import { useEffect, useState } from "react";

export type Role = "admin" | "teacher" | "parent" | null;

export function getLS<T>(key: string, defaultVal: T): T {
  try {
    const val = localStorage.getItem(key);
    if (val === null) return defaultVal;
    return JSON.parse(val) as T;
  } catch {
    return defaultVal;
  }
}

export function setLS<T>(key: string, val: T) {
  localStorage.setItem(key, JSON.stringify(val));
  window.dispatchEvent(new Event("local-storage"));
}

export function useLS<T>(key: string, defaultVal: T): [T, (val: T) => void] {
  const [val, setVal] = useState<T>(() => getLS(key, defaultVal));

  useEffect(() => {
    const handleStorageChange = () => {
      setVal(getLS(key, defaultVal));
    };
    window.addEventListener("local-storage", handleStorageChange);
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("local-storage", handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [key, defaultVal]);

  const setAndSave = (newVal: T) => {
    setVal(newVal);
    setLS(key, newVal);
  };

  return [val, setAndSave];
}

export const useAuth = () => {
  const [role, setRole] = useLS<Role>("app_role", null);
  const login = (newRole: Role) => { setRole(newRole); };
  const logout = () => { setRole(null); };
  return { role, login, logout };
};

export interface Student {
  id: string;
  name: string;
  fatherName: string;
  motherName: string;
  className: string;
  jamaat: string;
  phone: string;
  address: string;
  dob?: string;
  admissionDate?: string;
  status?: "Active" | "Inactive" | "Graduated";
  photo?: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  assignedClass: string;
  qualification: string;
  joiningDate: string;
  status: "Active" | "Inactive";
}

export const CLASS_OPTIONS = ["Nursery", "KG", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"];
export const JAMAAT_OPTIONS = ["Hifz", "Nazera", "Alim", "General"];

const initialStudents: Student[] = [
  { id: "s1", name: "Ahmed Khan", fatherName: "Rashid Khan", motherName: "Fatima Khan", className: "5th", jamaat: "Hifz", phone: "9876543210", address: "Kalgaon", dob: "2012-03-15", admissionDate: "2020-06-01", status: "Active" },
  { id: "s2", name: "Mohammed Ali", fatherName: "Salim Ali", motherName: "Amina Ali", className: "5th", jamaat: "Hifz", phone: "9876543211", address: "Kalgaon", dob: "2012-07-22", admissionDate: "2020-06-01", status: "Active" },
  { id: "s3", name: "Ibrahim Sheikh", fatherName: "Yusuf Sheikh", motherName: "Khadija Sheikh", className: "6th", jamaat: "Nazera", phone: "9876543212", address: "Kalgaon", dob: "2011-11-05", admissionDate: "2019-06-01", status: "Active" },
  { id: "s4", name: "Usman Patel", fatherName: "Ismail Patel", motherName: "Maryam Patel", className: "6th", jamaat: "Nazera", phone: "9876543213", address: "Kalgaon", dob: "2011-04-18", admissionDate: "2019-06-01", status: "Active" },
  { id: "s5", name: "Hasan Ansari", fatherName: "Hussain Ansari", motherName: "Zainab Ansari", className: "7th", jamaat: "Alim", phone: "9876543214", address: "Kalgaon", dob: "2010-09-30", admissionDate: "2018-06-01", status: "Active" },
];

const initialTeachers: Teacher[] = [
  { id: "t1", name: "Maulana Abdul Rahman", email: "abdulrahman@dsik.edu", phone: "9876500001", assignedClass: "5th", qualification: "Dars-e-Nizami", joiningDate: "2018-01-15", status: "Active" },
  { id: "t2", name: "Ustad Mohammed Yusuf", email: "myusuf@dsik.edu", phone: "9876500002", assignedClass: "6th", qualification: "Fazil", joiningDate: "2019-03-01", status: "Active" },
];

const initialDonations = [
  { id: "don1", receiptNo: "DSIK/DON/2026/00001", donorName: "Abdullah Merchant", phone: "9988776655", amount: 25000, donationType: "General", paymentMethod: "Cash", transactionId: "", date: new Date(2026, 4, 10).toISOString() },
  { id: "don2", receiptNo: "DSIK/DON/2026/00002", donorName: "Yusuf Chapra", phone: "9988776644", amount: 15000, donationType: "Zakat", paymentMethod: "Bank Transfer", transactionId: "TXN001", date: new Date(2026, 4, 12).toISOString() },
  { id: "don3", receiptNo: "DSIK/DON/2026/00003", donorName: "Ibrahim Memon", phone: "9988776633", amount: 10000, donationType: "Sadaqah", paymentMethod: "UPI", transactionId: "UPI002", date: new Date(2026, 4, 15).toISOString() },
  { id: "don4", receiptNo: "DSIK/DON/2026/00004", donorName: "Rashid Shaikh", phone: "9988776622", amount: 50000, donationType: "Construction", paymentMethod: "Bank Transfer", transactionId: "TXN003", date: new Date(2026, 4, 18).toISOString() },
  { id: "don5", receiptNo: "DSIK/DON/2026/00005", donorName: "Salim Vohra", phone: "9988776611", amount: 5000, donationType: "Fitrana", paymentMethod: "Cash", transactionId: "", date: new Date(2026, 4, 20).toISOString() },
];

const initialFees = [
  { id: "fee1", receiptNo: "DSIK/FEE/2026/00001", studentId: "s1", month: "2026-01", amount: 1500, paymentMethod: "Cash", status: "paid", date: new Date(2026, 0, 5).toISOString() },
  { id: "fee2", receiptNo: "DSIK/FEE/2026/00002", studentId: "s2", month: "2026-01", amount: 1500, paymentMethod: "Bank Transfer", status: "paid", date: new Date(2026, 0, 7).toISOString() },
  { id: "fee3", receiptNo: "DSIK/FEE/2026/00003", studentId: "s3", month: "2026-02", amount: 1500, paymentMethod: "Online/UPI", status: "paid", date: new Date(2026, 1, 3).toISOString() },
  { id: "fee4", receiptNo: "DSIK/FEE/2026/00004", studentId: "s4", month: "2026-02", amount: 1500, paymentMethod: "Cash", status: "pending", date: new Date(2026, 1, 10).toISOString() },
  { id: "fee5", receiptNo: "DSIK/FEE/2026/00005", studentId: "s5", month: "2026-03", amount: 1500, paymentMethod: "Cash", status: "paid", date: new Date(2026, 2, 4).toISOString() },
];

const initialExpenses = [
  { id: "exp1", category: "Salary", description: "Teacher salaries for April", amount: 45000, date: new Date(2026, 3, 30).toISOString() },
  { id: "exp2", category: "Electricity", description: "Monthly electricity bill", amount: 3500, date: new Date(2026, 4, 5).toISOString() },
  { id: "exp3", category: "Books", description: "Quran and Islamic books", amount: 8000, date: new Date(2026, 4, 10).toISOString() },
  { id: "exp4", category: "Maintenance", description: "Classroom renovation", amount: 12000, date: new Date(2026, 4, 15).toISOString() },
];

export function initializeData() {
  if (getLS("students", []).length === 0) setLS("students", initialStudents);
  if (getLS("teachers", []).length === 0) setLS("teachers", initialTeachers);
  if (getLS("fees", []).length === 0) setLS("fees", initialFees);
  if (getLS("expenses", []).length === 0) setLS("expenses", initialExpenses);
  if (getLS("donations", []).length === 0) setLS("donations", initialDonations);
  if (getLS("attendance", []).length === 0) setLS("attendance", []);
  if (getLS("hifz_progress", []).length === 0) setLS("hifz_progress", []);
  if (getLS("exam_results", []).length === 0) setLS("exam_results", []);
  if (getLS("salaries", []).length === 0) setLS("salaries", []);
  if (getLS("staff", []).length === 0) setLS("staff", []);
  if (getLS("donors", []).length === 0) setLS("donors", []);
  if (getLS("notifications", []).length === 0) setLS("notifications", []);
}

export function exportToCSV(headers: string[], rows: string[][], filename: string) {
  const csvContent = [headers.join(","), ...rows.map(r => r.map(c => `"${(c || "").replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
