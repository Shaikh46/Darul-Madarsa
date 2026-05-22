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
  // dispatch custom event to update hooks across components
  window.dispatchEvent(new Event("local-storage"));
}

export function useLS<T>(key: string, defaultVal: T): [T, (val: T) => void] {
  const [val, setVal] = useState<T>(() => getLS(key, defaultVal));

  useEffect(() => {
    const handleStorageChange = () => {
      setVal(getLS(key, defaultVal));
    };

    window.addEventListener("local-storage", handleStorageChange);
    // Also listen for cross-tab changes
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
  
  const login = (newRole: Role) => {
    setRole(newRole);
  };

  const logout = () => {
    setRole(null);
  };

  return { role, login, logout };
};

// Types and sample data
export interface Student {
  id: string;
  name: string;
  fatherName: string;
  motherName: string;
  className: string;
  phone: string;
  address: string;
}

export interface Teacher {
  id: string;
  name: string;
  className: string;
  subject: string;
  phone: string;
}

const initialStudents: Student[] = [
  { id: "s1", name: "Ahmed Khan", fatherName: "Rashid Khan", motherName: "Fatima Khan", className: "Class 5", phone: "9876543210", address: "Kalgaon" },
  { id: "s2", name: "Mohammed Ali", fatherName: "Salim Ali", motherName: "Amina Ali", className: "Class 5", phone: "9876543211", address: "Kalgaon" },
  { id: "s3", name: "Ibrahim Sheikh", fatherName: "Yusuf Sheikh", motherName: "Khadija Sheikh", className: "Class 6", phone: "9876543212", address: "Kalgaon" },
  { id: "s4", name: "Usman Patel", fatherName: "Ismail Patel", motherName: "Maryam Patel", className: "Class 6", phone: "9876543213", address: "Kalgaon" },
  { id: "s5", name: "Hasan Ansari", fatherName: "Hussain Ansari", motherName: "Zainab Ansari", className: "Class 7", phone: "9876543214", address: "Kalgaon" }
];

const initialTeachers: Teacher[] = [
  { id: "t1", name: "Maulana Abdul Rahman", className: "Class 5", subject: "Hifz", phone: "9876500001" },
  { id: "t2", name: "Ustad Mohammed Yusuf", className: "Class 6", subject: "Nazera", phone: "9876500002" }
];

export function initializeData() {
  if (getLS("students", []).length === 0) setLS("students", initialStudents);
  if (getLS("teachers", []).length === 0) setLS("teachers", initialTeachers);
  if (getLS("fees", []).length === 0) setLS("fees", []);
  if (getLS("expenses", []).length === 0) setLS("expenses", []);
  if (getLS("donations", []).length === 0) setLS("donations", []);
  if (getLS("attendance", []).length === 0) setLS("attendance", []);
  if (getLS("hifz_progress", []).length === 0) setLS("hifz_progress", []);
  if (getLS("exam_results", []).length === 0) setLS("exam_results", []);
  if (getLS("salaries", []).length === 0) setLS("salaries", []);
  if (getLS("donors", []).length === 0) setLS("donors", []);
  if (getLS("notifications", []).length === 0) setLS("notifications", []);
}
