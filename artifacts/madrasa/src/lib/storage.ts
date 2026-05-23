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

// ── Hardcoded credentials ──────────────────────────────────────────────────
export interface Credential {
  username: string;
  password: string;
  role: Role;
  displayName: string;
}

export const CREDENTIALS: Credential[] = [
  { username: "darulum@admin",   password: "78607860", role: "admin",   displayName: "Administrator" },
  { username: "darulum@teacher", password: "068706",   role: "teacher", displayName: "Teacher" },
  { username: "parent@demo.com", password: "parent123",role: "parent",  displayName: "Parent" },
];

export function tryLogin(username: string, password: string): Credential | null {
  return CREDENTIALS.find(
    c => c.username.toLowerCase() === username.trim().toLowerCase() && c.password === password
  ) ?? null;
}

// ── Auth hook ──────────────────────────────────────────────────────────────
export const useAuth = () => {
  const [role, setRole] = useLS<Role>("app_role", null);
  const [userName, setUserName] = useLS<string>("app_user_name", "");
  const [teacherClass, setTeacherClass] = useLS<string>("app_teacher_class", "");

  const login = (cred: Credential, resolvedClass?: string) => {
    setRole(cred.role);
    setUserName(cred.displayName);
    if (cred.role === "teacher") {
      setTeacherClass(resolvedClass || "");
    }
  };

  const logout = () => {
    setRole(null);
    setUserName("");
    setTeacherClass("");
  };

  return { role, userName, teacherClass, login, logout };
};

// ── Student type ──────────────────────────────────────────────────────────
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

// ── Teacher type ──────────────────────────────────────────────────────────
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

// ── Class options ─────────────────────────────────────────────────────────
export interface ClassGroup {
  label: string;
  icon: string;
  classes: string[];
}

export const CLASS_GROUPS: ClassGroup[] = [
  { label: "Deeniyat Classes", icon: "📚", classes: ["Deeniyat Alif", "Deeniyat Baa"] },
  { label: "Farsi Classes",    icon: "📖", classes: ["Farsi Awwal", "Farsi Duwwam"] },
  { label: "Arabic Classes",   icon: "🕌", classes: ["Arbi Awwal", "Arbi Duwwam", "Arbi Suwwam", "Arbi Chahrum", "Arbi Panjum"] },
  { label: "Hifz Classes",     icon: "🌟", classes: ["Hifz Alif", "Hifz Baa"] },
];

export const CLASS_OPTIONS: string[] = CLASS_GROUPS.flatMap(g => g.classes);

export const JAMAAT_OPTIONS = ["Hifz", "Nazera", "Alim", "General"];

// ── Reset all data keys ────────────────────────────────────────────────────
const DATA_KEYS = [
  "students","teachers","donations","fees","expenses","attendance",
  "hifz_progress","exam_results","salaries","staff","donors",
  "notifications","timetable_entries","qaida_progress","salary_records",
];

export function resetAllData() {
  DATA_KEYS.forEach(k => localStorage.removeItem(k));
  localStorage.removeItem("db_init_version");
  window.location.reload();
}

// ── Sample seed data (v2) ──────────────────────────────────────────────────
const INIT_VERSION = "v2";

const sampleStudents: Student[] = [
  { id: "s1", name: "Abdullah",  fatherName: "Ahmed",  motherName: "", className: "Deeniyat Alif", jamaat: "General", phone: "9876543210", address: "Kalgaon", status: "Active", admissionDate: new Date().toISOString().slice(0,10) },
  { id: "s2", name: "Fatima",    fatherName: "Yusuf",  motherName: "", className: "Deeniyat Baa",  jamaat: "General", phone: "9876543211", address: "Kalgaon", status: "Active", admissionDate: new Date().toISOString().slice(0,10) },
  { id: "s3", name: "Muhammad",  fatherName: "Omar",   motherName: "", className: "Arbi Awwal",    jamaat: "Nazera",  phone: "9876543212", address: "Kalgaon", status: "Active", admissionDate: new Date().toISOString().slice(0,10) },
  { id: "s4", name: "Ayesha",    fatherName: "Bilal",  motherName: "", className: "Hifz Alif",     jamaat: "Hifz",    phone: "9876543213", address: "Kalgaon", status: "Active", admissionDate: new Date().toISOString().slice(0,10) },
  { id: "s5", name: "Hassan",    fatherName: "Ali",    motherName: "", className: "Farsi Awwal",   jamaat: "Alim",    phone: "9876543214", address: "Kalgaon", status: "Active", admissionDate: new Date().toISOString().slice(0,10) },
];

const sampleTeachers: Teacher[] = [
  { id: "t1", name: "Qari Sahab",    email: "darulum@teacher",  phone: "9876543215", assignedClass: "Hifz Alif",     qualification: "Hifz-e-Quran",  joiningDate: new Date().toISOString().slice(0,10), status: "Active" },
  { id: "t2", name: "Maulana Sahab", email: "teacher2@dsik.edu",phone: "9876543216", assignedClass: "Deeniyat Alif", qualification: "Dars-e-Nizami", joiningDate: new Date().toISOString().slice(0,10), status: "Active" },
];

const today  = new Date().toISOString();
const yesterday = new Date(Date.now() - 86400000).toISOString();
const lastWeek  = new Date(Date.now() - 7 * 86400000).toISOString();

const sampleDonations = [
  { id: "don1", receiptNo: "DSIK/DON/2026/00001", donorName: "Mr. Rahman",  phone: "9876540001", amount: 5000,  donationType: "Zakat",   paymentMethod: "Cash", transactionId: "", date: today     },
  { id: "don2", receiptNo: "DSIK/DON/2026/00002", donorName: "Mrs. Fatima", phone: "9876540002", amount: 2500,  donationType: "Sadaqah", paymentMethod: "Cash", transactionId: "", date: yesterday },
  { id: "don3", receiptNo: "DSIK/DON/2026/00003", donorName: "Mr. Ibrahim", phone: "9876540003", amount: 10000, donationType: "General", paymentMethod: "Bank Transfer", transactionId: "TXN001", date: lastWeek  },
];

export function initializeData() {
  const currentVersion = localStorage.getItem("db_init_version");

  if (currentVersion !== INIT_VERSION) {
    // Clear all old data and reseed with new sample data
    DATA_KEYS.forEach(k => localStorage.removeItem(k));
    setLS("students",         sampleStudents);
    setLS("teachers",         sampleTeachers);
    setLS("donations",        sampleDonations);
    setLS("fees",             []);
    setLS("expenses",         []);
    setLS("attendance",       []);
    setLS("hifz_progress",    []);
    setLS("exam_results",     []);
    setLS("salaries",         []);
    setLS("timetable_entries",[]);
    setLS("qaida_progress",   []);
    setLS("donors",           []);
    setLS("notifications",    []);
    localStorage.setItem("db_init_version", INIT_VERSION);
    localStorage.setItem("madrasa_info", JSON.stringify({
      name: "Darul Uloom Sirajul Islam Kalgaon",
      established: "",
      address: "",
      phone: "",
      email: "",
    }));
  }
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
