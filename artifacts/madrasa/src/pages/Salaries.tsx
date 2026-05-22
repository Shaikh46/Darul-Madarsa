import { useState } from "react";
import { useLS } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Check } from "lucide-react";
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

export default function Salaries() {
  const [staff, setStaff] = useLS<Staff[]>("staff", []);
  const [payments, setPayments] = useLS<SalaryPayment[]>("salaries", []);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const { toast } = useToast();

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
    toast({ title: "Salary Paid", description: "Payment recorded successfully." });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Salaries</h1>
          <p className="text-muted-foreground mt-1">Manage staff and salaries</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
            <DialogTrigger asChild>
              <Button variant="outline"><Plus className="w-4 h-4 mr-2" /> Add Staff</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Staff Member</DialogTitle></DialogHeader>
              <form onSubmit={handleAddStaff} className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input name="name" required />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select name="role" required>
                    <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Teacher">Teacher</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Clerk">Clerk</SelectItem>
                      <SelectItem value="Security">Security</SelectItem>
                      <SelectItem value="Cook">Cook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Basic Salary (₹)</Label>
                  <Input type="number" name="basicSalary" required />
                </div>
                <DialogFooter><Button type="submit">Save Staff</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isPayOpen} onOpenChange={setIsPayOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" /> Pay Salary</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Pay Salary</DialogTitle></DialogHeader>
              <form onSubmit={handlePay} className="space-y-4">
                <div className="space-y-2">
                  <Label>Staff Member</Label>
                  <Select name="staffId" required>
                    <SelectTrigger><SelectValue placeholder="Select staff" /></SelectTrigger>
                    <SelectContent>
                      {staff.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.role})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Month</Label>
                  <Input type="month" name="month" required />
                </div>
                <div className="space-y-2">
                  <Label>Amount Paid (₹)</Label>
                  <Input type="number" name="amount" required />
                </div>
                <DialogFooter><Button type="submit">Record Payment</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="border rounded-md bg-card">
          <div className="p-4 border-b bg-muted/50 font-semibold">Staff Directory</div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Base Salary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{s.role}</TableCell>
                  <TableCell>₹{s.basicSalary}</TableCell>
                </TableRow>
              ))}
              {staff.length === 0 && (
                <TableRow><TableCell colSpan={3} className="text-center h-24 text-muted-foreground">No staff added.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="border rounded-md bg-card">
          <div className="p-4 border-b bg-muted/50 font-semibold">Recent Payments</div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.slice(0, 10).map(p => {
                const s = staff.find(st => st.id === p.staffId);
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{s?.name || "Unknown"}</TableCell>
                    <TableCell>{p.month}</TableCell>
                    <TableCell className="text-emerald-600 font-medium">₹{p.amount}</TableCell>
                  </TableRow>
                );
              })}
              {payments.length === 0 && (
                <TableRow><TableCell colSpan={3} className="text-center h-24 text-muted-foreground">No payments recorded.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
