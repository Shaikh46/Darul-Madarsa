import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/storage";
import {
  LayoutDashboard,
  Users,
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
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["admin"] },
  { name: "Students", href: "/students", icon: Users, roles: ["admin", "teacher", "parent"] },
  { name: "Attendance", href: "/attendance", icon: CalendarCheck, roles: ["admin", "teacher", "parent"] },
  { name: "Hifz Progress", href: "/hifz-progress", icon: BookOpen, roles: ["admin", "teacher", "parent"] },
  { name: "Results", href: "/results", icon: GraduationCap, roles: ["admin", "teacher", "parent"] },
  { name: "Teacher Portal", href: "/teacher-portal", icon: Briefcase, roles: ["teacher"] },
  { name: "Fees", href: "/fees", icon: CreditCard, roles: ["admin", "parent"] },
  { name: "Expenses", href: "/expenses", icon: Receipt, roles: ["admin"] },
  { name: "Salaries", href: "/salaries", icon: Wallet, roles: ["admin"] },
  { name: "Donations", href: "/donations", icon: HeartHandshake, roles: ["admin"] },
  { name: "Islamic", href: "/islamic", icon: MoonStar, roles: ["admin", "teacher", "parent"] },
  { name: "Communication", href: "/communication", icon: MessageSquare, roles: ["admin"] },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const [location] = useLocation();
  const { role, logout } = useAuth();
  
  if (!role) return null;

  const filteredNav = navItems.filter((item) => item.roles.includes(role));

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border w-64 text-sidebar-foreground">
      <div className="p-6 border-b border-sidebar-border bg-sidebar-primary text-sidebar-primary-foreground flex flex-col items-center justify-center space-y-2">
        <MoonStar className="w-10 h-10 text-accent" />
        <h1 className="text-lg font-bold text-center leading-tight">Darul Uloom Sirajul Islam</h1>
        <p className="text-xs opacity-90">Kalgaon</p>
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
                }`}
                onClick={onClose}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-sidebar-accent-foreground" : ""}`} />
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="mb-4 px-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Logged in as</p>
          <p className="font-semibold capitalize text-sm">{role}</p>
        </div>
        <Button 
          variant="outline" 
          className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
          onClick={() => {
            logout();
            onClose?.();
          }}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}
