import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth, Role } from "@/lib/storage";
import { MoonStar, ShieldCheck, BookOpen, Users } from "lucide-react";

export default function Login() {
  const { login } = useAuth();

  const handleLogin = (role: Role) => {
    login(role);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-xl border-primary/20">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <MoonStar className="w-10 h-10 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-primary">Darul Uloom Sirajul Islam</CardTitle>
            <CardDescription className="text-base mt-2">Kalgaon Madrasa Management System</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            className="w-full h-14 text-lg bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-start px-6 gap-4" 
            onClick={() => handleLogin("admin")}
          >
            <ShieldCheck className="w-6 h-6 text-accent" />
            Admin Login
          </Button>
          <Button 
            variant="outline"
            className="w-full h-14 text-lg border-primary/30 hover:bg-primary/5 flex items-center justify-start px-6 gap-4" 
            onClick={() => handleLogin("teacher")}
          >
            <BookOpen className="w-6 h-6 text-primary" />
            Teacher Login
          </Button>
          <Button 
            variant="outline"
            className="w-full h-14 text-lg border-primary/30 hover:bg-primary/5 flex items-center justify-start px-6 gap-4" 
            onClick={() => handleLogin("parent")}
          >
            <Users className="w-6 h-6 text-primary" />
            Parent Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
