import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoonStar, Clock, CalendarDays } from "lucide-react";

export default function Islamic() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Approximate Hijri date calculation for UI demonstration
  // Real implementation would use a library like moment-hijri
  const getApproximateHijriDate = () => {
    const d = new Date();
    // A very rough approximation for demo
    const formatter = new Intl.DateTimeFormat('en-u-ca-islamic', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    return formatter.format(d);
  };

  const prayers = [
    { name: "Fajr", time: "05:30 AM", active: false },
    { name: "Dhuhr", time: "01:15 PM", active: false },
    { name: "Asr", time: "05:00 PM", active: true }, // mocked active
    { name: "Maghrib", time: "06:45 PM", active: false },
    { name: "Isha", time: "08:15 PM", active: false },
  ];

  const events = [
    { name: "Ramadan Begins", date: "Approx. Mar 1, 2025", daysLeft: 45 },
    { name: "Eid ul-Fitr", date: "Approx. Mar 30, 2025", daysLeft: 74 },
    { name: "Eid ul-Adha", date: "Approx. Jun 6, 2025", daysLeft: 142 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Islamic Calendar & Times</h1>
        <p className="text-muted-foreground mt-1">Prayer times for Kalgaon and upcoming events</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-primary text-primary-foreground border-none">
          <CardContent className="p-8 text-center space-y-4">
            <MoonStar className="w-16 h-16 mx-auto text-accent opacity-90" />
            <div>
              <p className="text-primary-foreground/80 text-lg">Today's Hijri Date</p>
              <h2 className="text-3xl font-bold mt-1">{getApproximateHijriDate()}</h2>
              <p className="text-primary-foreground/80 mt-2">{time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="pt-4 border-t border-primary-foreground/20">
              <h1 className="text-5xl font-bold tracking-wider">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</h1>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Prayer Times
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {prayers.map((prayer) => (
              <div 
                key={prayer.name} 
                className={`flex justify-between items-center p-4 rounded-lg border ${
                  prayer.active ? 'bg-primary/10 border-primary' : 'bg-card'
                }`}
              >
                <span className={`text-lg ${prayer.active ? 'font-bold text-primary' : 'font-medium'}`}>
                  {prayer.name}
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
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              Upcoming Islamic Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {events.map((event) => (
                <div key={event.name} className="p-4 border rounded-lg bg-card flex flex-col justify-center text-center space-y-2">
                  <h3 className="font-bold text-lg text-primary">{event.name}</h3>
                  <p className="text-sm text-muted-foreground">{event.date}</p>
                  <div className="mt-2 inline-block mx-auto px-3 py-1 bg-accent/20 text-accent-foreground font-semibold rounded-full text-sm">
                    In {event.daysLeft} Days
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
