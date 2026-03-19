import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import {
  Phone,
  MessageCircle,
  MapPin,
  Search,
  Instagram,
  Twitter,
  Car,
  Palette,
  Calendar,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Shield,
  Star,
  X,
  Menu,
  CheckCircle,
  Eye,
  Gauge,
  Tag,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
} from "lucide-react";

interface WebsiteSettings {
  companyName: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  logoUrl: string;
  heroBgColor: string;
  primaryColor: string;
  whatsappNumber: string;
  phone: string;
  address: string;
  socialInstagram: string;
  socialTwitter: string;
  isPublished: boolean;
  showPrices: boolean;
  showFinancing: boolean;
}

interface Vehicle {
  id: number;
  manufacturer: string;
  category: string;
  trimLevel: string;
  year: string;
  color: string;
  interiorColor: string;
  importType: string;
  status: string;
  salePrice: string;
  images: string[];
  notes: string;
  chassisNumber: string;
}

function formatPrice(price: string | number) {
  const n = typeof price === "string" ? parseFloat(price) : price;
  if (!n || isNaN(n)) return "";
  return n.toLocaleString("ar-SA");
}

/* ──────────────────────────────── Particle / Glow BG ── */
function GlowOrbs({ primary }: { primary: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full opacity-[0.07] blur-[140px]"
        style={{ backgroundColor: primary }}
      />
      <div
        className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.05] blur-[120px]"
        style={{ backgroundColor: primary }}
      />
      <div
        className="absolute top-[40%] left-[30%] w-[400px] h-[400px] rounded-full opacity-[0.04] blur-[100px]"
        style={{ backgroundColor: primary }}
      />
    </div>
  );
}

