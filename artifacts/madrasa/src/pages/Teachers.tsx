import { useState, useCallback } from "react";
import { useLS, Teacher, CLASS_GROUPS, exportToCSV, trClass, trClassGroup } from "@/lib/storage";
import { useLang } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, Plus, Download, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const emptyForm = (): Omit<Teacher, "id"> => ({
  name: "",
  email: "",
  phone: "",
  assignedClass: "",
  qualification: "",
  joiningDate: new Date().toISOString().slice(0, 10),
  status: "Active",
});

function validate(f: Omit<Teacher, "id">): string | null {
  if (!f.name.trim()) return "Full name is required.";
  if (f.phone && !/^\d{10}$/.test(f.phone)) return "Phone must be exactly 10 digits.";
  if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) return "Enter a valid email address.";
  return null;
}

export default function Teachers() {
  const { lang, tr } = useLang();
  const isUrdu = lang === "ur";
  const [teachers, setTeachers] = useLS<Teacher[]>("teachers", []);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [formError, setFormError] = useState<string | null>(null);
  const { toast } = useToast();

  const filtered = teachers.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.assignedClass.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.qualification.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEdit = (t: Teacher) => {
    setEditingId(t.id);
    setForm({ name: t.name, email: t.email, phone: t.phone, assignedClass: t.assignedClass, qualification: t.qualification, joiningDate: t.joiningDate, status: t.status });
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleSave = () => {
    const err = validate(form);
    if (err) { setFormError(err); return; }
    if (editingId) {
      setTeachers(teachers.map(t => t.id === editingId ? { ...form, id: editingId } : t));
      toast({ title: isUrdu ? "استاد تازہ ہو گیا" : "Teacher Updated", description: form.name });
    } else {
      setTeachers([...teachers, { ...form, id: `t${Date.now()}` }]);
      toast({ title: isUrdu ? "استاد شامل ہو گیا" : "Teacher Added", description: form.name });
    }
    setIsFormOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(isUrdu ? `"${name}" کو حذف کریں؟ یہ واپس نہیں ہو سکتا۔` : `Delete "${name}"? This cannot be undone.`)) {
      setTeachers(teachers.filter(t => t.id !== id));
      toast({ title: isUrdu ? "استاد ہٹا دیا گیا" : "Teacher Removed", description: name });
    }
  };

  const handleExport = () => {
    exportToCSV(
      ["Name", "Email", "Phone", "Assigned Class", "Qualification", "Joining Date", "Status"],
      filtered.map(t => [t.name, t.email, t.phone, t.assignedClass, t.qualification, t.joiningDate, t.status]),
      "teachers.csv"
    );
  };

  const setField = useCallback(<K extends keyof Omit<Teacher, "id">>(key: K, val: Omit<Teacher, "id">[K]) => {
    setForm(f => ({ ...f, [key]: val }));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-3xl font-bold text-foreground ${isUrdu ? "urdu-text" : ""}`}>{tr("teachersPage")}</h1>
          <p className={`text-muted-foreground mt-1 ${isUrdu ? "urdu-text" : ""}`}>{teachers.length} {tr("staffMembers")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />{tr("exportCsv")}
          </Button>
          <Button size="sm" onClick={openAdd} data-testid="btn-add-teacher">
            <Plus className="w-4 h-4 mr-2" />{tr("addTeacherBtn")}
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder={tr("searchNameClass")} className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      <div className="border rounded-md bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{tr("name")}</TableHead>
              <TableHead>{tr("assignedClass")}</TableHead>
              <TableHead>{tr("qualification")}</TableHead>
              <TableHead>{tr("phone")}</TableHead>
              <TableHead>{tr("joiningDate")}</TableHead>
              <TableHead>{tr("status")}</TableHead>
              <TableHead className="text-right">{tr("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(t => (
              <TableRow key={t.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.email}</p>
                  </div>
                </TableCell>
                <TableCell>{t.assignedClass ? trClass(t.assignedClass, lang) : "—"}</TableCell>
                <TableCell>{t.qualification || "—"}</TableCell>
                <TableCell>+91 {t.phone}</TableCell>
                <TableCell>{t.joiningDate}</TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-1 rounded-full border ${t.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-600"}`}>
                    {t.status === "Active" ? tr("active") : tr("inactive")}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(t)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(t.id, t.name)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className={`text-center h-24 text-muted-foreground ${isUrdu ? "urdu-text" : ""}`}>{tr("noTeachersFound")}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className={isUrdu ? "urdu-text" : ""}>{editingId ? tr("editTeacher") : tr("addNewTeacher")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label className={isUrdu ? "urdu-text" : ""}>{tr("fullName")} <span className="text-destructive">*</span></Label>
                <Input placeholder="Maulana Abdul Rahman" value={form.name} onChange={e => setField("name", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className={isUrdu ? "urdu-text" : ""}>{tr("email")}</Label>
                <Input type="email" placeholder="teacher@dsik.edu" value={form.email} onChange={e => setField("email", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className={isUrdu ? "urdu-text" : ""}>{tr("phone")} (+91)</Label>
                <div className="flex gap-1">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-sm text-muted-foreground">+91</span>
                  <Input placeholder="9876500001" value={form.phone} onChange={e => setField("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} className="rounded-l-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className={isUrdu ? "urdu-text" : ""}>{tr("assignedClass")}</Label>
                <Select value={form.assignedClass} onValueChange={v => setField("assignedClass", v)}>
                  <SelectTrigger><SelectValue placeholder={isUrdu ? "کلاس منتخب کریں" : "Select class"} /></SelectTrigger>
                  <SelectContent>
                    {CLASS_GROUPS.map(group => (
                      <div key={group.label}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/50 mt-1 mb-0.5">
                          {group.icon} {trClassGroup(group.label, lang)}
                        </div>
                        {group.classes.map(c => (
                          <SelectItem key={c} value={c} className="pl-5">{trClass(c, lang)}</SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className={isUrdu ? "urdu-text" : ""}>{tr("qualification")}</Label>
                <Input placeholder="Dars-e-Nizami" value={form.qualification} onChange={e => setField("qualification", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className={isUrdu ? "urdu-text" : ""}>{tr("joiningDate")}</Label>
                <Input type="date" value={form.joiningDate} onChange={e => setField("joiningDate", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className={isUrdu ? "urdu-text" : ""}>{tr("status")}</Label>
                <Select value={form.status} onValueChange={v => setField("status", v as Teacher["status"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">{tr("active")}</SelectItem>
                    <SelectItem value="Inactive">{tr("inactive")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {formError && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded px-3 py-2">{formError}</div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setForm(emptyForm()); setFormError(null); }} className={isUrdu ? "urdu-text" : ""}>{tr("reset")}</Button>
            <Button variant="outline" onClick={() => setIsFormOpen(false)} className={isUrdu ? "urdu-text" : ""}>{tr("cancel")}</Button>
            <Button onClick={handleSave} className={isUrdu ? "urdu-text" : ""}>{editingId ? tr("updateTeacher") : tr("saveTeacher")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
