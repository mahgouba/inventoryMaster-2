import { useState } from "react";
import {
  Mail,
  Send,
  Users,
  Clock,
  CheckCheck,
  XCircle,
  Plus,
  Trash2,
  Search,
  RefreshCw,
  Settings,
  AlertCircle,
  BarChart2,
  Eye,
  Edit3,
  FileText,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Campaign {
  id: number;
  name: string;
  subject: string;
  sentTo: number;
  opened: number;
  clicked: number;
  status: "sent" | "draft" | "failed" | "scheduled";
  date: string;
}

const CAMPAIGNS: Campaign[] = [
  { id: 1, name: "عروض نهاية الشهر", subject: "🚗 عروض حصرية لهذا الشهر فقط!", sentTo: 450, opened: 210, clicked: 87, status: "sent", date: "15 مارس 2026" },
  { id: 2, name: "ترحيب عملاء جدد", subject: "مرحباً بك في معرضنا", sentTo: 120, opened: 98, clicked: 45, status: "sent", date: "10 مارس 2026" },
  { id: 3, name: "عروض رمضان", subject: "🌙 عروض رمضان المبارك", sentTo: 0, opened: 0, clicked: 0, status: "draft", date: "قريباً" },
  { id: 4, name: "متابعة عروض الأسعار", subject: "عرض السعر الخاص بك لا يزال متاحاً", sentTo: 75, opened: 40, clicked: 22, status: "sent", date: "8 مارس 2026" },
];

const TEMPLATES = [
  { id: 1, name: "ترحيب", subject: "مرحباً بك في {{اسم_الشركة}}", body: "عزيزي {{اسم_العميل}},\n\nنرحب بك في عائلة {{اسم_الشركة}}. يسعدنا خدمتك وتقديم أفضل العروض لك.\n\nمع تحياتنا،\nفريق {{اسم_الشركة}}" },
  { id: 2, name: "عرض سعر", subject: "عرض سعر خاص لك", body: "عزيزي {{اسم_العميل}},\n\nيسرنا تقديم عرض سعر خاص على {{اسم_السيارة}} بسعر {{السعر}} ر.س\n\nالعرض ساري لمدة 7 أيام.\n\nمع تحياتنا" },
  { id: 3, name: "متابعة", subject: "هل لا تزال مهتماً؟", body: "عزيزي {{اسم_العميل}},\n\nنود الاطمئنان عليك ومعرفة ما إذا كنت لا تزال مهتماً بالسيارة التي استفسرت عنها.\n\nيسعدنا مساعدتك في أي وقت." },
];

const statusConfig = {
  sent: { label: "مُرسَلة", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  draft: { label: "مسودة", color: "bg-white/10 text-white/50 border-white/20" },
  failed: { label: "فشلت", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  scheduled: { label: "مجدولة", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
};

export default function EmailBulkPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"compose" | "campaigns" | "templates" | "settings">("compose");
  const [subject, setSubject] = useState("");
  const [recipients, setRecipients] = useState("");
  const [body, setBody] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [search, setSearch] = useState("");

  const handleSend = () => {
    const emails = recipients.split("\n").filter(e => e.trim());
    if (!emails.length || !subject || !body) {
      toast({ title: "خطأ", description: "يرجى ملء جميع الحقول المطلوبة", variant: "destructive" });
      return;
    }
    toast({ title: "جارٍ الإرسال", description: `سيتم إرسال البريد إلى ${emails.length} عنوان` });
    setSubject(""); setRecipients(""); setBody("");
  };

  const stats = [
    { label: "إجمالي المُرسَل", value: "645", icon: Send, color: "#6366f1" },
    { label: "معدل الفتح", value: "54%", icon: Eye, color: "#3b82f6" },
    { label: "معدل النقر", value: "23%", icon: TrendingUp, color: "#10b981" },
    { label: "الحملات النشطة", value: "3", icon: BarChart2, color: "#f59e0b" },
  ];

  const tabs = [
    { id: "compose", label: "إنشاء", icon: Edit3 },
    { id: "campaigns", label: "الحملات", icon: BarChart2 },
    { id: "templates", label: "القوالب", icon: FileText },
    { id: "settings", label: "الإعدادات", icon: Settings },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "#6366f120", border: "1px solid #6366f140" }}>
            <Mail className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">البريد الإلكتروني الجماعي</h1>
            <p className="text-white/40 text-sm">إدارة حملات البريد الإلكتروني التسويقية</p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => setActiveTab("compose")}
          className="font-medium"
          style={{ backgroundColor: "#6366f120", color: "#818cf8", border: "1px solid #6366f140" }}
        >
          <Plus className="w-4 h-4 ml-1" />
          حملة جديدة
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="rounded-2xl p-4" style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.05)" }}>
            <div className="flex items-center justify-between mb-3">
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              <TrendingUp className="w-4 h-4 text-white/20" />
            </div>
            <p className="text-2xl font-bold text-white mb-0.5">{stat.value}</p>
            <p className="text-white/40 text-xs">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex-shrink-0"
            style={activeTab === tab.id
              ? { backgroundColor: "#6366f120", color: "#818cf8", border: "1px solid #6366f140" }
              : { backgroundColor: "rgba(0,0,0,0.03)", color: "rgba(0,0,0,0.35)", border: "1px solid rgba(0,0,0,0.05)" }}
            data-testid={`tab-${tab.id}`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl p-6" style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.04)" }}>
        {/* Compose */}
        {activeTab === "compose" && (
          <div>
            <h2 className="text-white font-semibold text-lg mb-5">إنشاء حملة بريدية</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-white/50 text-sm mb-1.5 block">الموضوع</label>
                  <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="موضوع البريد الإلكتروني" className="bg-white/5 border-white/10 text-white placeholder:text-white/25" data-testid="input-subject" />
                </div>
                <div>
                  <label className="text-white/50 text-sm mb-1.5 block">قائمة المستلمين (بريد في كل سطر)</label>
                  <Textarea
                    value={recipients}
                    onChange={(e) => setRecipients(e.target.value)}
                    placeholder={"customer1@gmail.com\ncustomer2@gmail.com"}
                    rows={6}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/25 resize-none font-mono text-sm"
                    data-testid="input-recipients"
                  />
                  <p className="text-white/25 text-xs mt-1">{recipients.split("\n").filter(e => e.trim()).length} مستلم</p>
                </div>
              </div>
              <div>
                <label className="text-white/50 text-sm mb-1.5 block">محتوى الرسالة</label>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="اكتب محتوى بريدك الإلكتروني هنا..."
                  rows={11}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/25 resize-none"
                  data-testid="input-body"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-5 pt-5 border-t border-white/5">
              <div className="flex items-center gap-2 text-amber-400 text-xs">
                <AlertCircle className="w-4 h-4" />
                سيتم إرسال الرسائل دفعات لضمان معدل وصول مرتفع
              </div>
              <div className="mr-auto flex gap-3">
                <Button variant="outline" className="border-white/10 text-white/60 hover:text-white" onClick={() => toast({ title: "تم الحفظ", description: "تم حفظ الحملة كمسودة" })}>
                  حفظ كمسودة
                </Button>
                <Button
                  onClick={handleSend}
                  className="font-bold"
                  style={{ backgroundColor: "#6366f1", color: "#fff" }}
                  data-testid="button-send-email"
                >
                  <Send className="w-4 h-4 ml-2" />
                  إرسال الحملة
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Campaigns */}
        {activeTab === "campaigns" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold text-lg">الحملات البريدية</h2>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث..." className="bg-white/5 border-white/10 text-white placeholder:text-white/25 pr-9 h-9 text-sm w-48" />
              </div>
            </div>
            <div className="space-y-3">
              {CAMPAIGNS.filter(c => !search || c.name.includes(search) || c.subject.includes(search)).map((camp) => {
                const st = statusConfig[camp.status];
                const openRate = camp.sentTo ? Math.round((camp.opened / camp.sentTo) * 100) : 0;
                return (
                  <div key={camp.id} className="p-4 rounded-xl" style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.04)" }}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-white font-medium">{camp.name}</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${st.color}`}>{st.label}</span>
                        </div>
                        <p className="text-white/40 text-sm truncate mb-3">{camp.subject}</p>
                        {camp.status === "sent" && (
                          <div className="flex items-center gap-6 text-xs text-white/40">
                            <span>أُرسل لـ <span className="text-white">{camp.sentTo}</span></span>
                            <span>فُتح <span className="text-white">{camp.opened}</span> ({openRate}%)</span>
                            <span>نُقر <span className="text-white">{camp.clicked}</span></span>
                          </div>
                        )}
                      </div>
                      <div className="text-left">
                        <p className="text-white/25 text-xs">{camp.date}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Templates */}
        {activeTab === "templates" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold text-lg">قوالب البريد الإلكتروني</h2>
              <Button size="sm" style={{ backgroundColor: "#6366f120", color: "#818cf8", border: "1px solid #6366f140" }}>
                <Plus className="w-4 h-4 ml-1" /> قالب جديد
              </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {TEMPLATES.map((t) => (
                <div key={t.id} className="p-4 rounded-2xl" style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.04)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium text-sm">{t.name}</h3>
                    <button onClick={() => { setSubject(t.subject); setBody(t.body); setActiveTab("compose"); }} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors" data-testid={`use-template-${t.id}`}>
                      استخدام
                    </button>
                  </div>
                  <p className="text-white/50 text-xs mb-2 font-medium">{t.subject}</p>
                  <p className="text-white/30 text-xs leading-relaxed line-clamp-3">{t.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings */}
        {activeTab === "settings" && (
          <div className="max-w-lg">
            <h2 className="text-white font-semibold text-lg mb-5">إعدادات SMTP</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/50 text-sm mb-1.5 block">اسم المرسل</label>
                  <Input value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="معرض السيارات" className="bg-white/5 border-white/10 text-white placeholder:text-white/25" />
                </div>
                <div>
                  <label className="text-white/50 text-sm mb-1.5 block">بريد المرسل</label>
                  <Input value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} placeholder="info@showroom.com" className="bg-white/5 border-white/10 text-white placeholder:text-white/25" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="text-white/50 text-sm mb-1.5 block">SMTP Host</label>
                  <Input value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} placeholder="smtp.gmail.com" className="bg-white/5 border-white/10 text-white placeholder:text-white/25" />
                </div>
                <div>
                  <label className="text-white/50 text-sm mb-1.5 block">Port</label>
                  <Input value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} placeholder="587" className="bg-white/5 border-white/10 text-white placeholder:text-white/25" />
                </div>
              </div>
              <div className="p-4 rounded-xl text-sm text-amber-400/80 flex gap-3" style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>يمكنك استخدام Gmail SMTP أو Mailgun أو SendGrid أو أي مزود SMTP آخر</p>
              </div>
              <Button
                className="w-full font-bold"
                style={{ backgroundColor: "#6366f1", color: "#fff" }}
                onClick={() => toast({ title: "تم الحفظ", description: "تم حفظ إعدادات البريد الإلكتروني" })}
                data-testid="button-save-smtp"
              >
                حفظ الإعدادات
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