/* ──────────────────────────────── Vehicle Card ── */
function VehicleCard({
  vehicle,
  settings,
  onSelect,
  index,
}: {
  vehicle: Vehicle;
  settings: WebsiteSettings;
  onSelect: () => void;
  index: number;
}) {
  const primary = settings.primaryColor || "#C79C45";
  const img = vehicle.images?.[0];
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative cursor-pointer"
      style={{
        animationDelay: `${index * 60}ms`,
      }}
      data-testid={`card-vehicle-${vehicle.id}`}
    >
      {/* Card Shell */}
      <div
        className="relative rounded-2xl overflow-hidden transition-all duration-500"
        style={{
          background: "linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
          border: hovered ? `1px solid ${primary}55` : "1px solid rgba(255,255,255,0.07)",
          boxShadow: hovered
            ? `0 30px 60px rgba(0,0,0,0.5), 0 0 0 1px ${primary}22, inset 0 1px 0 rgba(255,255,255,0.1)`
            : "0 8px 30px rgba(0,0,0,0.25)",
          transform: hovered ? "translateY(-8px) scale(1.01)" : "translateY(0) scale(1)",
        }}
      >
        {/* Image Area */}
        <div className="relative overflow-hidden" style={{ height: "220px" }}>
          {img ? (
            <>
              <img
                src={img}
                alt={`${vehicle.manufacturer} ${vehicle.category}`}
                className="w-full h-full object-cover transition-transform duration-700"
                style={{ transform: hovered ? "scale(1.08)" : "scale(1)" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              {/* Shimmer line */}
              <div
                className="absolute top-0 left-0 right-0 h-px opacity-50"
                style={{ background: `linear-gradient(90deg, transparent, ${primary}, transparent)` }}
              />
            </>
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                background: `radial-gradient(circle at center, ${primary}08 0%, transparent 70%)`,
              }}
            >
              <Car className="w-20 h-20" style={{ color: primary + "20" }} />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 right-3">
            <span
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wider text-black"
              style={{
                background: `linear-gradient(135deg, ${primary}, ${primary}bb)`,
                boxShadow: `0 2px 12px ${primary}60`,
              }}
            >
              متاح
            </span>
          </div>
          {vehicle.importType && (
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-white/80 bg-black/60 backdrop-blur-md border border-white/10">
                {vehicle.importType}
              </span>
            </div>
          )}

          {/* View overlay */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-all duration-300"
            style={{ opacity: hovered ? 1 : 0, background: `${primary}12` }}
          >
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-black"
              style={{
                background: `linear-gradient(135deg, ${primary}, ${primary}dd)`,
                boxShadow: `0 4px 20px ${primary}60`,
              }}
            >
              <Eye className="w-4 h-4" />
              عرض التفاصيل
            </div>
          </div>

          {/* Year tag */}
          {vehicle.year && (
            <div className="absolute bottom-3 right-3">
              <span className="flex items-center gap-1 text-[11px] font-bold text-white bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/10">
                <Calendar className="w-3 h-3" style={{ color: primary }} />
                {vehicle.year}
              </span>
            </div>
          )}
        </div>

        {/* Info Area */}
        <div className="p-5" dir="rtl">
          {/* Name */}
          <div className="mb-4">
            <h3
              className="font-extrabold text-white text-xl leading-tight mb-1 transition-colors duration-300"
              style={{ color: hovered ? primary : "white" }}
            >
              {vehicle.manufacturer} {vehicle.category}
            </h3>
            {vehicle.trimLevel && (
              <p className="text-white/35 text-sm truncate">{vehicle.trimLevel}</p>
            )}
          </div>

          {/* Color chip */}
          {vehicle.color && (
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full border border-white/20 bg-gray-400/50" />
              <span className="text-white/40 text-xs">{vehicle.color}</span>
            </div>
          )}

          {/* Divider */}
          <div
            className="h-px mb-4 transition-all duration-500"
            style={{
              background: hovered
                ? `linear-gradient(90deg, ${primary}40, transparent)`
                : "rgba(255,255,255,0.06)",
            }}
          />

          {/* Price + Arrow */}
          <div className="flex items-center justify-between">
            {settings.showPrices && vehicle.salePrice ? (
              <div>
                <p className="text-white/25 text-[10px] uppercase tracking-widest mb-0.5">السعر</p>
                <p className="font-extrabold text-lg leading-none" style={{ color: primary }}>
                  {formatPrice(vehicle.salePrice)}
                  <span className="text-xs font-normal text-white/30 mr-1.5">ر.س</span>
                </p>
              </div>
            ) : (
              <div />
            )}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300"
              style={{
                background: hovered ? primary : `${primary}18`,
                border: `1px solid ${primary}30`,
                boxShadow: hovered ? `0 4px 16px ${primary}50` : "none",
              }}
            >
              <ArrowLeft className="w-4 h-4" style={{ color: hovered ? "black" : primary }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────── Vehicle Detail ── */
function VehicleDetail({
  vehicle,
  settings,
  onBack,
}: {
  vehicle: Vehicle;
  settings: WebsiteSettings;
  onBack: () => void;
}) {
  const [activeImg, setActiveImg] = useState(0);
  const primary = settings.primaryColor || "#C79C45";
  const whatsappMsg = encodeURIComponent(
    `مرحباً، أريد الاستفسار عن: ${vehicle.manufacturer} ${vehicle.category} ${vehicle.trimLevel || ""} ${vehicle.year || ""}`
  );
  const whatsappUrl = settings.whatsappNumber
    ? `https://wa.me/${settings.whatsappNumber}?text=${whatsappMsg}`
    : "#";

  const specs = [
    { label: "الشركة المصنعة", value: vehicle.manufacturer, icon: Car },
    { label: "الفئة", value: vehicle.category, icon: Gauge },
    { label: "درجة التجهيز", value: vehicle.trimLevel, icon: Star },
    { label: "سنة الصنع", value: vehicle.year, icon: Calendar },
    { label: "اللون الخارجي", value: vehicle.color, icon: Palette },
    { label: "اللون الداخلي", value: vehicle.interiorColor, icon: Palette },
    { label: "نوع الاستيراد", value: vehicle.importType, icon: Shield },
  ].filter((s) => s.value);

  return (
    <div dir="rtl" className="animate-in fade-in duration-300">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 mb-8 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 hover:gap-3"
        style={{
          color: primary,
          background: `${primary}12`,
          border: `1px solid ${primary}25`,
        }}
        data-testid="button-back"
      >
        <ArrowLeft className="w-4 h-4" />
        العودة لجميع السيارات
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 xl:gap-12">
        {/* ── Gallery ── */}
        <div className="lg:col-span-3">
          {/* Main Image */}
          <div
            className="rounded-2xl overflow-hidden relative mb-3"
            style={{
              height: "440px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {vehicle.images?.[activeImg] ? (
              <img
                src={vehicle.images[activeImg]}
                alt={`${vehicle.manufacturer} ${vehicle.category}`}
                className="w-full h-full object-cover"
                key={activeImg}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Car className="w-28 h-28" style={{ color: primary + "20" }} />
              </div>
            )}

            {/* Top shimmer */}
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${primary}60, transparent)` }}
            />

            {/* Nav Arrows */}
            {vehicle.images && vehicle.images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setActiveImg((p) => (p - 1 + vehicle.images.length) % vehicle.images.length); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md border border-white/15 text-white bg-black/40 hover:bg-black/70 transition-all hover:scale-110"
                  data-testid="button-prev-image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setActiveImg((p) => (p + 1) % vehicle.images.length); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md border border-white/15 text-white bg-black/40 hover:bg-black/70 transition-all hover:scale-110"
                  data-testid="button-next-image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-black/60 backdrop-blur-md border border-white/10">
                    {activeImg + 1} / {vehicle.images.length}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {vehicle.images && vehicle.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {vehicle.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImg(idx)}
                  className="flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden transition-all duration-200 hover:opacity-100"
                  style={{
                    border: `2px solid ${activeImg === idx ? primary : "rgba(255,255,255,0.08)"}`,
                    opacity: activeImg === idx ? 1 : 0.5,
                    boxShadow: activeImg === idx ? `0 0 12px ${primary}50` : "none",
                  }}
                  data-testid={`button-thumb-${idx}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Info Panel ── */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Badges + Title */}
          <div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span
                className="px-3 py-1 rounded-lg text-xs font-bold text-black"
                style={{ background: `linear-gradient(135deg, ${primary}, ${primary}bb)` }}
              >
                متاح
              </span>
              {vehicle.importType && (
                <span className="px-3 py-1 rounded-lg text-xs border text-white/50"
                  style={{ borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)" }}>
                  {vehicle.importType}
                </span>
              )}
            </div>
            <h1 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight mb-1">
              {vehicle.manufacturer}{" "}
              <span style={{
                background: `linear-gradient(135deg, ${primary}, #fff8e1)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                {vehicle.category}
              </span>
            </h1>
            {vehicle.trimLevel && (
              <p className="text-white/40 text-base">{vehicle.trimLevel}</p>
            )}
          </div>

          {/* Price Card */}
          {settings.showPrices && vehicle.salePrice && (
            <div
              className="rounded-2xl p-5 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${primary}15, ${primary}05)`,
                border: `1px solid ${primary}30`,
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${primary}60, transparent)` }}
              />
              <p className="text-white/40 text-xs uppercase tracking-widest mb-2">السعر الإجمالي</p>
              <p className="font-extrabold leading-none" style={{ color: primary, fontSize: "2.5rem" }}>
                {formatPrice(vehicle.salePrice)}
                <span className="text-lg font-normal text-white/40 mr-2">ر.س</span>
              </p>
            </div>
          )}

          {/* Specs Grid */}
          <div
            className="rounded-2xl p-4 grid grid-cols-2 gap-3"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            {specs.map((spec, i) => (
              <div
                key={i}
                className="rounded-xl p-3"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <p className="text-white/25 text-[10px] uppercase tracking-widest mb-1">{spec.label}</p>
                <p className="text-white text-sm font-semibold">{spec.value}</p>
              </div>
            ))}
          </div>

          {/* Notes */}
          {vehicle.notes && (
            <div
              className="rounded-2xl p-4 text-sm text-white/40 leading-relaxed"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              {vehicle.notes}
            </div>
          )}

          {/* CTAs */}
          <div className="flex flex-col gap-3 mt-auto">
            {settings.whatsappNumber && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold text-white text-base transition-all duration-300 hover:scale-[1.02]"
                style={{
                  backgroundColor: "#25D366",
                  boxShadow: "0 8px 30px rgba(37,211,102,0.35)",
                }}
                data-testid="button-whatsapp"
              >
                <MessageCircle className="w-5 h-5" />
                استفسر عبر واتساب
              </a>
            )}
            {settings.phone && (
              <a
                href={`tel:${settings.phone}`}
                className="flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold text-black text-base transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: `linear-gradient(135deg, ${primary}, ${primary}cc)`,
                  boxShadow: `0 8px 30px ${primary}40`,
                }}
                data-testid="button-call"
              >
                <Phone className="w-5 h-5" />
                اتصل بنا الآن
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────── Main Page ── */
export default function ShowroomPage() {
  const params = useParams();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(
    params?.id ? parseInt(params.id) : null
  );
  const [filterManufacturer, setFilterManufacturer] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const { data: settings, isLoading: settingsLoading } = useQuery<WebsiteSettings>({
    queryKey: ["/api/website/settings"],
  });

  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/website/vehicles"],
  });

  const selectedVehicle = selectedId ? vehicles.find((v) => v.id === selectedId) : null;
  const available = vehicles.filter((v) => v.status === "متاح" || v.status === "available");
  const manufacturers = [...new Set(available.map((v) => v.manufacturer))];
  const filtered = available.filter((v) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      v.manufacturer?.toLowerCase().includes(q) ||
      v.category?.toLowerCase().includes(q) ||
      v.trimLevel?.toLowerCase().includes(q);
    const matchMfr = !filterManufacturer || v.manufacturer === filterManufacturer;
    return matchSearch && matchMfr;
  });

  if (settingsLoading || vehiclesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#06080f" }}>
        <div className="flex flex-col items-center gap-5">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #C79C45, #8B6914)", boxShadow: "0 0 40px #C79C4550" }}
          >
            <Car className="w-8 h-8 text-black animate-pulse" />
          </div>
          <p className="text-white/30 text-sm tracking-widest uppercase">جارٍ التحميل</p>
        </div>
      </div>
    );
  }

  const s = settings || ({} as WebsiteSettings);
  const primary = s.primaryColor || "#C79C45";
  const bgBase = s.heroBgColor || "#06080f";

  if (!s.isPublished) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: bgBase }} dir="rtl">
        <div className="text-center">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: `${primary}15`, border: `1px solid ${primary}25` }}
          >
            <Car className="w-10 h-10" style={{ color: primary }} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">الموقع قيد الإنشاء</h1>
          <p className="text-white/30">سيكون الموقع متاحاً قريباً</p>
        </div>
      </div>
    );
  }

  const whatsappMsg = encodeURIComponent("مرحباً، أريد الاستفسار عن سياراتكم");
  const whatsappUrl = s.whatsappNumber
    ? `https://wa.me/${s.whatsappNumber}?text=${whatsappMsg}`
    : "#";

  return (
    <div
      className="min-h-screen text-white"
      style={{ background: bgBase }}
      dir="rtl"
    >
      {/* ═══════════════════════════════ HEADER ══ */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled
            ? `${bgBase}f0`
            : "transparent",
          backdropFilter: scrolled ? "blur(24px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
        }}
      >
        <div className="max-w-7xl mx-auto px-5 lg:px-8 h-18 flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            {s.logoUrl ? (
              <img src={s.logoUrl} alt={s.companyName} className="h-10 w-10 object-contain rounded-xl" />
            ) : (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${primary}, ${primary}88)`,
                  boxShadow: `0 4px 20px ${primary}40`,
                }}
              >
                <Car className="w-5 h-5 text-black" />
              </div>
            )}
            <div>
              <p className="font-extrabold text-white text-base leading-none tracking-tight">
                {s.companyName || "معرض السيارات"}
              </p>
              {s.tagline && (
                <p className="text-white/30 text-[10px] mt-0.5 tracking-wide">{s.tagline}</p>
              )}
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-white/50">
            {s.phone && (
              <a
                href={`tel:${s.phone}`}
                className="flex items-center gap-1.5 hover:text-white transition-colors duration-200"
              >
                <Phone className="w-3.5 h-3.5" style={{ color: primary }} />
                {s.phone}
              </a>
            )}
            {s.address && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" style={{ color: primary }} />
                {s.address}
              </span>
            )}
          </nav>

          {/* Header CTA */}
          <div className="flex items-center gap-3">
            {s.whatsappNumber && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:scale-105"
                style={{
                  backgroundColor: "#25D366",
                  boxShadow: "0 4px 20px rgba(37,211,102,0.3)",
                }}
                data-testid="button-header-whatsapp"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">واتساب</span>
              </a>
            )}
            <button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl transition-colors"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              onClick={() => setMenuOpen(!menuOpen)}
              data-testid="button-menu"
            >
              {menuOpen ? <X className="w-5 h-5 text-white/70" /> : <Menu className="w-5 h-5 text-white/70" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {menuOpen && (
          <div
            className="md:hidden px-5 pb-5 pt-4 flex flex-col gap-4 text-sm"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: `${bgBase}f8` }}
          >
            {s.phone && (
              <a href={`tel:${s.phone}`} className="flex items-center gap-2 text-white/60 hover:text-white">
                <Phone className="w-4 h-4" style={{ color: primary }} /> {s.phone}
              </a>
            )}
            {s.address && (
              <span className="flex items-center gap-2 text-white/60">
                <MapPin className="w-4 h-4" style={{ color: primary }} /> {s.address}
              </span>
            )}
          </div>
        )}
      </header>

      {/* ═══════════════════════════════ HERO ══ */}
      {!selectedVehicle && (
        <section ref={heroRef} className="relative min-h-screen flex flex-col justify-center overflow-hidden">
          <GlowOrbs primary={primary} />

          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
              backgroundSize: "80px 80px",
            }}
          />

          {/* Diagonal accent */}
          <div
            className="absolute top-0 right-0 w-1/2 h-full opacity-[0.03]"
            style={{
              background: `linear-gradient(135deg, ${primary} 0%, transparent 60%)`,
            }}
          />

          <div className="relative max-w-7xl mx-auto px-5 lg:px-8 pt-32 pb-20 text-center">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full text-sm font-semibold mb-10 border"
              style={{
                color: primary,
                borderColor: `${primary}30`,
                background: `${primary}0d`,
                backdropFilter: "blur(8px)",
              }}>
              <Sparkles className="w-4 h-4" />
              {available.length} سيارة متاحة الآن
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: primary }}
              />
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl xl:text-8xl font-extrabold mb-6 leading-[1.05] tracking-tight">
              <span className="text-white">
                {(s.heroTitle || "اكتشف سيارة أحلامك").split(" ").slice(0, -1).join(" ")}{" "}
              </span>
              <br className="hidden sm:block" />
              <span
                style={{
                  background: `linear-gradient(135deg, ${primary} 0%, #fff8e1 50%, ${primary} 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {(s.heroTitle || "اكتشف سيارة أحلامك").split(" ").slice(-1)[0]}
              </span>
            </h1>

            <p className="text-white/40 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
              {s.heroSubtitle || "تشكيلة واسعة من السيارات الفاخرة والعملية بأفضل الأسعار"}
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto mb-14">
              <div
                className="flex items-center gap-3 rounded-2xl px-5 py-4 transition-all duration-300"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  backdropFilter: "blur(16px)",
                  boxShadow: `0 0 0 0px ${primary}00`,
                }}
              >
                <Search className="w-5 h-5 flex-shrink-0" style={{ color: primary }} />
                <input
                  type="text"
                  placeholder="ابحث بالماركة، الفئة أو الموديل..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-white placeholder:text-white/25 text-sm text-right"
                  data-testid="input-search"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="text-white/25 hover:text-white/70 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex items-center justify-center gap-12 flex-wrap">
              {[
                { value: available.length, label: "سيارة متاحة" },
                { value: manufacturers.length, label: "علامة تجارية" },
                { value: "100%", label: "ضمان الجودة" },
              ].map((stat, i) => (
                <div key={i} className="text-center group">
                  <p
                    className="text-4xl font-extrabold leading-none mb-1.5"
                    style={{ color: primary }}
                  >
                    {stat.value}
                  </p>
                  <p className="text-white/30 text-xs uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Scroll indicator */}
            <div className="mt-20 flex flex-col items-center gap-2 animate-bounce">
              <ChevronDown className="w-5 h-5 text-white/20" />
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════ MAIN CONTENT ══ */}
      <main
        className="max-w-7xl mx-auto px-5 lg:px-8 pb-24"
        style={{ paddingTop: selectedVehicle ? "100px" : "0" }}
      >
        {selectedVehicle ? (
          <VehicleDetail vehicle={selectedVehicle} settings={s} onBack={() => setSelectedId(null)} />
        ) : (
          <>
            {/* Section Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-extrabold text-white mb-1">
                  {filterManufacturer ? filterManufacturer : "جميع السيارات"}
                </h2>
                <p className="text-white/30 text-sm">
                  {filtered.length > 0 ? `${filtered.length} سيارة متاحة` : "لا توجد نتائج"}
                </p>
              </div>
              {search && (
                <p className="text-white/30 text-sm">
                  نتائج البحث: <span style={{ color: primary }}>"{search}"</span>
                </p>
              )}
            </div>

            {/* Filter Chips */}
            {manufacturers.length > 0 && (
              <div className="flex gap-2.5 mb-10 overflow-x-auto pb-2 scrollbar-none">
                <button
                  onClick={() => setFilterManufacturer("")}
                  className="flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105"
                  style={
                    !filterManufacturer
                      ? {
                          background: `linear-gradient(135deg, ${primary}, ${primary}bb)`,
                          color: "#000",
                          boxShadow: `0 4px 20px ${primary}50`,
                        }
                      : {
                          background: "rgba(255,255,255,0.05)",
                          color: "rgba(255,255,255,0.5)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }
                  }
                  data-testid="filter-all"
                >
                  الكل <span className="opacity-60 font-normal mr-1">({available.length})</span>
                </button>
                {manufacturers.map((mfr) => (
                  <button
                    key={mfr}
                    onClick={() => setFilterManufacturer(mfr === filterManufacturer ? "" : mfr)}
                    className="flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105"
                    style={
                      filterManufacturer === mfr
                        ? {
                            background: `linear-gradient(135deg, ${primary}, ${primary}bb)`,
                            color: "#000",
                            boxShadow: `0 4px 20px ${primary}50`,
                          }
                        : {
                            background: "rgba(255,255,255,0.05)",
                            color: "rgba(255,255,255,0.5)",
                            border: "1px solid rgba(255,255,255,0.08)",
                          }
                    }
                    data-testid={`filter-${mfr}`}
                  >
                    {mfr}{" "}
                    <span className="opacity-60 font-normal mr-1">
                      ({available.filter((v) => v.manufacturer === mfr).length})
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Grid / Empty */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-40 text-center">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: `${primary}10`, border: `1px solid ${primary}20` }}
                >
                  <Car className="w-10 h-10" style={{ color: primary + "50" }} />
                </div>
                <p className="text-white/30 text-lg font-semibold mb-2">لا توجد سيارات متاحة حالياً</p>
                <p className="text-white/15 text-sm">تفقد مرة أخرى قريباً</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filtered.map((v, i) => (
                  <VehicleCard
                    key={v.id}
                    vehicle={v}
                    settings={s}
                    onSelect={() => setSelectedId(v.id)}
                    index={i}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* ═══════════════════════════════ FOOTER ══ */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.4)" }}>
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-12" dir="rtl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${primary}, ${primary}88)` }}
                >
                  <Car className="w-4 h-4 text-black" />
                </div>
                <p className="font-bold text-white text-base">{s.companyName || "معرض السيارات"}</p>
              </div>
              {s.tagline && <p className="text-white/20 text-xs mr-12">{s.tagline}</p>}
            </div>

            {/* Contact */}
            <div className="flex flex-col gap-2.5 text-sm text-white/35">
              {s.address && (
                <span className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" style={{ color: primary }} /> {s.address}
                </span>
              )}
              {s.phone && (
                <a href={`tel:${s.phone}`} className="flex items-center gap-2 hover:text-white transition-colors">
                  <Phone className="w-3.5 h-3.5" style={{ color: primary }} /> {s.phone}
                </a>
              )}
            </div>

            {/* Social */}
            <div className="flex items-center gap-2.5">
              {s.socialInstagram && (
                <a
                  href={`https://instagram.com/${s.socialInstagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                  data-testid="link-instagram"
                >
                  <Instagram className="w-4 h-4 text-pink-400" />
                </a>
              )}
              {s.socialTwitter && (
                <a
                  href={`https://twitter.com/${s.socialTwitter.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                  data-testid="link-twitter"
                >
                  <Twitter className="w-4 h-4 text-sky-400" />
                </a>
              )}
              {s.whatsappNumber && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                  style={{ backgroundColor: "#25D366", boxShadow: "0 4px 15px rgba(37,211,102,0.3)" }}
                  data-testid="link-whatsapp-footer"
                >
                  <MessageCircle className="w-4 h-4 text-white" />
                </a>
              )}
            </div>
          </div>

          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-3 text-white/15 text-xs pt-6"
            style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
          >
            <p>جميع الحقوق محفوظة © {new Date().getFullYear()} {s.companyName}</p>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500/70" />
              <span>موقع موثوق وآمن</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ═══════════════════════════════ Floating WhatsApp ══ */}
      {s.whatsappNumber && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 left-6 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-2xl text-white font-bold text-sm transition-all duration-300 hover:scale-105"
          style={{
            backgroundColor: "#25D366",
            boxShadow: "0 8px 30px rgba(37,211,102,0.45)",
          }}
          data-testid="button-floating-whatsapp"
        >
          <MessageCircle className="w-5 h-5" />
          تواصل معنا
        </a>
      )}
    </div>
  );
}
