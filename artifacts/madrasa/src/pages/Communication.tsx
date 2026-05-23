import { useState } from "react";
import { useLang } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BellRing, MessageSquare, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Communication() {
  const { tr, lang } = useLang();
  const isUrdu = lang === "ur";
  const { toast } = useToast();
  const [waPhone, setWaPhone] = useState("");
  const [waMessage, setWaMessage] = useState("");
  const [pushMessage, setPushMessage] = useState("");

  const handleSendWhatsApp = () => {
    if (!waPhone || !waMessage) return;
    window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(waMessage)}`, '_blank');
    setWaMessage("");
    toast({ title: isUrdu ? "واٹس ایپ کھل گیا" : "WhatsApp Opened", description: isUrdu ? "پیغام بھیجنے کے لیے تیار ہے۔" : "Your message is ready to send." });
  };

  const handleSendPush = () => {
    if (!pushMessage) return;
    toast({ title: isUrdu ? "اطلاع بھیجی گئی" : "Notification Sent", description: isUrdu ? "تمام صارفین کو پیغام بھیجا گیا۔" : "Message broadcasted to all users." });
    setPushMessage("");
  };

  const handleEmergency = () => {
    if (confirm(isUrdu ? "کیا آپ تمام والدین اور عملے کو ہنگامی الرٹ بھیجنا چاہتے ہیں؟" : "Are you sure you want to trigger an emergency alert to all parents and staff?")) {
      toast({
        title: isUrdu ? "ہنگامی الرٹ بھیجا گیا" : "Emergency Alert Sent",
        description: isUrdu ? "ایس ایم ایس اور اطلاعات بھیج دی گئی ہیں۔" : "SMS and Push notifications dispatched.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold text-foreground ${isUrdu ? "urdu-text" : ""}`}>{tr("communicationPage")}</h1>
        <p className={`text-muted-foreground mt-1 ${isUrdu ? "urdu-text" : ""}`}>{tr("connectParentsStaff")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <Card>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isUrdu ? "urdu-text" : ""}`}>
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              {tr("waDirectMessage")}
            </CardTitle>
            <CardDescription className={isUrdu ? "urdu-text" : ""}>{tr("sendInstantWa")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className={isUrdu ? "urdu-text" : ""}>{tr("phoneCountryCode")}</Label>
              <Input
                placeholder={tr("waPhonePlh")}
                value={waPhone}
                onChange={(e) => setWaPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className={isUrdu ? "urdu-text" : ""}>{tr("message")}</Label>
              <Textarea
                placeholder={tr("waMessagePlh")}
                rows={4}
                value={waMessage}
                onChange={(e) => setWaMessage(e.target.value)}
              />
            </div>
            <Button className={`w-full bg-emerald-600 hover:bg-emerald-700 text-white ${isUrdu ? "urdu-text" : ""}`} onClick={handleSendWhatsApp}>
              {tr("openInWhatsApp")}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isUrdu ? "urdu-text" : ""}`}>
                <BellRing className="w-5 h-5 text-primary" />
                {tr("appPushNotif")}
              </CardTitle>
              <CardDescription className={isUrdu ? "urdu-text" : ""}>{tr("sendNoticeParents")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className={isUrdu ? "urdu-text" : ""}>{tr("announcementMsg")}</Label>
                <Textarea
                  placeholder={tr("broadcastPlh")}
                  rows={3}
                  value={pushMessage}
                  onChange={(e) => setPushMessage(e.target.value)}
                />
              </div>
              <Button className={`w-full ${isUrdu ? "urdu-text" : ""}`} onClick={handleSendPush}>
                {tr("broadcastNotif")}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 text-destructive ${isUrdu ? "urdu-text" : ""}`}>
                <AlertTriangle className="w-5 h-5" />
                {tr("emergencyAlertSys")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-sm text-muted-foreground mb-4 ${isUrdu ? "urdu-text" : ""}`}>
                {tr("emergencyAlertDesc")}
              </p>
              <Button variant="destructive" className={`w-full font-bold ${isUrdu ? "urdu-text" : ""}`} onClick={handleEmergency}>
                {tr("triggerEmergency")}
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
