import { useState, useMemo } from "react";
import { useLang } from "@/lib/i18n";
import { useLS } from "@/lib/storage";
import { DUAS, DUA_SECTIONS, type DuaSection } from "@/lib/duas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollText, Search, Heart, Share2, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Duas() {
  const { lang, tr } = useLang();
  const isUrdu = lang === "ur";
  const { toast } = useToast();
  const [section, setSection] = useState<DuaSection | "all">("all");
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const [favorites, setFavorites] = useLS<number[]>("duas_favorites", []);

  const filtered = useMemo(() => {
    let list = section === "all" ? DUAS : DUAS.filter(d => d.section === section);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(d =>
        d.title.en.toLowerCase().includes(q) ||
        d.title.ur.includes(query.trim()) ||
        d.translation.en.toLowerCase().includes(q) ||
        d.translation.ur.includes(query.trim())
      );
    }
    return list;
  }, [section, query]);

  const safeIndex = Math.min(index, Math.max(0, filtered.length - 1));
  const current = filtered[safeIndex];

  const isFav = current ? favorites.includes(current.id) : false;
  const toggleFav = () => {
    if (!current) return;
    setFavorites(isFav ? favorites.filter(id => id !== current.id) : [...favorites, current.id]);
  };

  const shareWhatsApp = () => {
    if (!current) return;
    const t = `${current.title[lang]}\n\n${current.arabic}\n\n${current.translation[lang]}${current.reference ? `\n\n— ${current.reference}` : ""}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(t)}`, "_blank");
  };

  const copyText = async () => {
    if (!current) return;
    const t = `${current.title[lang]}\n\n${current.arabic}\n\n${current.translation[lang]}${current.reference ? `\n\n— ${current.reference}` : ""}`;
    try {
      await navigator.clipboard.writeText(t);
      toast({ title: isUrdu ? "نقل ہو گیا" : "Copied", description: isUrdu ? "دعا کلپ بورڈ میں نقل ہو گئی" : "Dua copied to clipboard" });
    } catch {
      toast({ title: "Error", description: "Could not copy", variant: "destructive" });
    }
  };

  const sectionLabel = (s: typeof DUA_SECTIONS[number]) => (isUrdu ? s.ur : s.en);

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold text-foreground flex items-center gap-2 ${isUrdu ? "urdu-text" : ""}`}>
          <ScrollText className="w-7 h-7 text-primary" />
          {tr("duasAzkar")}
        </h1>
        <p className={`text-muted-foreground mt-1 ${isUrdu ? "urdu-text" : ""}`}>{tr("duasSubtitle")}</p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={isUrdu ? "دعا تلاش کریں..." : "Search dua..."}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setIndex(0); }}
            className={`pl-9 ${isUrdu ? "urdu-text" : ""}`}
            data-testid="input-dua-search"
          />
        </div>
        <div className={`text-sm text-muted-foreground ${isUrdu ? "urdu-text" : ""}`}>
          {filtered.length} {isUrdu ? "دعائیں" : "duas"} · {favorites.length} {isUrdu ? "پسندیدہ" : "favorites"}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={section === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => { setSection("all"); setIndex(0); }}
          data-testid="btn-dua-section-all"
          className={isUrdu ? "urdu-text" : ""}
        >
          {isUrdu ? "سب" : "All"} ({DUAS.length})
        </Button>
        {DUA_SECTIONS.map(s => {
          const count = DUAS.filter(d => d.section === s.key).length;
          return (
            <Button
              key={s.key}
              variant={section === s.key ? "default" : "outline"}
              size="sm"
              onClick={() => { setSection(s.key); setIndex(0); }}
              data-testid={`btn-dua-section-${s.key}`}
              className={isUrdu ? "urdu-text" : ""}
            >
              <span className="mr-1">{s.icon}</span>
              {sectionLabel(s)} ({count})
            </Button>
          );
        })}
      </div>

      {current ? (
        <Card className="border-primary/20">
          <CardHeader className="bg-primary/5 border-b">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <p className={`text-xs text-muted-foreground uppercase tracking-wider ${isUrdu ? "urdu-text" : ""}`}>
                  {isUrdu ? `دعا #${current.id}` : `Dua #${current.id}`}
                </p>
                <CardTitle className={`text-xl mt-1 ${isUrdu ? "urdu-text" : ""}`} dir={isUrdu ? "rtl" : "ltr"}>
                  {current.title[lang]}
                </CardTitle>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={toggleFav} data-testid="btn-fav-dua" title={isUrdu ? "پسندیدہ" : "Favorite"}>
                  <Heart className={`w-5 h-5 ${isFav ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
                <Button variant="ghost" size="icon" onClick={shareWhatsApp} data-testid="btn-share-dua" title="WhatsApp">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="text-right" dir="rtl">
              <p className="text-2xl leading-loose" style={{ fontFamily: "'Noto Naskh Arabic', 'Amiri', serif" }}>
                {current.arabic}
              </p>
            </div>
            <div className="space-y-2 pt-4 border-t">
              <p className={`text-xs font-semibold text-muted-foreground uppercase tracking-wider ${isUrdu ? "urdu-text" : ""}`}>
                {isUrdu ? "ترجمہ" : "Translation"}
              </p>
              <p
                className={`text-lg leading-relaxed ${isUrdu ? "urdu-text leading-loose" : ""}`}
                dir={isUrdu ? "rtl" : "ltr"}
              >
                {current.translation[lang]}
              </p>
            </div>
            <div className="pt-3 border-t flex justify-between items-center flex-wrap gap-2">
              {current.reference && (
                <span className={`text-sm font-medium text-primary ${isUrdu ? "urdu-text" : ""}`}>
                  {isUrdu ? "حوالہ: " : "Reference: "}
                  {current.reference}
                </span>
              )}
              <Button variant="outline" size="sm" onClick={copyText} data-testid="btn-copy-dua" className={`${isUrdu ? "urdu-text" : ""} ${!current.reference ? "ml-auto" : ""}`}>
                {isUrdu ? "نقل کریں" : "Copy"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className={`p-8 text-center border rounded-md text-muted-foreground bg-card ${isUrdu ? "urdu-text" : ""}`}>
          {isUrdu ? "کوئی دعا نہیں ملی" : "No dua found"}
        </div>
      )}

      {filtered.length > 0 && (
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => setIndex(Math.max(0, safeIndex - 1))}
            disabled={safeIndex === 0}
            data-testid="btn-prev-dua"
            className={isUrdu ? "urdu-text" : ""}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {isUrdu ? "پچھلی" : "Previous"}
          </Button>
          <span className={`text-sm font-medium ${isUrdu ? "urdu-text" : ""}`}>
            {safeIndex + 1} / {filtered.length}
          </span>
          <Button
            variant="outline"
            onClick={() => setIndex(Math.min(filtered.length - 1, safeIndex + 1))}
            disabled={safeIndex >= filtered.length - 1}
            data-testid="btn-next-dua"
            className={isUrdu ? "urdu-text" : ""}
          >
            {isUrdu ? "اگلی" : "Next"}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
