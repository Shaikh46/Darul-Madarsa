import { useState, useRef, useCallback } from "react";
import { useLS, Student, CLASS_GROUPS, JAMAAT_OPTIONS, exportToCSV } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Download, Edit, Trash2, Upload, CheckCircle2, X, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLang } from "@/lib/i18n";

const emptyForm = (): Omit<Student, "id"> => ({
  name: "",
  fatherName: "",
  motherName: "",
  className: "",
  jamaat: "General",
  phone: "",
  address: "",
  dob: "",
  admissionDate: new Date().toISOString().slice(0, 10),
  status: "Active",
  photo: "",
});

function validate(form: Omit<Student, "id">): string | null {
  if (!form.name.trim()) return "Full name is required.";
  if (!form.fatherName.trim()) return "Father's name is required.";
  if (!form.className) return "Class is required.";
  if (form.phone && !/^\d{10}$/.test(form.phone)) return "Phone must be exactly 10 digits.";
  return null;
}

export default function Students() {
  const { lang, tr } = useLang();
  const isUrdu = lang === "ur";
  const [students, setStudents] = useLS<Student[]>("students", []);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);
  const [importPreview, setImportPreview] = useState<Partial<Student>[]>([]);
  const [importRaw, setImportRaw] = useState<Partial<Student>[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const csvRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.fatherName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchClass = filterClass === "all" || s.className === filterClass;
    return matchSearch && matchClass;
  });

  const classes = Array.from(new Set(students.map(s => s.className))).filter(Boolean);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    setFormError(null);
    setSuccessMsg(false);
    setIsFormOpen(true);
  };

  const openEdit = (s: Student) => {
    setEditingId(s.id);
    setForm({ name: s.name, fatherName: s.fatherName, motherName: s.motherName || "", className: s.className, jamaat: s.jamaat || "General", phone: s.phone, address: s.address, dob: s.dob || "", admissionDate: s.admissionDate || "", status: s.status || "Active", photo: s.photo || "" });
    setFormError(null);
    setSuccessMsg(false);
    setIsFormOpen(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm(f => ({ ...f, photo: ev.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const err = validate(form);
    if (err) { setFormError(err); return; }
    setFormError(null);
    if (editingId) {
      setStudents(students.map(s => s.id === editingId ? { ...form, id: editingId } : s));
      toast({ title: "Student Updated", description: `${form.name} has been updated.` });
    } else {
      setStudents([...students, { ...form, id: `s${Date.now()}` }]);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    }
    setIsFormOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
      setStudents(students.filter(s => s.id !== id));
      toast({ title: "Student Deleted", description: `${name} has been removed.` });
    }
  };

  const handleExport = () => {
    exportToCSV(
      ["Name", "Father Name", "Mother Name", "Class", "Jamaat", "Phone", "Address", "DOB", "Admission Date", "Status"],
      filtered.map(s => [s.name, s.fatherName, s.motherName, s.className, s.jamaat || "", s.phone, s.address, s.dob || "", s.admissionDate || "", s.status || "Active"]),
      "students.csv"
    );
  };

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").filter(l => l.trim());
      const parsed: Partial<Student>[] = lines.slice(1).map(line => {
        const parts = line.split(",").map(p => p.trim().replace(/^"|"$/g, ""));
        return { name: parts[0], fatherName: parts[1], className: parts[2] || "General", phone: parts[3], address: parts[4] || "Kalgaon", jamaat: "General", status: "Active" as const };
      }).filter(s => s.name);
      setImportRaw(parsed);
      setImportPreview(parsed.slice(0, 5));
      setIsImportOpen(true);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const confirmImport = () => {
    const newStudents = importRaw.map((s, i) => ({ ...emptyForm(), ...s, id: `imp${Date.now()}_${i}` }));
    setStudents([...students, ...newStudents]);
    setIsImportOpen(false);
    toast({ title: "Import Successful", description: `${newStudents.length} students imported.` });
  };

  const setField = useCallback(<K extends keyof Omit<Student, "id">>(key: K, val: Omit<Student, "id">[K]) => {
    setForm(f => ({ ...f, [key]: val }));
  }, []);

  const statusColor = (s?: string) => {
    if (s === "Active") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (s === "Graduated") return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-gray-100 text-gray-600 border-gray-200";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Students</h1>
          <p className="text-muted-foreground mt-1">
            {students.length} total students &nbsp;·&nbsp; {filtered.length} shown
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input type="file" accept=".csv" ref={csvRef} className="hidden" onChange={handleCSVImport} />
          <Button variant="outline" size="sm" onClick={() => csvRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />{tr("importCsv")}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />{tr("exportCsv")}
          </Button>
          <Button size="sm" onClick={openAdd} data-testid="btn-add-student">
            <Plus className="w-4 h-4 mr-2" />{tr("addStudentBtn")}
          </Button>
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          <CheckCircle2 className="w-4 h-4" />
          {tr("studentAddedOk")}
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, class or father..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <Select value={filterClass} onValueChange={setFilterClass}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {CLASS_GROUPS.map(group => (
              <div key={group.label}>
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/50 mt-1 mb-0.5">
                  {group.icon} {group.label}
                </div>
                {group.classes.filter(c => classes.includes(c)).map(c => (
                  <SelectItem key={c} value={c} className="pl-5">{c}</SelectItem>
                ))}
              </div>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-md bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Father Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Jamaat</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(student => (
              <TableRow key={student.id} data-testid={`row-student-${student.id}`}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {student.photo ? (
                      <img src={student.photo} alt={student.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.dob ? `DOB: ${student.dob}` : ""}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{student.fatherName}</TableCell>
                <TableCell>{student.className}</TableCell>
                <TableCell><span className="text-xs bg-muted px-2 py-1 rounded-full">{student.jamaat || "—"}</span></TableCell>
                <TableCell className="text-sm">+91 {student.phone}</TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-1 rounded-full border ${statusColor(student.status)}`}>
                    {student.status || "Active"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(student)} data-testid={`btn-edit-${student.id}`}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(student.id, student.name)} data-testid={`btn-delete-${student.id}`}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                  {searchTerm ? "No students match your search." : "No students added yet."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Student" : "Add New Student"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Photo upload */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted">
                {form.photo ? (
                  <img src={form.photo} alt="Photo" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div>
                <input type="file" accept="image/*" ref={fileRef} className="hidden" onChange={handlePhotoUpload} />
                <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                  <Upload className="w-3.5 h-3.5 mr-2" /> Upload Photo
                </Button>
                {form.photo && (
                  <Button variant="ghost" size="sm" className="ml-2 text-destructive" onClick={() => setField("photo", "")}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                )}
                <p className="text-xs text-muted-foreground mt-1">Optional. Stored locally.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Full Name <span className="text-destructive">*</span></Label>
                <Input placeholder="Ahmed Khan" value={form.name} onChange={e => setField("name", e.target.value)} data-testid="input-name" />
              </div>
              <div className="space-y-1.5">
                <Label>Date of Birth</Label>
                <Input type="date" value={form.dob} onChange={e => setField("dob", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Father's Name <span className="text-destructive">*</span></Label>
                <Input placeholder="Rashid Khan" value={form.fatherName} onChange={e => setField("fatherName", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Mother's Name</Label>
                <Input placeholder="Fatima Khan" value={form.motherName} onChange={e => setField("motherName", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Class <span className="text-destructive">*</span></Label>
                <Select value={form.className} onValueChange={v => setField("className", v)}>
                  <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>
                    {CLASS_GROUPS.map(group => (
                      <div key={group.label}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/50 mt-1 mb-0.5">
                          {group.icon} {group.label}
                        </div>
                        {group.classes.map(c => (
                          <SelectItem key={c} value={c} className="pl-5">{c}</SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Jamaat</Label>
                <Select value={form.jamaat} onValueChange={v => setField("jamaat", v)}>
                  <SelectTrigger><SelectValue placeholder="Select jamaat" /></SelectTrigger>
                  <SelectContent>
                    {JAMAAT_OPTIONS.map(j => <SelectItem key={j} value={j}>{j}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Phone (+91)</Label>
                <div className="flex gap-1">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-sm text-muted-foreground">+91</span>
                  <Input placeholder="9876543210" value={form.phone} onChange={e => setField("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} className="rounded-l-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setField("status", v as Student["status"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Graduated">Graduated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Admission Date</Label>
                <Input type="date" value={form.admissionDate} onChange={e => setField("admissionDate", e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Address</Label>
              <Textarea placeholder="Village / Town, District" value={form.address} onChange={e => setField("address", e.target.value)} rows={2} />
            </div>

            {formError && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded px-3 py-2">
                {formError}
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setForm(emptyForm()); setFormError(null); }}>Reset</Button>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} data-testid="btn-save-student">
              {editingId ? "Update Student" : "Save Student"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CSV Import Preview Dialog */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Import Preview ({importRaw.length} students)</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Showing first {importPreview.length} rows. CSV format: Name, Father Name, Class, Phone, Address</p>
          <div className="border rounded-md overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Father</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Phone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {importPreview.map((s, i) => (
                  <TableRow key={i}>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>{s.fatherName}</TableCell>
                    <TableCell>{s.className}</TableCell>
                    <TableCell>{s.phone}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportOpen(false)}>Cancel</Button>
            <Button onClick={confirmImport}>Import All {importRaw.length} Students</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
