import { useState } from "react";
import { useLS, Student } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Printer } from "lucide-react";

interface ExamResult {
  id: string;
  studentId: string;
  examName: string;
  subject: string;
  marksObtained: number;
  totalMarks: number;
  date: string;
}

export default function Results() {
  const [students] = useLS<Student[]>("students", []);
  const [results, setResults] = useLS<ExamResult[]>("exam_results", []);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const calculateGrade = (obtained: number, total: number) => {
    const percent = (obtained / total) * 100;
    if (percent >= 90) return "A+";
    if (percent >= 80) return "A";
    if (percent >= 70) return "B";
    if (percent >= 60) return "C";
    return "F";
  };

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newResult: ExamResult = {
      id: `res_${Date.now()}`,
      studentId: formData.get("studentId") as string,
      examName: formData.get("examName") as string,
      subject: formData.get("subject") as string,
      marksObtained: parseInt(formData.get("marksObtained") as string),
      totalMarks: parseInt(formData.get("totalMarks") as string),
      date: new Date().toISOString(),
    };
    setResults([...results, newResult]);
    setIsAddOpen(false);
  };

  const handlePrint = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const studentResults = results.filter(r => r.studentId === studentId);
    if (studentResults.length === 0) return alert("No results to print.");

    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Report Card - ${student.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1, h2, h3 { text-align: center; margin: 5px 0; }
            .header { border-bottom: 2px solid #008000; padding-bottom: 20px; margin-bottom: 20px; }
            table { w-full: 100%; border-collapse: collapse; margin-top: 20px; width: 100%; }
            th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
            th { background-color: #f5f5f5; }
            .footer { margin-top: 50px; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="color: #008000;">Darul Uloom Sirajul Islam</h1>
            <h2>Kalgaon</h2>
            <h3>Official Report Card</h3>
          </div>
          <p><strong>Student Name:</strong> ${student.name}</p>
          <p><strong>Class:</strong> ${student.className}</p>
          
          <table>
            <tr>
              <th>Exam Name</th>
              <th>Subject</th>
              <th>Marks</th>
              <th>Total</th>
              <th>Percentage</th>
              <th>Grade</th>
            </tr>
            ${studentResults.map(r => {
              const pct = ((r.marksObtained / r.totalMarks) * 100).toFixed(1);
              const grd = calculateGrade(r.marksObtained, r.totalMarks);
              return `
              <tr>
                <td>${r.examName}</td>
                <td>${r.subject}</td>
                <td>${r.marksObtained}</td>
                <td>${r.totalMarks}</td>
                <td>${pct}%</td>
                <td>${grd}</td>
              </tr>
              `;
            }).join('')}
          </table>

          <div class="footer">
            <p>_______________________<br/>Teacher Signature</p>
            <p>_______________________<br/>Principal Signature</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Exam Results</h1>
          <p className="text-muted-foreground mt-1">Manage marks and report cards</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add Result</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Exam Result</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label>Student</Label>
                <Select name="studentId" required>
                  <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                  <SelectContent>
                    {students.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.className})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Exam Name (e.g. Mid Term)</Label>
                <Input name="examName" required />
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input name="subject" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Marks Obtained</Label>
                  <Input type="number" name="marksObtained" required />
                </div>
                <div className="space-y-2">
                  <Label>Total Marks</Label>
                  <Input type="number" name="totalMarks" required />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Exam</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Marks</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map(r => {
              const student = students.find(s => s.id === r.studentId);
              return (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{student?.name || "Unknown"}</TableCell>
                  <TableCell>{r.examName}</TableCell>
                  <TableCell>{r.subject}</TableCell>
                  <TableCell>{r.marksObtained} / {r.totalMarks}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-accent/20 text-accent-foreground font-bold rounded">
                      {calculateGrade(r.marksObtained, r.totalMarks)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handlePrint(r.studentId)}>
                      <Printer className="w-4 h-4 mr-2" /> Print Report Card
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {results.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">No results recorded.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
