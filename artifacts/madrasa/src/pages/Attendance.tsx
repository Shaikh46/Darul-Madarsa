import { useState } from "react";
import { useLS, Student } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface AttendanceRecord {
  id: string;
  date: string;
  className: string;
  records: Record<string, "present" | "absent" | "late">; // studentId -> status
}

export default function Attendance() {
  const [students] = useLS<Student[]>("students", []);
  const [attendanceLogs, setAttendanceLogs] = useLS<AttendanceRecord[]>("attendance", []);
  const { toast } = useToast();

  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [selectedClass, setSelectedClass] = useState<string>("");

  const classes = Array.from(new Set(students.map(s => s.className)));
  const currentStudents = students.filter(s => s.className === selectedClass);

  const currentLog = attendanceLogs.find(
    log => log.date === selectedDate && log.className === selectedClass
  );

  const [currentRecords, setCurrentRecords] = useState<Record<string, "present" | "absent" | "late">>(
    currentLog?.records || {}
  );

  const handleStatusChange = (studentId: string, status: "present" | "absent" | "late") => {
    setCurrentRecords(prev => ({ ...prev, [studentId]: status }));
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
      title: "Attendance Saved",
      description: `Attendance for ${selectedClass} on ${selectedDate} has been saved.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Attendance</h1>
        <p className="text-muted-foreground mt-1">Mark and view daily attendance</p>
      </div>

      <div className="flex gap-4 p-4 border rounded-md bg-card">
        <div className="space-y-2 flex-1">
          <Label>Date</Label>
          <input 
            type="date" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        <div className="space-y-2 flex-1">
          <Label>Class</Label>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedClass ? (
        <div className="border rounded-md bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentStudents.map(student => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>
                    <RadioGroup 
                      className="flex space-x-4" 
                      value={currentRecords[student.id] || ""}
                      onValueChange={(val: "present"|"absent"|"late") => handleStatusChange(student.id, val)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="present" id={`${student.id}-present`} />
                        <Label htmlFor={`${student.id}-present`} className="text-emerald-600">Present</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="absent" id={`${student.id}-absent`} />
                        <Label htmlFor={`${student.id}-absent`} className="text-destructive">Absent</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="late" id={`${student.id}-late`} />
                        <Label htmlFor={`${student.id}-late`} className="text-yellow-600">Late</Label>
                      </div>
                    </RadioGroup>
                  </TableCell>
                </TableRow>
              ))}
              {currentStudents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center h-24 text-muted-foreground">
                    No students in this class.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          {currentStudents.length > 0 && (
            <div className="p-4 border-t flex justify-end">
              <Button onClick={handleSave}>Save Attendance</Button>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 text-center border rounded-md text-muted-foreground bg-card">
          Please select a class to mark attendance.
        </div>
      )}
    </div>
  );
}
