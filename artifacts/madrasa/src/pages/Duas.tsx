import { useState, useMemo } from "react";
import { useLang } from "@/lib/i18n";
import { useLS } from "@/lib/storage";
import { DUAS, DUA_SECTIONS, type DuaSection } from "@/lib/duas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollText, Search, Heart, Share2, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type DuaLang = "en" | "hi" | "ur";

export default function Duas() {
  const { lang, tr } = useLang();
  const isUrdu = lang === "ur";
  const { toast } = useToast();
  const [duaLang, setDuaLang] = useState<DuaLang>(lang === "ur" ? "ur" : "en");
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
        d.title.hi.includes(query.trim()) ||
        d.title.ur.includes(query.trim()) ||
        d.translation.en.toLowerCase().includes(q) ||
        d.translation.hi.includes(query.trim()) ||
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
    const t = `${current.title[duaLang]}\n\n${current.arabic}\n\n${current.translation[duaLang]}${current.reference ? `\n\n— ${current.reference}` : ""}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(t)}`, "_blank");
  };

  const copyText = async () => {
    if (!current) return;
    const t = `${current.title[duaLang]}\n\n${current.arabic}\n\n${current.translation[duaLang]}${current.reference ? `\n\n— ${current.reference}` : ""}`;
    try {
      await navigator.clipboard.writeText(t);
      toast({ title: isUrdu ? "نقل ہو گیا" : "Copied", description: isUrdu ? "دعا کلپ بورڈ میں نقل ہو گئی" : "Dua copied to clipboard" });
    } catch {
      toast({ title: "Error", description: "Could not copy", variant: "destructive" });
    }
  };

  const langButtons: { key: DuaLang; label: string }[] = [
    { key: "en", label: "English" },
    { key: "hi", label: "हिंदी" },
    { key: "ur", label: "اردو" },
  ];

  const sectionLabel = (s: typeof DUA_SECTIONS[number]) =>
    duaLang === "ur" ? s.ur : duaLang === "hi" ? s.hi : s.en;

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold text-foreground flex items-center gap-2 ${isUrdu ? "urdu-text" : ""}`}>
          <ScrollText className="w-7 h-7 text-primary" />
          {tr("duasAzkar")}
        </h1>
        <p className={`text-muted-foreground mt-1 ${isUrdu ? "urdu-text" : ""}`}>{tr("duasSubtitle")}</p>
      </div>

      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-1 border rounded-md p-1 bg-card">
          {langButtons.map(b => (
            <Button
              key={b.key}
              variant={duaLang === b.key ? "default" : "ghost"}
              size="sm"
              onClick={() => setDuaLang(b.key)}
              data-testid={`btn-dua-lang-${b.key}`}
            >
              {b.label}
            </Button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={duaLang === "ur" ? "دعا تلاش کریں..." : duaLang === "hi" ? "दुआ खोजें..." : "Search dua..."}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setIndex(0); }}
            className="pl-9"
            data-testid="input-dua-search"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={section === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => { setSection("all"); setIndex(0); }}
          data-testid="btn-dua-section-all"
        >
          {duaLang === "ur" ? "سب" : duaLang === "hi" ? "सभी" : "All"} ({DUAS.length})
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
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {duaLang === "ur" ? `دعا #${current.id}` : duaLang === "hi" ? `दुआ #${current.id}` : `Dua #${current.id}`}
                </p>
                <CardTitle className={`text-xl mt-1 ${duaLang === "ur" ? "urdu-text" : ""}`} dir={duaLang === "ur" ? "rtl" : "ltr"}>
                  {current.title[duaLang]}
                </CardTitle>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={toggleFav} data-testid="btn-fav-dua" title="Favorite">
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
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {duaLang === "ur" ? "ترجمہ" : duaLang === "hi" ? "अनुवाद" : "Translation"}
              </p>
              <p
                className={`text-lg leading-relaxed ${duaLang === "ur" ? "urdu-text" : ""}`}
                dir={duaLang === "ur" ? "rtl" : "ltr"}
              >
                {current.translation[duaLang]}
              </p>
            </div>
            {current.reference && (
              <div className="pt-3 border-t flex justify-between items-center">
                <span className="text-sm font-medium text-primary">
                  {duaLang === "ur" ? "حوالہ: " : duaLang === "hi" ? "संदर्भ: " : "Reference: "}
                  {current.reference}
                </span>
                <Button variant="outline" size="sm" onClick={copyText} data-testid="btn-copy-dua">
                  {duaLang === "ur" ? "نقل کریں" : duaLang === "hi" ? "कॉपी करें" : "Copy"}
                </Button>
              </div>
            )}
            {!current.reference && (
              <div className="pt-3 border-t flex justify-end">
                <Button variant="outline" size="sm" onClick={copyText} data-testid="btn-copy-dua">
                  {duaLang === "ur" ? "نقل کریں" : duaLang === "hi" ? "कॉपी करें" : "Copy"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="p-8 text-center border rounded-md text-muted-foreground bg-card">
          {duaLang === "ur" ? "کوئی دعا نہیں ملی" : duaLang === "hi" ? "कोई दुआ नहीं मिली" : "No dua found"}
        </div>
      )}

      {filtered.length > 0 && (
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => setIndex(Math.max(0, safeIndex - 1))}
            disabled={safeIndex === 0}
            data-testid="btn-prev-dua"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {duaLang === "ur" ? "پچھلی" : duaLang === "hi" ? "पिछली" : "Previous"}
          </Button>
          <span className="text-sm font-medium">
            {safeIndex + 1} / {filtered.length}
          </span>
          <Button
            variant="outline"
            onClick={() => setIndex(Math.min(filtered.length - 1, safeIndex + 1))}
            disabled={safeIndex >= filtered.length - 1}
            data-testid="btn-next-dua"
          >
            {duaLang === "ur" ? "اگلی" : duaLang === "hi" ? "अगली" : "Next"}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
