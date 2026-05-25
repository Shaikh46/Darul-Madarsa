import { useState, useEffect } from "react";
import { useLS, Student, CLASS_GROUPS, CLASS_OPTIONS, trClass, trClassGroup, useAuth, AttendanceRecord } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useLang } from "@/lib/i18n";
import { CheckCircle2, XCircle, Clock, Save, History, RotateCcw, Download, CalendarDays, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

export default function Attendance() {
  const [students] = useLS<Student[]>("students", []);
  const [attendanceLogs, setAttendanceLogs] = useLS<AttendanceRecord[]>("attendance", []);
  const { toast } = useToast();
  const { lang, tr } = useLang();
  const isUrdu = lang === "ur";
  const { role, teacherClass, userName } = useAuth();

  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [loadedClass, setLoadedClass] = useState<string>("");
  const [loadedDate, setLoadedDate] = useState<string>("");

  const [showSummary, setShowSummary] = useState(false);
  const [historyStudent, setHistoryStudent] = useState<Student | null>(null);

  // Teacher can only see their own class
  const availableClasses = role === "teacher" && teacherClass
    ? CLASS_OPTIONS.filter(c => c === teacherClass)
    : CLASS_OPTIONS;

  useEffect(() => {
    if (role === "teacher" && teacherClass && !selectedClass) {
      setSelectedClass(teacherClass);
    }
  }, [role, teacherClass]);

  const currentStudents = students.filter(s => s.className === loadedClass);

  const currentLog = attendanceLogs.find(
    log => log.date === loadedDate && log.className === loadedClass
  );

  const [currentRecords, setCurrentRecords] = useState<Record<string, { status: "present" | "absent" | "late", remark?: string }>>({});

  const handleLoadStudents = () => {
    if (!selectedClass) {
      toast({ title: isUrdu ? "براہ کرم پہلے کلاس منتخب کریں" : "Please select a class first", variant: "destructive" });
      return;
    }
    if (!selectedDate) {
      toast({ title: isUrdu ? "براہ کرم تاریخ منتخب کریں" : "Please select a date", variant: "destructive" });
      return;
    }
    const stuInClass = students.filter(s => s.className === selectedClass);
    if (stuInClass.length === 0) {
      toast({ title: isUrdu ? "اس کلاس میں کوئی طالب علم نہیں ملا" : "No students found in this class", variant: "destructive" });
    }
    
    setLoadedClass(selectedClass);
    setLoadedDate(selectedDate);
    
    const existingLog = attendanceLogs.find(
      log => log.date === selectedDate && log.className === selectedClass
    );
    
    if (existingLog && existingLog.records) {
      // Migrate old string records to new object format if necessary
      const formattedRecords: any = {};
      Object.keys(existingLog.records).forEach(key => {
        const val = existingLog.records[key];
        if (typeof val === "string") {
          formattedRecords[key] = { status: val };
        } else {
          formattedRecords[key] = val;
        }
      });
      setCurrentRecords(formattedRecords);
    } else {
      setCurrentRecords({});
    }
  };

  const handleResetFilters = () => {
    if (role !== "teacher") setSelectedClass("");
    setSelectedDate(format(new Date(), "yyyy-MM-dd"));
    setLoadedClass("");
    setLoadedDate("");
    setCurrentRecords({});
  };

  const handleStatusChange = (studentId: string, status: "present" | "absent" | "late") => {
    setCurrentRecords(prev => ({ ...prev, [studentId]: { ...prev[studentId], status } }));
  };

  const handleRemarkChange = (studentId: string, remark: string) => {
    setCurrentRecords(prev => ({ ...prev, [studentId]: { ...prev[studentId], remark } }));
  };

  const markAll = (status: "present" | "absent" | "late") => {
    const all: Record<string, { status: "present" | "absent" | "late", remark?: string }> = { ...currentRecords };
    currentStudents.forEach(s => { 
      all[s.id] = { ...all[s.id], status }; 
    });
    setCurrentRecords(all);
  };

  const resetAll = () => {
    setCurrentRecords({});
  };

  const downloadReport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "No.,Student Name,Status,Remarks\n"
      + currentStudents.map((s, i) => {
        const rec = currentRecords[s.id];
        return `${i + 1},${s.name},${rec?.status || 'Unmarked'},"${rec?.remark || ''}"`;
      }).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Attendance_${loadedClass}_${loadedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const presentCount = currentStudents.filter(s => currentRecords[s.id]?.status === "present").length;
  const absentCount = currentStudents.filter(s => currentRecords[s.id]?.status === "absent").length;
  const lateCount = currentStudents.filter(s => currentRecords[s.id]?.status === "late").length;
  const totalMarked = presentCount + absentCount + lateCount;

  const confirmSave = () => {
    if (totalMarked === 0) return;
    setShowSummary(true);
  };

  const executeSave = () => {
    const newLog: AttendanceRecord = {
      id: currentLog?.id || `att_${Date.now()}`,
      date: loadedDate,
      className: loadedClass,
      lastModifiedBy: userName || role || "Admin",
      timestamp: Date.now(),
      records: currentRecords as any, // Cast for backwards compatibility in type if needed
    };

    if (currentLog) {
      setAttendanceLogs(attendanceLogs.map(log => log.id === currentLog.id ? newLog : log));
    } else {
      setAttendanceLogs([...attendanceLogs, newLog]);
    }

    setShowSummary(false);
    toast({
      title: isUrdu 
        ? `${totalMarked} طلباء کی حاضری کامیابی سے محفوظ ہوگئی` 
        : `Attendance saved successfully for ${totalMarked} students`,
    });
  };

  // Student history helper
  const getStudentHistory = (studentId: string) => {
    const now = new Date();
    const history = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const log = attendanceLogs.find(l => l.date === dateStr && l.className === loadedClass);
      if (log && log.records && log.records[studentId]) {
        const rec = log.records[studentId];
        const status = typeof rec === 'string' ? rec : (rec as any).status;
        history.push({ date: dateStr, status });
      }
    }
    return history;
  };

  return (
    <div className={`space-y-6 ${isUrdu ? "urdu-text" : ""}`} dir={isUrdu ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          📝 {isUrdu ? "حاضری لگائیں" : "Mark Attendance"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isUrdu ? "حاضری لگانے کے لیے کلاس اور تاریخ منتخب کریں" : "Select class and date to mark attendance"}
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-5">
          <div className={`flex gap-4 flex-wrap items-end ${isUrdu ? "flex-row-reverse" : ""}`}>
            <div className="space-y-1.5 flex-1 min-w-[200px]">
              <Label>{isUrdu ? "کلاس منتخب کریں" : "Select Class"}</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}
                disabled={role === "teacher" && !!teacherClass}>
                <SelectTrigger>
                  <SelectValue placeholder={isUrdu ? "کلاس منتخب کریں" : "Select class"} />
                </SelectTrigger>
                <SelectContent>
                  {CLASS_GROUPS.map(group => {
                    const groupClasses = group.classes.filter(c => availableClasses.includes(c));
                    if (groupClasses.length === 0) return null;
                    return (
                      <div key={group.label}>
                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/50 mt-1 mb-0.5">
                          {group.icon} {trClassGroup(group.label, lang)}
                        </div>
                        {groupClasses.map(c => (
                          <SelectItem key={c} value={c} className="pl-5">
                            {trClass(c, lang)}
                          </SelectItem>
                        ))}
                      </div>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 flex-1 min-w-[200px]">
              <Label>{isUrdu ? "تاریخ منتخب کریں" : "Select Date"}</Label>
              <div className="flex gap-2">
                <input
                  type="date"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                />
                <Button variant="outline" onClick={() => setSelectedDate(format(new Date(), "yyyy-MM-dd"))}>
                  {isUrdu ? "آج کی تاریخ" : "Today's Date"}
                </Button>
              </div>
            </div>

            <div className="flex gap-2 min-w-[200px]">
              <Button onClick={handleLoadStudents} className="flex-1">
                <Users className="w-4 h-4 mr-2" />
                {isUrdu ? "طلباء لوڈ کریں" : "Load Students"}
              </Button>
              <Button variant="outline" onClick={handleResetFilters}>
                {isUrdu ? "ری سیٹ کریں" : "Reset"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loadedClass && loadedDate && (
        <div className="space-y-4 slide-up">
          {/* Previous Attendance Note */}
          {currentLog && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg flex items-start gap-3">
              <CalendarDays className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">
                  {isUrdu 
                    ? "اس کلاس اور تاریخ کی حاضری پہلے ہی موجود ہے۔ موجودہ ریکارڈ میں ترمیم کی جا رہی ہے۔" 
                    : "Attendance already marked for this class on this date. Editing existing records."}
                </p>
                {currentLog.lastModifiedBy && (
                  <p className="text-sm mt-1 opacity-80">
                    {isUrdu ? "آخری تبدیلی بذریعہ:" : "Last modified by:"} {currentLog.lastModifiedBy} {isUrdu ? "بتاریخ" : "on"} {currentLog.timestamp ? new Date(currentLog.timestamp).toLocaleString() : ""}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Bulk Actions */}
          <Card>
            <CardContent className="py-4">
              <div className={`flex flex-col sm:flex-row items-center gap-4 justify-between ${isUrdu ? "sm:flex-row-reverse" : ""}`}>
                <div className="font-semibold text-muted-foreground">
                  {isUrdu ? "فوری اقدامات:" : "Quick Actions:"}
                </div>
                <div className={`flex gap-2 flex-wrap ${isUrdu ? "flex-row-reverse" : ""}`}>
                  <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                    onClick={() => markAll("present")}>{isUrdu ? "سب حاضر کریں" : "Mark All Present"}</Button>
                  <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50"
                    onClick={() => markAll("absent")}>{isUrdu ? "سب غیر حاضر کریں" : "Mark All Absent"}</Button>
                  <Button size="sm" variant="outline" className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                    onClick={() => markAll("late")}>{isUrdu ? "سب دیر سے کریں" : "Mark All Late"}</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student table */}
          <div className="border rounded-xl bg-card overflow-x-auto shadow-sm">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-16">{isUrdu ? "نمبر" : "No."}</TableHead>
                  <TableHead className="min-w-[200px]">{isUrdu ? "طالب علم کا نام" : "Student Name"}</TableHead>
                  <TableHead className="min-w-[300px]">{isUrdu ? "حیثیت" : "Status"}</TableHead>
                  <TableHead className="min-w-[200px]">{isUrdu ? "تبصرہ" : "Remarks"}</TableHead>
                  <TableHead className="w-24 text-center">{isUrdu ? "تاریخ" : "History"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentStudents.map((student, idx) => (
                  <TableRow key={student.id} className="hover:bg-muted/30">
                    <TableCell className="text-muted-foreground font-medium">{idx + 1}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-bold text-foreground">{student.name}</p>
                        {student.fatherName && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {isUrdu ? "والد:" : "Father:"} {student.fatherName}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <RadioGroup
                        className={`flex gap-4 ${isUrdu ? "flex-row-reverse" : ""}`}
                        value={currentRecords[student.id]?.status || ""}
                        onValueChange={(val: "present" | "absent" | "late") => handleStatusChange(student.id, val)}
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="present" id={`${student.id}-present`} className="text-emerald-500 border-emerald-500" />
                          <Label htmlFor={`${student.id}-present`} className="text-emerald-600 cursor-pointer font-medium flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            {isUrdu ? "حاضر" : "Present"}
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="absent" id={`${student.id}-absent`} className="text-red-500 border-red-500" />
                          <Label htmlFor={`${student.id}-absent`} className="text-red-600 cursor-pointer font-medium flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            {isUrdu ? "غیر حاضر" : "Absent"}
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="late" id={`${student.id}-late`} className="text-yellow-500 border-yellow-500" />
                          <Label htmlFor={`${student.id}-late`} className="text-yellow-600 cursor-pointer font-medium flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                            {isUrdu ? "دیر سے" : "Late"}
                          </Label>
                        </div>
                      </RadioGroup>
                    </TableCell>
                    <TableCell>
                      <Input 
                        placeholder={isUrdu ? "تبصرہ (اختیاری)..." : "Remarks (optional)..."} 
                        maxLength={100}
                        value={currentRecords[student.id]?.remark || ""}
                        onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                        className={`text-sm h-8 ${isUrdu ? "text-right" : ""}`}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="sm" onClick={() => setHistoryStudent(student)} className="h-8 px-2 text-primary hover:bg-primary/10">
                        <History className="w-4 h-4 mr-1.5" />
                        <span className="text-xs">{isUrdu ? "دیکھیں" : "View"}</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <div className={`p-4 border-t flex flex-wrap gap-3 ${isUrdu ? "justify-start flex-row-reverse" : "justify-between"} bg-muted/20`}>
              <div className="flex gap-2">
                <Button variant="outline" onClick={resetAll}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {isUrdu ? "سب ری سیٹ کریں" : "Reset All"}
                </Button>
                <Button variant="outline" onClick={downloadReport}>
                  <Download className="w-4 h-4 mr-2" />
                  {isUrdu ? "رپورٹ ڈاؤن لوڈ کریں" : "Download Report"}
                </Button>
              </div>
              <Button onClick={confirmSave} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 shadow-md hover:shadow-lg transition-all">
                <Save className="w-5 h-5 mr-2" />
                {isUrdu ? "حاضری محفوظ کریں" : "Save Attendance"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Summary Modal */}
      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={`text-2xl ${isUrdu ? "urdu-text" : ""}`}>
              {isUrdu ? "حاضری کا خلاصہ:" : "Attendance Summary:"}
            </DialogTitle>
          </DialogHeader>
          <div className={`py-4 space-y-4 ${isUrdu ? "urdu-text" : ""}`}>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">{isUrdu ? "کل طلباء:" : "Total Students:"}</span>
              <span className="font-bold text-xl">{currentStudents.length}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-emerald-600 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>{isUrdu ? "حاضر:" : "Present:"}</span>
              <span className="font-bold text-lg">{presentCount} <span className="text-sm text-muted-foreground font-normal">({Math.round((presentCount/currentStudents.length)*100 || 0)}%)</span></span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-red-600 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span>{isUrdu ? "غیر حاضر:" : "Absent:"}</span>
              <span className="font-bold text-lg">{absentCount} <span className="text-sm text-muted-foreground font-normal">({Math.round((absentCount/currentStudents.length)*100 || 0)}%)</span></span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-yellow-600 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-500"></span>{isUrdu ? "دیر سے:" : "Late:"}</span>
              <span className="font-bold text-lg">{lateCount} <span className="text-sm text-muted-foreground font-normal">({Math.round((lateCount/currentStudents.length)*100 || 0)}%)</span></span>
            </div>
            {currentLog && (
              <p className="text-amber-600 text-sm mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                {isUrdu 
                  ? "نوٹ: یہ پرانے ریکارڈز کو اوور رائٹ کر دے گا۔" 
                  : "Note: This will overwrite the previously saved attendance for this date."}
              </p>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="outline" onClick={() => setShowSummary(false)}>{isUrdu ? "منسوخ کریں" : "Cancel"}</Button>
            <Button onClick={executeSave}>{isUrdu ? "محفوظ کرنے کی تصدیق کریں" : "Confirm Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View History Modal */}
      <Dialog open={!!historyStudent} onOpenChange={(o) => !o && setHistoryStudent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={isUrdu ? "urdu-text" : ""}>
              {historyStudent?.name} - {isUrdu ? "حاضری کی تاریخ" : "Attendance History"}
            </DialogTitle>
            <DialogDescription>
              {isUrdu ? "پچھلے 30 دن کی حاضری کا ریکارڈ" : "Attendance records for the last 30 days"}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[300px] overflow-y-auto pr-2 mt-4 space-y-2">
            {historyStudent && getStudentHistory(historyStudent.id).length > 0 ? (
              getStudentHistory(historyStudent.id).map((rec, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-lg border bg-muted/10">
                  <span className="font-medium">{new Date(rec.date).toLocaleDateString("en-IN", { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  {rec.status === "present" && <Badge className="bg-emerald-500">{isUrdu ? "حاضر" : "Present"}</Badge>}
                  {rec.status === "absent" && <Badge variant="destructive">{isUrdu ? "غیر حاضر" : "Absent"}</Badge>}
                  {rec.status === "late" && <Badge className="bg-yellow-500">{isUrdu ? "دیر سے" : "Late"}</Badge>}
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                {isUrdu ? "کوئی ریکارڈ نہیں ملا" : "No attendance records found"}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHistoryStudent(null)}>{isUrdu ? "بند کریں" : "Close"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
