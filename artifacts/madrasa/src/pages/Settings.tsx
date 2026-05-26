import { useState } from "react";
import { useLS, resetAllData, getSavedCredentials } from "@/lib/storage";
import { useLang } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Settings as SettingsIcon,
  Trash2,
  Save,
  AlertTriangle,
  School,
  Phone,
  Mail,
  MapPin,
  Info,
  Clock,
  Download,
  Upload,
  KeyRound,
  Lock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface MadrasaInfo {
  name: string;
  established: string;
  address: string;
  phone: string;
  email: string;
}

const defaultInfo: MadrasaInfo = {
  name: "Darul Uloom Sirajul Islam Kalgaon",
  established: "",
  address: "",
  phone: "",
  email: "",
};

export default function Settings() {
  const { lang, tr } = useLang();
  const isUrdu = lang === "ur";
  const { toast } = useToast();
  const [madrasaInfo, setMadrasaInfo] = useLS<MadrasaInfo>("madrasa_info", defaultInfo);
  const [prayerTimes, setPrayerTimes] = useLS<Record<string, string>>("prayer_times", {});
  const [form, setForm] = useState<MadrasaInfo>(madrasaInfo);
  const [prayerForm, setPrayerForm] = useState<Record<string, string>>(prayerTimes);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetTyped, setResetTyped] = useState("");

  const [selectedUser, setSelectedUser] = useState<"admin" | "teacher" | "parent">("admin");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [credentialsVersion, setCredentialsVersion] = useState(0);

  const backupAllData = () => {
    const keys = [
      'students', 'donations', 'fees', 'expenses', 'teachers',
      'attendance', 'hifz_progress', 'qaida_progress', 'timetable_entries'
    ];
    const backup: Record<string, any> = {};
    keys.forEach(key => {
      const data = localStorage.getItem(key);
      backup[key] = data ? JSON.parse(data) : [];
    });
    const dataStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `madrasa-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: isUrdu ? "کامیاب" : "Success",
      description: isUrdu ? "بیک اپ فائل کامیابی سے ڈاؤن لوڈ ہو گئی۔" : "Backup downloaded successfully!"
    });
  };

  const restoreData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = function (e: any) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function (evt: any) {
        try {
          const backup = JSON.parse(evt.target.result);
          for (const [key, value] of Object.entries(backup)) {
            localStorage.setItem(key, JSON.stringify(value));
          }
          toast({
            title: isUrdu ? "کامیاب" : "Success",
            description: isUrdu ? "ڈیٹا کامیابی سے بحال ہو گیا! صفحہ دوبارہ لوڈ ہو رہا ہے۔" : "Data restored successfully! Reloading page."
          });
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } catch (error) {
          toast({
            title: isUrdu ? "غلطی" : "Error",
            description: isUrdu ? "غلط بیک اپ فائل۔ براہ کرم درست فائل منتخب کریں۔" : "Invalid backup file. Please select a valid backup.",
            variant: "destructive"
          });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleChangePassword = () => {
    const loggedInUserStr = localStorage.getItem('loggedInUser');
    if (!loggedInUserStr) {
      toast({
        title: isUrdu ? "غلطی" : "Error",
        description: isUrdu ? "براہ کرم پہلے ایڈمن کے طور پر لاگ ان کریں۔" : "Please login as Admin first.",
        variant: "destructive"
      });
      return;
    }

    try {
      const user = JSON.parse(loggedInUserStr);
      if (user.role !== 'admin') {
        toast({
          title: isUrdu ? "غلطی" : "Error",
          description: isUrdu ? "صرف ایڈمن ہی پاس ورڈ تبدیل کر سکتا ہے!" : "Only Admin can change passwords!",
          variant: "destructive"
        });
        return;
      }
    } catch (e) {
      console.error(e);
    }

    if (newPassword.length < 6) {
      toast({
        title: isUrdu ? "غلطی" : "Error",
        description: isUrdu ? "پاس ورڈ کم از کم 6 حروف کا ہونا چاہیے۔" : "Password must be at least 6 characters.",
        variant: "destructive"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: isUrdu ? "غلطی" : "Error",
        description: isUrdu ? "پاس ورڈز آپس میں نہیں ملتے!" : "Passwords do not match!",
        variant: "destructive"
      });
      return;
    }

    const currentCreds = getSavedCredentials();
    currentCreds[selectedUser].password = newPassword;

    localStorage.setItem('user_credentials', JSON.stringify(currentCreds));

    toast({
      title: isUrdu ? "کامیاب" : "Success",
      description: isUrdu
        ? `${selectedUser === 'admin' ? 'ایڈمن' : selectedUser === 'teacher' ? 'استاد' : 'والدین'} کا پاس ورڈ کامیابی سے تبدیل ہو گیا!`
        : `Password for ${selectedUser} changed successfully!`
    });

    setNewPassword("");
    setConfirmPassword("");
    setCredentialsVersion(v => v + 1);
  };

  const handleSave = () => {
    setMadrasaInfo(form);
    setPrayerTimes(prayerForm);
    toast({ title: isUrdu ? "ترتیبات محفوظ ہو گئیں" : "Settings Saved", description: isUrdu ? "مدرسہ کی معلومات اپ ڈیٹ ہو گئیں۔" : "Madrasa info updated." });
  };

  const handleReset = () => {
    if (resetTyped.trim().toUpperCase() !== "RESET") {
      toast({ title: "Incorrect", description: "Type RESET to confirm.", variant: "destructive" });
      return;
    }
    resetAllData();
  };

  return (
    <div className={`space-y-6 ${isUrdu ? "urdu-text" : ""}`} dir={isUrdu ? "rtl" : "ltr"}>
      {/* Header */}
      <div className={`flex items-center gap-3 ${isUrdu ? "flex-row-reverse" : ""}`}>
        <SettingsIcon className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isUrdu ? "ترتیبات" : "Settings"}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {isUrdu ? "مدرسہ کی ترتیبات اور ڈیٹا مینجمنٹ" : "Madrasa configuration and data management"}
          </p>
        </div>
      </div>

      {/* Madrasa Info */}
      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isUrdu ? "flex-row-reverse" : ""}`}>
            <School className="w-5 h-5 text-primary" />
            {isUrdu ? "مدرسہ کی معلومات" : "Madrasa Information"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className={`flex items-center gap-1.5 ${isUrdu ? "flex-row-reverse" : ""}`}>
              <School className="w-3.5 h-3.5 text-muted-foreground" />
              {isUrdu ? "مدرسہ کا نام" : "Madrasa Name"}
            </Label>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className={`flex items-center gap-1.5 ${isUrdu ? "flex-row-reverse" : ""}`}>
                <Info className="w-3.5 h-3.5 text-muted-foreground" />
                {isUrdu ? "قیام کا سال" : "Established"}
              </Label>
              <Input placeholder="e.g. 1995" value={form.established} onChange={e => setForm(f => ({ ...f, established: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className={`flex items-center gap-1.5 ${isUrdu ? "flex-row-reverse" : ""}`}>
                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                {isUrdu ? "فون نمبر" : "Phone"}
              </Label>
              <Input placeholder="9876543210" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className={`flex items-center gap-1.5 ${isUrdu ? "flex-row-reverse" : ""}`}>
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                {isUrdu ? "ای میل" : "Email"}
              </Label>
              <Input placeholder="info@dsik.edu" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className={`flex items-center gap-1.5 ${isUrdu ? "flex-row-reverse" : ""}`}>
                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                {isUrdu ? "پتہ" : "Address"}
              </Label>
              <Input placeholder="Kalgaon, Maharashtra" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            </div>
          </div>
          <div className={`pt-2 ${isUrdu ? "text-right" : ""}`}>
            <Button onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" />
              {isUrdu ? "ترتیبات محفوظ کریں" : "Save Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Prayer Times Section */}
      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isUrdu ? "flex-row-reverse" : ""}`}>
            <Clock className="w-5 h-5 text-primary" />
            {isUrdu ? "نماز کے اوقات" : "Prayer Times"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { key: "fajr", labelEn: "Fajr", labelUr: "فجر" },
              { key: "dhuhr", labelEn: "Dhuhr", labelUr: "ظہر" },
              { key: "asr", labelEn: "Asr", labelUr: "عصر" },
              { key: "maghrib", labelEn: "Maghrib", labelUr: "مغرب" },
              { key: "isha", labelEn: "Isha", labelUr: "عشاء" },
            ].map(p => (
              <div key={p.key} className="space-y-1.5">
                <Label className={`flex items-center gap-1.5 ${isUrdu ? "flex-row-reverse" : ""}`}>
                  {isUrdu ? p.labelUr : p.labelEn}
                </Label>
                <Input
                  value={prayerForm[p.key] || ""}
                  onChange={e => setPrayerForm(prev => ({ ...prev, [p.key]: e.target.value }))}
                  placeholder="e.g. 05:00 AM"
                />
              </div>
            ))}
          </div>
          <div className={`pt-4 ${isUrdu ? "text-right" : ""}`}>
            <Button onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" />
              {isUrdu ? "ترتیبات محفوظ کریں" : "Save Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Backup */}
      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isUrdu ? "flex-row-reverse" : ""}`}>
            <Download className="w-5 h-5 text-primary" />
            {isUrdu ? "📦 ڈیٹا بیک اپ" : "📦 Data Backup"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-muted-foreground text-sm mb-4 ${isUrdu ? "text-right urdu-text" : ""}`}>
            {isUrdu
              ? "مدرسہ کا تمام ڈیٹا ڈاؤن لوڈ کریں یا پہلے سے محفوظ کردہ بیک اپ فائل سے بحال کریں۔"
              : "Download all madrasa data as a backup or restore from a previously saved backup file."}
          </p>
          <div className={`flex flex-wrap gap-4 ${isUrdu ? "flex-row-reverse" : ""}`}>
            <Button onClick={backupAllData} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
              <Download className="w-4 h-4" />
              {isUrdu ? "📥 ڈیٹا بیک اپ کریں" : "📥 Backup Data"}
            </Button>
            <Button onClick={restoreData} className="gap-2 bg-amber-500 hover:bg-amber-600 text-amber-950 font-medium border border-amber-600">
              <Upload className="w-4 h-4" />
              {isUrdu ? "📤 ڈیٹا بحال کریں" : "📤 Restore Data"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card key={`creds-${credentialsVersion}`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isUrdu ? "flex-row-reverse" : ""}`}>
            <Info className="w-5 h-5 text-primary" />
            {isUrdu ? "لاگ ان کی معلومات" : "Login Credentials"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { role: isUrdu ? "منتظم" : "Admin",   id: "darulum@admin",   pass: getSavedCredentials().admin.password,  cls: "text-primary" },
              { role: isUrdu ? "استاد" : "Teacher",  id: "darulum@teacher", pass: getSavedCredentials().teacher.password,    cls: "text-emerald-600" },
              { role: isUrdu ? "والدین" : "Parent",  id: "darulum@parent",  pass: getSavedCredentials().parent.password,    cls: "text-blue-600" },
            ].map(c => (
              <div key={c.id} className={`flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border ${isUrdu ? "flex-row-reverse" : ""}`}>
                <span className={`text-sm font-semibold ${c.cls}`}>{c.role}</span>
                <div className={`text-xs text-muted-foreground font-mono ${isUrdu ? "text-left" : "text-right"}`}>
                  <div>{c.id}</div>
                  <div>{c.pass}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isUrdu ? "flex-row-reverse" : ""}`}>
            <KeyRound className="w-5 h-5 text-primary" />
            {isUrdu ? "🔐 پاس ورڈ تبدیل کریں (صرف ایڈمن)" : "🔐 Change Password (Admin Only)"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className={`flex items-center gap-1.5 ${isUrdu ? "flex-row-reverse" : ""}`}>
              {isUrdu ? "صارف منتخب کریں:" : "Select User:"}
            </Label>
            <Select value={selectedUser} onValueChange={(v: any) => setSelectedUser(v)}>
              <SelectTrigger className={isUrdu ? "text-right" : ""}>
                <SelectValue placeholder={isUrdu ? "صارف منتخب کریں" : "Select User"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">
                  {isUrdu ? "منتظم (darulum@admin)" : "Admin (darulum@admin)"}
                </SelectItem>
                <SelectItem value="teacher">
                  {isUrdu ? "استاد (darulum@teacher)" : "Teacher (darulum@teacher)"}
                </SelectItem>
                <SelectItem value="parent">
                  {isUrdu ? "والدین (darulum@parent)" : "Parent (darulum@parent)"}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className={`flex items-center gap-1.5 ${isUrdu ? "flex-row-reverse" : ""}`}>
                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                {isUrdu ? "نیا پاس ورڈ:" : "New Password:"}
              </Label>
              <Input
                type="password"
                placeholder={isUrdu ? "نیا پاس ورڈ درج کریں (کم از کم 6 ہندسے)" : "Enter new password (min 6 characters)"}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className={isUrdu ? "text-right placeholder:text-right" : ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label className={`flex items-center gap-1.5 ${isUrdu ? "flex-row-reverse" : ""}`}>
                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                {isUrdu ? "پاس ورڈ کی تصدیق کریں:" : "Confirm Password:"}
              </Label>
              <Input
                type="password"
                placeholder={isUrdu ? "دوبارہ پاس ورڈ درج کریں" : "Confirm new password"}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className={isUrdu ? "text-right placeholder:text-right" : ""}
              />
            </div>
          </div>

          <div className={`pt-2 ${isUrdu ? "text-right" : ""}`}>
            <Button onClick={handleChangePassword} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
              <Save className="w-4 h-4" />
              {isUrdu ? "پاس ورڈ تبدیل کریں" : "Update Password"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-destructive ${isUrdu ? "flex-row-reverse" : ""}`}>
            <AlertTriangle className="w-5 h-5" />
            {isUrdu ? "خطرناک زون" : "Danger Zone"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`flex items-center justify-between p-4 rounded-lg bg-destructive/5 border border-destructive/20 ${isUrdu ? "flex-row-reverse" : ""}`}>
            <div className={isUrdu ? "text-right" : ""}>
              <p className={`font-semibold text-destructive ${isUrdu ? "urdu-text" : ""}`}>
                {isUrdu ? "تمام ڈیٹا ری سیٹ کریں" : "Reset All Data"}
              </p>
              <p className={`text-sm text-muted-foreground mt-0.5 ${isUrdu ? "urdu-text" : ""}`}>
                {isUrdu
                  ? "تمام طلباء، اساتذہ، عطیات، فیس اور تمام ریکارڈ حذف ہو جائیں گے۔"
                  : "Permanently deletes all students, teachers, donations, fees and all records."}
              </p>
            </div>
            <Button variant="destructive" className="gap-2 flex-shrink-0 ml-4" onClick={() => { setResetTyped(""); setShowResetConfirm(true); }}>
              <Trash2 className="w-4 h-4" />
              {isUrdu ? "ری سیٹ کریں" : "Reset"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              {isUrdu ? "آپ کو یقین ہے؟" : "Are you sure?"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive space-y-1">
              <p className="font-semibold">{isUrdu ? "یہ عمل واپس نہیں کیا جا سکتا!" : "This action cannot be undone!"}</p>
              <p className={isUrdu ? "urdu-text" : ""}>{isUrdu ? "تمام ڈیٹا مستقل طور پر حذف ہو جائے گا۔" : "All data will be permanently deleted."}</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">
                {isUrdu ? "تصدیق کے لیے RESET لکھیں:" : "Type RESET to confirm:"}
              </Label>
              <Input
                placeholder="RESET"
                value={resetTyped}
                onChange={e => setResetTyped(e.target.value)}
                className="border-destructive/40 focus-visible:ring-destructive"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowResetConfirm(false)}>
              {isUrdu ? "منسوخ" : "Cancel"}
            </Button>
            <Button
              variant="destructive"
              onClick={handleReset}
              disabled={resetTyped.trim().toUpperCase() !== "RESET"}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isUrdu ? "تمام ڈیٹا حذف کریں" : "Delete All Data"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
