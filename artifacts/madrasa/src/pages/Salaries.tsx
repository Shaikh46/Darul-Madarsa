import { useState } from "react";
import { useLS } from "@/lib/storage";
import { useLang } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Staff {
  id: string;
  name: string;
  role: string;
  basicSalary: number;
}

interface SalaryPayment {
  id: string;
  staffId: string;
  month: string;
  amount: number;
  date: string;
}

const ROLES_EN = ["Teacher", "Admin", "Clerk", "Security", "Cook"];
const ROLES_UR  = ["استاد", "منتظم", "کلرک", "سیکیورٹی", "باورچی"];

export default function Salaries() {
  const { lang, tr } = useLang();
  const isUrdu = lang === "ur";
  const [staff, setStaff] = useLS<Staff[]>("staff", []);
  const [payments, setPayments] = useLS<SalaryPayment[]>("salaries", []);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const { toast } = useToast();

  const roles = isUrdu ? ROLES_UR : ROLES_EN;

  const handleAddStaff = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newStaff: Staff = {
      id: `staff_${Date.now()}`,
      name: formData.get("name") as string,
      role: formData.get("role") as string,
      basicSalary: parseInt(formData.get("basicSalary") as string),
    };
    setStaff([...staff, newStaff]);
    setIsAddStaffOpen(false);
    toast({ title: isUrdu ? "عملہ شامل ہو گیا" : "Staff Added", description: newStaff.name });
  };

  const handlePay = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPayment: SalaryPayment = {
      id: `sal_${Date.now()}`,
      staffId: formData.get("staffId") as string,
      month: formData.get("month") as string,
      amount: parseInt(formData.get("amount") as string),
      date: new Date().toISOString(),
    };
    setPayments([newPayment, ...payments]);
    setIsPayOpen(false);
    toast({ title: isUrdu ? "تنخواہ ادا ہو گئی" : "Salary Paid", description: isUrdu ? "ادائیگی ریکارڈ ہو گئی۔" : "Payment recorded successfully." });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-bold text-foreground ${isUrdu ? "urdu-text" : ""}`}>{tr("salariesPage")}</h1>
          <p className={`text-muted-foreground mt-1 ${isUrdu ? "urdu-text" : ""}`}>{tr("manageStaffSal")}</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className={isUrdu ? "urdu-text" : ""}><Plus className="w-4 h-4 mr-2" /> {tr("addStaff")}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className={isUrdu ? "urdu-text" : ""}>{tr("addStaffMember")}</DialogTitle></DialogHeader>
              <form onSubmit={handleAddStaff} className="space-y-4">
                <div className="space-y-2">
                  <Label className={isUrdu ? "urdu-text" : ""}>{tr("name")}</Label>
                  <Input name="name" required />
                </div>
                <div className="space-y-2">
                  <Label className={isUrdu ? "urdu-text" : ""}>{tr("role")}</Label>
                  <Select name="role" required>
                    <SelectTrigger><SelectValue placeholder={tr("selectRole")} /></SelectTrigger>
                    <SelectContent>
                      {ROLES_EN.map((r, i) => (
                        <SelectItem key={r} value={r}>{roles[i]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className={isUrdu ? "urdu-text" : ""}>{tr("basicSalaryLabel")}</Label>
                  <Input type="number" name="basicSalary" required />
                </div>
                <DialogFooter>
                  <Button type="submit" className={isUrdu ? "urdu-text" : ""}>{tr("saveStaff")}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isPayOpen} onOpenChange={setIsPayOpen}>
            <DialogTrigger asChild>
              <Button className={isUrdu ? "urdu-text" : ""}><Plus className="w-4 h-4 mr-2" /> {tr("paySalary")}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className={isUrdu ? "urdu-text" : ""}>{tr("paySalary")}</DialogTitle></DialogHeader>
              <form onSubmit={handlePay} className="space-y-4">
                <div className="space-y-2">
                  <Label className={isUrdu ? "urdu-text" : ""}>{tr("staffMembers")}</Label>
                  <Select name="staffId" required>
                    <SelectTrigger><SelectValue placeholder={tr("selectStaff")} /></SelectTrigger>
                    <SelectContent>
                      {staff.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.role})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className={isUrdu ? "urdu-text" : ""}>{tr("month")}</Label>
                  <Input type="month" name="month" required />
                </div>
                <div className="space-y-2">
                  <Label className={isUrdu ? "urdu-text" : ""}>{tr("amountPaid")}</Label>
                  <Input type="number" name="amount" required />
                </div>
                <DialogFooter>
                  <Button type="submit" className={isUrdu ? "urdu-text" : ""}>{tr("recordPaymentBtn")}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="border rounded-md bg-card">
          <div className={`p-4 border-b bg-muted/50 font-semibold ${isUrdu ? "urdu-text" : ""}`}>{tr("staffDirectory")}</div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{tr("name")}</TableHead>
                <TableHead>{tr("role")}</TableHead>
                <TableHead>{tr("baseSalary")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map(s => {
                const roleIdx = ROLES_EN.indexOf(s.role);
                const roleLabel = roleIdx >= 0 ? roles[roleIdx] : s.role;
                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{roleLabel}</TableCell>
                    <TableCell>₹{s.basicSalary}</TableCell>
                  </TableRow>
                );
              })}
              {staff.length === 0 && (
                <TableRow><TableCell colSpan={3} className={`text-center h-24 text-muted-foreground ${isUrdu ? "urdu-text" : ""}`}>{tr("noStaffAdded")}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="border rounded-md bg-card">
          <div className={`p-4 border-b bg-muted/50 font-semibold ${isUrdu ? "urdu-text" : ""}`}>{tr("recentPayments")}</div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{tr("staffMembers")}</TableHead>
                <TableHead>{tr("month")}</TableHead>
                <TableHead>{tr("amount")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.slice(0, 10).map(p => {
                const s = staff.find(st => st.id === p.staffId);
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{s?.name || (isUrdu ? "نامعلوم" : "Unknown")}</TableCell>
                    <TableCell>{p.month}</TableCell>
                    <TableCell className="text-emerald-600 font-medium">₹{p.amount}</TableCell>
                  </TableRow>
                );
              })}
              {payments.length === 0 && (
                <TableRow><TableCell colSpan={3} className={`text-center h-24 text-muted-foreground ${isUrdu ? "urdu-text" : ""}`}>{tr("noPaymentsRecorded")}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
