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
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Shield,
  Star,
  Zap,
  X,
  Menu,
  CheckCircle,
  Eye,
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

/* ─────────────────────────────────────────── Vehicle Card ── */
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

  return (
    <div
      onClick={onSelect}
      className="group relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-2"
      style={{
        background: "linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 4px 30px rgba(0,0,0,0.3)",
        animationDelay: `${index * 80}ms`,
      }}
      data-testid={`card-vehicle-${vehicle.id}`}
    >
      {/* Image Container */}
      <div className="relative h-52 overflow-hidden bg-gradient-to-br from-white/5 to-transparent">
        {img ? (
          <>
            <img
              src={img}
              alt={`${vehicle.manufacturer} ${vehicle.category}`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Car className="w-20 h-20 text-white/10" />
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white backdrop-blur-md"
            style={{ backgroundColor: primary + "cc" }}>
            متاح
          </span>
        </div>
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full text-xs font-medium text-white/90 bg-black/50 backdrop-blur-md border border-white/10">
            {vehicle.importType || "وكالة"}
          </span>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
          style={{ background: `${primary}22` }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20"
            style={{ backgroundColor: primary + "44" }}>
            <Eye className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Bottom info on image */}
        {vehicle.year && (
          <div className="absolute bottom-3 left-3">
            <span className="flex items-center gap-1 text-xs text-white/80 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
              <Calendar className="w-3 h-3" /> {vehicle.year}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5" dir="rtl">
        <h3 className="text-white font-bold text-lg leading-tight mb-1 group-hover:text-[#C79C45] transition-colors" style={{ color: undefined }}>
          {vehicle.manufacturer} {vehicle.category}
        </h3>
        <p className="text-white/40 text-sm mb-4 truncate">{vehicle.trimLevel}</p>

        <div className="flex items-center gap-3 text-white/40 text-xs mb-4 flex-wrap">
          {vehicle.color && (
            <span className="flex items-center gap-1">
              <Palette className="w-3 h-3" /> {vehicle.color}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          {settings.showPrices && vehicle.salePrice ? (
            <div>
              <p className="text-white/30 text-xs mb-0.5">السعر</p>
              <p className="text-xl font-bold" style={{ color: primary }}>
                {formatPrice(vehicle.salePrice)}
                <span className="text-xs font-normal text-white/40 mr-1">ر.س</span>
              </p>
            </div>
          ) : (
            <div />
          )}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
            style={{ backgroundColor: primary + "22", border: `1px solid ${primary}44` }}
          >
            <ArrowRight className="w-4 h-4" style={{ color: primary }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────── Vehicle Detail ── */
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
    { label: "الفئة", value: vehicle.category, icon: Car },
    { label: "درجة التجهيز", value: vehicle.trimLevel, icon: Star },
    { label: "سنة الصنع", value: vehicle.year, icon: Calendar },
    { label: "اللون الخارجي", value: vehicle.color, icon: Palette },
    { label: "اللون الداخلي", value: vehicle.interiorColor, icon: Palette },
    { label: "نوع الاستيراد", value: vehicle.importType, icon: Shield },
  ].filter((s) => s.value);

  return (
    <div dir="rtl">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 mb-8 text-sm font-medium transition-all duration-200 hover:gap-3"
        style={{ color: primary }}
        data-testid="button-back"
      >
        <ArrowRight className="w-4 h-4" /> العودة لجميع السيارات
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Image Gallery — 3 cols */}
        <div className="lg:col-span-3">
          <div
            className="rounded-3xl overflow-hidden mb-4 relative"
            style={{ height: "420px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {vehicle.images?.[activeImg] ? (
              <img
                src={vehicle.images[activeImg]}
                alt={`${vehicle.manufacturer} ${vehicle.category}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Car className="w-32 h-32 text-white/10" />
              </div>
            )}
            {/* Nav arrows */}
            {vehicle.images && vehicle.images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImg((p) => (p - 1 + vehicle.images.length) % vehicle.images.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 text-white bg-black/30 hover:bg-black/60 transition-all"
                  data-testid="button-prev-image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveImg((p) => (p + 1) % vehicle.images.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 text-white bg-black/30 hover:bg-black/60 transition-all"
                  data-testid="button-next-image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
            {/* Counter */}
            {vehicle.images && vehicle.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs text-white bg-black/50 backdrop-blur-md">
                {activeImg + 1} / {vehicle.images.length}
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {vehicle.images && vehicle.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {vehicle.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImg(idx)}
                  className="flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden transition-all duration-200"
                  style={{
                    border: `2px solid ${activeImg === idx ? primary : "rgba(255,255,255,0.1)"}`,
                    opacity: activeImg === idx ? 1 : 0.6,
                  }}
                  data-testid={`button-thumb-${idx}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Panel — 2 cols */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Title */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: primary }}>
                متاح
              </span>
              {vehicle.importType && (
                <span className="px-3 py-1 rounded-full text-xs border text-white/60" style={{ borderColor: "rgba(255,255,255,0.15)" }}>
                  {vehicle.importType}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-extrabold text-white leading-tight mb-1">
              {vehicle.manufacturer} {vehicle.category}
            </h1>
            <p className="text-white/50">{vehicle.trimLevel}</p>
          </div>

          {/* Price */}
          {settings.showPrices && vehicle.salePrice && (
            <div
              className="rounded-2xl p-5"
              style={{
                background: `linear-gradient(135deg, ${primary}15, ${primary}05)`,
                border: `1px solid ${primary}30`,
              }}
            >
              <p className="text-white/50 text-sm mb-1">السعر الإجمالي</p>
              <p className="text-4xl font-extrabold" style={{ color: primary }}>
                {formatPrice(vehicle.salePrice)}
                <span className="text-lg font-normal text-white/50 mr-2">ر.س</span>
              </p>
            </div>
          )}

          {/* Specs */}
          <div
            className="rounded-2xl p-4 grid grid-cols-2 gap-3"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            {specs.map((spec, i) => (
              <div key={i} className="flex flex-col gap-0.5">
                <p className="text-white/30 text-[10px] uppercase tracking-wider">{spec.label}</p>
                <p className="text-white text-sm font-semibold">{spec.value}</p>
              </div>
            ))}
          </div>

          {/* Notes */}
          {vehicle.notes && (
            <div
              className="rounded-2xl p-4 text-sm text-white/50 leading-relaxed"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              {vehicle.notes}
            </div>
          )}

          {/* CTA */}
          <div className="flex flex-col gap-3 mt-auto">
            {settings.whatsappNumber && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold text-white text-base transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                style={{ backgroundColor: "#25D366", boxShadow: "0 8px 25px rgba(37,211,102,0.3)" }}
                data-testid="button-whatsapp"
              >
                <MessageCircle className="w-5 h-5" />
                استفسر عبر واتساب
              </a>
            )}
            {settings.phone && (
              <a
                href={`tel:${settings.phone}`}
                className="flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold text-black text-base transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                style={{ backgroundColor: primary, boxShadow: `0 8px 25px ${primary}40` }}
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

/* ─────────────────────────────────────────── Main Page ── */
export default function ShowroomPage() {
  const params = useParams();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(
    params?.id ? parseInt(params.id) : null
  );
  const [filterManufacturer, setFilterManufacturer] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#080d1a" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse"
            style={{ background: "linear-gradient(135deg, #C79C45, #B8862F)" }}>
            <Car className="w-8 h-8 text-black" />
          </div>
          <p className="text-white/40 text-sm">جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  const s = settings || ({} as WebsiteSettings);
  const primary = s.primaryColor || "#C79C45";
  const bgBase = s.heroBgColor || "#080d1a";

  if (!s.isPublished) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: bgBase }} dir="rtl">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: `${primary}22`, border: `1px solid ${primary}33` }}>
            <Car className="w-10 h-10" style={{ color: primary }} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">الموقع قيد الإنشاء</h1>
          <p className="text-white/40">سيكون الموقع متاحاً قريباً</p>
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
      style={{ background: `linear-gradient(160deg, ${bgBase} 0%, #0d1525 60%, ${bgBase} 100%)` }}
      dir="rtl"
    >
      {/* ── HEADER ── */}
      <header
        className="sticky top-0 z-50 w-full"
        style={{
          background: `${bgBase}ee`,
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            {s.logoUrl ? (
              <img src={s.logoUrl} alt={s.companyName} className="h-9 w-9 object-contain rounded-xl" />
            ) : (
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${primary}, ${primary}88)` }}
              >
                <Car className="w-5 h-5 text-black" />
              </div>
            )}
            <div>
              <p className="font-extrabold text-white text-base leading-none">{s.companyName || "معرض السيارات"}</p>
              {s.tagline && <p className="text-white/35 text-[10px] mt-0.5">{s.tagline}</p>}
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-white/60">
            {s.phone && (
              <a href={`tel:${s.phone}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Phone className="w-3.5 h-3.5" /> {s.phone}
              </a>
            )}
            {s.address && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> {s.address}
              </span>
            )}
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            {s.whatsappNumber && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105"
                style={{ backgroundColor: "#25D366", boxShadow: "0 4px 15px rgba(37,211,102,0.35)" }}
                data-testid="button-header-whatsapp"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">واتساب</span>
              </a>
            )}
            <button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-white/10 text-white/60 hover:text-white transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              data-testid="button-menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden px-5 pb-4 flex flex-col gap-3 text-sm text-white/70 border-t border-white/5 pt-3">
            {s.phone && (
              <a href={`tel:${s.phone}`} className="flex items-center gap-2">
                <Phone className="w-4 h-4" /> {s.phone}
              </a>
            )}
            {s.address && (
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" /> {s.address}
              </span>
            )}
          </div>
        )}
      </header>

      {/* ── HERO (hidden on detail view) ── */}
      {!selectedVehicle && (
        <section className="relative overflow-hidden">
          {/* Decorative bg glow */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-15 blur-[120px]"
              style={{ backgroundColor: primary }}
            />
            <div
              className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full opacity-10 blur-[100px]"
              style={{ backgroundColor: primary }}
            />
          </div>

          <div className="relative max-w-7xl mx-auto px-5 pt-20 pb-16 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 border"
              style={{ color: primary, borderColor: `${primary}40`, backgroundColor: `${primary}12` }}>
              <Zap className="w-3 h-3" />
              {available.length} سيارة متاحة الآن
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold mb-5 leading-tight tracking-tight">
              <span className="text-white">{(s.heroTitle || "اكتشف سيارة أحلامك").split(" ").slice(0, -1).join(" ")} </span>
              <span style={{
                background: `linear-gradient(135deg, ${primary}, #fff5d6)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                {(s.heroTitle || "اكتشف سيارة أحلامك").split(" ").slice(-1)[0]}
              </span>
            </h1>
            <p className="text-white/50 text-lg md:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
              {s.heroSubtitle || "تشكيلة واسعة من السيارات الفاخرة والعملية"}
            </p>

            {/* Search */}
            <div className="max-w-lg mx-auto relative">
              <div
                className="flex items-center gap-3 rounded-2xl px-5 py-3.5"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <Search className="w-5 h-5 flex-shrink-0" style={{ color: primary }} />
                <input
                  type="text"
                  placeholder="ابحث عن سيارة... (ماركة، فئة، موديل)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-white placeholder:text-white/30 text-sm text-right"
                  data-testid="input-search"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="text-white/30 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 mt-12 flex-wrap">
              {[
                { value: available.length, label: "سيارة متاحة" },
                { value: manufacturers.length, label: "علامة تجارية" },
                { value: "100%", label: "ضمان الجودة" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-3xl font-extrabold" style={{ color: primary }}>{stat.value}</p>
                  <p className="text-white/40 text-xs mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-7xl mx-auto px-5 pb-20">
        {selectedVehicle ? (
          <div className="pt-10">
            <VehicleDetail vehicle={selectedVehicle} settings={s} onBack={() => setSelectedId(null)} />
          </div>
        ) : (
          <>
            {/* Filter Bar */}
            {manufacturers.length > 0 && (
              <div className="flex gap-2.5 mb-8 overflow-x-auto pb-2 scrollbar-none">
                <button
                  onClick={() => setFilterManufacturer("")}
                  className="flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200"
                  style={
                    !filterManufacturer
                      ? { backgroundColor: primary, color: "#000", boxShadow: `0 4px 15px ${primary}50` }
                      : { backgroundColor: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)" }
                  }
                  data-testid="filter-all"
                >
                  الكل ({available.length})
                </button>
                {manufacturers.map((mfr) => (
                  <button
                    key={mfr}
                    onClick={() => setFilterManufacturer(mfr === filterManufacturer ? "" : mfr)}
                    className="flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200"
                    style={
                      filterManufacturer === mfr
                        ? { backgroundColor: primary, color: "#000", boxShadow: `0 4px 15px ${primary}50` }
                        : { backgroundColor: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)" }
                    }
                    data-testid={`filter-${mfr}`}
                  >
                    {mfr} ({available.filter((v) => v.manufacturer === mfr).length})
                  </button>
                ))}
              </div>
            )}

            {/* Results Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-white/30 text-sm">
                {filtered.length > 0 ? `${filtered.length} سيارة` : "لا توجد نتائج"}
              </p>
              {search && (
                <p className="text-white/30 text-sm">
                  نتائج البحث عن: <span style={{ color: primary }}>"{search}"</span>
                </p>
              )}
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: `${primary}12`, border: `1px solid ${primary}25` }}
                >
                  <Car className="w-10 h-10" style={{ color: primary + "60" }} />
                </div>
                <p className="text-white/40 text-lg font-medium mb-2">لا توجد سيارات متاحة حالياً</p>
                <p className="text-white/20 text-sm">تفقد مرة أخرى قريباً</p>
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

      {/* ── FOOTER ── */}
      <footer
        className="border-t"
        style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.3)" }}
      >
        <div className="max-w-7xl mx-auto px-5 py-10" dir="rtl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${primary}, ${primary}88)` }}
                >
                  <Car className="w-4 h-4 text-black" />
                </div>
                <p className="font-bold text-white">{s.companyName || "معرض السيارات"}</p>
              </div>
              {s.tagline && <p className="text-white/30 text-xs">{s.tagline}</p>}
            </div>

            {/* Contact */}
            <div className="flex flex-col gap-2 text-sm text-white/40">
              {s.address && (
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> {s.address}
                </span>
              )}
              {s.phone && (
                <a href={`tel:${s.phone}`} className="flex items-center gap-2 hover:text-white transition-colors">
                  <Phone className="w-4 h-4" /> {s.phone}
                </a>
              )}
            </div>

            {/* Social */}
            <div className="flex items-center gap-3">
              {s.socialInstagram && (
                <a
                  href={`https://instagram.com/${s.socialInstagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
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
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
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
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                  style={{ backgroundColor: "#25D366" }}
                  data-testid="link-whatsapp-footer"
                >
                  <MessageCircle className="w-4 h-4 text-white" />
                </a>
              )}
            </div>
          </div>

          <div
            className="mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-white/20 text-xs"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
          >
            <p>جميع الحقوق محفوظة © {new Date().getFullYear()} {s.companyName}</p>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span>موقع موثوق وآمن</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Floating WhatsApp Button ── */}
      {s.whatsappNumber && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-5 py-3.5 rounded-2xl text-white font-bold text-sm transition-all duration-300 hover:scale-105"
          style={{
            backgroundColor: "#25D366",
            boxShadow: "0 8px 30px rgba(37,211,102,0.5)",
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
