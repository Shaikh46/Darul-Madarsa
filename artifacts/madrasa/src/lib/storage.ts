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
  { username: "darulum@parent",  password: "123456",   role: "parent",  displayName: "Parent" },
  { username: "parent@demo.com", password: "123456",   role: "parent",  displayName: "Parent" },
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
    try {
      const userData = {
        email: cred.username,
        role: cred.role,
        name: cred.displayName,
        loginTime: new Date().toISOString()
      };
      localStorage.setItem('loggedInUser', JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to sync loggedInUser to localStorage:', error);
    }
  };

  const logout = () => {
    setRole(null);
    setUserName("");
    setTeacherClass("");
    try {
      localStorage.removeItem('loggedInUser');
    } catch (error) {
      console.error('Failed to clear loggedInUser from localStorage:', error);
    }
  };

  return { role, userName, teacherClass, login, logout };
};

// ── Types ─────────────────────────────────────────────────────────────────
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
  studentAadhar?: string;
  parentAadhar?: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  className: string;
  lastModifiedBy?: string;
  timestamp?: number;
  records: Record<string, {
    status: "present" | "absent" | "late";
    remark?: string;
  }>;
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
  { label: "Hifz Classes",     icon: "🌟", classes: ["Hifz Alif", "Hifz Baa"] }
];

export const CLASS_OPTIONS: string[] = CLASS_GROUPS.flatMap(g => g.classes);

export const CLASS_NAMES_UR: Record<string, string> = {
  "Deeniyat Alif": "دینیات الف",
  "Deeniyat Baa":  "دینیات ب",
  "Farsi Awwal":   "فارسی اول",
  "Farsi Duwwam":  "فارسی دوم",
  "Arbi Awwal":    "عربی اول",
  "Arbi Duwwam":   "عربی دوم",
  "Arbi Suwwam":   "عربی سوم",
  "Arbi Chahrum":  "عربی چہارم",
  "Arbi Panjum":   "عربی پنجم",
  "Hifz Alif":     "حفظ الف",
  "Hifz Baa":      "حفظ ب"
};

export const CLASS_GROUP_LABELS_UR: Record<string, string> = {
  "Deeniyat Classes": "دینیات کلاسیں",
  "Farsi Classes":    "فارسی کلاسیں",
  "Arabic Classes":   "عربی کلاسیں",
  "Hifz Classes":     "حفظ کلاسیں",
};

export function trClass(cls: string, lang: "en" | "ur"): string {
  return lang === "ur" ? (CLASS_NAMES_UR[cls] ?? cls) : cls;
}

export function trClassGroup(label: string, lang: "en" | "ur"): string {
  return lang === "ur" ? (CLASS_GROUP_LABELS_UR[label] ?? label) : label;
}

export const JAMAAT_OPTIONS = ["Hifz", "Nazera", "Alim", "General"];

// ── Reset all data keys ────────────────────────────────────────────────────
const DATA_KEYS = [
  "students","teachers","donations","fees","expenses","attendance",
  "notifications","timetable_entries","qaida_progress","salary_records","prayer_times","islamic_events"
];

export function resetAllData() {
  DATA_KEYS.forEach(k => localStorage.removeItem(k));
  localStorage.removeItem("db_init_version");
  window.location.reload();
}

// ── Empty seed (zero data) ─────────────────────────────────────────────────
const INIT_VERSION = "v3-zero";

export function initializeData() {
  const currentVersion = localStorage.getItem("db_init_version");

  if (currentVersion !== INIT_VERSION) {
    // Clear all old data — start completely empty
    DATA_KEYS.forEach(k => localStorage.removeItem(k));
    setLS("students",         []);
    setLS("teachers",         []);
    setLS("donations",        []);
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
  URL.revokeObjectURL(url);
}

// ── Prayer Times ───────────────────────────────────────────────────────────
export interface PrayerTimes {
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export const DEFAULT_PRAYER_TIMES: PrayerTimes = {
  fajr: "05:00 AM",
  dhuhr: "12:30 PM",
  asr: "03:45 PM",
  maghrib: "06:30 PM",
  isha: "08:00 PM",
};

export const usePrayerTimes = () => useLS<PrayerTimes>("prayer_times", DEFAULT_PRAYER_TIMES);

// ── Islamic Events ─────────────────────────────────────────────────────────
export interface IslamicEvent {
  id: string;
  md: string;
  en: string;
  ur: string;
}

export const DEFAULT_ISLAMIC_EVENTS: IslamicEvent[] = [];

export const useIslamicEvents = () => useLS<IslamicEvent[]>("islamic_events", DEFAULT_ISLAMIC_EVENTS);

