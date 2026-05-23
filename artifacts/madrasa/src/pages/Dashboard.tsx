import { useState, useEffect, useCallback, useRef } from "react";
import { useLS, CLASS_GROUPS, trClass, trClassGroup } from "@/lib/storage";
import type { Student, Teacher } from "@/lib/storage";
import { useLang } from "@/lib/i18n";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  UserCheck,
  CreditCard,
  HeartHandshake,
  BookOpen,
  RefreshCw,
  Plus,
  Bell,
  Download,
  FileText,
  AlertCircle,
  X,
  TrendingUp,
  TrendingDown,
  Calendar,
  UserCog,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const feeData = [
  { name: "Aug", amount: 0 },
  { name: "Sep", amount: 0 },
  { name: "Oct", amount: 0 },
  { name: "Nov", amount: 0 },
  { name: "Dec", amount: 0 },
  { name: "Jan", amount: 0 },
];

const PIE_COLORS = ["#008000", "#DAA520", "#2563eb", "#9333ea", "#10b981"];

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const weekAttendance = [0, 0, 0, 0, 0, 0, 0];

function getHijriDate(lang: "en" | "ur" = "en"): string {
  // Anchor: 18 May 2026 = 1 Zil Hijjah 1447 (verified reference point)
  const ANCHOR_GREG = new Date(2026, 4, 18);
  const AVG = 29.53059;
  const AVG_YEAR = AVG * 12;
  const ANCHOR_TOTAL = (1447 - 1) * AVG_YEAR + (12 - 1) * AVG + (1 - 1);
  const today = new Date();
  const diffDays = Math.round((today.getTime() - ANCHOR_GREG.getTime()) / 86400000);
  const total = ANCHOR_TOTAL + diffDays;
  const hYear = Math.floor(total / AVG_YEAR) + 1;
  const rem1 = total % AVG_YEAR;
  const hMonth = Math.min(Math.floor(rem1 / AVG) + 1, 12);
  const hDay = Math.min(Math.floor(rem1 % AVG) + 1, 30);
  const monthsEn = ["Muharram","Safar","Rabi ul Awwal","Rabi ul Thani","Jamadi ul Awwal","Jamadi ul Thani","Rajab","Sha'ban","Ramadan","Shawwal","Zil Qa'dah","Zil Hijjah"];
  const monthsUr = ["محرم","صفر","ربیع الاول","ربیع الثانی","جمادی الاول","جمادی الثانی","رجب","شعبان","رمضان","شوال","ذوالقعدہ","ذوالحجہ"];
  const mIdx = Math.max(0, Math.min(hMonth - 1, 11));
  if (lang === "ur") return `${hDay} ${monthsUr[mIdx]} ${hYear} ہجری`;
  return `${hDay} ${monthsEn[mIdx]} ${hYear} AH`;
}

function getGreeting(lang: "en" | "ur", tr: (k: string) => string): string {
  const hour = new Date().getHours();
  if (hour < 12) return tr("goodMorning");
  if (hour < 16) return tr("goodAfternoon");
  return tr("goodEvening");
}

function getHeatmapColor(pct: number): string {
  if (pct >= 90) return "#008000";
  if (pct >= 70) return "#DAA520";
  return "#ef4444";
}

interface Donation {
  id: string;
  donorName: string;
  phone?: string;
  amount: number;
  donationType: string;
  date: string;
  receiptNo: string;
}

interface Fee {
  id: string;
  studentName?: string;
  amount: number;
  date: string;
  status: string;
  receiptNo?: string;
}

interface HifzRecord {
  studentId: string;
  studentName: string;
  currentJuz: number;
}

interface Expense {
  id: string;
  amount: number;
  date: string;
}

