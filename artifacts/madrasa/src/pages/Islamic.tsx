import { useState, useEffect } from "react";
import { useLang } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoonStar, Clock, CalendarDays } from "lucide-react";

function getHijriDate(lang: "en" | "ur" = "en"): string {
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

export default function Islamic() {
  const { lang, tr } = useLang();
  const isUrdu = lang === "ur";
  const [time, setTime] = useState(new Date());

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
    </div>
  );
}
