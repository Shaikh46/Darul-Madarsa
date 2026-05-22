import { useState } from "react";
import { useLS } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { format } from "date-fns";

interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
}

export default function Expenses() {
  const [expenses, setExpenses] = useLS<Expense[]>("expenses", []);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newExpense: Expense = {
      id: `exp_${Date.now()}`,
      category: formData.get("category") as string,
      description: formData.get("description") as string,
      amount: parseInt(formData.get("amount") as string),
      date: formData.get("date") as string || new Date().toISOString(),
    };
    setExpenses([newExpense, ...expenses]);
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Expenses</h1>
          <p className="text-muted-foreground mt-1">Record and track madrasa expenses</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add Expense</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Expense</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select name="category" required>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Salary">Salary</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Books">Books</SelectItem>
                    <SelectItem value="Electricity">Electricity</SelectItem>
                    <SelectItem value="Water">Water</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input name="description" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount (₹)</Label>
                  <Input type="number" name="amount" required />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" name="date" required defaultValue={format(new Date(), "yyyy-MM-dd")} />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="p-4 bg-primary/10 rounded-lg flex items-center justify-between">
        <span className="text-lg font-medium text-primary">Total Expenses</span>
        <span className="text-2xl font-bold text-primary">₹{totalExpenses.toLocaleString()}</span>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map(e => (
              <TableRow key={e.id}>
                <TableCell>{format(new Date(e.date), "MMM d, yyyy")}</TableCell>
                <TableCell>
                  <span className="bg-muted px-2 py-1 rounded text-xs">{e.category}</span>
                </TableCell>
                <TableCell>{e.description}</TableCell>
                <TableCell className="text-right font-medium">₹{e.amount}</TableCell>
              </TableRow>
            ))}
            {expenses.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">No expenses recorded.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
