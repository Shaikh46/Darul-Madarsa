import { useState } from "react";
import { useLS, Student } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, CheckCircle2, Clock } from "lucide-react";

interface FeePayment {
  id: string;
  receiptNo: string;
  studentId: string;
  month: string;
  amount: number;
  paymentMethod: string;
  status: "paid" | "pending";
  date: string;
}

export default function Fees() {
  const [students] = useLS<Student[]>("students", []);
  const [fees, setFees] = useLS<FeePayment[]>("fees", []);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const generateReceiptNo = () => {
    return `DSIK/FEE/2026/${String(fees.length + 1).padStart(5, '0')}`;
  };

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newFee: FeePayment = {
      id: `fee_${Date.now()}`,
      receiptNo: generateReceiptNo(),
      studentId: formData.get("studentId") as string,
      month: formData.get("month") as string,
      amount: parseInt(formData.get("amount") as string),
      paymentMethod: formData.get("paymentMethod") as string,
      status: formData.get("status") as "paid" | "pending",
      date: new Date().toISOString(),
    };
    setFees([newFee, ...fees]);
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fee Management</h1>
          <p className="text-muted-foreground mt-1">Record and track student fees</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Record Payment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Record Fee Payment</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label>Student</Label>
                <Select name="studentId" required>
                  <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                  <SelectContent>
                    {students.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.className})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Month</Label>
                  <Input name="month" type="month" required />
                </div>
                <div className="space-y-2">
                  <Label>Amount (₹)</Label>
                  <Input type="number" name="amount" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select name="paymentMethod" defaultValue="Cash">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Online/UPI">Online / UPI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select name="status" defaultValue="paid">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save Record</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Receipt No</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Month</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fees.map(f => {
              const student = students.find(s => s.id === f.studentId);
              return (
                <TableRow key={f.id}>
                  <TableCell className="font-mono text-sm">{f.receiptNo}</TableCell>
                  <TableCell className="font-medium">{student?.name || "Unknown"}</TableCell>
                  <TableCell>{f.month}</TableCell>
                  <TableCell>₹{f.amount}</TableCell>
                  <TableCell>
                    {f.status === 'paid' ? (
                      <span className="flex items-center text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md w-fit text-sm">
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Paid
                      </span>
                    ) : (
                      <span className="flex items-center text-amber-600 bg-amber-50 px-2 py-1 rounded-md w-fit text-sm">
                        <Clock className="w-4 h-4 mr-1" /> Pending
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {fees.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No fee records found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
