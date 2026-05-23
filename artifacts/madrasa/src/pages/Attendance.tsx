import { useState, useEffect } from "react";
import { useLS, Student, CLASS_GROUPS, CLASS_OPTIONS, trClass, trClassGroup, useAuth } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useLang } from "@/lib/i18n";
import { CheckCircle2, XCircle, Clock, Save, BarChart3 } from "lucide-react";

interface AttendanceRecord {
  id: string;
  date: string;
  className: string;
  records: Record<string, "present" | "absent" | "late">;
}

export default function Attendance() {
  const [students] = useLS<Student[]>("students", []);
  const [attendanceLogs, setAttendanceLogs] = useLS<AttendanceRecord[]>("attendance", []);
  const { toast } = useToast();
  const { lang, tr } = useLang();
  const isUrdu = lang === "ur";
  const { role, teacherClass } = useAuth();

  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [selectedClass, setSelectedClass] = useState<string>("");

  // Teacher can only see their own class; admin sees all
  const availableClasses = role === "teacher" && teacherClass
    ? CLASS_OPTIONS.filter(c => c === teacherClass)
    : CLASS_OPTIONS;

  // Auto-select for teacher with one class
  useEffect(() => {
    if (role === "teacher" && teacherClass && !selectedClass) {
      setSelectedClass(teacherClass);
    }
  }, [role, teacherClass]);

  const currentStudents = students.filter(s => s.className === selectedClass);

  const currentLog = attendanceLogs.find(
    log => log.date === selectedDate && log.className === selectedClass
  );

  const [currentRecords, setCurrentRecords] = useState<Record<string, "present" | "absent" | "late">>({});

  // Sync records when date/class changes
  useEffect(() => {
    setCurrentRecords(currentLog?.records || {});
  }, [selectedDate, selectedClass]);

  const handleStatusChange = (studentId: string, status: "present" | "absent" | "late") => {
    setCurrentRecords(prev => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status: "present" | "absent" | "late") => {
    const all: Record<string, "present" | "absent" | "late"> = {};
    currentStudents.forEach(s => { all[s.id] = status; });
    setCurrentRecords(all);
  };

  const handleSave = () => {
    if (!selectedClass || !selectedDate) return;

    const newLog: AttendanceRecord = {
      id: currentLog?.id || `att_${Date.now()}`,
      date: selectedDate,
      className: selectedClass,
      records: currentRecords,
    };

    if (currentLog) {
      setAttendanceLogs(attendanceLogs.map(log => log.id === currentLog.id ? newLog : log));
    } else {
      setAttendanceLogs([...attendanceLogs, newLog]);
    }

    toast({
      title: isUrdu ? "حاضری محفوظ ہو گئی" : "Attendance Saved",
      description: isUrdu
        ? `${trClass(selectedClass, lang)} — ${selectedDate}`
        : `${selectedClass} on ${selectedDate}`,
    });
  };

  // Summary: for each class compute attendance %
  const classSummary = CLASS_OPTIONS.map(cls => {
    const logs = attendanceLogs.filter(l => l.className === cls);
    const totalDays = logs.length;
    const classStudents = students.filter(s => s.className === cls);
    if (totalDays === 0 || classStudents.length === 0) return { cls, pct: 0, totalDays };
    let presentCount = 0;
    let total = 0;
    logs.forEach(log => {
      classStudents.forEach(s => {
        if (log.records[s.id]) {
          total++;
          if (log.records[s.id] === "present") presentCount++;
        }
      });
    });
    const pct = total > 0 ? Math.round((presentCount / total) * 100) : 0;
    return { cls, pct, totalDays };
  }).filter(x => x.totalDays > 0 || students.some(s => s.className === x.cls));

  const presentCount = currentStudents.filter(s => currentRecords[s.id] === "present").length;
  const absentCount = currentStudents.filter(s => currentRecords[s.id] === "absent").length;
  const lateCount = currentStudents.filter(s => currentRecords[s.id] === "late").length;
  const unmarked = currentStudents.length - presentCount - absentCount - lateCount;

  return (
    <div className={`space-y-6 ${isUrdu ? "urdu-text" : ""}`} dir={isUrdu ? "rtl" : "ltr"}>
      <div>
        <h1 className="text-3xl font-bold text-foreground">{tr("attendance")}</h1>
        <p className="text-muted-foreground mt-1">
          {isUrdu ? "روزانہ حاضری لگائیں اور دیکھیں" : "Mark and view daily attendance"}
        </p>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="pt-5">
          <div className={`flex gap-4 flex-wrap ${isUrdu ? "flex-row-reverse" : ""}`}>
            {/* Date */}
            <div className="space-y-1.5 flex-1 min-w-40">
              <Label>{isUrdu ? "تاریخ منتخب کریں" : "Select Date"}</Label>
              <input
                type="date"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
              />
            </div>

            {/* Class */}
            <div className="space-y-1.5 flex-1 min-w-48">
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
          </div>
        </CardContent>
      </Card>

      {selectedClass ? (
        <>
          {/* Quick stats */}
          {currentStudents.length > 0 && (
            <div className={`flex gap-3 flex-wrap ${isUrdu ? "flex-row-reverse" : ""}`}>
              <div className="flex items-center gap-1.5 text-sm bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full">
                <CheckCircle2 className="w-4 h-4" />
                <span>{isUrdu ? "حاضر" : "Present"}: {presentCount}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-full">
                <XCircle className="w-4 h-4" />
                <span>{isUrdu ? "غیر حاضر" : "Absent"}: {absentCount}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1.5 rounded-full">
                <Clock className="w-4 h-4" />
                <span>{isUrdu ? "دیر سے آیا" : "Late"}: {lateCount}</span>
              </div>
              {unmarked > 0 && (
                <div className="flex items-center gap-1.5 text-sm bg-muted text-muted-foreground border px-3 py-1.5 rounded-full">
                  <span>{isUrdu ? "نشان نہیں" : "Unmarked"}: {unmarked}</span>
                </div>
              )}
            </div>
          )}

          {/* Mark all row */}
          {currentStudents.length > 0 && (
            <div className={`flex gap-2 items-center flex-wrap ${isUrdu ? "flex-row-reverse" : ""}`}>
              <span className="text-sm text-muted-foreground">{isUrdu ? "سب کو نشان زد کریں:" : "Mark all as:"}</span>
              <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                onClick={() => markAll("present")}>{isUrdu ? "حاضر" : "All Present"}</Button>
              <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50"
                onClick={() => markAll("absent")}>{isUrdu ? "غیر حاضر" : "All Absent"}</Button>
              <Button size="sm" variant="outline" className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                onClick={() => markAll("late")}>{isUrdu ? "دیر سے آیا" : "All Late"}</Button>
            </div>
          )}

          {/* Student table */}
          <div className="border rounded-md bg-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14">{isUrdu ? "نمبر" : "No."}</TableHead>
                  <TableHead>{isUrdu ? "طالب علم کا نام" : "Student Name"}</TableHead>
                  <TableHead>{isUrdu ? "حیثیت" : "Status"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentStudents.map((student, idx) => (
                  <TableRow key={student.id}>
                    <TableCell className="text-muted-foreground text-sm">{idx + 1}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        {student.fatherName && (
                          <p className="text-xs text-muted-foreground">
                            {isUrdu ? "والد:" : "Father:"} {student.fatherName}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <RadioGroup
                        className={`flex gap-4 ${isUrdu ? "flex-row-reverse" : ""}`}
                        value={currentRecords[student.id] || ""}
                        onValueChange={(val: "present" | "absent" | "late") => handleStatusChange(student.id, val)}
                      >
                        <div className="flex items-center gap-1.5">
                          <RadioGroupItem value="present" id={`${student.id}-present`} />
                          <Label htmlFor={`${student.id}-present`} className="text-emerald-600 cursor-pointer">
                            {isUrdu ? "حاضر" : "Present"}
                          </Label>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <RadioGroupItem value="absent" id={`${student.id}-absent`} />
                          <Label htmlFor={`${student.id}-absent`} className="text-destructive cursor-pointer">
                            {isUrdu ? "غیر حاضر" : "Absent"}
                          </Label>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <RadioGroupItem value="late" id={`${student.id}-late`} />
                          <Label htmlFor={`${student.id}-late`} className="text-yellow-600 cursor-pointer">
                            {isUrdu ? "دیر سے آیا" : "Late"}
                          </Label>
                        </div>
                      </RadioGroup>
                    </TableCell>
                  </TableRow>
                ))}
                {currentStudents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-28 text-muted-foreground">
                      {isUrdu
                        ? `اس کلاس میں ابھی کوئی طالب علم نہیں۔ پہلے طلباء شامل کریں۔`
                        : `No students in ${trClass(selectedClass, "en")} yet. Add students first.`}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {currentStudents.length > 0 && (
              <div className={`p-4 border-t flex ${isUrdu ? "justify-start flex-row-reverse" : "justify-end"} gap-3`}>
                <Button onClick={handleSave} className="gap-2">
                  <Save className="w-4 h-4" />
                  {isUrdu ? "حاضری محفوظ کریں" : "Save Attendance"}
                </Button>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="p-10 text-center border rounded-md text-muted-foreground bg-card">
          {isUrdu ? "حاضری لگانے کے لیے پہلے کلاس منتخب کریں۔" : "Please select a class to mark attendance."}
        </div>
      )}

      {/* Attendance Summary by Class */}
      {role === "admin" && classSummary.some(x => x.totalDays > 0) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className={`text-base flex items-center gap-2 ${isUrdu ? "flex-row-reverse urdu-text" : ""}`}>
              <BarChart3 className="w-4 h-4" />
              {isUrdu ? "کلاس وار حاضری خلاصہ" : "Class Attendance Summary"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isUrdu ? "کلاس" : "Class"}</TableHead>
                    <TableHead>{isUrdu ? "حاضری %" : "Present %"}</TableHead>
                    <TableHead>{isUrdu ? "کل دن" : "Total Days"}</TableHead>
                    <TableHead>{isUrdu ? "حیثیت" : "Status"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classSummary.filter(x => x.totalDays > 0).map(({ cls, pct, totalDays }) => (
                    <TableRow key={cls}>
                      <TableCell className="font-medium">{trClass(cls, lang)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-muted rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${pct >= 75 ? "bg-emerald-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{pct}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{totalDays}</TableCell>
                      <TableCell>
                        <Badge variant={pct >= 75 ? "default" : pct >= 50 ? "secondary" : "destructive"}
                          className="text-xs">
                          {pct >= 75
                            ? (isUrdu ? "اچھا" : "Good")
                            : pct >= 50
                              ? (isUrdu ? "اوسط" : "Average")
                              : (isUrdu ? "کم" : "Low")}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
