import { useState, useEffect } from "react";
import { useAuth, tryLogin, getLS, Teacher, Role } from "@/lib/storage";
import { useLang } from "@/lib/i18n";
import { Eye, EyeOff, ShieldCheck, BookOpen, Lock, User } from "lucide-react";
import logoImg from "@assets/logo.png_1779548283551.jpeg";

export default function Login() {
  const { login } = useAuth();
  const { lang, tr, setLang } = useLang();
  const isUrdu = lang === "ur";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isUsernameReadOnly, setIsUsernameReadOnly] = useState(true);
  const [isPasswordReadOnly, setIsPasswordReadOnly] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>(null);

  // Guarantee empty fields on mount — no browser auto-fill leaks through
  useEffect(() => {
    setUsername("");
    setPassword("");
  }, []);

  const performLogin = (
    usernameInput: string,
    passwordInput: string,
    role: Exclude<Role, null>
  ) => {
    setError("");
    setLoading(true);
    setTimeout(() => {
      const cred = tryLogin(usernameInput, passwordInput);
      if (!cred || cred.role !== role) {
        setError(tr("invalidCreds"));
        setLoading(false);
        return;
      }
      let resolvedClass = "";
      if (cred.role === "teacher") {
        const teachers = getLS<Teacher[]>("teachers", []);
        const matched = teachers.find(
          (t) =>
            t.email?.toLowerCase() === usernameInput.trim().toLowerCase()
        );
        resolvedClass = matched?.assignedClass || "";
      }
      login(cred, resolvedClass);
      setLoading(false);
    }, 400);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      setError(
        isUrdu ? "براہ کرم اپنا عہدہ منتخب کریں۔" : "Please select your role."
      );
      return;
    }
    if (!username.trim()) {
      setError(
        isUrdu
          ? "براہ کرم اپنا ای میل / آئی ڈی درج کریں۔"
          : "Please enter your Email / ID."
      );
      return;
    }
    if (!password) {
      setError(
        isUrdu
          ? "براہ کرم اپنا پاس ورڈ درج کریں۔"
          : "Please enter your password."
      );
      return;
    }
    performLogin(username, password, selectedRole);
  };

  // Role selection buttons: only set role
  const selectRole = (role: Exclude<Role, null>) => {
    setSelectedRole(role);
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4 ${isUrdu ? "urdu-text" : ""}`}
      dir={isUrdu ? "rtl" : "ltr"}
    >
      <div className="w-full max-w-md">
        {/* Language Toggle */}
        <div className="flex justify-end mb-3">
          <button
            onClick={() => setLang(isUrdu ? "en" : "ur")}
            className="text-xs bg-card border border-border rounded-full px-3 py-1.5 shadow-sm hover:bg-primary/5"
            data-testid="btn-lang-toggle-login"
          >
            {isUrdu ? "اردو | English" : "English | اردو"}
          </button>
        </div>

        <div className="bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
          {/* Header */}
          <div className="bg-primary px-8 py-8 text-center text-primary-foreground relative overflow-hidden">
            <div className="relative">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/40 shadow-lg overflow-hidden p-1">
                <img
                  src={logoImg}
                  alt="Darul Uloom Sirajul Islam Kalgaon"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <h1
                className={`text-xl font-bold leading-tight ${isUrdu ? "urdu-text" : ""}`}
                style={{ color: "#FFD700" }}
              >
                {tr("brandLine1")}
              </h1>
              <p
                className={`text-white text-sm font-semibold mt-0.5 tracking-wide ${isUrdu ? "urdu-text" : ""}`}
              >
                {tr("brandLine2")}
              </p>
              <p
                className={`text-primary-foreground/80 text-xs mt-1 ${isUrdu ? "urdu-text" : ""}`}
              >
                {tr("brandSubtitle")}
              </p>
              {!isUrdu && (
                <p
                  className="text-accent text-xs mt-1"
                  style={{
                    fontFamily: "'Noto Nastaliq Urdu', serif",
                    direction: "rtl",
                  }}
                >
                  دارالعلوم سراج الاسلام کلگاؤں
                </p>
              )}
            </div>
          </div>

          {/* Form */}
          <div className="px-8 py-6 space-y-5">
            <div className="text-center">
              <h2
                className={`text-lg font-semibold text-foreground ${isUrdu ? "urdu-text" : ""}`}
              >
                {tr("signInHeading")}
              </h2>
              <p
                className={`text-sm text-muted-foreground ${isUrdu ? "urdu-text" : ""}`}
              >
                {tr("enterCredentials")}
              </p>
            </div>

            <form
              onSubmit={handleLogin}
              className="space-y-4"
              noValidate
              autoComplete="off"
            >
              {/* Email / ID */}
              <div className="space-y-1.5">
                <label
                  className={`text-sm font-medium text-foreground ${isUrdu ? "urdu-text" : ""}`}
                >
                  {tr("emailOrId")}
                </label>
                <div className="relative">
                  <User
                    className={`absolute ${isUrdu ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`}
                  />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setError("");
                    }}
                    placeholder={isUrdu ? "ای میل / آئی ڈی" : "Email / ID"}
                    className={`w-full ${isUrdu ? "pr-10 pl-4 text-right" : "pl-10 pr-4"} py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent placeholder:text-muted-foreground transition-all`}
                    autoComplete="off"
                    readOnly={isUsernameReadOnly}
                    onFocus={() => setIsUsernameReadOnly(false)}
                    data-testid="input-username"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label
                  className={`text-sm font-medium text-foreground ${isUrdu ? "urdu-text" : ""}`}
                >
                  {tr("passwordLabel")}
                </label>
                <div className="relative">
                  <Lock
                    className={`absolute ${isUrdu ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    placeholder={tr("enterPasswordPh")}
                    className={`w-full ${isUrdu ? "pr-10 pl-12 text-right" : "pl-10 pr-12"} py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent placeholder:text-muted-foreground transition-all ${isUrdu ? "urdu-text" : ""}`}
                    autoComplete="new-password"
                    readOnly={isPasswordReadOnly}
                    onFocus={() => setIsPasswordReadOnly(false)}
                    data-testid="input-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className={`absolute ${isUrdu ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors`}
                    tabIndex={-1}
                    aria-label={
                      showPassword
                        ? isUrdu
                          ? "پاس ورڈ چھپائیں"
                          : "Hide password"
                        : isUrdu
                        ? "پاس ورڈ دکھائیں"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div
                  className={`flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm ${isUrdu ? "urdu-text" : ""}`}
                  data-testid="login-error"
                >
                  <span className="mt-0.5">⚠</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed text-sm ${isUrdu ? "urdu-text" : ""}`}
                data-testid="btn-login"
              >
                {loading
                  ? isUrdu
                    ? "سائن ان ہو رہا ہے..."
                    : "Signing in..."
                  : tr("signInBtn")}
              </button>
            </form>

            {/* Role Selection Buttons */}
            <div className="pt-2 border-t border-border">
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => selectRole("admin")}
                  disabled={loading}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border transition-colors text-xs disabled:opacity-60 disabled:cursor-not-allowed ${selectedRole === "admin" ? "border-primary bg-primary/10" : "border-border hover:bg-primary/5 hover:border-primary/30"}`}
                  data-testid="demo-admin"
                  aria-pressed={selectedRole === "admin"}
                >
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span
                    className={`font-medium text-foreground ${isUrdu ? "urdu-text" : ""}`}
                  >
                    {tr("roleAdmin")}
                  </span>
                </button>
                <button
                  onClick={() => selectRole("teacher")}
                  disabled={loading}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border transition-colors text-xs disabled:opacity-60 disabled:cursor-not-allowed ${selectedRole === "teacher" ? "border-primary bg-primary/10" : "border-border hover:bg-primary/5 hover:border-primary/30"}`}
                  data-testid="demo-teacher"
                  aria-pressed={selectedRole === "teacher"}
                >
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span
                    className={`font-medium text-foreground ${isUrdu ? "urdu-text" : ""}`}
                  >
                    {tr("roleTeacher")}
                  </span>
                </button>
                <button
                  onClick={() => selectRole("parent")}
                  disabled={loading}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border transition-colors text-xs disabled:opacity-60 disabled:cursor-not-allowed ${selectedRole === "parent" ? "border-primary bg-primary/10" : "border-border hover:bg-primary/5 hover:border-primary/30"}`}
                  data-testid="demo-parent"
                  aria-pressed={selectedRole === "parent"}
                >
                  <User className="w-4 h-4 text-primary" />
                  <span
                    className={`font-medium text-foreground ${isUrdu ? "urdu-text" : ""}`}
                  >
                    {tr("roleParent")}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <p
          className={`text-center text-xs text-muted-foreground mt-4 ${isUrdu ? "urdu-text" : ""}`}
        >
          {isUrdu
            ? "دارالعلوم سراج الاسلام کلگاؤں"
            : "Darul Uloom Sirajul Islam Kalgaon"}{" "}
          &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
