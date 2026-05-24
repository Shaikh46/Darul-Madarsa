import { useState } from "react";
import { useLS, Student, CLASS_GROUPS, trClass, trClassGroup } from "@/lib/storage";
import { useLang } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Circle, Clock } from "lucide-react";

interface ProgressRecord {
  studentId: string;
  type: "hifz" | "nazera";
  hifz?: { currentJuz: number; currentSurah: string; versesMemorized: number; progressPercent: number };
  nazera?: { currentPage: number; currentParah: number; readingQuality: "Excellent" | "Good" | "Needs Improvement" };
  remarks: string;
  updatedAt: string;
}

const JUZ_NAMES_EN = [
  "Alif Laam Meem", "Sayaqool", "Tilkal Rusulu", "Lan Tana Lol Birra", "Wal Muhsanaat",
  "La Yuhibbullah", "Wa Iza Samiu", "Wa Lau Annana", "Qalal Malao", "Wa A'lamu",
  "Ya'tazerona", "Wa Mamin Da'abat", "Wa Ma Ubrioo", "Rubama", "Subhanallazi",
  "Qal Alam", "Iqtarabath", "Qadd Aflaha", "Wa Qalallazina", "A'man Khalaq",
  "Utlu Ma Oohi", "Wa Manyaqnut", "Wa Mali", "Faman Azlam", "Elahe Yuruddu",
  "Ha'a Meem", "Qala Fama Khatbukum", "Qadd Sami Allah", "Tabarakallazi", "Amma"
];

const JUZ_NAMES_UR = [
  "الم", "سیقول", "تلک الرسل", "لن تنالوا البر", "والمحصنات",
  "لا یحب اللہ", "وإذا سمعوا", "ولو أننا", "قال الملأ", "واعلموا",
  "یعتذرون", "وما من دابۃ", "وما أبرئ", "ربما", "سبحان الذی",
  "قال ألم", "اقترب", "قد أفلح", "وقال الذین", "أمن خلق",
  "اتل ما أوحی", "ومن یقنت", "ومالی", "فمن أظلم", "إلیہ یرد",
  "حم", "قال فما خطبکم", "قد سمع اللہ", "تبارک الذی", "عم"
];

type JuzStatus = "completed" | "in_progress" | "pending";

interface JuzMap { [juzNum: number]: JuzStatus; }

