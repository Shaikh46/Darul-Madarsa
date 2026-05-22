import { useState } from "react";
import { useLS, Student, exportToCSV } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Printer, Search, Download, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExamResult {
  id: string;
  studentId: string;
  examName: string;
  subject: string;
  marksObtained: number;
  totalMarks: number;
  date: string;
}

const EXAM_NAMES = ["Mid-Term", "Final", "Monthly Test", "Weekly Test", "Annual", "Unit Test"];
const SUBJECTS = ["Quran", "Hifz", "Tajweed", "Fiqh", "Arabic", "Urdu", "English", "Mathematics", "General Knowledge", "Islamic Studies"];

function calculateGrade(obtained: number, total: number) {
  const pct = (obtained / total) * 100;
  if (pct >= 90) return { grade: "A+", color: "bg-emerald-100 text-emerald-700" };
  if (pct >= 80) return { grade: "A", color: "bg-green-100 text-green-700" };
  if (pct >= 70) return { grade: "B", color: "bg-blue-100 text-blue-700" };
  if (pct >= 60) return { grade: "C", color: "bg-yellow-100 text-yellow-700" };
  return { grade: "F", color: "bg-red-100 text-red-700" };
}

export default function Results() {
  const [students] = useLS<Student[]>("students", []);
  const [results, setResults] = useLS<ExamResult[]>("exam_results", []);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStudent, setFilterStudent] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [customExam, setCustomExam] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [marksObtained, setMarksObtained] = useState("");
  const [totalMarks, setTotalMarks] = useState("100");
  const [formError, setFormError] = useState("");
  const { toast } = useToast();

  const examNameValue = selectedExam === "custom" ? customExam : selectedExam;

  const filtered = results.filter(r => {
    const student = students.find(s => s.id === r.studentId);
    const matchSearch = (student?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.examName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStudent = filterStudent === "all" || r.studentId === filterStudent;
    return matchSearch && matchStudent;
  });

  const resetForm = () => {
    setSelectedStudent(""); setSelectedExam(""); setCustomExam(""); setSelectedSubject("");
    setMarksObtained(""); setTotalMarks("100"); setFormError("");
  };

  const handleAdd = () => {
    if (!selectedStudent) { setFormError("Please select a student."); return; }
    if (!examNameValue.trim()) { setFormError("Exam name is required."); return; }
    if (!selectedSubject) { setFormError("Please select a subject."); return; }
    const obtained = parseFloat(marksObtained);
    const total = parseFloat(totalMarks);
    if (isNaN(obtained) || obtained < 0) { setFormError("Marks obtained must be a valid number."); return; }
    if (isNaN(total) || total <= 0) { setFormError("Total marks must be positive."); return; }
    if (obtained > total) { setFormError("Marks obtained cannot exceed total marks."); return; }
    setFormError("");
    const newResult: ExamResult = {
      id: `res_${Date.now()}`,
      studentId: selectedStudent,
      examName: examNameValue,
      subject: selectedSubject,
      marksObtained: obtained,
      totalMarks: total,
      date: new Date().toISOString(),
    };
    setResults([newResult, ...results]);
    toast({ title: "Result Added", description: `${examNameValue} result saved.` });
    resetForm();
    setIsAddOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this result?")) {
      setResults(results.filter(r => r.id !== id));
      toast({ title: "Result Deleted" });
    }
  };

  const handleExport = () => {
    exportToCSV(
      ["Student", "Class", "Exam", "Subject", "Marks", "Total", "Percentage", "Grade"],
      filtered.map(r => {
        const s = students.find(st => st.id === r.studentId);
        const { grade } = calculateGrade(r.marksObtained, r.totalMarks);
        return [s?.name || "Unknown", s?.className || "", r.examName, r.subject, String(r.marksObtained), String(r.totalMarks), `${((r.marksObtained / r.totalMarks) * 100).toFixed(1)}%`, grade];
      }),
      "exam_results.csv"
    );
  };

  const handlePrint = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    const studentResults = results.filter(r => r.studentId === studentId);
    if (studentResults.length === 0) return alert("No results to print.");
    const printWindow = window.open("", "", "width=800,height=600");
    if (!printWindow) return;
    printWindow.document.write(`<html><head><title>Report Card - ${student.name}</title><style>body{font-family:Arial,sans-serif;padding:40px}h1,h2,h3{text-align:center;margin:5px 0}.header{border-bottom:2px solid #008000;padding-bottom:20px;margin-bottom:20px}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ccc;padding:10px;text-align:left}th{background:#f5f5f5}.footer{margin-top:50px;display:flex;justify-content:space-between}.grade{font-weight:bold;padding:2px 8px;border-radius:4px}</style></head><body><div class="header"><h1 style="color:#008000">Darul Uloom Sirajul Islam</h1><h2>Kalgaon, Maharashtra</h2><h3>Official Report Card</h3></div><p><strong>Student Name:</strong> ${student.name}</p><p><strong>Class:</strong> ${student.className}</p><p><strong>Jamaat:</strong> ${student.jamaat || "—"}</p><p><strong>Date Issued:</strong> ${new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p><table><tr><th>Exam</th><th>Subject</th><th>Marks</th><th>Total</th><th>%</th><th>Grade</th></tr>${studentResults.map(r => { const pct = ((r.marksObtained / r.totalMarks) * 100).toFixed(1); const { grade } = calculateGrade(r.marksObtained, r.totalMarks); return `<tr><td>${r.examName}</td><td>${r.subject}</td><td>${r.marksObtained}</td><td>${r.totalMarks}</td><td>${pct}%</td><td class="grade">${grade}</td></tr>`; }).join("")}</table><div class="footer"><p>_______________________<br/>Teacher Signature</p><p>_______________________<br/>Principal Signature</p></div></body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Exam Results</h1>
          <p className="text-muted-foreground mt-1">{results.length} result records</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Button size="sm" onClick={() => { resetForm(); setIsAddOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Add Result
          </Button>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by student, exam or subject..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <Select value={filterStudent} onValueChange={setFilterStudent}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All Students" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Students</SelectItem>
            {students.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-md bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Exam</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Marks</TableHead>
              <TableHead>Percentage</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(r => {
              const student = students.find(s => s.id === r.studentId);
              const pct = ((r.marksObtained / r.totalMarks) * 100).toFixed(1);
              const { grade, color } = calculateGrade(r.marksObtained, r.totalMarks);
              return (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{student?.name || "Unknown"}<br /><span className="text-xs text-muted-foreground">{student?.className}</span></TableCell>
                  <TableCell>{r.examName}</TableCell>
                  <TableCell>{r.subject}</TableCell>
                  <TableCell>{r.marksObtained} / {r.totalMarks}</TableCell>
                  <TableCell className="font-medium">{pct}%</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${color}`}>{grade}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" className="mr-1" onClick={() => handlePrint(r.studentId)}>
                      <Printer className="w-3.5 h-3.5 mr-1.5" /> Report Card
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(r.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">No results found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Exam Result</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Student <span className="text-destructive">*</span></Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>
                  {students.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.className})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Exam Name <span className="text-destructive">*</span></Label>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger><SelectValue placeholder="Select exam type" /></SelectTrigger>
                <SelectContent>
                  {EXAM_NAMES.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                  <SelectItem value="custom">Other (type below)</SelectItem>
                </SelectContent>
              </Select>
              {selectedExam === "custom" && (
                <Input placeholder="Enter exam name" value={customExam} onChange={e => setCustomExam(e.target.value)} className="mt-2" />
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Subject <span className="text-destructive">*</span></Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Marks Obtained <span className="text-destructive">*</span></Label>
                <Input type="number" placeholder="85" min="0" value={marksObtained} onChange={e => setMarksObtained(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Total Marks <span className="text-destructive">*</span></Label>
                <Input type="number" placeholder="100" min="1" value={totalMarks} onChange={e => setTotalMarks(e.target.value)} />
              </div>
            </div>
            {marksObtained && totalMarks && !isNaN(parseFloat(marksObtained)) && !isNaN(parseFloat(totalMarks)) && parseFloat(totalMarks) > 0 && (
              <div className="p-3 bg-muted rounded-lg flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Auto-calculated result</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{((parseFloat(marksObtained) / parseFloat(totalMarks)) * 100).toFixed(1)}%</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${calculateGrade(parseFloat(marksObtained), parseFloat(totalMarks)).color}`}>
                    {calculateGrade(parseFloat(marksObtained), parseFloat(totalMarks)).grade}
                  </span>
                </div>
              </div>
            )}
            {formError && <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded px-3 py-2">{formError}</p>}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Save Result</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
