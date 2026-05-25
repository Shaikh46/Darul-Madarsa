import { useState, useEffect, useMemo } from "react";
import { useLang } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoonStar, Clock, CalendarDays, ChevronLeft, ChevronRight, Star } from "lucide-react";
import {
  gregToHijri, formatHijri, getEventForHijri,
  HIJRI_MONTHS_EN, HIJRI_MONTHS_UR, WEEKDAYS_EN, WEEKDAYS_UR,
} from "@/lib/hijri";
import { useIslamicEvents, useAuth } from "@/lib/storage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Save, Edit } from "lucide-react";

function getHijriDate(lang: "en" | "ur"): string {
  return formatHijri(gregToHijri(new Date()), lang);
}

export default function Islamic() {
  const { lang, tr } = useLang();
  const { role } = useAuth();
  const isUrdu = lang === "ur";
  const [time, setTime] = useState(new Date());
  const [islamicEvents, setIslamicEvents] = useIslamicEvents();
  const [isEditEventsOpen, setIsEditEventsOpen] = useState(false);
  const [eventsForm, setEventsForm] = useState(islamicEvents);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const prayers = [
    { key: "fajr",    time: "05:30 AM" },
    { key: "dhuhr",   time: "01:15 PM" },
    { key: "asr",     time: "05:00 PM", active: true },
    { key: "maghrib", time: "06:45 PM" },
    { key: "isha",    time: "08:15 PM" },
  ];

  const events = isUrdu
    ? [
        { name: "رمضان شروع",    date: "تقریباً ۱ مارچ ۲۰۲۶",  daysLeft: 45 },
        { name: "عید الفطر",     date: "تقریباً ۳۰ مارچ ۲۰۲۶", daysLeft: 74 },
        { name: "عید الاضحیٰ",   date: "تقریباً ۶ جون ۲۰۲۶",  daysLeft: 142 },
      ]
    : [
        { name: "Ramadan Begins", date: "Approx. Mar 1, 2026",  daysLeft: 45 },
        { name: "Eid ul-Fitr",   date: "Approx. Mar 30, 2026", daysLeft: 74 },
        { name: "Eid ul-Adha",   date: "Approx. Jun 6, 2026",  daysLeft: 142 },
      ];

  const hijriDate = getHijriDate(lang);
  const gregorianDate = time.toLocaleDateString(isUrdu ? "ar-SA" : "en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });

  const [calCursor, setCalCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const calData = useMemo(() => {
    const year = calCursor.getFullYear();
    const month = calCursor.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startWeekday = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const cells: { date: Date | null; hijri: ReturnType<typeof gregToHijri> | null; event: string | null }[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push({ date: null, hijri: null, event: null });
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const h = gregToHijri(date);
      cells.push({ date, hijri: h, event: getEventForHijri(h, islamicEvents, lang) });
    }
    while (cells.length % 7 !== 0) cells.push({ date: null, hijri: null, event: null });
    const firstHijri = gregToHijri(firstDay);
    const lastHijri = gregToHijri(lastDay);
    return { cells, firstHijri, lastHijri };
  }, [calCursor, lang, islamicEvents]);

  const monthEvents = useMemo(() => {
    const seen = new Set<string>();
    const out: { date: Date; hijri: ReturnType<typeof gregToHijri>; name: string }[] = [];
    for (const c of calData.cells) {
      if (c.date && c.event && c.hijri && !seen.has(c.event)) {
        seen.add(c.event);
        out.push({ date: c.date, hijri: c.hijri, name: c.event });
      }
    }
    return out;
  }, [calData]);

  const navMonth = (delta: number) => {
    setCalCursor(new Date(calCursor.getFullYear(), calCursor.getMonth() + delta, 1));
  };

  const todayKey = new Date().toDateString();
  const monthNames = isUrdu
    ? ["جنوری","فروری","مارچ","اپریل","مئی","جون","جولائی","اگست","ستمبر","اکتوبر","نومبر","دسمبر"]
    : ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const weekdays = isUrdu ? WEEKDAYS_UR : WEEKDAYS_EN;
  const hijriMonths = isUrdu ? HIJRI_MONTHS_UR : HIJRI_MONTHS_EN;

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold text-foreground ${isUrdu ? "urdu-text" : ""}`}>{tr("islamicCalTimes")}</h1>
        <p className={`text-muted-foreground mt-1 ${isUrdu ? "urdu-text" : ""}`}>{tr("prayerTimesKalgaon")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-primary text-primary-foreground border-none">
          <CardContent className="p-8 text-center space-y-4">
            <MoonStar className="w-16 h-16 mx-auto text-accent opacity-90" />
            <div>
              <p className={`text-primary-foreground/80 text-lg ${isUrdu ? "urdu-text" : ""}`}>{tr("todaysHijriDate")}</p>
              <h2 className={`text-2xl font-bold mt-1 ${isUrdu ? "urdu-text" : ""}`}>{hijriDate}</h2>
              <p className={`text-primary-foreground/80 mt-2 ${isUrdu ? "urdu-text" : ""}`}>{gregorianDate}</p>
            </div>
            <div className="pt-4 border-t border-primary-foreground/20">
              <h1 className="text-5xl font-bold tracking-wider">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</h1>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isUrdu ? "urdu-text" : ""}`}>
              <Clock className="w-5 h-5 text-primary" />
              {tr("prayerTimes")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {prayers.map((prayer) => (
              <div
                key={prayer.key}
                className={`flex justify-between items-center p-4 rounded-lg border ${prayer.active ? 'bg-primary/10 border-primary' : 'bg-card'}`}
              >
                <span className={`text-lg ${prayer.active ? 'font-bold text-primary' : 'font-medium'} ${isUrdu ? "urdu-text" : ""}`}>
                  {tr(prayer.key)}
                </span>
                <span className={`text-lg ${prayer.active ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                  {prayer.time}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center flex-wrap gap-3">
              <CardTitle className={`flex items-center gap-2 ${isUrdu ? "urdu-text" : ""}`}>
                <CalendarDays className="w-5 h-5 text-primary" />
                {tr("hijriCalendar")}
              </CardTitle>
              <div className="flex items-center gap-2">
                {role === "admin" && (
                  <Button variant="outline" size="sm" onClick={() => { setEventsForm(islamicEvents); setIsEditEventsOpen(true); }}>
                    <Edit className="w-4 h-4 mr-2" />
                    {isUrdu ? "ایونٹس میں ترمیم کریں" : "Edit Events"}
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => navMonth(-1)} data-testid="btn-cal-prev">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCalCursor(new Date(new Date().getFullYear(), new Date().getMonth(), 1))} data-testid="btn-cal-today">
                  {tr("today")}
                </Button>
                <Button variant="outline" size="sm" onClick={() => navMonth(1)} data-testid="btn-cal-next">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="mt-3 text-center">
              <p className={`text-xl font-bold ${isUrdu ? "urdu-text" : ""}`}>
                {hijriMonths[calData.firstHijri.m - 1]}
                {calData.firstHijri.m !== calData.lastHijri.m && ` / ${hijriMonths[calData.lastHijri.m - 1]}`}
                {" "}{calData.firstHijri.y}{isUrdu ? " ہجری" : " AH"}
              </p>
              <p className={`text-sm text-muted-foreground ${isUrdu ? "urdu-text" : ""}`}>
                {monthNames[calCursor.getMonth()]} {calCursor.getFullYear()}
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekdays.map((d, i) => (
                <div key={i} className={`text-center text-xs font-semibold text-muted-foreground p-1 ${isUrdu ? "urdu-text" : ""}`}>
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calData.cells.map((c, i) => {
                if (!c.date) return <div key={i} className="aspect-square" />;
                const isToday = c.date.toDateString() === todayKey;
                const hasEvent = false;
                return (
                  <div
                    key={i}
                    className={`aspect-square border rounded-md p-1 flex flex-col items-center justify-between text-xs relative ${
                      isToday ? "bg-primary text-primary-foreground border-primary font-bold" : "bg-card"
                    }`}
                    title={c.event || ""}
                  >
                    <span className="font-medium">{c.date.getDate()}</span>
                    <span className={`text-[10px] ${isToday ? "opacity-90" : "text-muted-foreground"}`}>
                      {c.hijri?.d}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isUrdu ? "urdu-text" : ""}`}>
              <CalendarDays className="w-5 h-5 text-primary" />
              {tr("upcomingIslamicEvt")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {events.map((event) => (
                <div key={event.name} className="p-4 border rounded-lg bg-card flex flex-col justify-center text-center space-y-2">
                  <h3 className={`font-bold text-lg text-primary ${isUrdu ? "urdu-text" : ""}`}>{event.name}</h3>
                  <p className={`text-sm text-muted-foreground ${isUrdu ? "urdu-text" : ""}`}>{event.date}</p>
                  <div className={`mt-2 inline-block mx-auto px-3 py-1 bg-accent/20 text-accent-foreground font-semibold rounded-full text-sm ${isUrdu ? "urdu-text" : ""}`}>
                    {isUrdu ? `${event.daysLeft} دن میں` : `In ${event.daysLeft} Days`}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Events Dialog */}
      <Dialog open={isEditEventsOpen} onOpenChange={setIsEditEventsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className={isUrdu ? "urdu-text" : ""}>{isUrdu ? "اسلامی ایونٹس میں ترمیم کریں" : "Edit Islamic Events"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {eventsForm.map((ev, index) => (
              <div key={ev.id} className="flex gap-2 items-end border p-3 rounded-lg">
                <div className="space-y-1.5 w-24 flex-shrink-0">
                  <Label className={isUrdu ? "urdu-text" : ""}>{isUrdu ? "مہینہ-دن" : "M-D"}</Label>
                  <Input placeholder="9-1" value={ev.md} onChange={(e) => {
                    const newForm = [...eventsForm];
                    newForm[index].md = e.target.value;
                    setEventsForm(newForm);
                  }} />
                </div>
                <div className="space-y-1.5 flex-1">
                  <Label className={isUrdu ? "urdu-text" : ""}>{isUrdu ? "نام (انگریزی)" : "Name (En)"}</Label>
                  <Input placeholder="Event Name" value={ev.en} onChange={(e) => {
                    const newForm = [...eventsForm];
                    newForm[index].en = e.target.value;
                    setEventsForm(newForm);
                  }} />
                </div>
                <div className="space-y-1.5 flex-1" dir="rtl">
                  <Label className="urdu-text text-right block">نام (اردو)</Label>
                  <Input placeholder="ایونٹ کا نام" value={ev.ur} onChange={(e) => {
                    const newForm = [...eventsForm];
                    newForm[index].ur = e.target.value;
                    setEventsForm(newForm);
                  }} className="text-right" />
                </div>
                <Button variant="ghost" size="icon" className="text-destructive mb-0.5" onClick={() => {
                  setEventsForm(eventsForm.filter(e => e.id !== ev.id));
                }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" className="w-full border-dashed" onClick={() => {
              setEventsForm([...eventsForm, { id: `e${Date.now()}`, md: "", en: "", ur: "" }]);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              {isUrdu ? "نیا ایونٹ شامل کریں" : "Add New Event"}
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditEventsOpen(false)}>{isUrdu ? "منسوخ" : "Cancel"}</Button>
            <Button onClick={() => {
              setIslamicEvents(eventsForm);
              setIsEditEventsOpen(false);
            }}>
              <Save className="w-4 h-4 mr-2" />
              {isUrdu ? "محفوظ کریں" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
