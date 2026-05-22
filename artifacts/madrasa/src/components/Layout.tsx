import { ReactNode, useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/lib/storage";
import { useLocation } from "wouter";
import { initializeData } from "@/lib/storage";

export function Layout({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { role } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    if (!role && location !== "/login") {
      setLocation("/login");
    } else if (role && location === "/login") {
      setLocation("/dashboard");
    }
  }, [role, location, setLocation]);

  if (!role && location === "/login") {
    return <>{children}</>;
  }

  if (!role) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row w-full overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-sidebar-primary text-sidebar-primary-foreground border-b border-sidebar-border z-20">
        <div className="font-bold">Darul Uloom Sirajul Islam</div>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
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
        <div className="p-4 md:p-8 flex-1 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
