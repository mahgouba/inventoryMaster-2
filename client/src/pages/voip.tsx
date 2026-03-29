import { useState } from "react";
import {
  Phone,
  PhoneCall,
  PhoneMissed,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Clock,
  Users,
  Settings,
  BarChart2,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Hash,
  Delete,
  RefreshCw,
  TrendingUp,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface CallLog {
  id: number;
  contact: string;
  number: string;
  type: "incoming" | "outgoing" | "missed";
  duration: string;
  time: string;
}

const CALL_LOGS: CallLog[] = [
  { id: 1, contact: "أحمد محمد", number: "0501234567", type: "outgoing", duration: "5:23", time: "منذ 10 دقائق" },
  { id: 2, contact: "سارة العمري", number: "0559876543", type: "incoming", duration: "2:45", time: "منذ 30 دقيقة" },
  { id: 3, contact: "غير معروف", number: "0531112233", type: "missed", duration: "—", time: "منذ ساعة" },
  { id: 4, contact: "خالد الدوسري", number: "0564455667", type: "outgoing", duration: "8:12", time: "منذ 2 ساعة" },
  { id: 5, contact: "محمد العتيبي", number: "0507891234", type: "incoming", duration: "1:30", time: "أمس" },
  { id: 6, contact: "فاطمة الزهراني", number: "0541237890", type: "missed", duration: "—", time: "أمس" },
];

const DIALPAD = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["*", "0", "#"],
];

const callTypeConfig = {
  incoming: { label: "وارد", color: "text-emerald-400", icon: ArrowDownLeft, bg: "bg-emerald-500/10" },
  outgoing: { label: "صادر", color: "text-blue-400", icon: ArrowUpRight, bg: "bg-blue-500/10" },
  missed: { label: "فائت", color: "text-red-400", icon: PhoneMissed, bg: "bg-red-500/10" },
};