export default function HifzProgress() {
  const { lang, tr } = useLang();
  const isUrdu = lang === "ur";
  const [students] = useLS<Student[]>("students", []);
  const [progress, setProgress] = useLS<ProgressRecord[]>("hifz_progress", []);
  const [juzMap, setJuzMap] = useLS<Record<string, JuzMap>>("hifz_juz_map", {});
  const [selectedClass, setSelectedClass] = useState<string>("");

  const getJuzStatus = (studentId: string, juz: number): JuzStatus => {
    return juzMap[studentId]?.[juz] || "pending";
  };

  const cycleJuz = (studentId: string, juz: number) => {
    const cur = getJuzStatus(studentId, juz);
    const next: JuzStatus = cur === "pending" ? "in_progress" : cur === "in_progress" ? "completed" : "pending";
    setJuzMap({ ...juzMap, [studentId]: { ...(juzMap[studentId] || {}), [juz]: next } });
  };

  const completedCount = (studentId: string) => {
    const m = juzMap[studentId] || {};
    return Array.from({ length: 30 }, (_, i) => i + 1).filter(j => m[j] === "completed").length;
  };

  const classes = Array.from(new Set(students.map(s => s.className)));
  const currentStudents = students.filter(s => s.className === selectedClass);

  const getProgress = (studentId: string, type: "hifz" | "nazera") => {
    return progress.find(p => p.studentId === studentId && p.type === type);
  };

  const handleUpdate = (studentId: string, type: "hifz" | "nazera", data: Record<string, unknown>) => {
    const existing = getProgress(studentId, type);
    const newRecord: ProgressRecord = {
      studentId,
      type,
      remarks: "",
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
        <h1 className={`text-3xl font-bold text-foreground ${isUrdu ? "urdu-text" : ""}`}>{tr("hifzNazeraProgress")}</h1>
        <p className={`text-muted-foreground mt-1 ${isUrdu ? "urdu-text" : ""}`}>{tr("trackMemReading")}</p>
      </div>

      <div className="w-full max-w-sm space-y-1.5">
        <Label className={isUrdu ? "urdu-text" : ""}>{tr("selectClass")}</Label>
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger>
            <SelectValue placeholder={isUrdu ? "کلاس منتخب کریں" : "Select class"} />
          </SelectTrigger>
          <SelectContent>
            {CLASS_GROUPS.map(group => {
              const groupClasses = group.classes.filter(c => classes.includes(c));
              if (groupClasses.length === 0) return null;
              return (
                <div key={group.label}>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/50 mt-1 mb-0.5">
                    {group.icon} {trClassGroup(group.label, lang)}
                  </div>
                  {groupClasses.map(c => (
                    <SelectItem key={c} value={c} className="pl-5">{trClass(c, lang)}</SelectItem>
                  ))}
                </div>
              );
            })}
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

                  <div className="space-y-4">
                    <h3 className={`font-semibold border-b pb-2 text-primary ${isUrdu ? "urdu-text" : ""}`}>{tr("hifzProgressSection")}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className={isUrdu ? "urdu-text" : ""}>{tr("currentJuz")}</Label>
                        <Input
                          type="number"
                          min={1} max={30}
                          defaultValue={hifzData?.hifz?.currentJuz || 1}
                          onBlur={(e) => handleUpdate(student.id, "hifz", { hifz: { ...hifzData?.hifz, currentJuz: parseInt(e.target.value) } })}
                        />
                      </div>
                      <div>
                        <Label className={isUrdu ? "urdu-text" : ""}>{tr("currentSurah")}</Label>
                        <Input
                          defaultValue={hifzData?.hifz?.currentSurah || ""}
                          onBlur={(e) => handleUpdate(student.id, "hifz", { hifz: { ...hifzData?.hifz, currentSurah: e.target.value } })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className={isUrdu ? "urdu-text" : ""}>{tr("overallProgress")}</span>
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

                  <div className="space-y-4 pt-4 border-t">
                    <h3 className={`font-semibold border-b pb-2 text-primary ${isUrdu ? "urdu-text" : ""}`}>{tr("nazeraProgressSection")}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className={isUrdu ? "urdu-text" : ""}>{tr("currentParah")}</Label>
                        <Input
                          type="number"
                          min={1} max={30}
                          defaultValue={nazeraData?.nazera?.currentParah || 1}
                          onBlur={(e) => handleUpdate(student.id, "nazera", { nazera: { ...nazeraData?.nazera, currentParah: parseInt(e.target.value) } })}
                        />
                      </div>
                      <div>
                        <Label className={isUrdu ? "urdu-text" : ""}>{tr("quality")}</Label>
                        <Select
                          defaultValue={nazeraData?.nazera?.readingQuality || "Good"}
                          onValueChange={(val) => handleUpdate(student.id, "nazera", { nazera: { ...nazeraData?.nazera, readingQuality: val as "Excellent" | "Good" | "Needs Improvement" } })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Excellent">{tr("excellent")}</SelectItem>
                            <SelectItem value="Good">{tr("good")}</SelectItem>
                            <SelectItem value="Needs Improvement">{tr("needsImprovement")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className={isUrdu ? "urdu-text" : ""}>{tr("teacherRemarks")}</Label>
                    <Textarea
                      placeholder={tr("addRemarks")}
                      defaultValue={hifzData?.remarks || nazeraData?.remarks || ""}
                      onBlur={(e) => handleUpdate(student.id, "hifz", { remarks: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <h3 className={`font-semibold text-primary ${isUrdu ? "urdu-text" : ""}`}>{tr("juzTracker")}</h3>
                      <span className="text-sm font-medium">
                        {completedCount(student.id)} / 30
                      </span>
                    </div>
                    <Progress value={(completedCount(student.id) / 30) * 100} className="h-2" />
                    <p className={`text-xs text-muted-foreground ${isUrdu ? "urdu-text" : ""}`}>
                      {isUrdu ? "حالت تبدیل کرنے کے لیے جزو پر کلک کریں" : "Click a Juz to cycle status"}
                    </p>
                    <div className="grid grid-cols-5 gap-1.5 mt-2">
                      {Array.from({ length: 30 }, (_, i) => i + 1).map(j => {
                        const status = getJuzStatus(student.id, j);
                        const name = (isUrdu ? JUZ_NAMES_UR : JUZ_NAMES_EN)[j - 1];
                        return (
                          <button
                            key={j}
                            type="button"
                            onClick={() => cycleJuz(student.id, j)}
                            title={`${tr("juz")} ${j}: ${name}`}
                            className={`aspect-square rounded-md border-2 text-xs font-semibold flex flex-col items-center justify-center transition-colors ${
                              status === "completed"
                                ? "bg-emerald-100 border-emerald-500 text-emerald-700"
                                : status === "in_progress"
                                ? "bg-amber-100 border-amber-500 text-amber-700"
                                : "bg-card border-border text-muted-foreground hover:border-primary"
                            }`}
                            data-testid={`btn-juz-${student.id}-${j}`}
                          >
                            <span>{j}</span>
                            {status === "completed" && <CheckCircle2 className="w-3 h-3" />}
                            {status === "in_progress" && <Clock className="w-3 h-3" />}
                            {status === "pending" && <Circle className="w-3 h-3 opacity-30" />}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex gap-3 text-xs mt-2 flex-wrap">
                      <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-500" /><span className={isUrdu ? "urdu-text" : ""}>{tr("completed")}</span></span>
                      <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-amber-100 border border-amber-500" /><span className={isUrdu ? "urdu-text" : ""}>{tr("inProgress")}</span></span>
                      <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-card border border-border" /><span className={isUrdu ? "urdu-text" : ""}>{tr("pending")}</span></span>
                    </div>
                  </div>

                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className={`p-8 text-center border rounded-md text-muted-foreground bg-card ${isUrdu ? "urdu-text" : ""}`}>
          {tr("pleaseSelectClass")}
        </div>
      )}
    </div>
  );
}
