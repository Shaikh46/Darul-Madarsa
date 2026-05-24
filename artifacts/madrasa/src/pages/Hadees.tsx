import { useState, useMemo } from "react";
import { useLang } from "@/lib/i18n";
import { useLS } from "@/lib/storage";
import { HADEES_LIST } from "@/lib/hadees";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, ChevronLeft, ChevronRight, Heart, Share2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Hadees() {
  const { lang, tr } = useLang();
  const isUrdu = lang === "ur";
  const { toast } = useToast();
  const [index, setIndex] = useState(0);
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useLS<number[]>("hadees_favorites", []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return HADEES_LIST;
    return HADEES_LIST.filter(h =>
      h.en.toLowerCase().includes(q) ||
      h.ur.includes(query.trim()) ||
      h.reference.toLowerCase().includes(q)
    );
  }, [query]);

  const safeIndex = Math.min(index, Math.max(0, filtered.length - 1));
  const current = filtered[safeIndex];

  const isFav = current ? favorites.includes(current.id) : false;

  const toggleFav = () => {
    if (!current) return;
    setFavorites(isFav ? favorites.filter(id => id !== current.id) : [...favorites, current.id]);
  };

  const shareWhatsApp = () => {
    if (!current) return;
    const text = `${current.arabic}\n\n${current.en}\n\n${current.ur}\n\n— ${current.reference}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const copyText = async () => {
    if (!current) return;
    const text = `${current.arabic}\n\n${current.en}\n\n${current.ur}\n\n— ${current.reference}`;
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: isUrdu ? "نقل ہو گیا" : "Copied", description: isUrdu ? "حدیث کلپ بورڈ میں نقل ہو گئی" : "Hadees copied to clipboard" });
    } catch {
      toast({ title: "Error", description: "Could not copy", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold text-foreground flex items-center gap-2 ${isUrdu ? "urdu-text" : ""}`}>
          <BookOpen className="w-7 h-7 text-primary" />
          {tr("hadeesBook")}
        </h1>
        <p className={`text-muted-foreground mt-1 ${isUrdu ? "urdu-text" : ""}`}>{tr("hadeesSubtitle")}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={isUrdu ? "تلاش کریں..." : "Search hadees..."}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setIndex(0); }}
            className={`pl-9 ${isUrdu ? "urdu-text" : ""}`}
            data-testid="input-hadees-search"
          />
        </div>
        <div className={`text-sm text-muted-foreground ${isUrdu ? "urdu-text" : ""}`}>
          {filtered.length} {isUrdu ? "احادیث" : "hadees"} · {favorites.length} {isUrdu ? "پسندیدہ" : "favorites"}
        </div>
      </div>

      {current ? (
        <Card className="border-primary/20">
          <CardHeader className="bg-primary/5 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className={`text-xl ${isUrdu ? "urdu-text" : ""}`}>
                {isUrdu ? `حدیث #${current.id}` : `Hadees #${current.id}`}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={toggleFav} data-testid="btn-fav-hadees" title={isUrdu ? "پسندیدہ" : "Favorite"}>
                  <Heart className={`w-5 h-5 ${isFav ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
                <Button variant="ghost" size="icon" onClick={shareWhatsApp} data-testid="btn-share-hadees" title="WhatsApp">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="text-right" dir="rtl">
              <p className="text-2xl leading-loose font-arabic" style={{ fontFamily: "'Noto Naskh Arabic', 'Amiri', serif" }}>
                {current.arabic}
              </p>
            </div>
            <div className="space-y-2 pt-4 border-t">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">English</p>
              <p className="text-lg leading-relaxed">{current.en}</p>
            </div>
            <div className="space-y-2 pt-4 border-t">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">اردو</p>
              <p className="text-lg leading-loose urdu-text" dir="rtl">{current.ur}</p>
            </div>
            <div className="pt-4 border-t flex justify-between items-center">
              <span className={`text-sm font-medium text-primary ${isUrdu ? "urdu-text" : ""}`}>
                {isUrdu ? "حوالہ: " : "Reference: "}{current.reference}
              </span>
              <Button variant="outline" size="sm" onClick={copyText} data-testid="btn-copy-hadees">
                {isUrdu ? "نقل کریں" : "Copy"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className={`p-8 text-center border rounded-md text-muted-foreground bg-card ${isUrdu ? "urdu-text" : ""}`}>
          {isUrdu ? "کوئی حدیث نہیں ملی" : "No hadees found"}
        </div>
      )}

      {filtered.length > 0 && (
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => setIndex(Math.max(0, safeIndex - 1))}
            disabled={safeIndex === 0}
            data-testid="btn-prev-hadees"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {isUrdu ? "پچھلا" : "Previous"}
          </Button>
          <span className={`text-sm font-medium ${isUrdu ? "urdu-text" : ""}`}>
            {safeIndex + 1} / {filtered.length}
          </span>
          <Button
            variant="outline"
            onClick={() => setIndex(Math.min(filtered.length - 1, safeIndex + 1))}
            disabled={safeIndex >= filtered.length - 1}
            data-testid="btn-next-hadees"
          >
            {isUrdu ? "اگلا" : "Next"}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
