import { useLS, Student, useAuth } from "@/lib/storage";
import { useLang } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, CalendarCheck, GraduationCap, Users, ArrowRight, UserPlus } from "lucide-react";
import { Link } from "wouter";

export default function TeacherPortal() {
  const [students] = useLS<Student[]>("students", []);
  const { userName, teacherClass } = useAuth();
  const { lang } = useLang();
  const isUrdu = lang === "ur";

  const myStudents = teacherClass
    ? students.filter(s => s.className === teacherClass)
    : students;

  const activeStudents = myStudents.filter(s => s.status !== "Inactive");

  return (
    <div className={`space-y-6 ${isUrdu ? "urdu-text" : ""}`} dir={isUrdu ? "rtl" : "ltr"}>
      {/* Welcome header */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg">
        <div className="flex items-center gap-3 mb-1">
          <BookOpen className="w-6 h-6 text-accent" />
          <h1 className="text-2xl font-bold">
            {isUrdu ? "السلام علیکم" : "Assalamu Alaikum"}
          </h1>
        </div>
        <p className="text-primary-foreground/90 text-lg font-medium">
          {userName || (isUrdu ? "استاد" : "Teacher")}
        </p>
        {teacherClass && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-primary-foreground/70">
              {isUrdu ? "آپ کی کلاس:" : "Your assigned class:"}
            </span>
            <span className="px-3 py-1 rounded-full bg-white/20 border border-white/30 text-sm font-semibold">
              {teacherClass}
            </span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  {isUrdu ? "میری کلاس" : "My Class"}
                </p>
                <h3 className="text-lg font-bold truncate max-w-[100px]">{teacherClass || "—"}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  {isUrdu ? "کل طلباء" : "Total Students"}
                </p>
                <h3 className="text-2xl font-bold">{myStudents.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 text-blue-700 rounded-lg">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  {isUrdu ? "فعال طلباء" : "Active Students"}
                </p>
                <h3 className="text-2xl font-bold">{activeStudents.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-accent/20 text-accent-foreground rounded-lg">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  {isUrdu ? "سبق" : "Lessons"}
                </p>
                <h3 className="text-2xl font-bold">22</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/students">
          <Card className="cursor-pointer hover:shadow-md transition-all border-blue-200 hover:border-blue-400 group h-full">
            <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 text-blue-700 rounded-xl group-hover:bg-blue-200 transition-colors">
                  <UserPlus className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-base">
                    {isUrdu ? "طالب علم شامل کریں" : "Add Student"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isUrdu ? "اپنی کلاس میں نیا اندراج کریں" : "Register new student in your class"}
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-blue-600 transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/attendance">
          <Card className="cursor-pointer hover:shadow-md transition-all border-primary/20 hover:border-primary/40 group h-full">
            <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:bg-primary/20 transition-colors">
                  <CalendarCheck className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-base">
                    {isUrdu ? "حاضری لگائیں" : "Mark Attendance"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isUrdu ? "آج کی حاضری درج کریں" : "Record today's attendance for your class"}
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/norani-qaida">
          <Card className="cursor-pointer hover:shadow-md transition-all border-emerald-200 hover:border-emerald-400 group h-full">
            <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl group-hover:bg-emerald-200 transition-colors">
                  <BookOpen className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-base">
                    {isUrdu ? "نورانی قاعدہ" : "Norani Qaida"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isUrdu ? "طلباء کی پیشرفت درج کریں" : "Track student Qaida progress"}
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-emerald-600 transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Students list */}
      <Card>
        <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
          <h2 className="font-semibold text-sm">
            {isUrdu
              ? `${teacherClass || "تمام"} کلاس کے طلباء`
              : `Students — ${teacherClass || "All Classes"}`}
          </h2>
          <span className="text-xs text-muted-foreground">{myStudents.length} {isUrdu ? "طلباء" : "students"}</span>
        </div>
        <div className="divide-y divide-border">
          {myStudents.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              {isUrdu ? "کوئی طالب علم نہیں۔" : "No students found for this class."}
            </div>
          ) : (
            myStudents.slice(0, 10).map((s, i) => (
              <div key={s.id} className={`px-4 py-3 flex items-center gap-3 ${i % 2 === 0 ? "" : "bg-muted/20"}`}>
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary">
                  {s.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{isUrdu ? "والد:" : "Father:"} {s.fatherName}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${s.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>
                  {s.status || "Active"}
                </span>
              </div>
            ))
          )}
          {myStudents.length > 10 && (
            <div className="p-3 text-center text-xs text-muted-foreground">
              {isUrdu ? "اور" : "+"}{myStudents.length - 10} {isUrdu ? "مزید طلباء" : "more students"}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
