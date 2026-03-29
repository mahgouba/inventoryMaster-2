import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  MessageCircle,
  Send,
  Users,
  Clock,
  CheckCheck,
  XCircle,
  Phone,
  Plus,
  Trash2,
  ChevronDown,
  Search,
  Filter,
  RefreshCw,
  Settings,
  AlertCircle,
  BarChart2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: number;
  recipient: string;
  content: string;
  status: "sent" | "delivered" | "failed" | "pending";
  timestamp: string;
}

const DEMO_MESSAGES: Message[] = [
  { id: 1, recipient: "0501234567", content: "مرحباً، لدينا عروض جديدة على السيارات!", status: "delivered", timestamp: "منذ 5 دقائق" },
  { id: 2, recipient: "0559876543", content: "عزيزي العميل، سيارتك جاهزة للاستلام", status: "sent", timestamp: "منذ 15 دقيقة" },
  { id: 3, recipient: "0531112233", content: "شكراً لثقتك بمعرضنا", status: "failed", timestamp: "منذ ساعة" },
  { id: 4, recipient: "0564455667", content: "تذكير: موعد صيانة سيارتك غداً", status: "pending", timestamp: "منذ دقيقتين" },
];

const TEMPLATES = [
  { id: 1, name: "ترحيب بعميل جديد", content: "مرحباً بك في معرضنا! يسعدنا خدمتك. تواصل معنا لأي استفسار." },
  { id: 2, name: "عرض سعر", content: "عزيزي العميل، يسعدنا تقديم أفضل الأسعار لك على {{اسم_السيارة}}. السعر: {{السعر}} ر.س" },
  { id: 3, name: "تذكير موعد", content: "تذكير: لديك موعد في معرضنا يوم {{اليوم}} الساعة {{الوقت}}. نتطلع لرؤيتك!" },
  { id: 4, name: "جاهزية للاستلام", content: "بشرى سارة! سيارتك {{اسم_السيارة}} جاهزة للاستلام. تفضل بزيارتنا في أوقات الدوام." },
];

const statusConfig = {
  sent: { label: "مُرسَل", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: CheckCheck },
  delivered: { label: "مُستلَم", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: CheckCheck },
  failed: { label: "فشل", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: XCircle },
  pending: { label: "في الانتظار", color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: Clock },
};

