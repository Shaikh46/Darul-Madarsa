import { useState } from "react";
import { useLS, Student, exportToCSV } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, CheckCircle2, Clock, Search, Download, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FeePayment {
  id: string;
  receiptNo: string;
  studentId: string;
  month: string;
  year: string;
  amount: number;
  paymentMethod: string;
  status: "paid" | "pending";
  date: string;
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function Fees() {
  const [students] = useLS<Student[]>("students", []);
  const [fees, setFees] = useLS<FeePayment[]>("fees", []);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMethod, setSelectedMethod] = useState("Cash");
  const [selectedStatus, setSelectedStatus] = useState<"paid"|"pending">("paid");
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const { toast } = useToast();

  const generateReceiptNo = () => `DSIK/FEE/2026/${String(fees.length + 1).padStart(5, "0")}`;

  const filtered = fees.filter(f => {
    const student = students.find(s => s.id === f.studentId);
    const matchSearch = (student?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.receiptNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "all" || f.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalPaid = fees.filter(f => f.status === "paid").reduce((s, f) => s + f.amount, 0);
  const totalPending = fees.filter(f => f.status === "pending").reduce((s, f) => s + f.amount, 0);

  const resetForm = () => {
    setSelectedStudentId(""); setSelectedMonth(""); setSelectedYear(new Date().getFullYear().toString());
    setSelectedMethod("Cash"); setSelectedStatus("paid"); setAmount(""); setAmountError("");
  };

  const handleAdd = () => {
    if (!selectedStudentId) { toast({ title: "Error", description: "Please select a student.", variant: "destructive" }); return; }
    if (!selectedMonth) { toast({ title: "Error", description: "Please select a month.", variant: "destructive" }); return; }
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) { setAmountError("Amount must be a positive number."); return; }
    setAmountError("");
    const newFee: FeePayment = {
      id: `fee_${Date.now()}`,
      receiptNo: generateReceiptNo(),
      studentId: selectedStudentId,
      month: selectedMonth,
      year: selectedYear,
      amount: amt,
      paymentMethod: selectedMethod,
      status: selectedStatus,
      date: new Date().toISOString(),
    };
    setFees([newFee, ...fees]);
    toast({ title: "Fee Recorded", description: `Receipt ${newFee.receiptNo} generated.` });
    resetForm();
    setIsAddOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this fee record?")) {
      setFees(fees.filter(f => f.id !== id));
      toast({ title: "Record Deleted" });
    }
  };

  const handleExport = () => {
    exportToCSV(
      ["Receipt No", "Student", "Month", "Year", "Amount", "Method", "Status", "Date"],
      filtered.map(f => {
        const s = students.find(st => st.id === f.studentId);
        return [f.receiptNo, s?.name || "Unknown", f.month, f.year || "", String(f.amount), f.paymentMethod, f.status, new Date(f.date).toLocaleDateString()];
      }),
      "fees.csv"
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fee Management</h1>
          <p className="text-muted-foreground mt-1">Record and track student fees</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Button size="sm" onClick={() => { resetForm(); setIsAddOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Record Payment
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
          <p className="text-xs text-emerald-600 font-medium">Total Collected</p>
          <p className="text-2xl font-bold text-emerald-700">₹{totalPaid.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
          <p className="text-xs text-amber-600 font-medium">Pending Dues</p>
          <p className="text-2xl font-bold text-amber-700">₹{totalPending.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 col-span-2 md:col-span-1">
          <p className="text-xs text-primary font-medium">Total Records</p>
          <p className="text-2xl font-bold text-primary">{fees.length}</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by student or receipt..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-md bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Receipt No</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Month / Year</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(f => {
              const student = students.find(s => s.id === f.studentId);
              return (
                <TableRow key={f.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{f.receiptNo}</TableCell>
                  <TableCell className="font-medium">{student?.name || "Unknown"}<br /><span className="text-xs text-muted-foreground">{student?.className}</span></TableCell>
                  <TableCell>{f.month} {f.year || ""}</TableCell>
                  <TableCell className="font-bold">₹{f.amount.toLocaleString()}</TableCell>
                  <TableCell><span className="text-xs bg-muted px-2 py-1 rounded-full">{f.paymentMethod}</span></TableCell>
                  <TableCell>
                    {f.status === "paid" ? (
                      <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full text-xs w-fit">
                        <CheckCircle2 className="w-3 h-3" /> Paid
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full text-xs w-fit">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(f.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">No fee records found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Record Fee Payment</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Student <span className="text-destructive">*</span></Label>
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>
                  {students.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.className})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Month <span className="text-destructive">*</span></Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger><SelectValue placeholder="Select month" /></SelectTrigger>
                  <SelectContent>
                    {MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Year</Label>
                <Input value={selectedYear} onChange={e => setSelectedYear(e.target.value)} placeholder="2026" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Amount (₹) <span className="text-destructive">*</span></Label>
              <Input type="number" placeholder="1500" value={amount} onChange={e => { setAmount(e.target.value); setAmountError(""); }} min="1" />
              {amountError && <p className="text-xs text-destructive">{amountError}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Payment Method</Label>
                <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Online/UPI">Online / UPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={selectedStatus} onValueChange={v => setSelectedStatus(v as "paid"|"pending")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Save Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
