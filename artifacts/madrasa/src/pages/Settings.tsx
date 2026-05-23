import { useState } from "react";
import { useLS, resetAllData } from "@/lib/storage";
import { useLang } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
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
  const [form, setForm] = useState<MadrasaInfo>(madrasaInfo);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetTyped, setResetTyped] = useState("");

  const handleSave = () => {
    setMadrasaInfo(form);
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

      {/* App Info */}
      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isUrdu ? "flex-row-reverse" : ""}`}>
            <Info className="w-5 h-5 text-primary" />
            {isUrdu ? "لاگ ان کی معلومات" : "Login Credentials"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { role: isUrdu ? "منتظم" : "Admin",   id: "darulum@admin",   pass: "78607860",  cls: "text-primary" },
              { role: isUrdu ? "استاد" : "Teacher",  id: "darulum@teacher", pass: "068706",    cls: "text-emerald-600" },
              { role: isUrdu ? "والدین" : "Parent",  id: "parent@demo.com", pass: "parent123", cls: "text-blue-600" },
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
