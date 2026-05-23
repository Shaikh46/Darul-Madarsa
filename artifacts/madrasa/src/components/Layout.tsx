import { ReactNode, useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Menu, X, Languages, ShieldCheck } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth, initializeData } from "@/lib/storage";
import { useLocation } from "wouter";
import { useLang } from "@/lib/i18n";

export function Layout({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { role, userName } = useAuth();
  const [location, setLocation] = useLocation();
  const { lang, setLang } = useLang();

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    if (!role && location !== "/login") {
      setLocation("/login");
    } else if (role && location === "/login") {
      const dest = role === "teacher" ? "/teacher-portal" : "/dashboard";
      setLocation(dest);
    }
  }, [role, location, setLocation]);

  if (!role && location === "/login") {
    return <>{children}</>;
  }

  if (!role) return null;

  const roleBadge =
    role === "admin"   ? { label: "Admin",   cls: "bg-primary/10 text-primary border-primary/20" } :
    role === "teacher" ? { label: "Teacher", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" } :
                         { label: "Parent",  cls: "bg-blue-50 text-blue-700 border-blue-200" };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row w-full overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-sidebar-primary text-sidebar-primary-foreground border-b border-sidebar-border z-20">
        <div className={`font-bold text-sm ${lang === "ur" ? "urdu-text" : ""}`}>
          {lang === "ur" ? "دارالعلوم سراج الاسلام" : "Darul Uloom Sirajul Islam"}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(lang === "en" ? "ur" : "en")}
            className="text-xs px-2 py-1 rounded border border-white/30 text-white/90 hover:bg-white/20 transition-colors"
            data-testid="lang-toggle-mobile"
          >
            {lang === "en" ? "اردو" : "English"}
          </button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 transform transition-transform duration-200 ease-in-out
        md:relative md:translate-x-0
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-[100dvh] overflow-y-auto w-full relative">
        {/* Top bar (desktop) */}
        <div className="hidden md:flex items-center justify-between px-8 py-2 border-b border-border bg-card/50">
          {/* User badge */}
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{userName || roleBadge.label}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${roleBadge.cls}`}>
              {roleBadge.label}
            </span>
          </div>
          {/* Lang toggle */}
          <button
            onClick={() => setLang(lang === "en" ? "ur" : "en")}
            className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            data-testid="lang-toggle-desktop"
          >
            <Languages className="w-3.5 h-3.5" />
            {lang === "en" ? "اردو میں تبدیل کریں" : "Switch to English"}
          </button>
        </div>
        <div className="p-4 md:p-8 flex-1 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