export default function VoipPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"dialpad" | "history" | "settings">("dialpad");
  const [dialNumber, setDialNumber] = useState("");
  const [inCall, setInCall] = useState(false);
  const [muted, setMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(false);
  const [callTimer, setCallTimer] = useState(0);
  const [search, setSearch] = useState("");
  const [sipServer, setSipServer] = useState("");
  const [sipUser, setSipUser] = useState("");
  const [sipPass, setSipPass] = useState("");

  const handleDial = (digit: string) => {
    setDialNumber((p) => p + digit);
  };

  const handleCall = () => {
    if (!dialNumber) {
      toast({ title: "خطأ", description: "يرجى إدخال رقم الهاتف", variant: "destructive" });
      return;
    }
    setInCall(true);
    toast({ title: "جارٍ الاتصال", description: `يتصل بـ ${dialNumber}...` });
  };

  const handleHangup = () => {
    setInCall(false);
    setMuted(false);
    setSpeakerOn(false);
    toast({ title: "انتهت المكالمة", description: "تم إنهاء المكالمة" });
  };

  const stats = [
    { label: "مكالمات اليوم", value: "24", icon: Phone, color: "#6366f1" },
    { label: "مكالمات فائتة", value: "3", icon: PhoneMissed, color: "#ef4444" },
    { label: "متوسط المدة", value: "4:32", icon: Clock, color: "#f59e0b" },
    { label: "معدل الرد", value: "87%", icon: CheckCheck, color: "#10b981" },
  ];

  const tabs = [
    { id: "dialpad", label: "لوحة الاتصال", icon: Hash },
    { id: "history", label: "السجل", icon: Clock },
    { id: "settings", label: "الإعدادات", icon: Settings },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "#6366f120", border: "1px solid #6366f140" }}>
            <PhoneCall className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Voice over IP</h1>
            <p className="text-white/40 text-sm">نظام الاتصال الداخلي والخارجي عبر الإنترنت</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium" style={{ backgroundColor: "#10b98120", color: "#10b981", border: "1px solid #10b98140" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            SIP متصل
          </div>
        </div>
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
      <div className="flex gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
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
        {/* Dialpad */}
        {activeTab === "dialpad" && (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Phone UI */}
            <div className="mx-auto lg:mx-0">
              <div
                className="rounded-3xl p-6 w-72"
                style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)" }}
              >
                {/* Display */}
                <div className="text-center mb-6">
                  {inCall ? (
                    <>
                      <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3 border border-emerald-500/30">
                        <Phone className="w-8 h-8 text-emerald-400" />
                      </div>
                      <p className="text-white font-semibold text-lg mb-1">{dialNumber}</p>
                      <p className="text-emerald-400 text-sm animate-pulse">جارٍ الاتصال...</p>
                    </>
                  ) : (
                    <>
                      <div
                        className="w-full rounded-2xl px-4 py-3 mb-2 text-center text-white text-2xl font-light tracking-widest min-h-14 flex items-center justify-center"
                        style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.05)" }}
                        data-testid="display-dial-number"
                      >
                        {dialNumber || <span className="text-white/20 text-base">أدخل الرقم</span>}
                      </div>
                    </>
                  )}
                </div>

                {!inCall && (
                  <>
                    {/* Dialpad Grid */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {DIALPAD.map((row, ri) =>
                        row.map((digit, di) => (
                          <button
                            key={`${ri}-${di}`}
                            onClick={() => handleDial(digit)}
                            className="h-12 rounded-2xl text-white font-semibold text-lg transition-all active:scale-95"
                            style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.06)" }}
                            data-testid={`dial-${digit}`}
                          >
                            {digit}
                          </button>
                        ))
                      )}
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleCall}
                        className="flex-1 h-12 rounded-2xl flex items-center justify-center gap-2 font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                        style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 20px rgba(16,185,129,0.4)" }}
                        data-testid="button-call"
                      >
                        <Phone className="w-5 h-5" />
                        اتصال
                      </button>
                      <button
                        onClick={() => setDialNumber((p) => p.slice(0, -1))}
                        className="h-12 w-12 rounded-2xl flex items-center justify-center text-white/50 hover:text-white transition-colors"
                        style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.06)" }}
                        data-testid="button-delete"
                      >
                        <Delete className="w-5 h-5" />
                      </button>
                    </div>
                  </>
                )}

                {/* In-Call Controls */}
                {inCall && (
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => setMuted(!muted)}
                        className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all"
                        style={{ background: muted ? "rgba(239,68,68,0.2)" : "rgba(0,0,0,0.06)", border: `1px solid ${muted ? "rgba(239,68,68,0.4)" : "rgba(0,0,0,0.09)"}` }}
                        data-testid="button-mute"
                      >
                        {muted ? <MicOff className="w-6 h-6 text-red-400" /> : <Mic className="w-6 h-6 text-white" />}
                      </button>
                      <button
                        onClick={() => setSpeakerOn(!speakerOn)}
                        className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all"
                        style={{ background: speakerOn ? "rgba(99,102,241,0.2)" : "rgba(0,0,0,0.06)", border: `1px solid ${speakerOn ? "rgba(99,102,241,0.4)" : "rgba(0,0,0,0.09)"}` }}
                        data-testid="button-speaker"
                      >
                        {speakerOn ? <Volume2 className="w-6 h-6 text-indigo-400" /> : <VolumeX className="w-6 h-6 text-white" />}
                      </button>
                    </div>
                    <button
                      onClick={handleHangup}
                      className="w-full h-14 rounded-2xl flex items-center justify-center gap-2 font-bold text-white transition-all hover:opacity-90"
                      style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)", boxShadow: "0 4px 20px rgba(239,68,68,0.4)" }}
                      data-testid="button-hangup"
                    >
                      <PhoneOff className="w-6 h-6" />
                      إنهاء المكالمة
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Calls Quick View */}
            <div className="flex-1 w-full">
              <h3 className="text-white font-semibold mb-4">آخر المكالمات</h3>
              <div className="space-y-2">
                {CALL_LOGS.slice(0, 5).map((log) => {
                  const ct = callTypeConfig[log.type];
                  return (
                    <div
                      key={log.id}
                      className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-white/5 transition-colors"
                      style={{ border: "1px solid rgba(0,0,0,0.03)" }}
                      onClick={() => setDialNumber(log.number)}
                      data-testid={`call-log-${log.id}`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${ct.bg}`}>
                        <ct.icon className={`w-4 h-4 ${ct.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{log.contact}</p>
                        <p className="text-white/30 text-xs">{log.number}</p>
                      </div>
                      <div className="text-left flex-shrink-0">
                        <p className="text-white/40 text-xs">{log.duration !== "—" ? log.duration : ""}</p>
                        <p className="text-white/25 text-xs">{log.time}</p>
                      </div>
                      <button
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-400 opacity-0 hover:opacity-100 transition-all"
                        style={{ background: "rgba(16,185,129,0.15)" }}
                        onClick={(e) => { e.stopPropagation(); setDialNumber(log.number); handleCall(); }}
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* History */}
        {activeTab === "history" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold text-lg">سجل المكالمات</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث..." className="bg-white/5 border-white/10 text-white placeholder:text-white/25 pr-9 h-9 text-sm w-48" />
                </div>
                <Button variant="outline" size="sm" className="border-white/10 text-white/60 hover:text-white h-9">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              {CALL_LOGS.filter(l => !search || l.contact.includes(search) || l.number.includes(search)).map((log) => {
                const ct = callTypeConfig[log.type];
                return (
                  <div
                    key={log.id}
                    className="flex items-center gap-4 p-4 rounded-xl"
                    style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.04)" }}
                    data-testid={`history-log-${log.id}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${ct.bg}`}>
                      <ct.icon className={`w-5 h-5 ${ct.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-white font-medium text-sm">{log.contact}</p>
                        <span className={`text-[10px] font-medium ${ct.color}`}>{ct.label}</span>
                      </div>
                      <p className="text-white/30 text-xs">{log.number}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-white/40">
                      {log.duration !== "—" && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {log.duration}
                        </span>
                      )}
                      <span>{log.time}</span>
                    </div>
                    <button
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-400"
                      style={{ background: "rgba(16,185,129,0.12)" }}
                      onClick={() => { setDialNumber(log.number); setActiveTab("dialpad"); }}
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Settings */}
        {activeTab === "settings" && (
          <div className="max-w-lg">
            <h2 className="text-white font-semibold text-lg mb-5">إعدادات SIP / VoIP</h2>
            <div className="space-y-4">
              <div>
                <label className="text-white/50 text-sm mb-1.5 block">خادم SIP</label>
                <Input value={sipServer} onChange={(e) => setSipServer(e.target.value)} placeholder="sip.provider.com" className="bg-white/5 border-white/10 text-white placeholder:text-white/25" data-testid="input-sip-server" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/50 text-sm mb-1.5 block">اسم المستخدم</label>
                  <Input value={sipUser} onChange={(e) => setSipUser(e.target.value)} placeholder="1001" className="bg-white/5 border-white/10 text-white placeholder:text-white/25" data-testid="input-sip-user" />
                </div>
                <div>
                  <label className="text-white/50 text-sm mb-1.5 block">كلمة المرور</label>
                  <Input type="password" value={sipPass} onChange={(e) => setSipPass(e.target.value)} placeholder="••••••••" className="bg-white/5 border-white/10 text-white placeholder:text-white/25" data-testid="input-sip-pass" />
                </div>
              </div>
              <div className="p-4 rounded-xl text-sm text-indigo-400/80 flex gap-3" style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
                <Phone className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>يدعم النظام بروتوكول SIP ويتوافق مع Asterisk وFreeSWITCH وTwilio وجميع مزودي VoIP الرئيسيين</p>
              </div>
              <Button
                className="w-full font-bold"
                style={{ backgroundColor: "#6366f1", color: "#fff" }}
                onClick={() => toast({ title: "تم الحفظ", description: "تم حفظ إعدادات VoIP" })}
                data-testid="button-save-voip"
              >
                حفظ والاتصال بالخادم
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
