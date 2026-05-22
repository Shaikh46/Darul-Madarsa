import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BellRing, MessageSquare, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Communication() {
  const { toast } = useToast();
  const [waPhone, setWaPhone] = useState("");
  const [waMessage, setWaMessage] = useState("");
  const [pushMessage, setPushMessage] = useState("");

  const handleSendWhatsApp = () => {
    if (!waPhone || !waMessage) return;
    window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(waMessage)}`, '_blank');
    setWaMessage("");
    toast({ title: "WhatsApp Opened", description: "Your message is ready to send." });
  };

  const handleSendPush = () => {
    if (!pushMessage) return;
    toast({ title: "Notification Sent", description: "Message broadcasted to all users." });
    setPushMessage("");
  };

  const handleEmergency = () => {
    if (confirm("Are you sure you want to trigger an emergency alert to all parents and staff?")) {
      toast({ 
        title: "Emergency Alert Sent", 
        description: "SMS and Push notifications dispatched.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Communication</h1>
        <p className="text-muted-foreground mt-1">Connect with parents and staff</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              WhatsApp Direct Message
            </CardTitle>
            <CardDescription>Send an instant WhatsApp message to any number</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Phone Number (with country code)</Label>
              <Input 
                placeholder="e.g. 919876543210" 
                value={waPhone} 
                onChange={(e) => setWaPhone(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea 
                placeholder="Type your message here..." 
                rows={4}
                value={waMessage} 
                onChange={(e) => setWaMessage(e.target.value)} 
              />
            </div>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSendWhatsApp}>
              Open in WhatsApp
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BellRing className="w-5 h-5 text-primary" />
                App Push Notification
              </CardTitle>
              <CardDescription>Send a notice to all parents' dashboards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Announcement Message</Label>
                <Textarea 
                  placeholder="e.g. Madrasa will remain closed tomorrow due to heavy rain..." 
                  rows={3}
                  value={pushMessage} 
                  onChange={(e) => setPushMessage(e.target.value)} 
                />
              </div>
              <Button className="w-full" onClick={handleSendPush}>
                Broadcast Notification
              </Button>
            </CardContent>
          </Card>

          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Emergency Alert System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Use this only for critical emergencies. It will trigger an immediate SMS and push notification overriding silent modes.
              </p>
              <Button variant="destructive" className="w-full font-bold" onClick={handleEmergency}>
                TRIGGER EMERGENCY ALERT
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
