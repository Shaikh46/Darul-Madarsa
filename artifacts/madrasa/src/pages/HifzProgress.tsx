import { useState } from "react";
import { useLS, Student } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProgressRecord {
  studentId: string;
  type: "hifz" | "nazera";
  hifz?: { currentJuz: number; currentSurah: string; versesMemorized: number; progressPercent: number };
  nazera?: { currentPage: number; currentParah: number; readingQuality: "Excellent" | "Good" | "Needs Improvement" };
  remarks: string;
  updatedAt: string;
}

export default function HifzProgress() {
  const [students] = useLS<Student[]>("students", []);
  const [progress, setProgress] = useLS<ProgressRecord[]>("hifz_progress", []);
  const [selectedClass, setSelectedClass] = useState<string>("");

  const classes = Array.from(new Set(students.map(s => s.className)));
  const currentStudents = students.filter(s => s.className === selectedClass);

  const getProgress = (studentId: string, type: "hifz" | "nazera") => {
    return progress.find(p => p.studentId === studentId && p.type === type);
  };

  const handleUpdate = (studentId: string, type: "hifz" | "nazera", data: any) => {
    const existing = getProgress(studentId, type);
    const newRecord: ProgressRecord = {
      studentId,
      type,
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    if (existing) {
      setProgress(progress.map(p => p === existing ? { ...p, ...data, updatedAt: new Date().toISOString() } : p));
    } else {
      setProgress([...progress, newRecord]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Hifz & Nazera Progress</h1>
        <p className="text-muted-foreground mt-1">Track student memorization and reading</p>
      </div>

      <div className="w-full max-w-sm">
        <Label>Select Class</Label>
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

      {selectedClass ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentStudents.map(student => {
            const hifzData = getProgress(student.id, "hifz");
            const nazeraData = getProgress(student.id, "nazera");

            return (
              <Card key={student.id}>
                <CardHeader>
                  <CardTitle>{student.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Hifz Section */}
                  <div className="space-y-4">
                    <h3 className="font-semibold border-b pb-2 text-primary">Hifz Progress</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Current Juz</Label>
                        <Input 
                          type="number" 
                          min={1} max={30} 
                          defaultValue={hifzData?.hifz?.currentJuz || 1}
                          onBlur={(e) => handleUpdate(student.id, "hifz", { hifz: { ...hifzData?.hifz, currentJuz: parseInt(e.target.value) } })}
                        />
                      </div>
                      <div>
                        <Label>Current Surah</Label>
                        <Input 
                          defaultValue={hifzData?.hifz?.currentSurah || ""}
                          onBlur={(e) => handleUpdate(student.id, "hifz", { hifz: { ...hifzData?.hifz, currentSurah: e.target.value } })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Overall Progress</span>
                        <span>{hifzData?.hifz?.progressPercent || 0}%</span>
                      </div>
                      <Progress value={hifzData?.hifz?.progressPercent || 0} className="h-2" />
                      <Input 
                        type="range" 
                        min={0} max={100} 
                        className="w-full"
                        defaultValue={hifzData?.hifz?.progressPercent || 0}
                        onChange={(e) => handleUpdate(student.id, "hifz", { hifz: { ...hifzData?.hifz, progressPercent: parseInt(e.target.value) } })}
                      />
                    </div>
                  </div>

                  {/* Nazera Section */}
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-semibold border-b pb-2 text-primary">Nazera Progress</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Current Parah</Label>
                        <Input 
                          type="number" 
                          min={1} max={30} 
                          defaultValue={nazeraData?.nazera?.currentParah || 1}
                          onBlur={(e) => handleUpdate(student.id, "nazera", { nazera: { ...nazeraData?.nazera, currentParah: parseInt(e.target.value) } })}
                        />
                      </div>
                      <div>
                        <Label>Quality</Label>
                        <Select 
                          defaultValue={nazeraData?.nazera?.readingQuality || "Good"}
                          onValueChange={(val) => handleUpdate(student.id, "nazera", { nazera: { ...nazeraData?.nazera, readingQuality: val as any } })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Excellent">Excellent</SelectItem>
                            <SelectItem value="Good">Good</SelectItem>
                            <SelectItem value="Needs Improvement">Needs Improvement</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Remarks */}
                  <div>
                    <Label>Teacher Remarks</Label>
                    <Textarea 
                      placeholder="Add remarks..." 
                      defaultValue={hifzData?.remarks || nazeraData?.remarks || ""}
                      onBlur={(e) => handleUpdate(student.id, "hifz", { remarks: e.target.value })}
                    />
                  </div>

                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center border rounded-md text-muted-foreground bg-card">
          Please select a class to view progress.
        </div>
      )}
    </div>
  );
}
