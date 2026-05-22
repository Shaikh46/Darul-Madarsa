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
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  key: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
}

const navItems: NavItem[] = [
  { key: "dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["admin"] },
  { key: "students", href: "/students", icon: Users, roles: ["admin", "teacher", "parent"] },
  { key: "teachers", href: "/teachers", icon: UserCog, roles: ["admin"] },
  { key: "attendance", href: "/attendance", icon: CalendarCheck, roles: ["admin", "teacher", "parent"] },
  { key: "hifzProgress", href: "/hifz-progress", icon: BookOpen, roles: ["admin", "teacher", "parent"] },
  { key: "results", href: "/results", icon: GraduationCap, roles: ["admin", "teacher", "parent"] },
  { key: "teacherPortal", href: "/teacher-portal", icon: Briefcase, roles: ["teacher"] },
  { key: "fees", href: "/fees", icon: CreditCard, roles: ["admin", "parent"] },
  { key: "expenses", href: "/expenses", icon: Receipt, roles: ["admin"] },
  { key: "salaries", href: "/salaries", icon: Wallet, roles: ["admin"] },
  { key: "donations", href: "/donations", icon: HeartHandshake, roles: ["admin"] },
  { key: "noraniQaida", href: "/norani-qaida", icon: BookOpen, roles: ["admin", "teacher", "parent"] },
  { key: "islamic", href: "/islamic", icon: MoonStar, roles: ["admin", "teacher", "parent"] },
  { key: "communication", href: "/communication", icon: MessageSquare, roles: ["admin"] },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const [location] = useLocation();
  const { role, logout } = useAuth();
  const { lang, tr } = useLang();

  if (!role) return null;

  const filteredNav = navItems.filter((item) => item.roles.includes(role));
  const isUrdu = lang === "ur";

  return (
    <div
      className={`flex flex-col h-full bg-sidebar border-r border-sidebar-border w-64 text-sidebar-foreground ${isUrdu ? "urdu-text" : ""}`}
      dir={isUrdu ? "rtl" : "ltr"}
    >
      <div className="p-6 border-b border-sidebar-border bg-sidebar-primary text-sidebar-primary-foreground flex flex-col items-center justify-center space-y-2">
        <MoonStar className="w-10 h-10 text-accent" />
        <h1 className={`text-lg font-bold text-center leading-tight ${isUrdu ? "urdu-text" : ""}`}>
          {isUrdu ? "دارالعلوم سراج الاسلام" : "Darul Uloom Sirajul Islam"}
        </h1>
        <p className="text-xs opacity-90">{isUrdu ? "کلگاؤں" : "Kalgaon"}</p>
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

      <div className="p-4 border-t border-sidebar-border">
        <div className={`mb-4 px-2 ${isUrdu ? "text-right" : ""}`}>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{tr("loggedInAs")}</p>
          <p className="font-semibold capitalize text-sm">{role}</p>
        </div>
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