export default function Dashboard() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAlert, setShowAlert] = useState(true);
  const [teachers, setTeachers] = useLS<Teacher[]>("teachers", []);
  const [donations, setDonations] = useLS<Donation[]>("donations", []);
  const [fees, setFees] = useLS<Fee[]>("fees", []);
  const [hifzProgress] = useLS<HifzRecord[]>("hifz_progress", []);
  const [expenses, setExpenses] = useLS<Expense[]>("expenses", []);
  const [, setLocation] = useLocation();
  const { lang, tr } = useLang();
  const { toast } = useToast();
  const isUrdu = lang === "ur";

  // ── Quick Action modal state ──────────────────────────────────────────
  type ModalType = "student" | "teacher" | "donation" | "fee" | "expense" | null;
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [students, setStudents] = useLS<Student[]>("students", []);

  const [studentForm, setStudentForm] = useState({ name: "", fatherName: "", className: "", phone: "" });
  const [teacherForm, setTeacherForm] = useState({ name: "", email: "", phone: "", assignedClass: "", qualification: "" });
  const [donationForm, setDonationForm] = useState({ donorName: "", phone: "", amount: "", donationType: "General", date: new Date().toISOString().slice(0, 10) });
  const [feeForm, setFeeForm] = useState({ studentId: "", month: "", year: new Date().getFullYear().toString(), amount: "1500", paymentMethod: "Cash" });
  const [expenseForm, setExpenseForm] = useState({ category: "General", description: "", amount: "", date: new Date().toISOString().slice(0, 10) });

  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  const saveStudent = () => {
    if (!studentForm.name.trim()) { toast({ title: "Error", description: "Student name is required.", variant: "destructive" }); return; }
    const newStudent: Student = { id: `s${Date.now()}`, name: studentForm.name, fatherName: studentForm.fatherName, motherName: "", className: studentForm.className || "Deeniyat Alif", jamaat: "General", phone: studentForm.phone, address: "", status: "Active", admissionDate: new Date().toISOString().slice(0, 10) };
    setStudents([...students, newStudent]);
    toast({ title: isUrdu ? "طالب علم شامل ہو گیا" : "Student Added", description: studentForm.name });
    setStudentForm({ name: "", fatherName: "", className: "", phone: "" });
    setActiveModal(null);
  };

  const saveTeacher = () => {
    if (!teacherForm.name.trim()) { toast({ title: "Error", description: "Teacher name is required.", variant: "destructive" }); return; }
    const newTeacher: Teacher = { id: `t${Date.now()}`, name: teacherForm.name, email: teacherForm.email, phone: teacherForm.phone, assignedClass: teacherForm.assignedClass, qualification: teacherForm.qualification, joiningDate: new Date().toISOString().slice(0, 10), status: "Active" };
    setTeachers([...teachers, newTeacher]);
    toast({ title: isUrdu ? "استاد شامل ہو گیا" : "Teacher Added", description: teacherForm.name });
    setTeacherForm({ name: "", email: "", phone: "", assignedClass: "", qualification: "" });
    setActiveModal(null);
  };

  const saveDonation = () => {
    if (!donationForm.donorName.trim() || !donationForm.amount) { toast({ title: "Error", description: "Donor name and amount required.", variant: "destructive" }); return; }
    const receiptNo = `DSIK/DON/${new Date().getFullYear()}/${String(donations.length + 1).padStart(5, "0")}`;
    const newDon: Donation = { id: `don${Date.now()}`, receiptNo, donorName: donationForm.donorName, phone: donationForm.phone, amount: parseFloat(donationForm.amount), donationType: donationForm.donationType, date: new Date(donationForm.date).toISOString() };
    setDonations([newDon, ...donations]);
    toast({ title: isUrdu ? "عطیہ ریکارڈ ہو گیا" : "Donation Recorded", description: `₹${donationForm.amount} — ${receiptNo}` });
    setDonationForm({ donorName: "", phone: "", amount: "", donationType: "General", date: new Date().toISOString().slice(0, 10) });
    setActiveModal(null);
  };

  const saveFee = () => {
    if (!feeForm.studentId || !feeForm.month || !feeForm.amount) { toast({ title: "Error", description: "Student, month and amount required.", variant: "destructive" }); return; }
    const student = students.find(s => s.id === feeForm.studentId);
    const receiptNo = `DSIK/FEE/${feeForm.year}/${String(fees.length + 1).padStart(5, "0")}`;
    const newFee: Fee = { id: `fee${Date.now()}`, receiptNo, studentId: feeForm.studentId, studentName: student?.name, month: feeForm.month, year: feeForm.year, amount: parseFloat(feeForm.amount), paymentMethod: feeForm.paymentMethod, status: "paid", date: new Date().toISOString() } as Fee & { studentId: string; month: string; year: string; paymentMethod: string };
    setFees([newFee, ...fees]);
    toast({ title: isUrdu ? "فیس ریکارڈ ہو گئی" : "Fee Recorded", description: `${student?.name} — ${feeForm.month} — ₹${feeForm.amount}` });
    setFeeForm({ studentId: "", month: "", year: new Date().getFullYear().toString(), amount: "1500", paymentMethod: "Cash" });
    setActiveModal(null);
  };

  const saveExpense = () => {
    if (!expenseForm.description.trim() || !expenseForm.amount) { toast({ title: "Error", description: "Description and amount required.", variant: "destructive" }); return; }
    const newExp: Expense = { id: `exp${Date.now()}`, category: expenseForm.category, description: expenseForm.description, amount: parseFloat(expenseForm.amount), date: new Date(expenseForm.date).toISOString() } as Expense & { category: string; description: string };
    setExpenses([newExp, ...expenses]);
    toast({ title: isUrdu ? "خرچ شامل ہو گیا" : "Expense Added", description: `₹${expenseForm.amount} — ${expenseForm.description}` });
    setExpenseForm({ category: "General", description: "", amount: "", date: new Date().toISOString().slice(0, 10) });
    setActiveModal(null);
  };

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const totalDonations = donations.reduce((s, d) => s + d.amount, 0);
  const totalFees = fees.filter((f) => f.status === "paid").reduce((s, f) => s + f.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netBalance = totalFees + totalDonations - totalExpenses;

  const pieData = donations.reduce(
    (acc, curr) => {
      const ex = acc.find((i) => i.name === curr.donationType);
      if (ex) ex.value += curr.amount;
      else acc.push({ name: curr.donationType, value: curr.amount });
      return acc;
    },
    [] as { name: string; value: number }[]
  );

  const topDonors = [...donations]
    .reduce(
      (acc, d) => {
        const ex = acc.find((i) => i.name === d.donorName);
        if (ex) ex.total += d.amount;
        else acc.push({ name: d.donorName, total: d.amount });
        return acc;
      },
      [] as { name: string; total: number }[]
    )
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const recentActivity = [
    ...donations.slice(0, 3).map((d) => ({
      type: "Donation",
      label: `${d.donorName} — ₹${d.amount}`,
      date: d.date,
      color: "bg-purple-100 text-purple-700",
    })),
    ...fees.slice(0, 2).map((f) => ({
      type: "Fee",
      label: `Fee collected — ₹${f.amount}`,
      date: f.date,
      color: "bg-blue-100 text-blue-700",
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const avgJuz =
    hifzProgress.length > 0
      ? (hifzProgress.reduce((s, h) => s + (h.currentJuz || 0), 0) / hifzProgress.length).toFixed(1)
      : "0";

  const leader = hifzProgress.length > 0
    ? hifzProgress.reduce((prev, curr) => ((curr.currentJuz || 0) > (prev.currentJuz || 0) ? curr : prev))
    : null;

  const medalEmoji = (i: number) => {
    if (i === 0) return "🥇";
    if (i === 1) return "🥈";
    if (i === 2) return "🥉";
    return `${i + 1}.`;
  };

  return (
    <div key={refreshKey} className={`space-y-6 ${isUrdu ? "urdu-text" : ""}`}>
      {/* Header */}
      <div className={`flex items-center justify-between ${isUrdu ? "flex-row-reverse" : ""}`}>
        <div>
          <h1 className={`text-3xl font-bold text-foreground ${isUrdu ? "urdu-text" : ""}`}>
            {tr("dashboard")}
          </h1>
          <p className={`text-muted-foreground mt-1 ${isUrdu ? "urdu-text text-sm" : ""}`}>
            {tr("overview")}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          className="gap-2"
          data-testid="btn-refresh"
        >
          <RefreshCw className="w-4 h-4" />
          <span className={isUrdu ? "urdu-text" : ""}>{tr("refresh")}</span>
        </Button>
      </div>

      {/* Welcome Card */}
      <div
        className="relative rounded-2xl overflow-hidden p-6 text-white islamic-pattern"
        style={{ background: "linear-gradient(135deg, #006400 0%, #008000 50%, #00a000 100%)" }}
        data-testid="welcome-card"
      >
        <div className={`flex items-start justify-between ${isUrdu ? "flex-row-reverse" : ""}`}>
          <div>
            <p className={`text-white/70 text-sm mb-1 ${isUrdu ? "urdu-text" : ""}`}>
              {getGreeting(lang, tr)}
            </p>
            <h2 className={`text-2xl font-bold mb-1 ${isUrdu ? "urdu-text" : ""}`}>
              {tr("assalamAlaikum")}, Admin
            </h2>
            <p className="text-white/80 text-sm">
              {getHijriDate(lang)}
            </p>
            <p className="text-white/60 text-xs mt-0.5">
              {currentTime.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          {/* Decorative star */}
          <svg width="80" height="80" viewBox="0 0 80 80" className="opacity-20 flex-shrink-0">
            <polygon points="40,5 49,30 76,30 54,47 62,72 40,55 18,72 26,47 4,30 31,30" fill="gold" />
          </svg>
        </div>
      </div>

      {/* Pending Tasks Alert */}
      {showAlert && (
        <div className="flex items-center justify-between gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
          <div className={`flex items-center gap-3 ${isUrdu ? "flex-row-reverse" : ""}`}>
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span className={`text-sm font-medium ${isUrdu ? "urdu-text" : ""}`}>
              0 {tr("pendingFees")} &nbsp;·&nbsp; 0 {tr("salariesDue")} &nbsp;·&nbsp; 0 {tr("meetingTomorrow")}
            </span>
          </div>
          <button onClick={() => setShowAlert(false)} className="text-amber-500 hover:text-amber-700" data-testid="btn-dismiss-alert">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4 Gradient Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div
          className="rounded-xl p-5 text-white shadow-md"
          style={{ background: "linear-gradient(135deg, #006400, #008000)" }}
          data-testid="card-total-students"
        >
          <div className="flex items-start justify-between mb-3">
            <Users className="w-8 h-8 opacity-80" />
          </div>
          <p className={`text-3xl font-bold`}>{students.length}</p>
          <p className={`text-white/70 text-xs mt-1 ${isUrdu ? "urdu-text" : ""}`}>{tr("totalStudents")}</p>
        </div>

        {/* Present Today */}
        <div
          className="rounded-xl p-5 text-white shadow-md"
          style={{ background: "linear-gradient(135deg, #b8860b, #daa520)" }}
          data-testid="card-present-today"
        >
          <div className="flex items-start justify-between mb-3">
            <UserCheck className="w-8 h-8 opacity-80" />
            <span className="text-xs bg-white/20 rounded-full px-2 py-0.5">0%</span>
          </div>
          <p className="text-3xl font-bold">0</p>
          <p className={`text-white/70 text-xs mt-1 ${isUrdu ? "urdu-text" : ""}`}>{tr("presentToday")}</p>
        </div>

        {/* Monthly Fees */}
        <div
          className="rounded-xl p-5 text-white shadow-md"
          style={{ background: "linear-gradient(135deg, #1e3a8a, #2563eb)" }}
          data-testid="card-monthly-fees"
        >
          <div className="flex items-start justify-between mb-2">
            <CreditCard className="w-8 h-8 opacity-80" />
            <span className="text-xs bg-white/20 rounded-full px-2 py-0.5">0% target</span>
          </div>
          <p className="text-3xl font-bold">₹{totalFees.toLocaleString()}</p>
          <p className={`text-white/70 text-xs mt-1 mb-2 ${isUrdu ? "urdu-text" : ""}`}>{tr("monthlyFees")}</p>
          <div className="w-full bg-white/20 rounded-full h-1.5">
            <div className="bg-white h-1.5 rounded-full" style={{ width: "0%" }} />
          </div>
        </div>

        {/* Total Donations */}
        <div
          className="rounded-xl p-5 text-white shadow-md"
          style={{ background: "linear-gradient(135deg, #6b21a8, #9333ea)" }}
          data-testid="card-total-donations"
        >
          <div className="flex items-start justify-between mb-3">
            <HeartHandshake className="w-8 h-8 opacity-80" />
            <TrendingUp className="w-5 h-5 opacity-70" />
          </div>
          <p className="text-3xl font-bold">₹{totalDonations.toLocaleString()}</p>
          <p className={`text-white/70 text-xs mt-1 ${isUrdu ? "urdu-text" : ""}`}>{tr("totalDonations")}</p>
        </div>
      </div>

      {/* Quick Actions — 5 Prominent Cards */}
      <div>
        <p className={`text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 ${isUrdu ? "urdu-text text-right" : ""}`}>
          {tr("quickActions")}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { modal: "student" as const,  icon: Users,          label: isUrdu ? "طالب علم شامل کریں" : "Add Student",     sub: isUrdu ? "نئے طالب علم کا اندراج" : "Enrol a new student", grad: "from-primary to-primary/80" },
            { modal: "teacher" as const,  icon: UserCog,        label: isUrdu ? "استاد شامل کریں" : "Add Teacher",        sub: isUrdu ? "نئے استاد کا اندراج" : "Register new teacher", grad: "from-blue-600 to-blue-700" },
            { modal: "donation" as const, icon: HeartHandshake, label: isUrdu ? "عطیہ ریکارڈ کریں" : "Record Donation",  sub: isUrdu ? "عطیہ درج کریں" : "Log a donation receipt", grad: "from-purple-600 to-purple-700" },
            { modal: "fee" as const,      icon: CreditCard,     label: isUrdu ? "فیس ریکارڈ کریں" : "Record Fee",        sub: isUrdu ? "طالب علم کی فیس" : "Collect student fee", grad: "from-emerald-600 to-emerald-700" },
            { modal: "expense" as const,  icon: FileText,       label: isUrdu ? "خرچ شامل کریں" : "Add Expense",         sub: isUrdu ? "اخراجات ریکارڈ کریں" : "Record an expense", grad: "from-orange-500 to-orange-600" },
          ].map(({ modal, icon: Icon, label, sub, grad }) => (
            <button
              key={modal}
              onClick={() => setActiveModal(modal)}
              className={`relative rounded-xl p-4 text-white shadow-md bg-gradient-to-br ${grad} hover:opacity-90 active:scale-[0.98] transition-all text-left`}
              data-testid={`qa-${modal}`}
            >
              <Icon className="w-7 h-7 opacity-90 mb-2" />
              <p className={`font-bold text-sm leading-tight ${isUrdu ? "urdu-text" : ""}`}>{label}</p>
              <p className={`text-white/70 text-xs mt-0.5 ${isUrdu ? "urdu-text" : ""}`}>{sub}</p>
              <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>
        {/* Secondary quick links */}
        <div className="flex gap-2 flex-wrap mt-3">
          {[
            { label: tr("addStudent"), icon: Plus, action: () => setLocation("/students") },
            { label: tr("markAttendance"), icon: UserCheck, action: () => setLocation("/attendance") },
            { label: tr("sendNotification"), icon: Bell, action: () => setLocation("/communication") },
            { label: tr("generateReport"), icon: FileText, action: () => window.print() },
            { label: tr("downloadBackup"), icon: Download, action: () => {
              const data: Record<string, unknown> = {};
              for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key) { try { data[key] = JSON.parse(localStorage.getItem(key) || "null"); } catch { data[key] = localStorage.getItem(key); } }
              }
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href = url; a.download = "madrasa_backup.json"; a.click();
              URL.revokeObjectURL(url);
            }},
          ].map(({ label, icon: Icon, action }) => (
            <Button key={label} variant="outline" size="sm"
              className={`border-primary/30 text-primary hover:bg-primary/5 gap-1.5 ${isUrdu ? "urdu-text flex-row-reverse" : ""}`}
              onClick={action}>
              <Icon className="w-3.5 h-3.5" />{label}
            </Button>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className={isUrdu ? "urdu-text" : ""}>{tr("feeCollectionTrend")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={feeData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                    formatter={(v: number) => [`₹${v.toLocaleString()}`, "Amount"]}
                  />
                  <Line type="monotone" dataKey="amount" stroke="#008000" strokeWidth={2.5} dot={{ fill: "#008000", r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className={isUrdu ? "urdu-text" : ""}>{tr("donationByType")}</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" labelLine={false}>
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, ""]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">
                {tr("noData")}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 3-column widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Attendance */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className={`text-base ${isUrdu ? "urdu-text" : ""}`}>{tr("attendanceOverview")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: tr("present"), pct: 0, color: "bg-green-500" },
              { label: tr("absent"), pct: 0, color: "bg-red-500" },
              { label: tr("late"), pct: 0, color: "bg-yellow-500" },
            ].map(({ label, pct, color }) => (
              <div key={label}>
                <div className={`flex justify-between text-sm mb-1 ${isUrdu ? "flex-row-reverse" : ""}`}>
                  <span className={isUrdu ? "urdu-text" : ""}>{label}</span>
                  <span className="font-medium">{pct}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Monthly Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className={`text-base ${isUrdu ? "urdu-text" : ""}`}>{tr("monthlySummary")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className={`flex justify-between items-center ${isUrdu ? "flex-row-reverse" : ""}`}>
              <span className={`text-sm text-muted-foreground ${isUrdu ? "urdu-text" : ""}`}>{tr("totalIncome")}</span>
              <span className="font-bold text-green-600">₹{(totalFees + totalDonations).toLocaleString()}</span>
            </div>
            <div className={`flex justify-between items-center ${isUrdu ? "flex-row-reverse" : ""}`}>
              <span className={`text-sm text-muted-foreground ${isUrdu ? "urdu-text" : ""}`}>{tr("totalExpense")}</span>
              <span className="font-bold text-red-500">₹{totalExpenses.toLocaleString()}</span>
            </div>
            <div className="border-t border-border pt-3">
              <div className={`flex justify-between items-center ${isUrdu ? "flex-row-reverse" : ""}`}>
                <span className={`text-sm font-semibold ${isUrdu ? "urdu-text" : ""}`}>{tr("netBalance")}</span>
                <span className={`font-bold text-lg flex items-center gap-1 ${netBalance >= 0 ? "text-green-600" : "text-red-500"}`}>
                  {netBalance >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  ₹{Math.abs(netBalance).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className={`text-base ${isUrdu ? "urdu-text" : ""}`}>{tr("upcomingEvents")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Eid ul Adha", date: "Jun 7, 2026", color: "bg-green-500" },
              { label: "Fee Collection", date: "Jun 1, 2026", color: "bg-blue-500" },
              { label: "Monthly Meeting", date: "May 28, 2026", color: "bg-amber-500" },
            ].map(({ label, date, color }) => (
              <div key={label} className={`flex items-center gap-3 ${isUrdu ? "flex-row-reverse" : ""}`}>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${color}`} />
                <div className={`flex-1 ${isUrdu ? "text-right" : ""}`}>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{date}</p>
                </div>
                <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Bottom row — Recent Activity + Top Donors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className={`text-base ${isUrdu ? "urdu-text" : ""}`}>{tr("recentActivity")}</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((a, i) => (
                  <div key={i} className={`flex items-center justify-between gap-3 ${isUrdu ? "flex-row-reverse" : ""}`}>
                    <div className={`flex items-center gap-3 ${isUrdu ? "flex-row-reverse" : ""}`}>
                      <Badge className={`text-xs ${a.color} border-0`}>{a.type}</Badge>
                      <span className="text-sm">{a.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {new Date(a.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">{tr("noData")}</p>
            )}
          </CardContent>
        </Card>

        {/* Top Donors */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className={`text-base ${isUrdu ? "urdu-text" : ""}`}>{tr("topDonors")}</CardTitle>
          </CardHeader>
          <CardContent>
            {topDonors.length > 0 ? (
              <div className="space-y-3">
                {topDonors.map((d, i) => (
                  <div key={d.name} className={`flex items-center justify-between ${isUrdu ? "flex-row-reverse" : ""}`}>
                    <div className={`flex items-center gap-3 ${isUrdu ? "flex-row-reverse" : ""}`}>
                      <span className="text-lg w-8 text-center">{medalEmoji(i)}</span>
                      <span className="text-sm font-medium">{d.name}</span>
                    </div>
                    <span className="text-sm font-bold text-primary">₹{d.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">{tr("noData")}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Hifz Overview + Attendance Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className={`text-base flex items-center gap-2 ${isUrdu ? "urdu-text flex-row-reverse" : ""}`}>
              <BookOpen className="w-4 h-4 text-primary" />
              {tr("hifzOverview")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className={`flex justify-between ${isUrdu ? "flex-row-reverse" : ""}`}>
              <span className="text-sm text-muted-foreground">Students in Hifz</span>
              <span className="font-bold">{hifzProgress.length}</span>
            </div>
            <div className={`flex justify-between ${isUrdu ? "flex-row-reverse" : ""}`}>
              <span className="text-sm text-muted-foreground">Avg Juz Completed</span>
              <span className="font-bold">{avgJuz} / 30</span>
            </div>
            {leader && (
              <div className={`flex justify-between items-center ${isUrdu ? "flex-row-reverse" : ""}`}>
                <span className="text-sm text-muted-foreground">Leader</span>
                <span className="text-sm font-semibold text-primary">
                  {leader.studentName} (Juz {leader.currentJuz})
                </span>
              </div>
            )}
            {hifzProgress.length > 0 && (
              <div>
                <div className={`flex justify-between text-xs text-muted-foreground mb-1 ${isUrdu ? "flex-row-reverse" : ""}`}>
                  <span>Overall Progress</span>
                  <span>{Math.round((parseFloat(avgJuz) / 30) * 100)}%</span>
                </div>
                <Progress value={(parseFloat(avgJuz) / 30) * 100} className="h-2" />
              </div>
            )}
            {hifzProgress.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">{tr("noData")}</p>
            )}
          </CardContent>
        </Card>

        {/* Attendance Heatmap */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className={`text-base ${isUrdu ? "urdu-text" : ""}`}>
              This Week's Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {weekDays.map((day, i) => (
                <div key={day} className="flex flex-col items-center gap-1">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm"
                    style={{ backgroundColor: getHeatmapColor(weekAttendance[i]) }}
                    title={`${day}: ${weekAttendance[i]}%`}
                    data-testid={`heatmap-${day}`}
                  >
                    {weekAttendance[i]}%
                  </div>
                  <span className="text-xs text-muted-foreground">{day}</span>
                </div>
              ))}
            </div>
            <div className={`flex items-center gap-4 mt-4 text-xs text-muted-foreground ${isUrdu ? "flex-row-reverse" : ""}`}>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-600 inline-block" /> 90%+</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-500 inline-block" /> 70-89%</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500 inline-block" /> Below 70%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floating Action Button */}
      <FAB />

      {/* ── Quick Action Modals ──────────────────────────────────────────── */}

      {/* Add Student Modal */}
      <Dialog open={activeModal === "student"} onOpenChange={o => !o && setActiveModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className={isUrdu ? "urdu-text" : ""}>{isUrdu ? "طالب علم شامل کریں" : "Add Student"}</DialogTitle>
          </DialogHeader>
          <div className={`space-y-3 py-1 ${isUrdu ? "urdu-text" : ""}`} dir={isUrdu ? "rtl" : "ltr"}>
            <div className="space-y-1.5">
              <Label>{isUrdu ? "طالب علم کا نام" : "Student Name"} *</Label>
              <Input placeholder={isUrdu ? "مثلاً: عبداللہ" : "e.g. Abdullah"} value={studentForm.name} onChange={e => setStudentForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{isUrdu ? "والد کا نام" : "Father's Name"}</Label>
                <Input placeholder={isUrdu ? "والد کا نام" : "Father name"} value={studentForm.fatherName} onChange={e => setStudentForm(f => ({ ...f, fatherName: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>{isUrdu ? "فون" : "Phone"}</Label>
                <Input placeholder="9876543210" value={studentForm.phone} onChange={e => setStudentForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{isUrdu ? "کلاس" : "Class"}</Label>
              <Select value={studentForm.className} onValueChange={v => setStudentForm(f => ({ ...f, className: v }))}>
                <SelectTrigger><SelectValue placeholder={isUrdu ? "کلاس منتخب کریں" : "Select class"} /></SelectTrigger>
                <SelectContent>
                  {CLASS_GROUPS.map(g => (
                    <div key={g.label}>
                      <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/50 mt-1">{g.icon} {trClassGroup(g.label, lang)}</div>
                      {g.classes.map(c => <SelectItem key={c} value={c} className="pl-5">{trClass(c, lang)}</SelectItem>)}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveModal(null)}>{isUrdu ? "منسوخ" : "Cancel"}</Button>
            <Button onClick={saveStudent} data-testid="modal-save-student">{isUrdu ? "محفوظ کریں" : "Save Student"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Teacher Modal */}
      <Dialog open={activeModal === "teacher"} onOpenChange={o => !o && setActiveModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className={isUrdu ? "urdu-text" : ""}>{isUrdu ? "استاد شامل کریں" : "Add Teacher"}</DialogTitle>
          </DialogHeader>
          <div className={`space-y-3 py-1 ${isUrdu ? "urdu-text" : ""}`} dir={isUrdu ? "rtl" : "ltr"}>
            <div className="space-y-1.5">
              <Label>{isUrdu ? "پورا نام" : "Full Name"} *</Label>
              <Input placeholder={isUrdu ? "استاد کا نام" : "Teacher name"} value={teacherForm.name} onChange={e => setTeacherForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{isUrdu ? "ای میل" : "Email"}</Label>
                <Input placeholder="teacher@dsik.edu" value={teacherForm.email} onChange={e => setTeacherForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>{isUrdu ? "فون" : "Phone"}</Label>
                <Input placeholder="9876543210" value={teacherForm.phone} onChange={e => setTeacherForm(f => ({ ...f, phone: e.target.value.replace(/\D/g,"").slice(0,10) }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{isUrdu ? "کلاس" : "Assigned Class"}</Label>
              <Select value={teacherForm.assignedClass} onValueChange={v => setTeacherForm(f => ({ ...f, assignedClass: v }))}>
                <SelectTrigger><SelectValue placeholder={isUrdu ? "کلاس منتخب کریں" : "Select class"} /></SelectTrigger>
                <SelectContent>
                  {CLASS_GROUPS.map(g => (
                    <div key={g.label}>
                      <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/50 mt-1">{g.icon} {trClassGroup(g.label, lang)}</div>
                      {g.classes.map(c => <SelectItem key={c} value={c} className="pl-5">{trClass(c, lang)}</SelectItem>)}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{isUrdu ? "تعلیمی قابلیت" : "Qualification"}</Label>
              <Input placeholder="Dars-e-Nizami / Fazil" value={teacherForm.qualification} onChange={e => setTeacherForm(f => ({ ...f, qualification: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveModal(null)}>{isUrdu ? "منسوخ" : "Cancel"}</Button>
            <Button onClick={saveTeacher}>{isUrdu ? "محفوظ کریں" : "Save Teacher"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Donation Modal */}
      <Dialog open={activeModal === "donation"} onOpenChange={o => !o && setActiveModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className={isUrdu ? "urdu-text" : ""}>{isUrdu ? "عطیہ ریکارڈ کریں" : "Record Donation"}</DialogTitle>
          </DialogHeader>
          <div className={`space-y-3 py-1 ${isUrdu ? "urdu-text" : ""}`} dir={isUrdu ? "rtl" : "ltr"}>
            <div className="space-y-1.5">
              <Label>{isUrdu ? "عطیہ دہندہ کا نام" : "Donor Name"} *</Label>
              <Input placeholder="Abdullah Merchant" value={donationForm.donorName} onChange={e => setDonationForm(f => ({ ...f, donorName: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{isUrdu ? "فون" : "Phone"}</Label>
                <Input placeholder="9876543210" value={donationForm.phone} onChange={e => setDonationForm(f => ({ ...f, phone: e.target.value.replace(/\D/g,"").slice(0,10) }))} />
              </div>
              <div className="space-y-1.5">
                <Label>{isUrdu ? "رقم (₹)" : "Amount (₹)"} *</Label>
                <Input type="number" placeholder="5000" value={donationForm.amount} onChange={e => setDonationForm(f => ({ ...f, amount: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{isUrdu ? "قسم" : "Type"}</Label>
                <Select value={donationForm.donationType} onValueChange={v => setDonationForm(f => ({ ...f, donationType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["General","Zakat","Sadaqah","Fitrana","Construction","Monthly","One-time"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{isUrdu ? "تاریخ" : "Date"}</Label>
                <Input type="date" value={donationForm.date} onChange={e => setDonationForm(f => ({ ...f, date: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveModal(null)}>{isUrdu ? "منسوخ" : "Cancel"}</Button>
            <Button onClick={saveDonation}>{isUrdu ? "محفوظ کریں" : "Record Donation"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Fee Modal */}
      <Dialog open={activeModal === "fee"} onOpenChange={o => !o && setActiveModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className={isUrdu ? "urdu-text" : ""}>{isUrdu ? "فیس ریکارڈ کریں" : "Record Fee"}</DialogTitle>
          </DialogHeader>
          <div className={`space-y-3 py-1 ${isUrdu ? "urdu-text" : ""}`} dir={isUrdu ? "rtl" : "ltr"}>
            <div className="space-y-1.5">
              <Label>{isUrdu ? "طالب علم" : "Student"} *</Label>
              <Select value={feeForm.studentId} onValueChange={v => setFeeForm(f => ({ ...f, studentId: v }))}>
                <SelectTrigger><SelectValue placeholder={isUrdu ? "طالب علم منتخب کریں" : "Select student"} /></SelectTrigger>
                <SelectContent>
                  {students.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.className})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{isUrdu ? "مہینہ" : "Month"} *</Label>
                <Select value={feeForm.month} onValueChange={v => setFeeForm(f => ({ ...f, month: v }))}>
                  <SelectTrigger><SelectValue placeholder={isUrdu ? "مہینہ" : "Month"} /></SelectTrigger>
                  <SelectContent>{MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{isUrdu ? "سال" : "Year"}</Label>
                <Input value={feeForm.year} onChange={e => setFeeForm(f => ({ ...f, year: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{isUrdu ? "رقم (₹)" : "Amount (₹)"} *</Label>
                <Input type="number" value={feeForm.amount} onChange={e => setFeeForm(f => ({ ...f, amount: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>{isUrdu ? "ادائیگی طریقہ" : "Payment Method"}</Label>
                <Select value={feeForm.paymentMethod} onValueChange={v => setFeeForm(f => ({ ...f, paymentMethod: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Cash","Bank Transfer","Online/UPI","Cheque"].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveModal(null)}>{isUrdu ? "منسوخ" : "Cancel"}</Button>
            <Button onClick={saveFee}>{isUrdu ? "محفوظ کریں" : "Record Fee"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Expense Modal */}
      <Dialog open={activeModal === "expense"} onOpenChange={o => !o && setActiveModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className={isUrdu ? "urdu-text" : ""}>{isUrdu ? "خرچ شامل کریں" : "Add Expense"}</DialogTitle>
          </DialogHeader>
          <div className={`space-y-3 py-1 ${isUrdu ? "urdu-text" : ""}`} dir={isUrdu ? "rtl" : "ltr"}>
            <div className="space-y-1.5">
              <Label>{isUrdu ? "زمرہ" : "Category"}</Label>
              <Select value={expenseForm.category} onValueChange={v => setExpenseForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Salary","Maintenance","Books","Electricity","Water","Food","Transport","Other"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{isUrdu ? "تفصیل" : "Description"} *</Label>
              <Input placeholder={isUrdu ? "تفصیل درج کریں" : "e.g. Monthly electricity bill"} value={expenseForm.description} onChange={e => setExpenseForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{isUrdu ? "رقم (₹)" : "Amount (₹)"} *</Label>
                <Input type="number" placeholder="5000" value={expenseForm.amount} onChange={e => setExpenseForm(f => ({ ...f, amount: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>{isUrdu ? "تاریخ" : "Date"}</Label>
                <Input type="date" value={expenseForm.date} onChange={e => setExpenseForm(f => ({ ...f, date: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveModal(null)}>{isUrdu ? "منسوخ" : "Cancel"}</Button>
            <Button onClick={saveExpense}>{isUrdu ? "محفوظ کریں" : "Add Expense"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FAB() {
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const { lang: fabLang, tr: fabTr } = useLang();
  const fabUrdu = fabLang === "ur";
  const actions = [
    { label: fabUrdu ? "طالب علم شامل کریں" : "Add Student",     icon: Users,          href: "/students",  color: "bg-primary hover:bg-primary/90" },
    { label: fabUrdu ? "استاد شامل کریں"    : "Add Teacher",     icon: UserCheck,      href: "/teachers",  color: "bg-blue-600 hover:bg-blue-700" },
    { label: fabUrdu ? "عطیہ ریکارڈ کریں"  : "Record Donation", icon: HeartHandshake, href: "/donations", color: "bg-accent hover:bg-accent/90" },
    { label: fabUrdu ? "فیس ریکارڈ کریں"   : "Record Fee",      icon: CreditCard,     href: "/fees",      color: "bg-emerald-600 hover:bg-emerald-700" },
    { label: fabUrdu ? "خرچ شامل کریں"     : "Add Expense",     icon: FileText,       href: "/expenses",  color: "bg-orange-500 hover:bg-orange-600" },
  ];

  return (
    <div ref={ref} className="fixed bottom-6 right-6 z-50 flex flex-col-reverse items-end gap-3">
      {open && actions.map((action) => {
        const Icon = action.icon;
        return (
          <div key={action.href} className="flex items-center gap-3 animate-in slide-in-from-bottom-2 fade-in duration-150">
            <span className="bg-card text-foreground text-sm font-medium shadow-md px-3 py-1.5 rounded-lg border border-border whitespace-nowrap">
              {action.label}
            </span>
            <button
              onClick={() => { navigate(action.href); setOpen(false); }}
              className={`w-11 h-11 rounded-full flex items-center justify-center text-white shadow-lg transition-all ${action.color}`}
            >
              <Icon className="w-5 h-5" />
            </button>
          </div>
        );
      })}
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-white shadow-xl flex items-center justify-center transition-all duration-200 ${open ? "rotate-45" : ""}`}
        data-testid="fab-main"
        aria-label="Quick add menu"
      >
        <Plus className="w-7 h-7" />
      </button>
    </div>
  );
}
