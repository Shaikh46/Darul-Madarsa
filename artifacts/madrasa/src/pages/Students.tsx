import { useState } from "react";
import { useLS, Student } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Search, Plus, Download, Edit, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function Students() {
  const [students, setStudents] = useLS<Student[]>("students", []);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.className.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const studentData: Student = {
      id: editingStudent?.id || `s${Date.now()}`,
      name: formData.get("name") as string,
      fatherName: formData.get("fatherName") as string,
      motherName: formData.get("motherName") as string,
      className: formData.get("className") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
    };

    if (editingStudent) {
      setStudents(students.map(s => s.id === editingStudent.id ? studentData : s));
    } else {
      setStudents([...students, studentData]);
    }
    
    setIsAddOpen(false);
    setEditingStudent(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this student?")) {
      setStudents(students.filter(s => s.id !== id));
    }
  };

  const exportCSV = () => {
    const headers = ["Name,Father Name,Class,Phone,Address"];
    const rows = students.map(s => `${s.name},${s.fatherName},${s.className},${s.phone},${s.address}`);
    const csvContent = headers.concat(rows).join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "students.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Students</h1>
          <p className="text-muted-foreground mt-1">Manage student records</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={exportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingStudent(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingStudent ? "Edit Student" : "Add New Student"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSave} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" name="name" defaultValue={editingStudent?.name} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="className">Class</Label>
                    <Input id="className" name="className" defaultValue={editingStudent?.className} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fatherName">Father's Name</Label>
                    <Input id="fatherName" name="fatherName" defaultValue={editingStudent?.fatherName} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="motherName">Mother's Name</Label>
                    <Input id="motherName" name="motherName" defaultValue={editingStudent?.motherName} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" defaultValue={editingStudent?.phone} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" name="address" defaultValue={editingStudent?.address} required />
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button type="submit">{editingStudent ? "Update" : "Save"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or class..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Father Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.fatherName}</TableCell>
                  <TableCell>{student.className}</TableCell>
                  <TableCell>{student.phone}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        setEditingStudent(student);
                        setIsAddOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(student.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  No students found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
