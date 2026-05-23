import { useState } from "react";
import { useAuth, tryLogin, getLS, Teacher } from "@/lib/storage";
import { MoonStar, Eye, EyeOff, ShieldCheck, BookOpen, Lock, User } from "lucide-react";
import logoImg from "@assets/logo.png_1779548283551.jpeg";

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim()) { setError("Please enter your Email / ID."); return; }
    if (!password) { setError("Please enter your password."); return; }

    setLoading(true);
    setTimeout(() => {
      const cred = tryLogin(username, password);
      if (!cred) {
        setError("Invalid email or password. Please try again.");
        setLoading(false);
        return;
      }
      // For teacher login, find their assigned class from teachers list
      let resolvedClass = "";
      if (cred.role === "teacher") {
        const teachers = getLS<Teacher[]>("teachers", []);
        const matched = teachers.find(t =>
          t.email?.toLowerCase() === username.trim().toLowerCase()
        );
        resolvedClass = matched?.assignedClass || "";
      }
      login(cred, resolvedClass);
      setLoading(false);
    }, 400);
  };

  const fillDemo = (type: "admin" | "teacher" | "parent") => {
    if (type === "admin")   { setUsername("darulum@admin");   setPassword("78607860"); }
    if (type === "teacher") { setUsername("darulum@teacher"); setPassword("068706"); }
    if (type === "parent")  { setUsername("parent@demo.com"); setPassword("parent123"); }
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
          {/* Header */}
          <div className="bg-primary px-8 py-8 text-center text-primary-foreground relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
            <div className="relative">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/40 shadow-lg overflow-hidden p-1">
                <img src={logoImg} alt="Darul Uloom Sirajul Islam Kalgaon" className="w-full h-full object-contain rounded-full" />
              </div>
              <h1 className="text-xl font-bold leading-tight" style={{ color: "#FFD700" }}>DARUL ULOOM</h1>
              <p className="text-white text-sm font-semibold mt-0.5 tracking-wide">SIRAJUL ISLAM KALGAON</p>
              <p className="text-primary-foreground/80 text-xs mt-1">Madrasa Management System</p>
              <p className="text-accent text-xs mt-1 font-arabic" style={{ fontFamily: "'Noto Nastaliq Urdu', serif", direction: "rtl" }}>دارالعلوم سراج الاسلام کلگاؤں</p>
            </div>
          </div>

          {/* Form */}
          <div className="px-8 py-6 space-y-5">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-foreground">Sign In</h2>
              <p className="text-sm text-muted-foreground">Enter your credentials to continue</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4" noValidate>
              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Email / ID</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={username}
                    onChange={e => { setUsername(e.target.value); setError(""); }}
                    placeholder="darulum@admin"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent placeholder:text-muted-foreground transition-all"
                    autoComplete="username"
                    data-testid="input-username"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(""); }}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-12 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent placeholder:text-muted-foreground transition-all"
                    autoComplete="current-password"
                    data-testid="input-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm" data-testid="login-error">
                  <span className="mt-0.5">⚠</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                data-testid="btn-login"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Demo quick-fill */}
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground text-center mb-3">Quick fill demo credentials:</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => fillDemo("admin")}
                  className="flex flex-col items-center gap-1 p-2.5 rounded-lg border border-border hover:bg-primary/5 hover:border-primary/30 transition-colors text-xs"
                  data-testid="demo-admin"
                >
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span className="font-medium text-foreground">Admin</span>
                </button>
                <button
                  onClick={() => fillDemo("teacher")}
                  className="flex flex-col items-center gap-1 p-2.5 rounded-lg border border-border hover:bg-primary/5 hover:border-primary/30 transition-colors text-xs"
                  data-testid="demo-teacher"
                >
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span className="font-medium text-foreground">Teacher</span>
                </button>
                <button
                  onClick={() => fillDemo("parent")}
                  className="flex flex-col items-center gap-1 p-2.5 rounded-lg border border-border hover:bg-primary/5 hover:border-primary/30 transition-colors text-xs"
                  data-testid="demo-parent"
                >
                  <User className="w-4 h-4 text-primary" />
                  <span className="font-medium text-foreground">Parent</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Darul Uloom Sirajul Islam Kalgaon &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
