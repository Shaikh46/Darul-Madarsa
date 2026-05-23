import { useState } from "react";
import { useLS, exportToCSV } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Search, Download, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLang } from "@/lib/i18n";
import { format } from "date-fns";

interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
}

const CATEGORIES = ["Salary", "Maintenance", "Books", "Electricity", "Water", "Rent", "Food", "Transport", "Other"];

const CATEGORY_COLORS: Record<string, string> = {
  Salary: "bg-blue-100 text-blue-700",
  Maintenance: "bg-orange-100 text-orange-700",
  Books: "bg-emerald-100 text-emerald-700",
  Electricity: "bg-yellow-100 text-yellow-700",
  Water: "bg-cyan-100 text-cyan-700",
  Other: "bg-gray-100 text-gray-700",
};

export default function Expenses() {
  const { lang, tr } = useLang();
  const isUrdu = lang === "ur";
  const [expenses, setExpenses] = useLS<Expense[]>("expenses", []);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [amountError, setAmountError] = useState("");
  const { toast } = useToast();

  const filtered = expenses.filter(e => {
    const matchSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = filterCategory === "all" || e.category === filterCategory;
    return matchSearch && matchCat;
  });

  const totalExpenses = filtered.reduce((s, e) => s + e.amount, 0);

  const resetForm = () => { setCategory(""); setDescription(""); setAmount(""); setDate(format(new Date(), "yyyy-MM-dd")); setAmountError(""); };

  const handleAdd = () => {
    if (!category) { toast({ title: "Error", description: "Select a category.", variant: "destructive" }); return; }
    if (!description.trim()) { toast({ title: "Error", description: "Description is required.", variant: "destructive" }); return; }
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) { setAmountError("Amount must be a positive number."); return; }
    setAmountError("");
    const newExp: Expense = { id: `exp_${Date.now()}`, category, description, amount: amt, date: date || new Date().toISOString() };
    setExpenses([newExp, ...expenses]);
    toast({ title: "Expense Saved", description: `₹${amt} for ${category} recorded.` });
    resetForm();
    setIsAddOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this expense record?")) {
      setExpenses(expenses.filter(e => e.id !== id));
      toast({ title: "Expense Deleted" });
    }
  };

  const handleExport = () => {
    exportToCSV(
      ["Date", "Category", "Description", "Amount"],
      filtered.map(e => [e.date ? format(new Date(e.date), "dd MMM yyyy") : "", e.category, e.description, String(e.amount)]),
      "expenses.csv"
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-3xl font-bold text-foreground ${isUrdu ? "urdu-text" : ""}`}>{tr("expensesPage")}</h1>
          <p className={`text-muted-foreground mt-1 ${isUrdu ? "urdu-text" : ""}`}>{tr("trackExpenses")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />{tr("exportCsv")}
          </Button>
          <Button size="sm" onClick={() => { resetForm(); setIsAddOpen(true); }} data-testid="btn-add-expense">
            <Plus className="w-4 h-4 mr-2" />{tr("addExpenseBtn")}
          </Button>
        </div>
      </div>

      <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg flex items-center justify-between">
        <span className={`text-sm font-medium text-destructive ${isUrdu ? "urdu-text" : ""}`}>{tr("totalExpFiltered")}</span>
        <span className="text-2xl font-bold text-destructive">₹{totalExpenses.toLocaleString()}</span>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search description or category..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-md bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(e => (
              <TableRow key={e.id}>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {e.date ? format(new Date(e.date), "MMM d, yyyy") : "—"}
                </TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-1 rounded-full ${CATEGORY_COLORS[e.category] || "bg-gray-100 text-gray-600"}`}>
                    {e.category}
                  </span>
                </TableCell>
                <TableCell>{e.description}</TableCell>
                <TableCell className="text-right font-bold text-destructive">₹{e.amount.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(e.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className={`text-center h-24 text-muted-foreground ${isUrdu ? "urdu-text" : ""}`}>{tr("noExpenses")}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className={isUrdu ? "urdu-text" : ""}>{tr("addExpenseBtn")}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Category <span className="text-destructive">*</span></Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Description <span className="text-destructive">*</span></Label>
              <Input placeholder="Monthly electricity bill" value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Amount (₹) <span className="text-destructive">*</span></Label>
                <Input type="number" placeholder="5000" min="1" value={amount} onChange={e => { setAmount(e.target.value); setAmountError(""); }} />
                {amountError && <p className="text-xs text-destructive">{amountError}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Date <span className="text-destructive">*</span></Label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Save Expense</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
