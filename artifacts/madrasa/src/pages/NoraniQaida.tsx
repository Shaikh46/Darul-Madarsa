import { useState } from "react";
import { useLS, Student } from "@/lib/storage";
import { useLang } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, BookOpen, Award, ClipboardList, Star, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QaidaProgress {
  id: string;
  studentId: string;
  currentLesson: number;
  lessonsCompleted: number[];
  startedDate: string;
  completedDate?: string;
  status: "in_progress" | "completed" | "paused";
  fluencyRating: number;
  teacherRemarks: string;
}

interface QaidaAssessment {
  id: string;
  studentId: string;
  lessonNumber: number;
  assessmentDate: string;
  readingScore: number;
  tajweedScore: number;
  teacherComments: string;
  passed: boolean;
}

interface QaidaLesson {
  number: number;
  titleEn: string;
  titleAr: string;
  titleUr: string;
  contentAr: string;
  instructionsEn: string;
  instructionsUr: string;
  examplesAr: string[];
}

const LESSONS: QaidaLesson[] = [
  { number: 1, titleEn: "Arabic Alphabet", titleAr: "حُرُوفُ مُفْرَدَات", titleUr: "حروف مفردات", contentAr: "ا  ب  ت  ث  ج  ح  خ  د  ذ  ر  ز  س  ش  ص  ض  ط  ظ  ع  غ  ف  ق  ك  ل  م  ن  و  ه  ء  ي", instructionsEn: "Learn the 29 Arabic letters with their correct pronunciation point (Makhraj). Each letter has a unique place of articulation in the mouth or throat.", instructionsUr: "عربی حروف تہجی کو ان کے صحیح مخرج (ادائیگی کے مقام) کے ساتھ سیکھیں۔ ہر حرف کی اپنی منفرد جگہ ہے منہ یا گلے میں۔", examplesAr: ["اَلِف", "بَاء", "تَاء", "ثَاء", "جِيم"] },
  { number: 2, titleEn: "Compound Letters", titleAr: "حُرُوفُ مُرَكَّبَات", titleUr: "حروف مرکبات", contentAr: "آ  اا  ای  او  بب  تت  ثث  جج  حح", instructionsEn: "These are two or more letters joined together. Practise reading them smoothly without stopping between letters.", instructionsUr: "دو یا دو سے زیادہ حروف کو ملا کر پڑھنا سیکھیں۔ حروف کے درمیان رکے بغیر رواں پڑھیں۔", examplesAr: ["آَلَم", "اَلَا", "اَيَّان"] },
  { number: 3, titleEn: "Abbreviated Letters", titleAr: "حُرُوفُ مُقَطَّعَات", titleUr: "حروف مقطعات", contentAr: "الم  الر  المر  المص  كهيعص  طه  طسم  طس  يس  ص  حم  عسق  ق  ن", instructionsEn: "These letters appear at the beginning of some Quranic Surahs. They are read by their individual letter names, not combined.", instructionsUr: "یہ حروف قرآن کریم کی بعض سورتوں کے شروع میں آتے ہیں۔ انہیں الگ الگ ناموں سے پڑھا جاتا ہے۔", examplesAr: ["الم", "حم", "يس", "طه"] },
  { number: 4, titleEn: "Movements (Harakat)", titleAr: "الحَرَكَات", titleUr: "حرکات (زبر، زیر، پیش)", contentAr: "بَ  بِ  بُ  تَ  تِ  تُ  ثَ  ثِ  ثُ  جَ  جِ  جُ  حَ  حِ  حُ  خَ  خِ  خُ", instructionsEn: "Harakat are short vowel marks. Zabar (Fathah) above a letter gives 'a' sound, Zer (Kasrah) below gives 'i' sound, Pesh (Dammah) gives 'u' sound.", instructionsUr: "حرکات مختصر آواز کی علامات ہیں۔ زبر (فتحہ) اوپر 'اَ' کی آواز، زیر (کسرہ) نیچے 'اِ' کی آواز، اور پیش (ضمہ) 'اُ' کی آواز دیتا ہے۔", examplesAr: ["بَتَجَ", "بِتِجِ", "بُتُجُ"] },
  { number: 5, titleEn: "Tanween", titleAr: "التَّنْوِين", titleUr: "تنوین", contentAr: "بً  بٍ  بٌ  تً  تٍ  تٌ  جً  جٍ  جٌ  كً  كٍ  كٌ  لً  لٍ  لٌ", instructionsEn: "Tanween is the doubling of Harakat at the end of a word. It adds an 'n' sound: Fathatayn (an), Kasratayn (in), Dammatayn (un).", instructionsUr: "تنوین کسی لفظ کے آخر میں حرکات کا دُہراؤ ہے جس سے 'نون' کی آواز پیدا ہوتی ہے: فتحتین (اَن)، کسرتین (اِن)، ضمتین (اُن)۔", examplesAr: ["كِتَابً", "بَيْتٍ", "رَجُلٌ"] },
  { number: 6, titleEn: "Standing Harakat", titleAr: "الحَرَكَاتُ القَائِمَة", titleUr: "کھڑی حرکات", contentAr: "بٰ  بٖ  بٗ  اٰ  اٖ", instructionsEn: "These are elongated vowel marks: Khara Zabar (vertical Fathah) gives a long 'aa' sound, Khara Zer gives long 'ee', and Ulta Pesh gives long 'oo'.", instructionsUr: "یہ لمبی آواز کی علامات ہیں۔ کھڑی زبر لمبی 'آ' آواز، کھڑی زیر لمبی 'ای' آواز، اور الٹا پیش لمبی 'او' آواز دیتا ہے۔", examplesAr: ["رَحمٰن", "كِتٰب", "مُوسٰى"] },
  { number: 7, titleEn: "Madd Letters", titleAr: "حُرُوفُ المَدّ", titleUr: "حروف مدہ", contentAr: "با  بِي  بُو  تَا  تِي  تُو  ثَا  ثِي  ثُو", instructionsEn: "Madd (elongation) letters are: Alif (for Fathah), Ya (for Kasrah), Waw (for Dammah). They lengthen the sound to 2 counts (harakaat).", instructionsUr: "مدہ کے حروف ہیں: الف (فتحہ کے لیے)، یاء (کسرہ کے لیے)، واو (ضمہ کے لیے)۔ یہ آواز کو 2 حرکات تک لمبا کرتے ہیں۔", examplesAr: ["قَالَ", "قِيلَ", "يَقُول"] },
  { number: 8, titleEn: "Leen Letters", titleAr: "حُرُوفُ اللِّين", titleUr: "حروف لین", contentAr: "وْ  يْ  بَوْ  بَيْ  تَوْ  تَيْ  خَوْ  خَيْ  مَوْ  مَيْ", instructionsEn: "Leen letters are Waw and Ya with Sukoon (no vowel) preceded by a Fathah. They have a soft, gentle sound, read in 2 counts when stopping.", instructionsUr: "حروف لین واو اور یاء ہیں جن پر سکون ہو اور پہلے حرف پر فتحہ ہو۔ ان کی آواز نرم و ملائم ہوتی ہے۔", examplesAr: ["خَوْف", "بَيْت", "صَوْت"] },
  { number: 9, titleEn: "Izhaar (Clear Noon)", titleAr: "الإِظهَار", titleUr: "اظہار", contentAr: "نْ ء  نْ ه  نْ ع  نْ ح  نْ غ  نْ خ  مِنْ أَجْل  مَنْ عَمِل  عَنْ غَيْر", instructionsEn: "When Noon Sakinah or Tanween is followed by one of 6 throat letters (ء ه ع ح غ خ), each must be clearly pronounced without merging (Izhaar = clarity).", instructionsUr: "جب نون ساکنہ یا تنوین کے بعد حلق کے چھ حروف (ء ه ع ح غ خ) میں سے کوئی آئے تو نون کو واضح طور پر ادا کیا جاتا ہے۔", examplesAr: ["مَنْ آَمَن", "مِنْ هَادٍ", "عَنْ عَمَل"] },
  { number: 10, titleEn: "Idghaam (Merging)", titleAr: "الإِدغَام", titleUr: "ادغام", contentAr: "نْ ي  نْ ر  نْ م  نْ ل  نْ و  نْ ن", instructionsEn: "When Noon Sakinah or Tanween is followed by one of the letters (ي ر م ل و ن), the Noon merges into the next letter. With (ي م ن و) there is Ghunnah (nasal sound).", instructionsUr: "جب نون ساکنہ یا تنوین کے بعد (ي ر م ل و ن) میں سے کوئی حرف آئے تو نون اگلے حرف میں مل جاتا ہے۔", examplesAr: ["مِنْ يَقُول", "مِنْ رَبِّك", "مِن لَّدُن"] },
  { number: 11, titleEn: "Iqlab (Conversion)", titleAr: "الإِقلَاب", titleUr: "اقلاب", contentAr: "نْ ب  تَنْبُت  مِنْ بَعْد  أَنْبَأَ  جُنبَاً", instructionsEn: "When Noon Sakinah or Tanween is followed by Ba (ب), the Noon changes (converts) into a Meem with Ghunnah. This is called Iqlab (conversion).", instructionsUr: "جب نون ساکنہ یا تنوین کے بعد 'ب' آئے تو نون میم غنہ میں بدل جاتا ہے۔ اسے اقلاب کہتے ہیں۔", examplesAr: ["مِنْ بَعْد", "سَمِيعٌ بَصِير", "أَنْبَأَهُم"] },
  { number: 12, titleEn: "Ikhfaa (Concealment)", titleAr: "الإِخفَاء", titleUr: "اخفاء", contentAr: "نْ ت  نْ ث  نْ ج  نْ د  نْ ذ  نْ ز  نْ س  نْ ش  نْ ص  نْ ض  نْ ط  نْ ظ  نْ ف  نْ ق  نْ ك", instructionsEn: "When Noon Sakinah or Tanween is followed by any of the remaining 15 letters, the Noon is pronounced between Izhaar and Idghaam with Ghunnah — this is Ikhfaa (concealment).", instructionsUr: "جب نون ساکنہ یا تنوین کے بعد باقی 15 حروف میں سے کوئی آئے تو نون کو اظہار اور ادغام کے درمیان غنہ کے ساتھ ادا کیا جاتا ہے۔", examplesAr: ["مَنْ كَفَر", "إِنْ تَنصُرُوا", "أَنْتُم"] },
  { number: 13, titleEn: "Meem Sakinah Rules", titleAr: "مِيمُ السَّاكِنَة", titleUr: "میم ساکنہ کے قواعد", contentAr: "مْ ب = إخفاء شفوي  |  مْ م = إدغام شفوي  |  مْ (غير) = إظهار شفوي", instructionsEn: "Meem Sakinah has 3 rules: (1) Before Ba — Ikhfaa Shafawi (conceal with Ghunnah), (2) Before another Meem — Idghaam Shafawi (merge), (3) Before any other letter — Izhaar Shafawi (clear).", instructionsUr: "میم ساکنہ کے تین قواعد ہیں: (1) 'ب' سے پہلے — اخفاء شفوی، (2) 'م' سے پہلے — ادغام شفوی، (3) کسی اور حرف سے پہلے — اظہار شفوی۔", examplesAr: ["هُمْ بِهِ", "لَهُمْ مَا", "هُمْ فِيهَا"] },
  { number: 14, titleEn: "Qalqalah", titleAr: "القَلقَلَة", titleUr: "قلقلہ", contentAr: "ق  ط  ب  ج  د  —  Letters: قُطُب جَد", instructionsEn: "Qalqalah means 'echoing vibration'. When the letters ق ط ب ج د have Sukoon (no vowel), they produce a slight echo or bounce in their sound.", instructionsUr: "قلقلہ کا مطلب 'گونج یا ارتعاش' ہے۔ جب قطب جد کے حروف (ق ط ب ج د) پر سکون ہو تو ان میں ہلکی گونج پیدا ہوتی ہے۔", examplesAr: ["يَطْبَع", "خَلقَ", "اجْعَل", "الفَجْر"] },
  { number: 15, titleEn: "Tafkheem & Tarqeeq", titleAr: "التَّفخِيم وَالتَّرقِيق", titleUr: "تفخیم اور ترقیق", contentAr: "حروف مستعلية: خ ص ض غ ط ق ظ\nحروف مستفلة: باقی تمام حروف", instructionsEn: "Tafkheem = Heavy/thick sound (letters خ ص ض غ ط ق ظ are always heavy). Tarqeeq = Light/thin sound (most other letters). Letter Raa and Lam in Allah's name have special rules.", instructionsUr: "تفخیم = بھاری آواز (حروف مستعلیہ: خ ص ض غ ط ق ظ ہمیشہ بھاری ہوتے ہیں)۔ ترقیق = ہلکی آواز (باقی زیادہ تر حروف)۔", examplesAr: ["اللّٰه", "الرَّحمٰن", "الصِّرَاط"] },
  { number: 16, titleEn: "Rules of Letter Raa", titleAr: "أَحكَامُ الرَّاء", titleUr: "ر کے احکام", contentAr: "رَ رِ رُ  — تفخيم\nرِ — ترقيق\nسِتْر — وقف پر ترقیق", instructionsEn: "The letter Raa (ر) is heavy (Tafkheem) in most cases. It is light (Tarqeeq) when it has Kasrah, or is preceded by Kasrah/Ya Sakinah, or follows a certain letter at the beginning.", instructionsUr: "حرف راء (ر) اکثر حالات میں تفخیم (بھاری) ہوتا ہے۔ کسرہ کے ساتھ یا کسی خاص حرف کے بعد ترقیق (ہلکا) ہو جاتا ہے۔", examplesAr: ["رَبَّنَا", "رِزْق", "ذِكْر"] },
  { number: 17, titleEn: "Madd (Prolongation) Rules", titleAr: "أَحكَامُ المَدّ", titleUr: "مد کے احکام", contentAr: "مد طبيعي = ٢ حركة  |  مد متصل = ٤-٥  |  مد منفصل = ٢-٥  |  مد لازم = ٦", instructionsEn: "Madd = prolonging a vowel sound. Types: Natural Madd (2 counts), Madd Munfasil (2-5 counts), Madd Muttasil (4-5 counts), Madd Laazim (6 counts, mandatory).", instructionsUr: "مد = آواز کو لمبا کرنا۔ اقسام: مد طبیعی (2 حرکات)، مد منفصل (2-5)، مد متصل (4-5)، مد لازم (6 حرکات، واجب)۔", examplesAr: ["قَالَ", "جَاءُوا", "الضَّالِّين"] },
  { number: 18, titleEn: "Waqf (Stopping) Rules", titleAr: "أَحكَامُ الوَقف", titleUr: "وقف کے احکام", contentAr: "م = وقف لازم  |  ط = وقف مطلق  |  ج = جائز  |  ز = أحسن الوصل  |  ص = وصل أجوز  |  ق = الوقف أولى", instructionsEn: "Waqf means stopping during recitation. There are different types of stops marked in the Quran: Compulsory stop (م), Absolute stop (ط), Permissible (ج), and others.", instructionsUr: "وقف تلاوت کے دوران رکنا ہے۔ قرآن میں مختلف وقف کی علامات ہیں: لازمی وقف (م)، مطلق (ط)، جائز (ج) وغیرہ۔", examplesAr: ["مَالِك ۝", "الرَّحِيم ۙ", "نَسْتَعِين ۩"] },
  { number: 19, titleEn: "Hamzatul Wasl", titleAr: "هَمزَةُ الوَصل", titleUr: "ہمزہ وصل", contentAr: "ٱ  |  ٱلرَّحمٰن  ٱلرَّحِيم  ٱقرَأ  ٱسمِ  ٱلَّذِين", instructionsEn: "Hamzatul Wasl (ٱ) is a connecting Hamza. When it comes in the middle of speech (connected to a previous word), it is NOT pronounced — only pronounced when starting fresh.", instructionsUr: "ہمزہ وصل (ٱ) جوڑنے والا ہمزہ ہے۔ جب یہ پچھلے لفظ سے جڑا ہو تو اسے پڑھا نہیں جاتا، صرف ابتداء میں پڑھا جاتا ہے۔", examplesAr: ["بِسمِ ٱللّٰه", "قُلِ ٱعبُدُوا", "فَقُل ٱجتَنِبُوا"] },
  { number: 20, titleEn: "Common Words Practice", titleAr: "مَشقُ الكَلِمَات", titleUr: "عام الفاظ کی مشق", contentAr: "بِسمِ ٱللّٰهِ  الرَّحمٰنِ الرَّحِيمِ\nٱلحَمدُ لِلّٰهِ رَبِّ العَالَمِين\nإِيَّاكَ نَعبُدُ وَإِيَّاكَ نَستَعِين", instructionsEn: "Practise reading common Quranic words and short phrases applying all the rules learnt so far. Focus on correct pronunciation and smooth flow.", instructionsUr: "اب تک سیکھے گئے تمام قواعد کو لگاتے ہوئے عام قرآنی الفاظ اور جملوں کی مشق کریں۔ صحیح تلفظ اور روانی پر توجہ دیں۔", examplesAr: ["بِسمِ ٱللّٰه", "ٱلحَمدُ لِلّٰه", "رَبِّ العَالَمِين"] },
  { number: 21, titleEn: "Quranic Words Practice", titleAr: "مَشقُ الكَلِمَات القُرآنِيَّة", titleUr: "قرآنی الفاظ کی مشق", contentAr: "صِرَاطَ الَّذِينَ أَنعَمتَ عَلَيهِم\nغَيرِ المَغضُوبِ عَلَيهِم\nوَلَا الضَّالِّين", instructionsEn: "Practice reading longer Quranic sentences from Surah Al-Fatiha and short Surahs (Ikhlas, Falaq, Nas). Apply all Tajweed rules you have learnt.", instructionsUr: "سورہ فاتحہ اور چھوٹی سورتوں (اخلاص، فلق، ناس) کے طویل جملوں کی مشق کریں۔ تمام تجوید کے قواعد لگائیں۔", examplesAr: ["قُل هُوَ ٱللّٰهُ أَحَد", "قُل أَعُوذُ بِرَبِّ ٱلفَلَق", "قُل أَعُوذُ بِرَبِّ ٱلنَّاس"] },
  { number: 22, titleEn: "Full Practice & Completion", titleAr: "المَشقُ الكَامِل", titleUr: "مکمل مشق", contentAr: "مُبَارَك  |  جَمِيع الدُّرُوس  |  تَمَّ بِحَمدِ ٱللّٰه", instructionsEn: "Final lesson: Recite Al-Fatiha and 3 short Surahs from memory applying all Tajweed rules. Upon completion, a certificate of Norani Qaida will be issued. Alhamdulillah!", instructionsUr: "آخری سبق: سورہ فاتحہ اور 3 چھوٹی سورتیں تمام تجوید قواعد کے ساتھ حفظ سے تلاوت کریں۔ مکمل ہونے پر نورانی قاعدہ کا سرٹیفکیٹ ملے گا۔ الحمد للہ!", examplesAr: ["ٱلحَمدُ لِلّٰهِ رَبِّ ٱلعَالَمِين", "تَبَارَكَ وَتَعَالَى", "جَزَاكَ ٱللّٰهُ خَيراً"] },
];