export default function WhatsAppApiPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"send" | "bulk" | "history" | "templates" | "settings">("send");
  const [singlePhone, setSinglePhone] = useState("");
  const [singleMessage, setSingleMessage] = useState("");
  const [bulkPhones, setBulkPhones] = useState("");
  const [bulkMessage, setBulkMessage] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [instanceId, setInstanceId] = useState("");
  const [search, setSearch] = useState("");

  const handleSendSingle = () => {
    if (!singlePhone || !singleMessage) {
      toast({ title: "خطأ", description: "يرجى إدخال رقم الهاتف والرسالة", variant: "destructive" });
      return;
    }
    toast({ title: "تم الإرسال", description: `تم إرسال الرسالة إلى ${singlePhone}` });
    setSinglePhone("");
    setSingleMessage("");
  };

  const handleSendBulk = () => {
    const phones = bulkPhones.split("\n").filter(p => p.trim());
    if (!phones.length || !bulkMessage) {
      toast({ title: "خطأ", description: "يرجى إدخال الأرقام والرسالة", variant: "destructive" });
      return;
    }
    toast({ title: "جارٍ الإرسال", description: `سيتم إرسال الرسائل إلى ${phones.length} جهة اتصال` });
    setBulkPhones("");
    setBulkMessage("");
  };

  const stats = [
    { label: "إجمالي الرسائل", value: "1,248", icon: MessageCircle, color: "#25D366" },
    { label: "تم التسليم", value: "1,104", icon: CheckCheck, color: "#3b82f6" },
    { label: "فشل الإرسال", value: "28", icon: XCircle, color: "#ef4444" },
    { label: "في الانتظار", value: "116", icon: Clock, color: "#f59e0b" },
  ];

  const tabs = [
    { id: "send", label: "إرسال", icon: Send },
    { id: "bulk", label: "جماعي", icon: Users },
    { id: "history", label: "السجل", icon: Clock },
    { id: "templates", label: "القوالب", icon: MessageCircle },
    { id: "settings", label: "الإعدادات", icon: Settings },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "#25D36620", border: "1px solid #25D36640" }}>
            <MessageCircle className="w-6 h-6" style={{ color: "#25D366" }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">واتساب API</h1>
            <p className="text-white/40 text-sm">إدارة رسائل واتساب التسويقية والتشغيلية</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium" style={{ backgroundColor: "#25D36620", color: "#25D366", border: "1px solid #25D36640" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
            متصل
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="rounded-2xl p-4" style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.05)" }}>
            <div className="flex items-center justify-between mb-3">
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              <BarChart2 className="w-4 h-4 text-white/20" />
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
              ? { backgroundColor: "#25D36620", color: "#25D366", border: "1px solid #25D36640" }
              : { backgroundColor: "rgba(0,0,0,0.03)", color: "rgba(0,0,0,0.35)", border: "1px solid rgba(0,0,0,0.05)" }}
            data-testid={`tab-${tab.id}`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="rounded-2xl p-6" style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.04)" }}>
        {/* Send Single */}
        {activeTab === "send" && (
          <div className="max-w-xl">
            <h2 className="text-white font-semibold text-lg mb-5">إرسال رسالة واحدة</h2>
            <div className="space-y-4">
              <div>
                <label className="text-white/50 text-sm mb-1.5 block">رقم الهاتف</label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    value={singlePhone}
                    onChange={(e) => setSinglePhone(e.target.value)}
                    placeholder="05xxxxxxxx"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/25 pr-10"
                    data-testid="input-phone"
                  />
                </div>
              </div>
              <div>
                <label className="text-white/50 text-sm mb-1.5 block">نص الرسالة</label>
                <Textarea
                  value={singleMessage}
                  onChange={(e) => setSingleMessage(e.target.value)}
                  placeholder="اكتب رسالتك هنا..."
                  rows={5}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/25 resize-none"
                  data-testid="input-message"
                />
                <p className="text-white/25 text-xs mt-1 text-left">{singleMessage.length} / 4096</p>
              </div>
              <Button
                onClick={handleSendSingle}
                className="w-full font-bold"
                style={{ backgroundColor: "#25D366", color: "#000" }}
                data-testid="button-send-single"
              >
                <Send className="w-4 h-4 ml-2" />
                إرسال الرسالة
              </Button>
            </div>
          </div>
        )}

        {/* Bulk Send */}
        {activeTab === "bulk" && (
          <div>
            <h2 className="text-white font-semibold text-lg mb-5">الإرسال الجماعي</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-white/50 text-sm mb-1.5 block">قائمة الأرقام (رقم في كل سطر)</label>
                  <Textarea
                    value={bulkPhones}
                    onChange={(e) => setBulkPhones(e.target.value)}
                    placeholder={"0501234567\n0559876543\n0531112233"}
                    rows={8}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/25 resize-none font-mono text-sm"
                    data-testid="input-bulk-phones"
                  />
                  <p className="text-white/25 text-xs mt-1">
                    {bulkPhones.split("\n").filter(p => p.trim()).length} جهة اتصال
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-white/50 text-sm mb-1.5 block">نص الرسالة</label>
                  <Textarea
                    value={bulkMessage}
                    onChange={(e) => setBulkMessage(e.target.value)}
                    placeholder="اكتب رسالتك الجماعية هنا..."
                    rows={8}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/25 resize-none"
                    data-testid="input-bulk-message"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-5 pt-5 border-t border-white/5">
              <div className="flex items-center gap-2 text-amber-400 text-xs">
                <AlertCircle className="w-4 h-4" />
                سيتم إرسال الرسائل تدريجياً لتفادي الحجب
              </div>
              <div className="mr-auto">
                <Button
                  onClick={handleSendBulk}
                  className="font-bold"
                  style={{ backgroundColor: "#25D366", color: "#000" }}
                  data-testid="button-send-bulk"
                >
                  <Send className="w-4 h-4 ml-2" />
                  إرسال لـ {bulkPhones.split("\n").filter(p => p.trim()).length || 0} جهة اتصال
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* History */}
        {activeTab === "history" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold text-lg">سجل الرسائل</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="بحث..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/25 pr-9 h-9 text-sm w-48"
                  />
                </div>
                <Button variant="outline" size="sm" className="border-white/10 text-white/60 hover:text-white h-9">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              {DEMO_MESSAGES.filter(m => !search || m.recipient.includes(search) || m.content.includes(search)).map((msg) => {
                const st = statusConfig[msg.status];
                return (
                  <div
                    key={msg.id}
                    className="flex items-start gap-4 p-4 rounded-xl"
                    style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.04)" }}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#25D36615" }}>
                      <MessageCircle className="w-4 h-4" style={{ color: "#25D366" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white font-medium text-sm">{msg.recipient}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${st.color}`}>{st.label}</span>
                      </div>
                      <p className="text-white/40 text-sm truncate">{msg.content}</p>
                    </div>
                    <p className="text-white/25 text-xs flex-shrink-0">{msg.timestamp}</p>
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
              <h2 className="text-white font-semibold text-lg">قوالب الرسائل</h2>
              <Button
                size="sm"
                className="font-medium"
                style={{ backgroundColor: "#25D36620", color: "#25D366", border: "1px solid #25D36640" }}
              >
                <Plus className="w-4 h-4 ml-1" />
                قالب جديد
              </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {TEMPLATES.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-2xl"
                  style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.04)" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-medium text-sm">{t.name}</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setSingleMessage(t.content); setActiveTab("send"); }}
                        className="text-xs text-white/40 hover:text-white transition-colors"
                        data-testid={`button-use-template-${t.id}`}
                      >
                        استخدام
                      </button>
                      <button className="text-white/20 hover:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-white/40 text-xs leading-relaxed">{t.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings */}
        {activeTab === "settings" && (
          <div className="max-w-xl">
            <h2 className="text-white font-semibold text-lg mb-5">إعدادات الاتصال</h2>
            <div className="space-y-4">
              <div>
                <label className="text-white/50 text-sm mb-1.5 block">معرّف النسخة (Instance ID)</label>
                <Input
                  value={instanceId}
                  onChange={(e) => setInstanceId(e.target.value)}
                  placeholder="أدخل Instance ID"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/25"
                  data-testid="input-instance-id"
                />
              </div>
              <div>
                <label className="text-white/50 text-sm mb-1.5 block">مفتاح API</label>
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="أدخل API Key"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/25"
                  data-testid="input-api-key"
                />
              </div>
              <div className="p-4 rounded-xl text-sm text-amber-400/80 flex gap-3" style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>يمكنك الحصول على مفتاح API من لوحة تحكم مزود خدمة واتساب الخاص بك (مثل: UltraMsg, WhatsMate, Chat-API)</p>
              </div>
              <Button
                className="w-full font-bold"
                style={{ backgroundColor: "#25D366", color: "#000" }}
                onClick={() => toast({ title: "تم الحفظ", description: "تم حفظ إعدادات الاتصال" })}
                data-testid="button-save-settings"
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
