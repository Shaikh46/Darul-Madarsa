import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/storage";
import { useLang } from "@/lib/i18n";
import {
  LayoutDashboard,
  Users,
  UserCog,
  CalendarCheck,
  BookOpen,
  GraduationCap,
  Briefcase,
  CreditCard,
  Receipt,
  Wallet,
  HeartHandshake,
  MoonStar,
  MessageSquare,
  LogOut,
  ShieldCheck,
  Settings,
  ScrollText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import logoImg from "@assets/logo.png_1779548283551.jpeg";

interface NavItem {
  key: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
}

const navItems: NavItem[] = [
  { key: "dashboard",     href: "/dashboard",     icon: LayoutDashboard, roles: ["admin"] },
  { key: "students",      href: "/students",       icon: Users,           roles: ["admin", "parent", "teacher"] },
  { key: "teachers",      href: "/teachers",       icon: UserCog,         roles: ["admin"] },
  { key: "attendance",    href: "/attendance",     icon: CalendarCheck,   roles: ["admin", "teacher", "parent"] },
  { key: "hifzProgress",  href: "/hifz-progress",  icon: BookOpen,        roles: ["admin", "parent"] },
  { key: "results",       href: "/results",        icon: GraduationCap,   roles: ["admin", "parent"] },
  { key: "teacherPortal", href: "/teacher-portal", icon: Briefcase,       roles: ["teacher"] },
  { key: "noraniQaida",   href: "/norani-qaida",   icon: BookOpen,        roles: ["admin", "teacher", "parent"] },
  { key: "timetable",     href: "/timetable",      icon: CalendarCheck,   roles: ["admin", "teacher", "parent"] },
  { key: "fees",          href: "/fees",           icon: CreditCard,      roles: ["admin", "parent"] },
  { key: "expenses",      href: "/expenses",       icon: Receipt,         roles: ["admin"] },
  { key: "salaries",      href: "/salaries",       icon: Wallet,          roles: ["admin"] },
  { key: "donations",     href: "/donations",      icon: HeartHandshake,  roles: ["admin"] },
  { key: "islamic",       href: "/islamic",        icon: MoonStar,        roles: ["admin", "teacher", "parent"] },
  { key: "duasAzkar",     href: "/duas",           icon: ScrollText,      roles: ["admin", "teacher", "parent"] },
  { key: "communication", href: "/communication",  icon: MessageSquare,   roles: ["admin"] },
  { key: "settings",      href: "/settings",       icon: Settings,        roles: ["admin"] },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const [location] = useLocation();
  const { role, userName, teacherClass, logout } = useAuth();
  const { lang, tr } = useLang();

  if (!role) return null;

  const filteredNav = navItems.filter((item) => item.roles.includes(role));
  const isUrdu = lang === "ur";

  const roleBadgeColor =
    role === "admin"   ? "bg-primary/20 text-primary border-primary/30" :
    role === "teacher" ? "bg-emerald-100 text-emerald-800 border-emerald-300" :
                         "bg-blue-100 text-blue-800 border-blue-300";

  const roleLabel =
    role === "admin"   ? (isUrdu ? "منتظم"  : "Admin") :
    role === "teacher" ? (isUrdu ? "استاد"  : "Teacher") :
                         (isUrdu ? "والدین" : "Parent");

  return (
    <div
      className={`flex flex-col h-full bg-sidebar border-r border-sidebar-border w-64 text-sidebar-foreground ${isUrdu ? "urdu-text" : ""}`}
      dir={isUrdu ? "rtl" : "ltr"}
    >
      <div className="p-4 border-b border-sidebar-border bg-sidebar-primary text-sidebar-primary-foreground flex flex-col items-center justify-center space-y-2">
        <div className="w-20 h-20 rounded-full bg-white/95 p-1 shadow-md ring-2 ring-accent/40 flex items-center justify-center overflow-hidden">
          <img src={logoImg} alt="Darul Uloom Sirajul Islam Kalgaon" className="w-full h-full object-contain rounded-full" />
        </div>
        <div className="text-center leading-tight">
          <p className="text-[15px] font-bold tracking-wide" style={{ color: "#FFD700" }}>DARUL ULOOM</p>
          <p className="text-[11px] font-semibold opacity-90 mt-0.5">SIRAJUL ISLAM KALGAON</p>
        </div>
        {isUrdu && <p className="text-xs opacity-80 urdu-text">دارالعلوم سراج الاسلام کلگاؤں</p>}
      </div>

      {/* Logged-in user info */}
      <div className={`px-4 py-3 border-b border-sidebar-border bg-sidebar-primary/50 flex items-center gap-3 ${isUrdu ? "flex-row-reverse" : ""}`}>
        <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-4 h-4 text-accent" />
        </div>
        <div className={`flex-1 min-w-0 ${isUrdu ? "text-right" : ""}`}>
          <p className={`text-xs font-semibold text-sidebar-foreground truncate ${isUrdu ? "urdu-text" : ""}`}>{userName || roleLabel}</p>
          {role === "teacher" && teacherClass && (
            <p className="text-xs text-sidebar-foreground/60 truncate">{teacherClass}</p>
          )}
          <span className={`inline-block mt-0.5 text-xs px-2 py-0.5 rounded-full border font-medium ${roleBadgeColor} ${isUrdu ? "urdu-text" : ""}`}>
            {roleLabel}
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {filteredNav.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <span
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "hover:bg-sidebar-accent/50 text-sidebar-foreground/80 hover:text-sidebar-foreground"
                } ${isUrdu ? "flex-row-reverse text-right" : ""}`}
                onClick={onClose}
                data-testid={`nav-${item.key}`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-sidebar-accent-foreground" : ""}`} />
                <span className={isUrdu ? "urdu-text text-sm" : ""}>{tr(item.key)}</span>
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Contact Us Section */}
      <div className={`p-4 border-t border-sidebar-border bg-sidebar-primary/5 ${isUrdu ? "text-right" : ""}`}>
        <h4 className={`text-xs font-bold text-sidebar-primary mb-2.5 flex items-center gap-2 ${isUrdu ? "flex-row-reverse" : ""}`}>
          <span className="text-sm">📞</span>
          <span className={isUrdu ? "urdu-text" : ""}>{tr("contactUs")}</span>
        </h4>
        <div className="space-y-3">
          <div className={`flex flex-col ${isUrdu ? "items-end" : "items-start"}`}>
            <span className={`text-[10px] text-muted-foreground flex items-center gap-1 ${isUrdu ? "flex-row-reverse font-semibold" : ""}`}>
              <span>📱</span>
              <span className={isUrdu ? "urdu-text" : ""}>{tr("phoneLabel")}:</span>
            </span>
            <a
              href="tel:+919011912993"
              className={`text-xs font-semibold text-sidebar-foreground hover:text-sidebar-primary transition-colors flex items-center gap-1.5 mt-0.5 ${isUrdu ? "flex-row-reverse" : ""}`}
              data-testid="contact-phone"
            >
              <span className="font-mono">+91 90119 12993</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded bg-sidebar-primary/10 text-sidebar-primary hover:bg-sidebar-primary/20 ${isUrdu ? "urdu-text font-normal leading-normal" : ""}`}>
                [{tr("clickToCall")}]
              </span>
            </a>
          </div>

          <div className={`flex flex-col ${isUrdu ? "items-end" : "items-start"}`}>
            <span className={`text-[10px] text-muted-foreground flex items-center gap-1 ${isUrdu ? "flex-row-reverse font-semibold" : ""}`}>
              <span>✉️</span>
              <span className={isUrdu ? "urdu-text" : ""}>{tr("emailLabel")}:</span>
            </span>
            <a
              href="mailto:syedzubair313@gmail.com"
              className={`text-[11px] font-semibold text-sidebar-foreground hover:text-sidebar-primary transition-colors flex flex-wrap items-center gap-1.5 mt-0.5 ${isUrdu ? "flex-row-reverse" : ""}`}
              data-testid="contact-email"
            >
              <span className="truncate max-w-[150px] font-sans">syedzubair313@gmail.com</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded bg-sidebar-primary/10 text-sidebar-primary hover:bg-sidebar-primary/20 ${isUrdu ? "urdu-text font-normal leading-normal" : ""}`}>
                [{tr("sendEmail")}]
              </span>
            </a>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="outline"
          className={`w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20 ${isUrdu ? "flex-row-reverse" : ""}`}
          onClick={() => {
            logout();
            onClose?.();
          }}
          data-testid="btn-logout"
        >
          <LogOut className="w-4 h-4 mr-2" />
          <span className={isUrdu ? "urdu-text" : ""}>{tr("logout")}</span>
        </Button>
      </div>
    </div>
  );
}