function StarRating({ value, onChange, readOnly = false }: { value: number; onChange?: (n: number) => void; readOnly?: boolean }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          className={`w-4 h-4 cursor-${readOnly ? "default" : "pointer"} transition-colors ${n <= value ? "fill-accent text-accent" : "text-muted-foreground"}`}
          onClick={() => !readOnly && onChange?.(n)}
        />
      ))}
    </div>
  );
}

export default function NoraniQaida() {
  const [students] = useLS<Student[]>("students", []);
  const [progressList, setProgressList] = useLS<QaidaProgress[]>("qaida_progress", []);
  const [assessments, setAssessments] = useLS<QaidaAssessment[]>("qaida_assessments", []);
  const { lang } = useLang();
  const { toast } = useToast();
  const isUrdu = lang === "ur";

  const [selectedLesson, setSelectedLesson] = useState(1);
  const [practiceMode, setPracticeMode] = useState(false);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const [assessStudentId, setAssessStudentId] = useState("");
  const [assessLesson, setAssessLesson] = useState("1");
  const [readingScore, setReadingScore] = useState(3);
  const [tajweedScore, setTajweedScore] = useState(3);
  const [assessComments, setAssessComments] = useState("");
  const [assessPassed, setAssessPassed] = useState(true);

  const [progressStudentId, setProgressStudentId] = useState("");
  const [progressLesson, setProgressLesson] = useState("1");
  const [progressRemarks, setProgressRemarks] = useState("");
  const [progressFluency, setProgressFluency] = useState(3);

  const lesson = LESSONS.find(l => l.number === selectedLesson)!;
  const practiceLetters = lesson.contentAr.split(/\s+/).filter(Boolean);

  const getStudentProgress = (studentId: string) =>
    progressList.find(p => p.studentId === studentId);

  const handleSaveProgress = () => {
    if (!progressStudentId) { toast({ title: "Error", description: "Select a student", variant: "destructive" }); return; }
    const lessonNum = parseInt(progressLesson);
    const existing = progressList.find(p => p.studentId === progressStudentId);
    const now = new Date().toISOString();
    if (existing) {
      const completed = Array.from(new Set([...existing.lessonsCompleted, ...Array.from({ length: lessonNum }, (_, i) => i + 1)]));
      const updated: QaidaProgress = {
        ...existing,
        currentLesson: lessonNum,
        lessonsCompleted: completed,
        fluencyRating: progressFluency,
        teacherRemarks: progressRemarks,
        status: lessonNum >= 22 ? "completed" : "in_progress",
        completedDate: lessonNum >= 22 ? now : existing.completedDate,
      };
      setProgressList(progressList.map(p => p.studentId === progressStudentId ? updated : p));
    } else {
      const newProgress: QaidaProgress = {
        id: `qp_${Date.now()}`,
        studentId: progressStudentId,
        currentLesson: lessonNum,
        lessonsCompleted: Array.from({ length: lessonNum }, (_, i) => i + 1),
        startedDate: now,
        status: lessonNum >= 22 ? "completed" : "in_progress",
        completedDate: lessonNum >= 22 ? now : undefined,
        fluencyRating: progressFluency,
        teacherRemarks: progressRemarks,
      };
      setProgressList([...progressList, newProgress]);
    }
    toast({ title: "Progress Saved", description: "Student Qaida progress updated." });
    setProgressStudentId(""); setProgressRemarks(""); setProgressLesson("1"); setProgressFluency(3);
  };

  const handleSaveAssessment = () => {
    if (!assessStudentId) { toast({ title: "Error", description: "Select a student", variant: "destructive" }); return; }
    const newAssessment: QaidaAssessment = {
      id: `qa_${Date.now()}`,
      studentId: assessStudentId,
      lessonNumber: parseInt(assessLesson),
      assessmentDate: new Date().toISOString(),
      readingScore,
      tajweedScore,
      teacherComments: assessComments,
      passed: assessPassed,
    };
    setAssessments([newAssessment, ...assessments]);
    toast({ title: "Assessment Saved", description: `Lesson ${assessLesson} assessment recorded.` });
    setAssessStudentId(""); setAssessComments(""); setReadingScore(3); setTajweedScore(3);
  };

  const handlePrintCertificate = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    const progress = getStudentProgress(studentId);
    if (!student || !progress || progress.status !== "completed") return;
    const printWindow = window.open("", "", "width=900,height=650");
    if (!printWindow) return;
    printWindow.document.write(`<html><head><title>Norani Qaida Certificate - ${student.name}</title><style>
      @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');
      body{font-family:Georgia,serif;padding:0;margin:0;background:#fff}
      .cert{width:800px;margin:20px auto;border:12px double #DAA520;padding:50px;text-align:center;position:relative;background:linear-gradient(135deg,#fffbf0,#fff9e6)}
      .inner{border:4px solid #008000;padding:30px}
      .arabic{font-family:'Amiri',serif;font-size:32px;color:#008000;margin:15px 0;direction:rtl}
      h1{color:#008000;font-size:28px;margin:10px 0}
      h2{color:#DAA520;font-size:20px}
      .ornament{font-size:40px;color:#DAA520;margin:10px 0}
      .detail{font-size:14px;margin:8px 0;color:#333}
      .sig{display:flex;justify-content:space-around;margin-top:50px}
      .sig div{text-align:center}
      .sig p{border-top:1px solid #333;margin-top:30px;padding-top:5px;font-size:12px}
    </style></head><body><div class="cert"><div class="inner">
      <div class="ornament">✦ ✦ ✦</div>
      <div class="arabic">بِسمِ ٱللّٰهِ الرَّحمٰنِ الرَّحِيم</div>
      <h1>Darul Uloom Sirajul Islam, Kalgaon</h1>
      <h2>CERTIFICATE OF COMPLETION</h2>
      <h2 style="font-family:serif;font-size:16px;color:#555">Norani Qaida — نورانی قاعدہ</h2>
      <p class="detail" style="margin:25px 0;font-size:16px">This is to certify that</p>
      <h2 style="font-size:26px;color:#008000;border-bottom:2px solid #DAA520;display:inline-block;padding-bottom:5px">${student.name}</h2>
      <p class="detail">Son/Daughter of: <strong>${student.fatherName}</strong> &nbsp;|&nbsp; Class: <strong>${student.className}</strong></p>
      <p class="detail">has successfully completed all <strong>22 lessons</strong> of Norani Qaida</p>
      <p class="detail">with Fluency Rating: <strong>${"★".repeat(progress.fluencyRating)}${"☆".repeat(5 - progress.fluencyRating)}</strong></p>
      <p class="detail">Date of Completion: <strong>${progress.completedDate ? new Date(progress.completedDate).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) : "—"}</strong></p>
      <div class="arabic" style="font-size:20px;margin:20px 0">جَزَاكَ ٱللّٰهُ خَيراً — مَاشَاءَ ٱللّٰه</div>
      <div class="sig">
        <div><div style="height:40px"></div><p>Class Teacher<br/>دارالعلوم سراج الاسلام</p></div>
        <div><div style="height:40px"></div><p>Principal<br/>کلگاؤں، مہاراشٹر</p></div>
      </div>
      <div class="ornament" style="margin-top:20px">✦ ✦ ✦</div>
    </div></div></body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  const totalInQaida = progressList.length;
  const totalCompleted = progressList.filter(p => p.status === "completed").length;
  const avgLesson = progressList.length > 0 ? Math.round(progressList.reduce((s, p) => s + p.currentLesson, 0) / progressList.length) : 0;

  return (
    <div className={`space-y-6 ${isUrdu ? "urdu-text" : ""}`} dir={isUrdu ? "rtl" : "ltr"}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isUrdu ? "نورانی قاعدہ" : "Norani Qaida"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isUrdu ? "تجوید کے ساتھ قرآنی تعلیم" : "Quranic education with Tajweed — 22 lessons"}
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          <div className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary font-medium">{totalInQaida} {isUrdu ? "طلباء" : "enrolled"}</div>
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium">{totalCompleted} {isUrdu ? "مکمل" : "completed"}</div>
          {avgLesson > 0 && <div className="px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent-foreground font-medium">{isUrdu ? "اوسط سبق" : "Avg Lesson"} {avgLesson}</div>}
        </div>
      </div>

      <Tabs defaultValue="lessons">
        <TabsList className="mb-2">
          <TabsTrigger value="lessons">
            <BookOpen className="w-4 h-4 mr-2" />
            {isUrdu ? "اسباق" : "Lessons"}
          </TabsTrigger>
          <TabsTrigger value="progress">
            <ClipboardList className="w-4 h-4 mr-2" />
            {isUrdu ? "پیشرفت" : "Progress"}
          </TabsTrigger>
          <TabsTrigger value="assessment">
            <Award className="w-4 h-4 mr-2" />
            {isUrdu ? "جائزہ" : "Assessment"}
          </TabsTrigger>
        </TabsList>

        {/* ── LESSONS TAB ── */}
        <TabsContent value="lessons">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Lesson list */}
            <div className="lg:col-span-1 border rounded-lg bg-card overflow-hidden">
              <div className="p-3 bg-primary text-primary-foreground font-semibold text-sm">
                {isUrdu ? "22 اسباق" : "22 Lessons"}
              </div>
              <div className="overflow-y-auto max-h-[520px]">
                {LESSONS.map(l => (
                  <button
                    key={l.number}
                    onClick={() => { setSelectedLesson(l.number); setPracticeMode(false); }}
                    className={`w-full text-left px-3 py-2.5 text-sm border-b border-border/50 flex items-center gap-2.5 transition-colors ${selectedLesson === l.number ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50"}`}
                    data-testid={`lesson-btn-${l.number}`}
                  >
                    <span className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${selectedLesson === l.number ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                      {l.number}
                    </span>
                    <span className="flex-1 truncate">{isUrdu ? l.titleUr : l.titleEn}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Lesson content */}
            <div className="lg:col-span-3 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-lg">
                      <span className="text-primary">{isUrdu ? "سبق" : "Lesson"} {lesson.number}:</span>{" "}
                      {isUrdu ? lesson.titleUr : lesson.titleEn}
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={() => { setPracticeMode(!practiceMode); setPracticeIndex(0); setShowAnswer(false); }}>
                      {practiceMode ? (isUrdu ? "مواد دیکھیں" : "View Content") : (isUrdu ? "پریکٹس موڈ" : "Practice Mode")}
                    </Button>
                  </div>
                  <p className="text-muted-foreground text-sm font-arabic" dir="rtl">{lesson.titleAr}</p>
                </CardHeader>
                <CardContent>
                  {!practiceMode ? (
                    <div className="space-y-5">
                      {/* Arabic content display */}
                      <div className="p-6 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 text-center">
                        <p
                          className="leading-relaxed text-foreground font-arabic"
                          style={{ fontFamily: "'Amiri', serif", fontSize: "clamp(1.4rem, 3vw, 2rem)", direction: "rtl", lineHeight: "2.2" }}
                        >
                          {lesson.contentAr}
                        </p>
                      </div>

                      {/* Instructions */}
                      <div className="grid md:grid-cols-2 gap-4">
                        {(!isUrdu) && (
                          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                            <div className="flex items-center gap-2 mb-2 text-blue-700 font-semibold text-sm">
                              <BookOpen className="w-4 h-4" />
                              English Instructions
                            </div>
                            <p className="text-sm text-blue-900 leading-relaxed">{lesson.instructionsEn}</p>
                          </div>
                        )}
                        {(isUrdu) && (
                          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 col-span-2" dir="rtl">
                            <div className="flex items-center gap-2 mb-2 text-emerald-700 font-semibold text-sm urdu-text">
                              <BookOpen className="w-4 h-4" />
                              اردو ہدایات
                            </div>
                            <p className="text-sm text-emerald-900 leading-relaxed urdu-text">{lesson.instructionsUr}</p>
                          </div>
                        )}
                        {(!isUrdu) && (
                          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200" dir="rtl">
                            <div className="flex items-center gap-2 mb-2 text-emerald-700 font-semibold text-sm urdu-text">
                              <BookOpen className="w-4 h-4" />
                              اردو ہدایات
                            </div>
                            <p className="text-sm text-emerald-900 leading-relaxed urdu-text">{lesson.instructionsUr}</p>
                          </div>
                        )}
                      </div>

                      {/* Examples */}
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                          {isUrdu ? "مثالیں" : "Examples"}
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {lesson.examplesAr.map((ex, i) => (
                            <span
                              key={i}
                              className="px-4 py-2 rounded-lg bg-accent/10 border border-accent/20 text-foreground font-arabic"
                              style={{ fontFamily: "'Amiri', serif", fontSize: "1.3rem", direction: "rtl" }}
                            >
                              {ex}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Audio placeholder */}
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border text-sm text-muted-foreground">
                        <span className="text-lg">🎵</span>
                        <span>{isUrdu ? "آڈیو جلد آ رہا ہے — اپنے استاد کے ساتھ مشق کریں" : "Audio coming soon — Practice with your teacher"}</span>
                      </div>

                      {/* Navigation */}
                      <div className="flex justify-between pt-2">
                        <Button variant="outline" disabled={selectedLesson === 1} onClick={() => setSelectedLesson(s => s - 1)}>
                          {isUrdu ? "پچھلا سبق" : "Previous Lesson"}
                        </Button>
                        <span className="flex items-center text-sm text-muted-foreground">{selectedLesson} / 22</span>
                        <Button disabled={selectedLesson === 22} onClick={() => setSelectedLesson(s => s + 1)}>
                          {isUrdu ? "اگلا سبق" : "Next Lesson"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Practice mode */
                    <div className="text-center space-y-6">
                      <p className="text-sm text-muted-foreground">
                        {isUrdu ? "پریکٹس موڈ — حرف دیکھیں اور پڑھنے کی کوشش کریں" : "Practice Mode — Look at each element and try to pronounce it"}
                      </p>
                      <div
                        className="mx-auto w-40 h-40 rounded-2xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center cursor-pointer hover:bg-primary/15 transition-colors"
                        style={{ fontFamily: "'Amiri', serif", fontSize: "4rem", direction: "rtl" }}
                        onClick={() => setShowAnswer(true)}
                      >
                        {showAnswer ? practiceLetters[practiceIndex] : "?"}
                      </div>
                      <div className="flex gap-3 justify-center flex-wrap">
                        <Button variant="outline" onClick={() => setShowAnswer(true)} disabled={showAnswer}>
                          {isUrdu ? "جواب دیکھیں" : "Show Answer"}
                        </Button>
                        <Button
                          onClick={() => {
                            const next = (practiceIndex + 1) % practiceLetters.length;
                            setPracticeIndex(next);
                            setShowAnswer(false);
                          }}
                        >
                          {isUrdu ? "اگلا" : "Next"}
                        </Button>
                        <Button variant="ghost" onClick={() => { setPracticeIndex(Math.floor(Math.random() * practiceLetters.length)); setShowAnswer(false); }}>
                          {isUrdu ? "بے ترتیب" : "Random"}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">{practiceIndex + 1} / {practiceLetters.length}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── PROGRESS TAB ── */}
        <TabsContent value="progress">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Update progress form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{isUrdu ? "پیشرفت اپ ڈیٹ کریں" : "Update Student Progress"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>{isUrdu ? "طالب علم" : "Student"}</Label>
                  <Select value={progressStudentId} onValueChange={setProgressStudentId}>
                    <SelectTrigger><SelectValue placeholder={isUrdu ? "طالب علم منتخب کریں" : "Select student"} /></SelectTrigger>
                    <SelectContent>
                      {students.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.className})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{isUrdu ? "موجودہ سبق" : "Current Lesson"}</Label>
                  <Select value={progressLesson} onValueChange={setProgressLesson}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LESSONS.map(l => (
                        <SelectItem key={l.number} value={String(l.number)}>
                          {isUrdu ? `سبق ${l.number}: ${l.titleUr}` : `Lesson ${l.number}: ${l.titleEn}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{isUrdu ? "روانی کی درجہ بندی" : "Fluency Rating"}</Label>
                  <StarRating value={progressFluency} onChange={setProgressFluency} />
                </div>
                <div className="space-y-1.5">
                  <Label>{isUrdu ? "استاد کے تبصرے" : "Teacher Remarks"}</Label>
                  <Textarea
                    placeholder={isUrdu ? "تبصرے درج کریں..." : "Add remarks..."}
                    value={progressRemarks}
                    onChange={e => setProgressRemarks(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button className="w-full" onClick={handleSaveProgress}>{isUrdu ? "پیشرفت محفوظ کریں" : "Save Progress"}</Button>
              </CardContent>
            </Card>

            {/* Progress table */}
            <div className="lg:col-span-2">
              <div className="border rounded-lg bg-card overflow-x-auto">
                <div className="p-3 border-b bg-muted/30 font-semibold text-sm">{isUrdu ? "تمام طلباء کی پیشرفت" : "All Students' Qaida Progress"}</div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{isUrdu ? "طالب علم" : "Student"}</TableHead>
                      <TableHead>{isUrdu ? "سبق" : "Lesson"}</TableHead>
                      <TableHead>{isUrdu ? "پیشرفت" : "Progress"}</TableHead>
                      <TableHead>{isUrdu ? "روانی" : "Fluency"}</TableHead>
                      <TableHead>{isUrdu ? "حیثیت" : "Status"}</TableHead>
                      <TableHead className="text-right">{isUrdu ? "سرٹیفکیٹ" : "Certificate"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {progressList.map(p => {
                      const student = students.find(s => s.id === p.studentId);
                      const pct = Math.round((p.lessonsCompleted.length / 22) * 100);
                      return (
                        <TableRow key={p.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{student?.name || "Unknown"}</p>
                              <p className="text-xs text-muted-foreground">{student?.className}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-primary">{p.currentLesson}</span>
                            <span className="text-muted-foreground text-xs"> / 22</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 rounded-full bg-muted overflow-hidden">
                                <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-xs text-muted-foreground">{pct}%</span>
                            </div>
                          </TableCell>
                          <TableCell><StarRating value={p.fluencyRating} readOnly /></TableCell>
                          <TableCell>
                            {p.status === "completed" ? (
                              <span className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full w-fit">
                                <CheckCircle2 className="w-3 h-3" /> {isUrdu ? "مکمل" : "Completed"}
                              </span>
                            ) : p.status === "paused" ? (
                              <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">{isUrdu ? "رکا ہوا" : "Paused"}</span>
                            ) : (
                              <span className="flex items-center gap-1 text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded-full w-fit">
                                <Circle className="w-3 h-3" /> {isUrdu ? "جاری" : "In Progress"}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {p.status === "completed" ? (
                              <Button variant="outline" size="sm" onClick={() => handlePrintCertificate(p.studentId)}>
                                <Printer className="w-3.5 h-3.5 mr-1.5" /> {isUrdu ? "سرٹیفکیٹ" : "Certificate"}
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {progressList.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                          {isUrdu ? "ابھی کوئی پیشرفت درج نہیں۔" : "No progress records yet."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── ASSESSMENT TAB ── */}
        <TabsContent value="assessment">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{isUrdu ? "نیا جائزہ" : "New Assessment"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>{isUrdu ? "طالب علم" : "Student"}</Label>
                  <Select value={assessStudentId} onValueChange={setAssessStudentId}>
                    <SelectTrigger><SelectValue placeholder={isUrdu ? "طالب علم منتخب کریں" : "Select student"} /></SelectTrigger>
                    <SelectContent>
                      {students.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.className})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{isUrdu ? "سبق" : "Lesson"}</Label>
                  <Select value={assessLesson} onValueChange={setAssessLesson}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LESSONS.map(l => <SelectItem key={l.number} value={String(l.number)}>
                        {isUrdu ? `سبق ${l.number}` : `Lesson ${l.number}: ${l.titleEn}`}
                      </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{isUrdu ? "تلاوت کا اسکور" : "Reading Score"}</Label>
                  <StarRating value={readingScore} onChange={setReadingScore} />
                </div>
                <div className="space-y-1.5">
                  <Label>{isUrdu ? "تجوید کا اسکور" : "Tajweed Score"}</Label>
                  <StarRating value={tajweedScore} onChange={setTajweedScore} />
                </div>
                <div className="space-y-1.5">
                  <Label>{isUrdu ? "نتیجہ" : "Result"}</Label>
                  <div className="flex gap-2">
                    <Button variant={assessPassed ? "default" : "outline"} size="sm" className={assessPassed ? "bg-emerald-600 hover:bg-emerald-700" : ""} onClick={() => setAssessPassed(true)}>
                      {isUrdu ? "پاس" : "Pass"}
                    </Button>
                    <Button variant={!assessPassed ? "default" : "outline"} size="sm" className={!assessPassed ? "bg-destructive hover:bg-destructive/90" : ""} onClick={() => setAssessPassed(false)}>
                      {isUrdu ? "فیل" : "Fail"}
                    </Button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>{isUrdu ? "تبصرے" : "Teacher Comments"}</Label>
                  <Textarea placeholder={isUrdu ? "تبصرے..." : "Comments..."} value={assessComments} onChange={e => setAssessComments(e.target.value)} rows={3} />
                </div>
                <Button className="w-full" onClick={handleSaveAssessment}>{isUrdu ? "جائزہ محفوظ کریں" : "Save Assessment"}</Button>
              </CardContent>
            </Card>

            <div className="lg:col-span-2">
              <div className="border rounded-lg bg-card overflow-x-auto">
                <div className="p-3 border-b bg-muted/30 font-semibold text-sm">{isUrdu ? "جائزہ کا ریکارڈ" : "Assessment History"}</div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{isUrdu ? "طالب علم" : "Student"}</TableHead>
                      <TableHead>{isUrdu ? "سبق" : "Lesson"}</TableHead>
                      <TableHead>{isUrdu ? "تاریخ" : "Date"}</TableHead>
                      <TableHead>{isUrdu ? "تلاوت" : "Reading"}</TableHead>
                      <TableHead>{isUrdu ? "تجوید" : "Tajweed"}</TableHead>
                      <TableHead>{isUrdu ? "نتیجہ" : "Result"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assessments.map(a => {
                      const student = students.find(s => s.id === a.studentId);
                      return (
                        <TableRow key={a.id}>
                          <TableCell className="font-medium">{student?.name || "Unknown"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{isUrdu ? "سبق" : "L"}{a.lessonNumber}</Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(a.assessmentDate).toLocaleDateString("en-IN")}
                          </TableCell>
                          <TableCell><StarRating value={a.readingScore} readOnly /></TableCell>
                          <TableCell><StarRating value={a.tajweedScore} readOnly /></TableCell>
                          <TableCell>
                            {a.passed ? (
                              <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full">{isUrdu ? "پاس" : "Pass"}</span>
                            ) : (
                              <span className="text-xs text-destructive bg-destructive/10 border border-destructive/20 px-2 py-1 rounded-full">{isUrdu ? "فیل" : "Fail"}</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {assessments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                          {isUrdu ? "ابھی کوئی جائزہ نہیں۔" : "No assessments recorded yet."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
