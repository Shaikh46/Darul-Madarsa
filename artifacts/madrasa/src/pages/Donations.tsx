import { useState } from "react";
import { useLS } from "@/lib/storage";
import { useLang } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Printer, MessageSquare, PieChart as PieChartIcon } from "lucide-react";
import { format } from "date-fns";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface Donation {
  id: string;
  receiptNo: string;
  donorName: string;
  phone: string;
  amount: number;
  donationType: string;
  paymentMethod: string;
  transactionId?: string;
  date: string;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--chart-2))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function Donations() {
  const { lang, tr } = useLang();
  const isUrdu = lang === "ur";
  const [donations, setDonations] = useLS<Donation[]>("donations", []);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const generateReceiptNo = () => `DSIK/DON/2026/${String(donations.length + 1).padStart(5, '0')}`;

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newDonation: Donation = {
      id: `don_${Date.now()}`,
      receiptNo: generateReceiptNo(),
      donorName: formData.get("donorName") as string,
      phone: formData.get("phone") as string,
      amount: parseInt(formData.get("amount") as string),
      donationType: formData.get("donationType") as string,
      paymentMethod: formData.get("paymentMethod") as string,
      transactionId: formData.get("transactionId") as string,
      date: new Date().toISOString(),
    };
    setDonations([newDonation, ...donations]);
    setIsAddOpen(false);
  };

  const handlePrint = (don: Donation) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Donation Receipt - ${don.receiptNo}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #008000; padding-bottom: 20px; margin-bottom: 20px; }
            h1 { color: #008000; margin: 0; }
            .details { margin: 20px 0; }
            .row { display: flex; justify-content: space-between; border-bottom: 1px dashed #ccc; padding: 10px 0; }
            .amount { font-size: 24px; font-weight: bold; text-align: center; margin: 30px 0; color: #008000; border: 2px solid #008000; padding: 10px; border-radius: 8px;}
            .footer { margin-top: 50px; text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Darul Uloom Sirajul Islam</h1>
            <p>Kalgaon, Maharashtra</p>
            <h3>DONATION RECEIPT</h3>
          </div>
          <div class="details">
            <div class="row"><span>Receipt No:</span> <strong>${don.receiptNo}</strong></div>
            <div class="row"><span>Date:</span> <strong>${format(new Date(don.date), "dd MMM yyyy")}</strong></div>
            <div class="row"><span>Received From:</span> <strong>${don.donorName}</strong></div>
            <div class="row"><span>Type:</span> <strong>${don.donationType}</strong></div>
            <div class="row"><span>Payment Mode:</span> <strong>${don.paymentMethod}</strong></div>
            ${don.transactionId ? `<div class="row"><span>Transaction ID:</span> <strong>${don.transactionId}</strong></div>` : ''}
          </div>
          <div class="amount">
            ₹ ${don.amount.toLocaleString()}
          </div>
          <p style="text-align: center; font-style: italic;">Jazakallah Khair for your generous contribution.</p>
          <div class="footer">
            <p>_______________________</p>
            <p>Authorized Signatory</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const sendWhatsApp = (don: Donation) => {
    const msg = `As-salamu alaykum ${don.donorName},\n\nJazakallah Khair for your generous donation of ₹${don.amount} towards Darul Uloom Sirajul Islam (${don.donationType}).\nYour receipt number is ${don.receiptNo}.\n\nMay Allah reward you abundantly.`;
    window.open(`https://wa.me/${don.phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const zakatTotal = donations.filter(d => d.donationType === "Zakat").reduce((sum, d) => sum + d.amount, 0);
  const generalTotal = donations.filter(d => d.donationType !== "Zakat").reduce((sum, d) => sum + d.amount, 0);

  // Group donations by type for the pie chart
  const pieData = donations.reduce((acc, curr) => {
    const existing = acc.find(item => item.name === curr.donationType);
    if (existing) {
      existing.value += curr.amount;
    } else {
      acc.push({ name: curr.donationType, value: curr.amount });
    }
    return acc;
  }, [] as { name: string, value: number }[]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-bold text-foreground ${isUrdu ? "urdu-text" : ""}`}>{tr("donationsPage")}</h1>
          <p className="text-muted-foreground mt-1">{isUrdu ? "مدرسہ فنڈز کا انتظام اور رسید" : "Manage and receipt madrasa funds"}</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button data-testid="btn-new-donation"><Plus className="w-4 h-4 mr-2" />{tr("newDonation")}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className={isUrdu ? "urdu-text" : ""}>{tr("recordDonation")}</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label>Donor Name</Label>
                <Input name="donorName" required />
              </div>
              <div className="space-y-2">
                <Label>Phone Number (WhatsApp)</Label>
                <Input name="phone" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount (₹)</Label>
                  <Input type="number" name="amount" required />
                </div>
                <div className="space-y-2">
                  <Label>Donation Type</Label>
                  <Select name="donationType" required defaultValue="General">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="Zakat">Zakat</SelectItem>
                      <SelectItem value="Sadaqah">Sadaqah</SelectItem>
                      <SelectItem value="Fitrana">Fitrana</SelectItem>
                      <SelectItem value="Construction">Construction Fund</SelectItem>
                      <SelectItem value="Student Fund">Student Fund</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select name="paymentMethod" required defaultValue="Cash">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="UPI">UPI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Transaction ID (Optional)</Label>
                  <Input name="transactionId" />
                </div>
              </div>
              <DialogFooter><Button type="submit">Generate Receipt</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-lg bg-card border shadow-sm flex flex-col justify-center">
          <p className="text-sm font-medium text-muted-foreground">Total Collections</p>
          <h3 className="text-3xl font-bold mt-2">₹{(zakatTotal + generalTotal).toLocaleString()}</h3>
        </div>
        <div className="p-6 rounded-lg bg-card border shadow-sm border-l-4 border-l-primary flex flex-col justify-center">
          <p className="text-sm font-medium text-muted-foreground">General Funds</p>
          <h3 className="text-3xl font-bold mt-2">₹{generalTotal.toLocaleString()}</h3>
        </div>
        <div className="p-6 rounded-lg bg-card border shadow-sm border-l-4 border-l-accent flex flex-col justify-center">
          <p className="text-sm font-medium text-muted-foreground">Zakat Collection</p>
          <h3 className="text-3xl font-bold mt-2">₹{zakatTotal.toLocaleString()}</h3>
        </div>
      </div>

      {pieData.length > 0 && (
        <div className="p-6 border rounded-md bg-card">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
            <PieChartIcon className="w-5 h-5 text-primary" />
            Donation Types Distribution
          </h3>
          <div className="h-[300px] w-full max-w-lg mx-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Donations</TabsTrigger>
          <TabsTrigger value="zakat">Zakat Registry</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <div className="border rounded-md bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Donor</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donations.map(d => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono text-xs">{d.receiptNo}</TableCell>
                    <TableCell className="font-medium">{d.donorName}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${d.donationType === 'Zakat' ? 'bg-accent/20 text-accent-foreground' : 'bg-primary/10 text-primary'}`}>
                        {d.donationType}
                      </span>
                    </TableCell>
                    <TableCell className="font-bold">₹{d.amount}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handlePrint(d)} title="Print Receipt">
                        <Printer className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-emerald-600" onClick={() => sendWhatsApp(d)} title="Send WhatsApp">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {donations.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No donations recorded.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="zakat" className="mt-4">
          <div className="border rounded-md bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Donor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donations.filter(d => d.donationType === "Zakat").map(d => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono text-xs">{d.receiptNo}</TableCell>
                    <TableCell className="font-medium">{d.donorName}</TableCell>
                    <TableCell className="font-bold">₹{d.amount}</TableCell>
                    <TableCell>{format(new Date(d.date), "dd MMM yyyy")}</TableCell>
                  </TableRow>
                ))}
                {donations.filter(d => d.donationType === "Zakat").length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center h-24 text-muted-foreground">No zakat donations recorded.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}