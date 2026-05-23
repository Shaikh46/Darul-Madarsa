import { useState, useEffect, createContext, useContext } from "react";

export type Lang = "en" | "ur";

export const translations: Record<string, Record<Lang, string>> = {
  dashboard: { en: "Dashboard", ur: "ڈیش بورڈ" },
  students: { en: "Students", ur: "طلباء" },
  teachers: { en: "Teachers", ur: "اساتذہ" },
  attendance: { en: "Attendance", ur: "حاضری" },
  hifzProgress: { en: "Hifz Progress", ur: "حفظ پیشرفت" },
  results: { en: "Results", ur: "نتائج" },
  teacherPortal: { en: "Teacher Portal", ur: "استاد پورٹل" },
  fees: { en: "Fees", ur: "فیس" },
  expenses: { en: "Expenses", ur: "اخراجات" },
  salaries: { en: "Salaries", ur: "تنخواہیں" },
  donations: { en: "Donations", ur: "عطیات" },
  timetable: { en: "Timetable", ur: "نظام الاوقات" },
  islamic: { en: "Islamic", ur: "اسلامی" },
  communication: { en: "Communication", ur: "مواصلات" },
  settings:      { en: "Settings",      ur: "ترتیبات" },
  addStudent: { en: "Add Student", ur: "طالب علم شامل کریں" },
  addTeacher: { en: "Add Teacher", ur: "استاد شامل کریں" },
  markAttendance: { en: "Mark Attendance", ur: "حاضری لگائیں" },
  downloadReportCard: { en: "Download Report Card", ur: "رپورٹ کارڈ ڈاؤن لوڈ کریں" },
  present: { en: "Present", ur: "حاضر" },
  absent: { en: "Absent", ur: "غیر حاضر" },
  late: { en: "Late", ur: "دیر سے آیا" },
  save: { en: "Save", ur: "محفوظ کریں" },
  cancel: { en: "Cancel", ur: "منسوخ" },
  delete: { en: "Delete", ur: "حذف کریں" },
  edit: { en: "Edit", ur: "ترمیم کریں" },
  search: { en: "Search", ur: "تلاش کریں" },
  logout: { en: "Logout", ur: "لاگ آؤٹ" },
  loggedInAs: { en: "Logged in as", ur: "لاگ ان بطور" },
  totalStudents: { en: "Total Students", ur: "کل طلباء" },
  presentToday: { en: "Present Today", ur: "آج حاضر" },
  monthlyFees: { en: "Monthly Fees Collected", ur: "ماہانہ فیس" },
  pendingDues: { en: "Pending Dues", ur: "بقایا جات" },
  totalDonations: { en: "Total Donations", ur: "کل عطیات" },
  feeCollectionTrend: { en: "Fee Collection Trend", ur: "فیس کا رجحان" },
  donationByType: { en: "Donation by Type", ur: "قسم کے لحاظ سے عطیات" },
  quickActions: { en: "Quick Actions", ur: "فوری اقدامات" },
  addDonation: { en: "Record Donation", ur: "عطیہ ریکارڈ کریں" },
  collectFee: { en: "Record Fee", ur: "فیس ریکارڈ کریں" },
  addExpense: { en: "Add Expense", ur: "خرچ شامل کریں" },
  sendNotification: { en: "Send Notification", ur: "اطلاع بھیجیں" },
  generateReport: { en: "Generate Report", ur: "رپورٹ بنائیں" },
  downloadBackup: { en: "Download Backup", ur: "بیک اپ ڈاؤن لوڈ" },
  recentActivity: { en: "Recent Activity", ur: "حالیہ سرگرمی" },
  topDonors: { en: "Top Donors", ur: "اعلیٰ عطیہ دہندگان" },
  pendingTasks: { en: "Pending Tasks", ur: "زیر التوا کام" },
  monthlySummary: { en: "Monthly Summary", ur: "ماہانہ خلاصہ" },
  totalIncome: { en: "Total Income", ur: "کل آمدنی" },
  totalExpense: { en: "Total Expense", ur: "کل اخراجات" },
  netBalance: { en: "Net Balance", ur: "خالص بیلنس" },
  hifzOverview: { en: "Hifz Overview", ur: "حفظ کا جائزہ" },
  attendanceOverview: { en: "Today's Attendance", ur: "آج کی حاضری" },
  goodMorning: { en: "Good Morning", ur: "صبح بخیر" },
  goodAfternoon: { en: "Good Afternoon", ur: "دوپہر بخیر" },
  goodEvening: { en: "Good Evening", ur: "شام بخیر" },
  zakat: { en: "Zakat", ur: "زکوٰۃ" },
  sadaqah: { en: "Sadaqah", ur: "صدقہ" },
  fitrana: { en: "Fitrana", ur: "فطرانہ" },
  assalamAlaikum: { en: "Assalamu Alaikum", ur: "السلام علیکم" },
  overview: { en: "Overview of Madrasa activities", ur: "مدرسہ کی سرگرمیوں کا جائزہ" },
  refresh: { en: "Refresh", ur: "تازہ کریں" },
  upcomingEvents: { en: "Upcoming Events", ur: "آنے والے واقعات" },
  noraniQaida: { en: "Norani Qaida", ur: "نورانی قاعدہ" },
  noData: { en: "No data yet", ur: "ابھی کوئی ڈیٹا نہیں" },
  pendingFees: { en: "fees pending", ur: "فیس زیر التوا" },
  salariesDue: { en: "salaries due", ur: "تنخواہیں واجب الادا" },
  meetingTomorrow: { en: "meeting tomorrow", ur: "کل میٹنگ" },
  // Role labels
  roleAdmin:    { en: "Admin",   ur: "منتظم" },
  roleTeacher:  { en: "Teacher", ur: "استاد" },
  roleParent:   { en: "Parent",  ur: "والدین" },
  roleStudent:  { en: "Student", ur: "طالب علم" },
  // Page headings / button labels
  addStudentBtn:   { en: "Add Student",       ur: "طالب علم شامل کریں" },
  addTeacherBtn:   { en: "Add Teacher",       ur: "استاد شامل کریں" },
  addExpenseBtn:   { en: "Add Expense",       ur: "خرچ شامل کریں" },
  recordFeeBtn:    { en: "Record Fee",        ur: "فیس ریکارڈ کریں" },
  recordDonation:  { en: "Record Donation",   ur: "عطیہ ریکارڈ کریں" },
  newDonation:     { en: "New Donation",      ur: "نیا عطیہ" },
  exportCsv:       { en: "Export CSV",        ur: "CSV برآمد کریں" },
  importCsv:       { en: "Import CSV",        ur: "CSV درآمد کریں" },
  recordFeePayment: { en: "Record Fee Payment", ur: "فیس ادائیگی ریکارڈ کریں" },
  studentAddedOk:  { en: "Student Added Successfully!", ur: "طالب علم کامیابی سے شامل ہو گیا!" },
  teachersPage:    { en: "Teachers",          ur: "اساتذہ" },
  expensesPage:    { en: "Expenses",          ur: "اخراجات" },
  donationsPage:   { en: "Donations",         ur: "عطیات" },
  feesPage:        { en: "Fees",              ur: "فیس" },
  studentsPage:    { en: "Students",          ur: "طلباء" },
  staffMembers:    { en: "staff members",     ur: "عملہ ارکان" },
  trackExpenses:   { en: "Record and track madrasa expenses", ur: "مدرسہ اخراجات ریکارڈ کریں" },
  noExpenses:      { en: "No expenses recorded.", ur: "کوئی خرچ ریکارڈ نہیں۔" },
  noFeeRecords:    { en: "No fee records found.", ur: "کوئی فیس ریکارڈ نہیں ملا۔" },
  totalExpFiltered: { en: "Total Expenses (filtered)", ur: "کل اخراجات (فلٹر شدہ)" },
  // Months
  january:   { en: "January",   ur: "جنوری" },
  february:  { en: "February",  ur: "فروری" },
  march:     { en: "March",     ur: "مارچ" },
  april:     { en: "April",     ur: "اپریل" },
  may:       { en: "May",       ur: "مئی" },
  june:      { en: "June",      ur: "جون" },
  july:      { en: "July",      ur: "جولائی" },
  august:    { en: "August",    ur: "اگست" },
  september: { en: "September", ur: "ستمبر" },
  october:   { en: "October",   ur: "اکتوبر" },
  november:  { en: "November",  ur: "نومبر" },
  december:  { en: "December",  ur: "دسمبر" },
  // Timetable
  studyTimetable: { en: "Study Timetable", ur: "مطالعاتی نظام الاوقات" },
  addEntry: { en: "Add Entry", ur: "اندراج شامل کریں" },
  editEntry: { en: "Edit Entry", ur: "اندراج میں ترمیم کریں" },
  deleteEntry: { en: "Delete Entry", ur: "اندراج حذف کریں" },
  selectClass: { en: "Select Class", ur: "کلاس منتخب کریں" },
  selectDay: { en: "Select Day", ur: "دن منتخب کریں" },
  startTime: { en: "Start Time", ur: "شروع کا وقت" },
  endTime: { en: "End Time", ur: "ختم ہونے کا وقت" },
  subject: { en: "Subject", ur: "مضمون" },
  teacher: { en: "Teacher", ur: "استاد" },
  roomNo: { en: "Room No.", ur: "کمرہ نمبر" },
  sunday: { en: "Sunday", ur: "اتوار" },
  monday: { en: "Monday", ur: "پیر" },
  tuesday: { en: "Tuesday", ur: "منگل" },
  wednesday: { en: "Wednesday", ur: "بدھ" },
  thursday: { en: "Thursday", ur: "جمعرات" },
  friday: { en: "Friday", ur: "جمعہ" },
  noTimetable: { en: "No timetable added yet. Click 'Add Entry' to create schedule.", ur: "ابھی تک کوئی نظام الاوقات شامل نہیں کیا گیا۔ 'اندراج شامل کریں' پر کلک کریں۔" },
  // Classes
  classes:        { en: "Classes",          ur: "کلاسیں" },
  allClasses:     { en: "All Classes",      ur: "تمام کلاسیں" },
  // Reports / nav
  reports:        { en: "Reports",          ur: "رپورٹس" },
  downloadPdf:    { en: "Download PDF",     ur: "پی ڈی ایف ڈاؤن لوڈ کریں" },
  exportBtn:      { en: "Export",           ur: "ایکسپورٹ کریں" },
  login:          { en: "Login",            ur: "لاگ ان کریں" },
  // Days
  saturday:       { en: "Saturday",         ur: "ہفتہ" },
  // Norani Qaida
  lessons:        { en: "Lessons",          ur: "اسباق" },
  progress:       { en: "Progress",         ur: "پیشرفت" },
  assessment:     { en: "Assessment",       ur: "تشخیص" },
  readingFluency: { en: "Reading Fluency",  ur: "پڑھنے کی روانی" },
  tajweedScore:   { en: "Tajweed Score",    ur: "تجوید کا اسکور" },
  teacherRemarks: { en: "Teacher Remarks",  ur: "استاد کے تبصرے" },
  markComplete:   { en: "Mark Complete",    ur: "مکمل نشان زد کریں" },
  // Hijri
  hijriSuffix:    { en: "AH",              ur: "ہجری" },
  today:          { en: "Today",           ur: "آج" },
};

export function useLanguage() {
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem("app_lang") as Lang) || "en";
  });

  const setLang = (l: Lang) => {
    localStorage.setItem("app_lang", l);
    setLangState(l);
    document.documentElement.dir = l === "ur" ? "rtl" : "ltr";
    document.documentElement.lang = l === "ur" ? "ur" : "en";
  };

  useEffect(() => {
    document.documentElement.dir = lang === "ur" ? "rtl" : "ltr";
    document.documentElement.lang = lang === "ur" ? "ur" : "en";
  }, []);

  const tr = (key: string): string => {
    return translations[key]?.[lang] ?? key;
  };

  return { lang, setLang, tr };
}

export const LangContext = createContext<ReturnType<typeof useLanguage>>({
  lang: "en",
  setLang: () => {},
  tr: (k) => k,
});

export const useLang = () => useContext(LangContext);
