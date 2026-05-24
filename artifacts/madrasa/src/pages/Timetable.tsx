import { useState } from "react";
import { useLS, CLASS_GROUPS, trClass, trClassGroup, useAuth } from "@/lib/storage";
import type { Teacher } from "@/lib/storage";
import { useLang } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Download, CalendarDays } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface TimetableEntry {
  id: string;
  class_name: string;
  day: string;
  start_time: string;
  end_time: string;
  subject: string;
  teacher_name: string;
  teacher_id: string;
  room_no: string;
  created_by: string;
  created_date: string;
}

const ALL_CLASSES = CLASS_GROUPS.flatMap(g => g.classes);

const DAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const DAYS_UR = ["اتوار", "پیر", "منگل", "بدھ", "جمعرات", "جمعہ"];

const SUBJECTS_EN = ["Quran", "Qaida", "Deeniyat", "Arabic", "Farsi", "Hifz", "Tajweed", "Urdu", "Maths", "English", "Hadith", "Fiqh"];

function emptyForm(): Omit<TimetableEntry, "id" | "created_by" | "created_date"> {
  return {
    class_name: "",
    day: "",
    start_time: "",
    end_time: "",
    subject: "",
    teacher_name: "",
    teacher_id: "",
    room_no: "",
  };
}

export default function Timetable() {
  const [entries, setEntries] = useLS<TimetableEntry[]>("timetable_entries", []);
  const [teachers] = useLS<Teacher[]>("teachers", []);
  const { role } = useAuth();
  const { lang, tr } = useLang();
  const { toast } = useToast();
  const isUrdu = lang === "ur";
  const isAdmin = role === "admin";

  const DAYS = isUrdu ? DAYS_UR : DAYS_EN;
  const DAYS_KEY = DAYS_EN; // always use English keys for data

  const [selectedClass, setSelectedClass] = useState(ALL_CLASSES[0]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [formError, setFormError] = useState<string | null>(null);

  const classEntries = entries.filter(e => e.class_name === selectedClass);

  // Collect unique sorted time slots
  const timeSlots = Array.from(
    new Set(classEntries.map(e => `${e.start_time}||${e.end_time}`))
  ).sort((a, b) => {
    const [aStart] = a.split("||");
    const [bStart] = b.split("||");
    return aStart.localeCompare(bStart);
  });

  const getEntry = (slot: string, dayEn: string) => {
    const [start, end] = slot.split("||");
    return classEntries.find(e => e.start_time === start && e.end_time === end && e.day === dayEn);
  };

  const formatTime = (t: string) => {
    if (!t) return "";
    const [h, m] = t.split(":").map(Number);
    const ampm = h < 12 ? "AM" : "PM";
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm(), class_name: selectedClass });
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEdit = (entry: TimetableEntry) => {
    setEditingId(entry.id);
    setForm({
      class_name: entry.class_name,
      day: entry.day,
      start_time: entry.start_time,
      end_time: entry.end_time,
      subject: entry.subject,
      teacher_name: entry.teacher_name,
      teacher_id: entry.teacher_id,
      room_no: entry.room_no,
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm(isUrdu ? "کیا آپ واقعی یہ اندراج حذف کرنا چاہتے ہیں؟" : "Delete this timetable entry?")) {
      setEntries(entries.filter(e => e.id !== id));
      toast({ title: isUrdu ? "حذف ہو گیا" : "Deleted", description: isUrdu ? "اندراج حذف کر دیا گیا۔" : "Entry removed." });
    }
  };

  const handleSave = () => {
    if (!form.class_name) { setFormError(isUrdu ? "کلاس منتخب کریں۔" : "Select a class."); return; }
    if (!form.day) { setFormError(isUrdu ? "دن منتخب کریں۔" : "Select a day."); return; }
    if (!form.start_time || !form.end_time) { setFormError(isUrdu ? "وقت درج کریں۔" : "Enter start and end time."); return; }
    if (form.start_time >= form.end_time) { setFormError(isUrdu ? "ختم ہونے کا وقت شروع کے وقت سے بعد ہونا چاہیے۔" : "End time must be after start time."); return; }
    if (!form.subject.trim()) { setFormError(isUrdu ? "مضمون درج کریں۔" : "Enter a subject."); return; }
    setFormError(null);
    const now = new Date().toISOString().slice(0, 10);
    if (editingId) {
      setEntries(entries.map(e => e.id === editingId ? { ...form, id: editingId, created_by: "admin", created_date: now } : e));
      toast({ title: isUrdu ? "اندراج اپ ڈیٹ ہو گیا" : "Entry Updated" });
    } else {
      const newEntry: TimetableEntry = { ...form, id: `tt_${Date.now()}`, created_by: "admin", created_date: now };
      setEntries([...entries, newEntry]);
      toast({ title: isUrdu ? "اندراج شامل ہو گیا" : "Entry Added" });
    }
    setIsFormOpen(false);
  };

  const handleTeacherChange = (tid: string) => {
    const t = teachers.find(t => t.id === tid);
    setForm(f => ({ ...f, teacher_id: tid, teacher_name: t?.name || "" }));
  };

  const handlePDF = () => {
    const win = window.open("", "", "width=1000,height=700");
    if (!win) return;
    const dayHeaders = DAYS_KEY.map(d => `<th style="padding:8px 12px;background:#006400;color:#fff;border:1px solid #ccc">${isUrdu ? DAYS_UR[DAYS_KEY.indexOf(d)] : d}</th>`).join("");
    const rows = timeSlots.map(slot => {
      const [start, end] = slot.split("||");
      const cells = DAYS_KEY.map(dayEn => {
        const entry = getEntry(slot, dayEn);
        if (!entry) return `<td style="padding:8px;border:1px solid #ddd;color:#999;text-align:center">—</td>`;
        return `<td style="padding:8px;border:1px solid #ddd;text-align:center"><strong>${entry.subject}</strong><br/><small style="color:#666">${entry.teacher_name}</small>${entry.room_no ? `<br/><small style="color:#888">${entry.room_no}</small>` : ""}</td>`;
      }).join("");
      return `<tr><td style="padding:8px;border:1px solid #ddd;background:#f9f9f9;font-weight:600;white-space:nowrap">${formatTime(start)}–${formatTime(end)}</td>${cells}</tr>`;
    }).join("");
    win.document.write(`<html><head><title>Timetable - ${selectedClass}</title>
    <style>@import url('https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu&display=swap');
    body{font-family:Arial,sans-serif;padding:20px;direction:${isUrdu ? "rtl" : "ltr"}}
    table{border-collapse:collapse;width:100%}h1,h2{color:#006400;margin:0 0 4px}</style></head><body>
    <h1>Darul Uloom Sirajul Islam, Kalgaon</h1>
    <h2>${isUrdu ? "مطالعاتی نظام الاوقات" : "Study Timetable"} — ${selectedClass}</h2>
    <p style="color:#666;margin-bottom:16px">${new Date().toLocaleDateString("en-IN",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p>
    <table><thead><tr><th style="padding:8px 12px;background:#006400;color:#fff;border:1px solid #ccc">${isUrdu ? "وقت" : "Time"}</th>${dayHeaders}</tr></thead>
    <tbody>${rows || `<tr><td colspan="7" style="text-align:center;padding:24px;color:#999">${isUrdu ? "ابھی تک کوئی اندراج نہیں" : "No entries"}</td></tr>`}</tbody></table>
    </body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <div className={`space-y-6 ${isUrdu ? "urdu-text" : ""}`} dir={isUrdu ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isUrdu ? "مطالعاتی نظام الاوقات" : "Study Timetable"}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {isUrdu ? "تمام کلاسوں کے لیے نظام الاوقات" : "Class-wise weekly schedule"}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handlePDF}>
            <Download className="w-4 h-4 mr-2" />
            {isUrdu ? "PDF ڈاؤن لوڈ" : "Download PDF"}
          </Button>
          {isAdmin && (
            <Button size="sm" onClick={openAdd} data-testid="btn-add-entry">
              <Plus className="w-4 h-4 mr-2" />
              {isUrdu ? "اندراج شامل کریں" : "Add Entry"}
            </Button>
          )}
        </div>
      </div>

      {/* Class filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-muted-foreground">
          {isUrdu ? "کلاس منتخب کریں:" : "Select Class:"}
        </span>
        <div className="flex flex-wrap gap-2">
          {ALL_CLASSES.map(cls => (
            <button
              key={cls}
              onClick={() => setSelectedClass(cls)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                selectedClass === cls
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border hover:bg-muted"
              } ${isUrdu ? "urdu-text" : ""}`}
              data-testid={`class-tab-${cls}`}
            >
              {trClass(cls, lang)}
            </button>
          ))}
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        {/* Grid header */}
        <div className="px-4 py-3 bg-primary text-primary-foreground flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            <span className="font-semibold">
              {isUrdu ? "نظام الاوقات" : "Timetable"} — {selectedClass}
            </span>
          </div>
          {!isAdmin && (
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
              {isUrdu ? "صرف دیکھنے کے لیے" : "View Only"}
            </span>
          )}
        </div>

        {timeSlots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <CalendarDays className="w-14 h-14 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium">
              {isUrdu ? "ابھی تک کوئی نظام الاوقات شامل نہیں کیا گیا۔" : "No timetable added yet."}
            </p>
            {isAdmin && (
              <p className="text-sm text-muted-foreground mt-1">
                {isUrdu
                  ? "'اندراج شامل کریں' پر کلک کر کے شیڈول بنائیں۔"
                  : "Click 'Add Entry' above to create a schedule."}
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="bg-muted/60 border-b border-border">
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground w-28">
                    {isUrdu ? "وقت" : "Time"}
                  </th>
                  {DAYS_KEY.map((dayEn, idx) => (
                    <th key={dayEn} className="px-3 py-3 text-center font-semibold text-foreground border-l border-border/50">
                      {DAYS[idx]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((slot, rowIdx) => {
                  const [start, end] = slot.split("||");
                  return (
                    <tr key={slot} className={rowIdx % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                      <td className="px-4 py-3 font-medium text-xs text-primary whitespace-nowrap border-r border-border/50">
                        {formatTime(start)}<br /><span className="text-muted-foreground">–{formatTime(end)}</span>
                      </td>
                      {DAYS_KEY.map(dayEn => {
                        const entry = getEntry(slot, dayEn);
                        return (
                          <td key={dayEn} className="px-2 py-2 text-center align-top border-l border-border/50 min-w-[90px]">
                            {entry ? (
                              <div className="group relative rounded-lg bg-primary/8 border border-primary/15 px-2 py-1.5 hover:bg-primary/12 transition-colors">
                                <p className="font-semibold text-foreground text-xs leading-tight">{entry.subject}</p>
                                {entry.teacher_name && (
                                  <p className="text-muted-foreground text-xs mt-0.5 leading-tight">{entry.teacher_name}</p>
                                )}
                                {entry.room_no && (
                                  <p className="text-muted-foreground/70 text-xs mt-0.5">{entry.room_no}</p>
                                )}
                                {isAdmin && (
                                  <div className="absolute top-0.5 right-0.5 hidden group-hover:flex gap-0.5">
                                    <button
                                      onClick={() => openEdit(entry)}
                                      className="p-0.5 rounded bg-background/80 hover:bg-primary/10 text-primary transition-colors"
                                      title="Edit"
                                    >
                                      <Edit className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(entry.id)}
                                      className="p-0.5 rounded bg-background/80 hover:bg-destructive/10 text-destructive transition-colors"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground/30 text-xs">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role indicator */}
      {!isAdmin && (
        <p className="text-xs text-muted-foreground text-center">
          {isUrdu
            ? "آپ صرف نظام الاوقات دیکھ سکتے ہیں۔ ترمیم کے لیے ایڈمن سے رابطہ کریں۔"
            : "You can view the timetable only. Contact admin to make changes."}
        </p>
      )}

      {/* Add/Edit Dialog */}
      {isAdmin && (
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className={isUrdu ? "urdu-text" : ""}>
                {editingId
                  ? (isUrdu ? "اندراج میں ترمیم کریں" : "Edit Timetable Entry")
                  : (isUrdu ? "اندراج شامل کریں" : "Add Timetable Entry")}
              </DialogTitle>
            </DialogHeader>
            <div className={`space-y-4 py-2 ${isUrdu ? "urdu-text" : ""}`} dir={isUrdu ? "rtl" : "ltr"}>
              {/* Class */}
              <div className="space-y-1.5">
                <Label>{isUrdu ? "کلاس" : "Class"}</Label>
                <Select value={form.class_name} onValueChange={v => setForm(f => ({ ...f, class_name: v }))}>
                  <SelectTrigger><SelectValue placeholder={isUrdu ? "کلاس منتخب کریں" : "Select class"} /></SelectTrigger>
                  <SelectContent>
                    {CLASS_GROUPS.map(group => (
                      <div key={group.label}>
                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/50 mt-1 mb-0.5">
                          {group.icon} {trClassGroup(group.label, lang)}
                        </div>
                        {group.classes.map(c => <SelectItem key={c} value={c} className="pl-5">{trClass(c, lang)}</SelectItem>)}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Day */}
              <div className="space-y-1.5">
                <Label>{isUrdu ? "دن" : "Day"}</Label>
                <Select value={form.day} onValueChange={v => setForm(f => ({ ...f, day: v }))}>
                  <SelectTrigger><SelectValue placeholder={isUrdu ? "دن منتخب کریں" : "Select day"} /></SelectTrigger>
                  <SelectContent>
                    {DAYS_KEY.map((dayEn, idx) => (
                      <SelectItem key={dayEn} value={dayEn}>{isUrdu ? DAYS_UR[idx] : dayEn}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Times */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>{isUrdu ? "شروع کا وقت" : "Start Time"}</Label>
                  <Input type="time" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>{isUrdu ? "ختم ہونے کا وقت" : "End Time"}</Label>
                  <Input type="time" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} />
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <Label>{isUrdu ? "مضمون" : "Subject"}</Label>
                <div className="space-y-1.5">
                  <Input
                    placeholder={isUrdu ? "مثلاً: قرآن، قاعدہ، عربی..." : "e.g. Quran, Qaida, Arabic..."}
                    value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    list="subject-suggestions"
                  />
                  <datalist id="subject-suggestions">
                    {SUBJECTS_EN.map(s => <option key={s} value={s} />)}
                  </datalist>
                  <div className="flex flex-wrap gap-1.5">
                    {SUBJECTS_EN.slice(0, 6).map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, subject: s }))}
                        className="px-2 py-0.5 text-xs rounded-full border border-border hover:bg-muted transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Teacher */}
              <div className="space-y-1.5">
                <Label>{isUrdu ? "استاد" : "Teacher"}</Label>
                <Select value={form.teacher_id} onValueChange={handleTeacherChange}>
                  <SelectTrigger><SelectValue placeholder={isUrdu ? "استاد منتخب کریں" : "Select teacher"} /></SelectTrigger>
                  <SelectContent>
                    {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    <SelectItem value="_manual">Other / Manual</SelectItem>
                  </SelectContent>
                </Select>
                {(form.teacher_id === "_manual" || !form.teacher_id) && (
                  <Input
                    placeholder={isUrdu ? "استاد کا نام درج کریں" : "Enter teacher name manually"}
                    value={form.teacher_name}
                    onChange={e => setForm(f => ({ ...f, teacher_name: e.target.value }))}
                    className="mt-1"
                  />
                )}
              </div>

              {/* Room */}
              <div className="space-y-1.5">
                <Label>
                  {isUrdu ? "کمرہ نمبر" : "Room No."}{" "}
                  <span className="text-muted-foreground text-xs">({isUrdu ? "اختیاری" : "optional"})</span>
                </Label>
                <Input
                  placeholder={isUrdu ? "مثلاً: کمرہ 1" : "e.g. Room 1, Hifz Hall"}
                  value={form.room_no}
                  onChange={e => setForm(f => ({ ...f, room_no: e.target.value }))}
                />
              </div>

              {formError && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded px-3 py-2">
                  {formError}
                </div>
              )}
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                {isUrdu ? "منسوخ" : "Cancel"}
              </Button>
              <Button onClick={handleSave} data-testid="btn-save-entry">
                {isUrdu ? "محفوظ کریں" : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
