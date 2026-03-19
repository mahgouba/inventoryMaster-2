import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { 
  Phone, 
  MessageCircle, 
  MapPin, 
  ChevronLeft, 
  Search,
  Instagram,
  Twitter,
  Car,
  Fuel,
  Palette,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
}

function formatPrice(price: string | number) {
  const n = typeof price === "string" ? parseFloat(price) : price;
  if (!n || isNaN(n)) return "";
  return n.toLocaleString("ar-SA") + " ر.س";
}

function VehicleCard({ vehicle, settings, onSelect }: { vehicle: Vehicle; settings: WebsiteSettings; onSelect: () => void }) {
  const primaryImg = vehicle.images?.[0];
  return (
    <div
      onClick={onSelect}
      className="group rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur cursor-pointer hover:border-white/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      data-testid={`card-vehicle-${vehicle.id}`}
    >
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-white/5 to-white/10 overflow-hidden">
        {primaryImg ? (
          <img
            src={primaryImg}
            alt={`${vehicle.manufacturer} ${vehicle.category}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Car className="w-16 h-16 text-white/20" />
          </div>
        )}
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <Badge className="bg-emerald-500/90 text-white border-none text-xs">متاح</Badge>
        </div>
        {/* Import Type */}
        <div className="absolute top-3 left-3">
          <Badge className="bg-black/60 text-white border-none text-xs backdrop-blur">
            {vehicle.importType || "وكالة"}
          </Badge>
        </div>
      </div>

      {/* Info */}
      <div className="p-4" dir="rtl">
        <h3 className="text-white font-bold text-lg mb-1">
          {vehicle.manufacturer} {vehicle.category}
        </h3>
        <p className="text-white/50 text-sm mb-3">{vehicle.trimLevel}</p>

        <div className="flex items-center gap-4 text-white/50 text-xs mb-4">
          {vehicle.year && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {vehicle.year}
            </span>
          )}
          {vehicle.color && (
            <span className="flex items-center gap-1">
              <Palette className="w-3 h-3" /> {vehicle.color}
            </span>
          )}
        </div>

        {settings.showPrices && vehicle.salePrice && (
          <div
            className="text-lg font-bold"
            style={{ color: settings.primaryColor || "#C79C45" }}
          >
            {formatPrice(vehicle.salePrice)}
          </div>
        )}
      </div>
    </div>
  );
}

function VehicleDetail({ vehicle, settings, onBack }: { vehicle: Vehicle; settings: WebsiteSettings; onBack: () => void }) {
  const [activeImg, setActiveImg] = useState(0);
  const whatsappMsg = encodeURIComponent(
    `مرحباً، أريد الاستفسار عن: ${vehicle.manufacturer} ${vehicle.category} ${vehicle.trimLevel || ""} ${vehicle.year || ""}`
  );
  const whatsappUrl = settings.whatsappNumber
    ? `https://wa.me/${settings.whatsappNumber}?text=${whatsappMsg}`
    : "#";

  return (
    <div dir="rtl">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
        data-testid="button-back"
      >
        <ArrowRight className="w-4 h-4" /> العودة للسيارات
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="rounded-2xl overflow-hidden bg-white/5 border border-white/10 h-72 lg:h-96 mb-3">
            {vehicle.images?.[activeImg] ? (
              <img
                src={vehicle.images[activeImg]}
                alt={`${vehicle.manufacturer} ${vehicle.category}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Car className="w-24 h-24 text-white/20" />
              </div>
            )}
          </div>
          {vehicle.images && vehicle.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {vehicle.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImg(idx)}
                  className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImg === idx ? "border-[#C79C45]" : "border-white/10"
                  }`}
                  data-testid={`button-image-${idx}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="mb-2">
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 mb-3">متاح</Badge>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">
            {vehicle.manufacturer} {vehicle.category}
          </h1>
          <p className="text-white/50 mb-4">{vehicle.trimLevel}</p>

          {settings.showPrices && vehicle.salePrice && (
            <div
              className="text-3xl font-bold mb-6"
              style={{ color: settings.primaryColor || "#C79C45" }}
            >
              {formatPrice(vehicle.salePrice)}
            </div>
          )}

          {/* Specs Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { label: "الشركة المصنعة", value: vehicle.manufacturer },
              { label: "الفئة", value: vehicle.category },
              { label: "درجة التجهيز", value: vehicle.trimLevel },
              { label: "سنة الصنع", value: vehicle.year },
              { label: "اللون الخارجي", value: vehicle.color },
              { label: "اللون الداخلي", value: vehicle.interiorColor },
              { label: "نوع الاستيراد", value: vehicle.importType },
            ].filter(s => s.value).map((spec, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-white/40 text-xs mb-1">{spec.label}</p>
                <p className="text-white text-sm font-medium">{spec.value}</p>
              </div>
            ))}
          </div>

          {vehicle.notes && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
              <p className="text-white/50 text-sm leading-relaxed">{vehicle.notes}</p>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex gap-3">
            {settings.whatsappNumber && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: "#25D366" }}
                data-testid="button-whatsapp"
              >
                <MessageCircle className="w-5 h-5" /> واتساب
              </a>
            )}
            {settings.phone && (
              <a
                href={`tel:${settings.phone}`}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-black transition-all hover:opacity-90"
                style={{ backgroundColor: settings.primaryColor || "#C79C45" }}
                data-testid="button-call"
              >
                <Phone className="w-5 h-5" /> اتصل بنا
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShowroomPage() {
  const params = useParams();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(params?.id ? parseInt(params.id) : null);
  const [filterManufacturer, setFilterManufacturer] = useState("");

  const { data: settings, isLoading: settingsLoading } = useQuery<WebsiteSettings>({
    queryKey: ["/api/website/settings"],
  });

  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/website/vehicles"],
  });

  const selectedVehicle = selectedId ? vehicles.find(v => v.id === selectedId) : null;

  // Filter available vehicles
  const available = vehicles.filter(v => v.status === "متاح" || v.status === "available");

  const manufacturers = [...new Set(available.map(v => v.manufacturer))];

  const filtered = available.filter(v => {
    const q = search.toLowerCase();
    const matchSearch = !q || 
      v.manufacturer?.toLowerCase().includes(q) ||
      v.category?.toLowerCase().includes(q) ||
      v.trimLevel?.toLowerCase().includes(q);
    const matchMfr = !filterManufacturer || v.manufacturer === filterManufacturer;
    return matchSearch && matchMfr;
  });

  if (settingsLoading || vehiclesLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C79C45]" />
      </div>
    );
  }

  const s = settings || {} as WebsiteSettings;
  const bgColor = s.heroBgColor || "#0f172a";
  const primary = s.primaryColor || "#C79C45";

  if (!s.isPublished) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: bgColor }} dir="rtl">
        <div className="text-center">
          <Car className="w-20 h-20 text-white/20 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">الموقع قيد الإنشاء</h1>
          <p className="text-white/50">سيكون الموقع متاحاً قريباً</p>
        </div>
      </div>
    );
  }

  const whatsappMsg = encodeURIComponent("مرحباً، أريد الاستفسار عن سياراتكم");
  const whatsappUrl = s.whatsappNumber ? `https://wa.me/${s.whatsappNumber}?text=${whatsappMsg}` : "#";

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: bgColor }} dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/10" style={{ backgroundColor: bgColor + "dd" }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {s.logoUrl ? (
              <img src={s.logoUrl} alt={s.companyName} className="h-10 w-10 object-contain" />
            ) : (
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: primary + "33" }}>
                <Car className="w-5 h-5" style={{ color: primary }} />
              </div>
            )}
            <div>
              <h1 className="font-bold text-white text-lg leading-none">{s.companyName || "معرض السيارات"}</h1>
              {s.tagline && <p className="text-white/40 text-xs">{s.tagline}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {s.phone && (
              <a href={`tel:${s.phone}`} className="hidden sm:flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors">
                <Phone className="w-4 h-4" /> {s.phone}
              </a>
            )}
            {s.whatsappNumber && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90"
                style={{ backgroundColor: "#25D366" }}
                data-testid="button-header-whatsapp"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">واتساب</span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      {!selectedVehicle && (
        <div
          className="py-20 px-4 text-center relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${bgColor} 0%, ${primary}22 100%)` }}
        >
          <div className="absolute inset-0 opacity-5">
            <Car className="w-full h-full" />
          </div>
          <div className="relative max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: primary }}>
              {s.heroTitle || "اكتشف سيارة أحلامك"}
            </h2>
            <p className="text-white/60 text-lg mb-8">
              {s.heroSubtitle || "تشكيلة واسعة من السيارات الفاخرة والعملية"}
            </p>
            <div className="flex gap-3 max-w-md mx-auto">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  placeholder="ابحث عن سيارة..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 pr-10"
                  data-testid="input-search"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-10">
        {selectedVehicle ? (
          <VehicleDetail
            vehicle={selectedVehicle}
            settings={s}
            onBack={() => setSelectedId(null)}
          />
        ) : (
          <>
            {/* Filters */}
            {manufacturers.length > 1 && (
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                <button
                  onClick={() => setFilterManufacturer("")}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    !filterManufacturer ? "text-black" : "bg-white/10 text-white/70 hover:text-white"
                  }`}
                  style={!filterManufacturer ? { backgroundColor: primary } : {}}
                  data-testid="filter-all"
                >
                  الكل ({available.length})
                </button>
                {manufacturers.map((mfr) => (
                  <button
                    key={mfr}
                    onClick={() => setFilterManufacturer(mfr === filterManufacturer ? "" : mfr)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      filterManufacturer === mfr ? "text-black" : "bg-white/10 text-white/70 hover:text-white"
                    }`}
                    style={filterManufacturer === mfr ? { backgroundColor: primary } : {}}
                    data-testid={`filter-${mfr}`}
                  >
                    {mfr} ({available.filter(v => v.manufacturer === mfr).length})
                  </button>
                ))}
              </div>
            )}

            {/* Count */}
            <p className="text-white/40 text-sm mb-4">{filtered.length} سيارة متاحة</p>

            {/* Grid */}
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <Car className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/40">لا توجد سيارات متاحة حالياً</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filtered.map((v) => (
                  <VehicleCard
                    key={v.id}
                    vehicle={v}
                    settings={s}
                    onSelect={() => setSelectedId(v.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 px-4 mt-10">
        <div className="max-w-7xl mx-auto" dir="rtl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-bold text-white mb-1">{s.companyName}</h3>
              {s.tagline && <p className="text-white/40 text-sm">{s.tagline}</p>}
            </div>
            <div className="flex items-center gap-4 text-white/50 text-sm">
              {s.address && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {s.address}
                </span>
              )}
              {s.phone && (
                <a href={`tel:${s.phone}`} className="flex items-center gap-1 hover:text-white transition-colors">
                  <Phone className="w-4 h-4" /> {s.phone}
                </a>
              )}
            </div>
            <div className="flex items-center gap-3">
              {s.socialInstagram && (
                <a
                  href={`https://instagram.com/${s.socialInstagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
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
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
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
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                  style={{ backgroundColor: "#25D366" }}
                  data-testid="link-whatsapp-footer"
                >
                  <MessageCircle className="w-4 h-4 text-white" />
                </a>
              )}
            </div>
          </div>
          <div className="border-t border-white/10 mt-6 pt-6 text-center text-white/30 text-xs">
            جميع الحقوق محفوظة © {new Date().getFullYear()} {s.companyName}
          </div>
        </div>
      </footer>
    </div>
  );
}
