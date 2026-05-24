export const HIJRI_MONTHS_EN = [
  "Muharram", "Safar", "Rabi ul Awwal", "Rabi us Sani",
  "Jamadi ul Awwal", "Jamadi us Sani", "Rajab", "Shaban",
  "Ramadan", "Shawwal", "Dhul Qadah", "Dhul Hijjah"
];

export const HIJRI_MONTHS_UR = [
  "محرم", "صفر", "ربیع الاول", "ربیع الثانی",
  "جمادی الاول", "جمادی الثانی", "رجب", "شعبان",
  "رمضان", "شوال", "ذوالقعدہ", "ذوالحجہ"
];

export const WEEKDAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const WEEKDAYS_UR = ["اتوار", "پیر", "منگل", "بدھ", "جمعرات", "جمعہ", "ہفتہ"];

const ANCHOR_GREG = new Date(2026, 4, 18);
const AVG = 29.53059;
const AVG_YEAR = AVG * 12;
const ANCHOR_TOTAL = (1447 - 1) * AVG_YEAR + (12 - 1) * AVG;

export interface HijriDate { y: number; m: number; d: number; }

export function gregToHijri(date: Date): HijriDate {
  const diffDays = Math.round((date.getTime() - ANCHOR_GREG.getTime()) / 86400000);
  const total = ANCHOR_TOTAL + diffDays;
  const y = Math.floor(total / AVG_YEAR) + 1;
  const rem1 = total % AVG_YEAR;
  const m = Math.min(Math.max(Math.floor(rem1 / AVG) + 1, 1), 12);
  const d = Math.min(Math.max(Math.floor(rem1 % AVG) + 1, 1), 30);
  return { y, m, d };
}

export function formatHijri(h: HijriDate, lang: "en" | "ur"): string {
  const m = (lang === "ur" ? HIJRI_MONTHS_UR : HIJRI_MONTHS_EN)[h.m - 1];
  return lang === "ur" ? `${h.d} ${m} ${h.y} ہجری` : `${h.d} ${m} ${h.y} AH`;
}

export const ISLAMIC_EVENTS: { md: string; en: string; ur: string }[] = [
  { md: "1-1",   en: "Islamic New Year",   ur: "نیا اسلامی سال" },
  { md: "1-10",  en: "Ashura",             ur: "عاشورہ" },
  { md: "3-12",  en: "Eid Milad un Nabi",  ur: "عید میلاد النبی" },
  { md: "7-27",  en: "Al Isra wal Miraj",  ur: "معراج" },
  { md: "8-15",  en: "Shab e Barat",       ur: "شب برات" },
  { md: "9-1",   en: "First Ramadan",      ur: "پہلا رمضان" },
  { md: "9-27",  en: "Laylat al Qadr",     ur: "شب قدر" },
  { md: "10-1",  en: "Eid ul Fitr",        ur: "عید الفطر" },
  { md: "12-9",  en: "Day of Arafah",      ur: "یوم عرفہ" },
  { md: "12-10", en: "Eid ul Adha",        ur: "عید الاضحی" },
];

export function getEventForHijri(h: HijriDate, lang: "en" | "ur"): string | null {
  const ev = ISLAMIC_EVENTS.find(e => e.md === `${h.m}-${h.d}`);
  if (!ev) return null;
  return lang === "ur" ? ev.ur : ev.en;
}
