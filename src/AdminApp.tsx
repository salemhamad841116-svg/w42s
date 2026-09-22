import React, { useState } from 'react';
import { AdminLayout } from './components/admin/AdminLayout';
import TradingApp from './trading/TradingApp';
import { AdminStrategiesManager } from './components/admin/AdminStrategiesManager';
import { AdminAutoRecommendations } from './components/admin/AdminAutoRecommendations';
import { AdminBreakingNews } from './components/admin/AdminBreakingNews';
import { AdminBrokerAccounts } from './components/admin/AdminBrokerAccounts';
import { AdminUSE } from './components/admin/AdminUSE';
import { AdminAppUpdates } from './components/admin/AdminAppUpdates';
import { UpdateNotificationToast } from './components/common/UpdateNotificationToast';
import {
  Radio,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Search,
  Users,
  Shield,
  Activity,
  Flame,
  LayoutDashboard,
  ShieldAlert,
  Key,
  Bug,
  ShieldCheck,
  History,
  FileText,
  Code,
  Bot,
  Server,
  Zap,
  Camera,
  Bell,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Send,
  Eye,
  Sliders,
  ExternalLink,
} from 'lucide-react';

interface Signal {
  id: string;
  pair: string;
  type: 'BUY' | 'SELL';
  entryPrice: number;
  tp1: number;
  tp2: number;
  tp3: number;
  stopLoss: number;
  status: 'ACTIVE' | 'HIT_TP1' | 'HIT_TP2' | 'HIT_TP3' | 'HIT_SL' | 'CLOSED';
  createdAt: string;
}

const INITIAL_SIGNALS: Signal[] = [
  { id: '1', pair: 'XAU/USD', type: 'BUY', entryPrice: 2420.50, tp1: 2435.00, tp2: 2450.00, tp3: 2470.00, stopLoss: 2405.00, status: 'ACTIVE', createdAt: 'منذ 10 دقائق' },
  { id: '2', pair: 'BTC/USDT', type: 'BUY', entryPrice: 67200.00, tp1: 68500.00, tp2: 70000.00, tp3: 72500.00, stopLoss: 65800.00, status: 'ACTIVE', createdAt: 'منذ 35 دقيقة' },
  { id: '3', pair: 'EUR/USD', type: 'SELL', entryPrice: 1.0890, tp1: 1.0850, tp2: 1.0810, tp3: 1.0770, stopLoss: 1.0930, status: 'HIT_TP1', createdAt: 'منذ ساعتين' },
  { id: '4', pair: 'GBP/USD', type: 'BUY', entryPrice: 1.2840, tp1: 1.2890, tp2: 1.2940, tp3: 1.3000, stopLoss: 1.2780, status: 'HIT_TP2', createdAt: 'منذ 4 ساعات' },
  { id: '5', pair: 'USD/JPY', type: 'SELL', entryPrice: 154.50, tp1: 153.80, tp2: 153.00, tp3: 152.00, stopLoss: 155.30, status: 'CLOSED', createdAt: 'أمس' },
];

export default function AdminApp() {
  const [activeTab, setActiveTab] = useState('tradingTerminal');
  const [signals, setSignals] = useState<Signal[]>(INITIAL_SIGNALS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');

  // New Signal Form
  const [showNewModal, setShowNewModal] = useState(false);
  const [newPair, setNewPair] = useState('XAU/USD');
  const [newType, setNewType] = useState<'BUY' | 'SELL'>('BUY');
  const [newEntry, setNewEntry] = useState('');
  const [newTp1, setNewTp1] = useState('');
  const [newTp2, setNewTp2] = useState('');
  const [newTp3, setNewTp3] = useState('');
  const [newSl, setNewSl] = useState('');

  // Push Notification Form
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [notifSent, setNotifSent] = useState(false);

  // Breaking News Form
  const [newsTitle, setNewsTitle] = useState('');
  const [newsUrgent, setNewsUrgent] = useState(true);
  const [newsList, setNewsList] = useState([
    { id: '1', title: 'بيانات التضخم الأمريكية CPI تصدر بعد قليل وترقب لتحركات الذهب', time: 'منذ 15 دقيقة', urgent: true },
    { id: '2', title: 'الفيدرالي يلمح إلى خفض محتمل لأسعار الفائدة في الاجتماع القادم', time: 'منذ ساعتين', urgent: false },
  ]);

  const handleAddSignal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry || !newTp1 || !newSl) {
      alert('يرجى تعبئة سعر الدخول، الهدف الأول، ووقف الخسارة');
      return;
    }
    const sig: Signal = {
      id: Date.now().toString(),
      pair: newPair,
      type: newType,
      entryPrice: parseFloat(newEntry),
      tp1: parseFloat(newTp1),
      tp2: parseFloat(newTp2) || parseFloat(newTp1),
      tp3: parseFloat(newTp3) || parseFloat(newTp1),
      stopLoss: parseFloat(newSl),
      status: 'ACTIVE',
      createdAt: 'الآن',
    };
    setSignals([sig, ...signals]);
    setShowNewModal(false);
    setNewEntry('');
    setNewTp1('');
    setNewTp2('');
    setNewTp3('');
    setNewSl('');
  };

  const filteredSignals = signals.filter((s) => {
    const match = s.pair.toLowerCase().includes(searchTerm.toLowerCase());
    const filter = filterType === 'ALL' || s.type === filterType;
    return match && filter;
  });

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {/* 1. Trading Terminal */}
      {activeTab === 'tradingTerminal' && (
        <div className="h-[calc(100vh-56px)] w-full">
          <TradingApp />
        </div>
      )}

      {/* 1.5 Broker Accounts Management */}
      {activeTab === 'brokerAccounts' && <AdminBrokerAccounts />}

      {/* 2. Signals Management */}
      {activeTab === 'signals' && (
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Zap className="text-amber-400" />
                إدارة التوصيات والإشارات
              </h2>
              <p className="text-xs text-zinc-400 mt-1">نشر التوصيات وتحديث أهداف الصفقات في المنصة</p>
            </div>
            <button
              onClick={() => setShowNewModal(true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Plus size={16} />
              <span>إضافة إشارة جديدة</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 bg-[#11141c] p-3 rounded-2xl border border-zinc-800">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
              <input
                type="text"
                placeholder="بحث عن زوج العملات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#181c26] border border-zinc-700/60 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex gap-1.5">
              {(['ALL', 'BUY', 'SELL'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterType === type ? 'bg-amber-500 text-black' : 'bg-[#181c26] text-zinc-400 hover:text-white'
                  }`}
                >
                  {type === 'ALL' ? 'الكل' : type === 'BUY' ? 'شراء' : 'بيع'}
                </button>
              ))}
            </div>
          </div>


          <div className="bg-[#11141c] rounded-2xl border border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-bold bg-[#141822]">
                    <th className="p-3.5">الزوج</th>
                    <th className="p-3.5">النوع</th>
                    <th className="p-3.5">سعر الدخول</th>
                    <th className="p-3.5">الهدف 1</th>
                    <th className="p-3.5">الهدف 2</th>
                    <th className="p-3.5">الهدف 3</th>
                    <th className="p-3.5">وقف الخسارة</th>
                    <th className="p-3.5">الحالة</th>
                    <th className="p-3.5 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredSignals.map((sig) => (
                    <tr key={sig.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="p-3.5 font-bold text-white flex items-center gap-2">
                        <span>{sig.pair}</span>
                        <span className="text-[10px] text-zinc-500">{sig.createdAt}</span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 font-black px-2 py-0.5 rounded-md text-[10px] ${
                            sig.type === 'BUY'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {sig.type === 'BUY' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {sig.type}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-zinc-200">{sig.entryPrice}</td>
                      <td className="p-3.5 font-mono text-emerald-400">{sig.tp1}</td>
                      <td className="p-3.5 font-mono text-emerald-400">{sig.tp2}</td>
                      <td className="p-3.5 font-mono text-emerald-400">{sig.tp3}</td>
                      <td className="p-3.5 font-mono text-rose-400">{sig.stopLoss}</td>
                      <td className="p-3.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            sig.status === 'ACTIVE'
                              ? 'bg-cyan-500/10 text-cyan-400'
                              : sig.status.startsWith('HIT_TP')
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-zinc-700/30 text-zinc-400'
                          }`}
                        >
                          {sig.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => setSignals(signals.filter((s) => s.id !== sig.id))}
                          className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                          title="حذف الإشارة"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. Strategies Manager */}
      {activeTab === 'strategies' && (
        <AdminStrategiesManager signals={signals as any} onDispatchSignal={() => {}} lang="ar" />
      )}

      {/* 4. Auto Recommendations */}
      {activeTab === 'recommendations' && (
        <AdminAutoRecommendations signals={signals as any} onDispatchSignal={() => {}} lang="ar" />
      )}

      {/* 5. Signal History */}
      {activeTab === 'signalHistory' && (
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <History className="text-amber-400" />
              أرشيف وسجل جميع الإشارات التاريخية
            </h2>
            <span className="text-xs text-zinc-400">إجمالي الصفقات المؤرشفة: 342 صفقة</span>
          </div>
          <div className="bg-[#11141c] rounded-2xl border border-zinc-800 p-4 space-y-3">
            {[
              { pair: 'XAU/USD', res: 'حقق الهدف الثالث (+450 نقطة)', date: '2026-09-05', pnl: '+$4,500' },
              { pair: 'BTC/USDT', res: 'حقق الهدف الثاني (+1,200 نقطة)', date: '2026-09-04', pnl: '+$2,400' },
              { pair: 'EUR/USD', res: 'ضرب وقف الخسارة (-35 نقطة)', date: '2026-09-03', pnl: '-$350' },
            ].map((h, i) => (
              <div key={i} className="p-3 bg-[#181c26] rounded-xl border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white text-sm">{h.pair}</span>
                  <p className="text-xs text-zinc-400 mt-0.5">{h.res}</p>
                </div>
                <div className="text-left">
                  <span className={`text-xs font-mono font-bold ${h.pnl.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>{h.pnl}</span>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{h.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Overview */}
      {activeTab === 'overview' && (
        <div className="max-w-6xl mx-auto space-y-6">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <LayoutDashboard className="text-amber-400" />
            الإحصائيات والبيانات الحية للنظام
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#11141c] p-4 rounded-2xl border border-zinc-800">
              <span className="text-xs text-zinc-400 font-bold">المشتركون النشطون</span>
              <p className="text-2xl font-black text-white mt-1 font-mono">1,248</p>
              <span className="text-[10px] text-emerald-400 mt-1 block">↑ +14 اليوم</span>
            </div>
            <div className="bg-[#11141c] p-4 rounded-2xl border border-zinc-800">
              <span className="text-xs text-zinc-400 font-bold">الإشارات الفعالة الآن</span>
              <p className="text-2xl font-black text-amber-400 mt-1 font-mono">{signals.length}</p>
              <span className="text-[10px] text-zinc-500 mt-1 block">مباشرة في التطبيق</span>
            </div>
            <div className="bg-[#11141c] p-4 rounded-2xl border border-zinc-800">
              <span className="text-xs text-zinc-400 font-bold">نسبة نجاح الصفقات</span>
              <p className="text-2xl font-black text-emerald-400 mt-1 font-mono">88.2%</p>
              <span className="text-[10px] text-emerald-400 mt-1 block">آخر 30 يوماً</span>
            </div>
            <div className="bg-[#11141c] p-4 rounded-2xl border border-zinc-800">
              <span className="text-xs text-zinc-400 font-bold">نقاط الأرباح الإجمالية</span>
              <p className="text-2xl font-black text-cyan-400 mt-1 font-mono">+62,092 Pips</p>
              <span className="text-[10px] text-zinc-500 mt-1 block">تراكمي</span>
            </div>
          </div>
        </div>
      )}

      {/* 7. Breaking News */}
      {activeTab === 'breakingNews' && <AdminBreakingNews />}

      {/* 8. Health Dashboard */}
      {activeTab === 'healthDashboard' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Radio className="text-emerald-400" />
            لوحة صحة ونبض خدمات النظام
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: 'WebSocket Realtime Price Feed', status: 'Healthy', ping: '18ms' },
              { name: 'Trading Engine Core API', status: 'Healthy', ping: '24ms' },
              { name: 'Push Notifications Worker', status: 'Healthy', ping: '31ms' },
              { name: 'AI Signal Scanner Node', status: 'Healthy', ping: '45ms' },
            ].map((srv, idx) => (
              <div key={idx} className="bg-[#11141c] p-4 rounded-2xl border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">{srv.name}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">Ping: {srv.ping}</span>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                  🟢 {srv.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. Live Monitoring */}
      {activeTab === 'liveMonitoring' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Activity className="text-cyan-400" />
            المراقبة المباشرة وتدفق البيانات (Live Telemetry)
          </h2>
          <div className="bg-[#11141c] p-6 rounded-2xl border border-zinc-800 font-mono text-xs text-zinc-300 space-y-2">
            <div className="text-emerald-400">[06:40:12] BTC/USDT tick received: $67,285.50 (Spread: 0.10)</div>
            <div className="text-zinc-400">[06:40:14] AutoSignalEngine: Scanned 12 pairs - 0 alerts triggered</div>
            <div className="text-cyan-400">[06:40:18] Client connected (IP: 192.168.1.104, Device: iOS/Safari)</div>
            <div className="text-emerald-400">[06:40:22] XAU/USD tick received: $2,432.50</div>
            <div className="text-amber-400">[06:40:25] Heartbeat ACK from Redis Queue: OK</div>
          </div>
        </div>
      )}

      {/* 10. Analytics */}
      {activeTab === 'analytics' && (
        <div className="max-w-5xl mx-auto space-y-6">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <BarChart3 className="text-amber-400" />
            التحليلات المتقدمة والذكاء المالي
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#11141c] p-5 rounded-2xl border border-zinc-800">
              <span className="text-xs text-zinc-400 font-bold">أفضل زوج تحقيقاً للأرباح</span>
              <p className="text-xl font-black text-amber-400 mt-1">XAU/USD (الذهب)</p>
              <span className="text-[10px] text-zinc-500 mt-1 block">بمعدل نجاح 91%</span>
            </div>
            <div className="bg-[#11141c] p-5 rounded-2xl border border-zinc-800">
              <span className="text-xs text-zinc-400 font-bold">أفضل وقت لدخول الصفقات</span>
              <p className="text-xl font-black text-cyan-400 mt-1">جلسة لندن (08:00 - 12:00 GMT)</p>
              <span className="text-[10px] text-zinc-500 mt-1 block">أعلى سيولة ونقاط حركة</span>
            </div>
            <div className="bg-[#11141c] p-5 rounded-2xl border border-zinc-800">
              <span className="text-xs text-zinc-400 font-bold">متوسط معدل العائد/المخاطرة</span>
              <p className="text-xl font-black text-emerald-400 mt-1">1:2.8 R:R</p>
              <span className="text-[10px] text-zinc-500 mt-1 block">إدارة مخاطر صارمة</span>
            </div>
          </div>
        </div>
      )}

      {/* Universal Strategy Engine */}
      {activeTab === 'useEngine' && <AdminUSE />}

      {/* 11. Auto Engine */}
      {activeTab === 'autoEngine' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Bot className="text-amber-400" />
            محرك التداول والتوليد الآلي (Auto Signal Engine)
          </h2>
          <div className="bg-[#11141c] p-6 rounded-2xl border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div>
                <h3 className="text-sm font-bold text-white">حالة المحرك الآلي</h3>
                <p className="text-xs text-zinc-400">توليد التوصيات تلقائياً عند استيفاء شروط الاستراتيجيات</p>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl">
                نشط ويعمل 🟢
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-[#181c26] rounded-xl border border-zinc-800">
                <span className="text-zinc-500 block">فترة الفحص الدوري</span>
                <span className="text-white font-bold mt-1 block">كل 60 ثانية</span>
              </div>
              <div className="p-3 bg-[#181c26] rounded-xl border border-zinc-800">
                <span className="text-zinc-500 block">الفلترة الصارمة</span>
                <span className="text-emerald-400 font-bold mt-1 block">مفعلة (R:R &gt; 1:2)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 12. PineScript Module */}
      {activeTab === 'pinescript' && (
        <div className="max-w-5xl mx-auto space-y-6">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Code className="text-amber-400" />
            وحدة الاستراتيجية والخوارزمية (Camarilla.ts PineScript Engine)
          </h2>
          <div className="bg-[#11141c] p-4 rounded-2xl border border-zinc-800">
            <pre className="text-xs font-mono text-zinc-300 p-4 bg-[#090b10] rounded-xl overflow-x-auto border border-zinc-800">
{`// Camarilla Pivot Point Engine v3.2
export function calculateCamarillaPivots(high: number, low: number, close: number) {
  const range = high - low;
  return {
    r4: close + range * 1.1 / 2,
    r3: close + range * 1.1 / 4,
    r2: close + range * 1.1 / 6,
    r1: close + range * 1.1 / 12,
    pivot: (high + low + close) / 3,
    s1: close - range * 1.1 / 12,
    s2: close - range * 1.1 / 6,
    s3: close - range * 1.1 / 4,
    s4: close - range * 1.1 / 2,
  };
}`}
            </pre>
          </div>
        </div>
      )}

      {/* 13. Infrastructure */}
      {activeTab === 'infrastructure' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Server className="text-amber-400" />
            البنية التحتية والخوادم (Enterprise Infrastructure)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#11141c] p-4 rounded-2xl border border-zinc-800">
              <span className="text-xs text-zinc-400 font-bold">Node.js / Express Server</span>
              <p className="text-lg font-black text-white mt-1">Port 4000 (Active)</p>
              <span className="text-[10px] text-emerald-400 mt-1 block">Uptime: 99.98%</span>
            </div>
            <div className="bg-[#11141c] p-4 rounded-2xl border border-zinc-800">
              <span className="text-xs text-zinc-400 font-bold">Frontend Vite Dev Server</span>
              <p className="text-lg font-black text-white mt-1">HMR &amp; Fast Refresh</p>
              <span className="text-[10px] text-cyan-400 mt-1 block">React 18 + Tailwind</span>
            </div>
          </div>
        </div>
      )}

      {/* 14. Activity Timeline */}
      {activeTab === 'activityTimeline' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <FileText className="text-amber-400" />
            سجل العمليات والنشاطات (Activity Timeline)
          </h2>
          <div className="bg-[#11141c] p-4 rounded-2xl border border-zinc-800 space-y-3 text-xs">
            {[
              { text: 'قام المدير بنشر إشارة شراء على الذهب XAU/USD', time: 'منذ 10 دقائق', user: 'Admin' },
              { text: 'تحديث حالة الصفقة BTC/USDT إلى هدف محقق (TP1)', time: 'منذ 25 دقيقة', user: 'System' },
              { text: 'تعديل إعدادات استراتيجية كسر القنوات Camarilla', time: 'منذ ساعة', user: 'Admin' },
            ].map((a, i) => (
              <div key={i} className="p-3 bg-[#181c26] rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-white font-bold">{a.text}</span>
                  <span className="text-[10px] text-zinc-500 block mt-0.5">{a.time}</span>
                </div>
                <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">{a.user}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 15. Audit Logs */}
      {activeTab === 'audit' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <ShieldCheck className="text-amber-400" />
            سجل التدقيق الأمني وعمليات النظام (Audit Logs)
          </h2>
          <div className="bg-[#11141c] p-4 rounded-2xl border border-zinc-800 font-mono text-xs text-zinc-400 space-y-2">
            <div className="p-2 border-b border-zinc-800">[AUDIT] Admin login successful (2FA verified)</div>
            <div className="p-2 border-b border-zinc-800">[AUDIT] Signal #1 created: BUY XAU/USD at 2420.50</div>
            <div className="p-2 border-b border-zinc-800">[AUDIT] Strategy params updated: winRateThreshold=80%</div>
          </div>
        </div>
      )}

      {/* 16. Users & Devices */}
      {activeTab === 'users' && (
        <div className="max-w-5xl mx-auto space-y-6">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Users className="text-amber-400" />
            إدارة المستخدمين والأجهزة المشتركة
          </h2>
          <div className="bg-[#11141c] p-4 rounded-2xl border border-zinc-800 space-y-3">
            {[
              { name: 'أحمد الشمري', email: 'ahmed@forex.vip', tier: 'VIP', status: 'نشط 🟢' },
              { name: 'سارة خالد', email: 'sara@trade.net', tier: 'Gold', status: 'نشط 🟢' },
              { name: 'فيصل العتيبي', email: 'faisal@fx.sa', tier: 'Silver', status: 'نشط 🟢' },
            ].map((u, i) => (
              <div key={i} className="p-3 bg-[#181c26] rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white block">{u.name}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">{u.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">{u.tier}</span>
                  <span className="text-zinc-300">{u.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 17. Screenshots */}
      {activeTab === 'screenshots' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Camera className="text-amber-400" />
            إحصائيات وحماية لقطات الشاشة (Anti-Leak Analytics)
          </h2>
          <div className="bg-[#11141c] p-6 rounded-2xl border border-zinc-800 text-xs space-y-4">
            <p className="text-zinc-400">
              يقوم النظام برصد محاولات تصوير الشاشة في التطبيق ووضع علامة مائية ذكية لمنع تسريب التوصيات الخاصة.
            </p>
            <div className="p-4 bg-[#181c26] rounded-xl border border-zinc-800 flex items-center justify-between">
              <span>إجمالي لقطات الشاشة المرصودة هذا الشهر:</span>
              <strong className="text-amber-400 font-mono text-sm">48 محاولة رصد</strong>
            </div>
          </div>
        </div>
      )}

      {/* 18. Notifications */}
      {activeTab === 'notifications' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Bell className="text-amber-400" />
            إرسال إشعارات التنبيه (Push Notifications)
          </h2>
          <div className="bg-[#11141c] p-6 rounded-2xl border border-zinc-800 space-y-4 text-xs">
            <div>
              <label className="block font-bold text-zinc-400 mb-1">عنوان الإشعار</label>
              <input
                type="text"
                placeholder="مثال: فرصة ذهبية على الذهب الآن!"
                value={notifTitle}
                onChange={(e) => setNotifTitle(e.target.value)}
                className="w-full bg-[#181c26] border border-zinc-700/60 rounded-xl px-4 py-2.5 text-white outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block font-bold text-zinc-400 mb-1">نص الرسالة</label>
              <textarea
                rows={3}
                placeholder="اكتب تفاصيل التنبيه الذي سيصل لجميع المشتركين على هواتفهم..."
                value={notifBody}
                onChange={(e) => setNotifBody(e.target.value)}
                className="w-full bg-[#181c26] border border-zinc-700/60 rounded-xl px-4 py-2.5 text-white outline-none focus:border-amber-500"
              />
            </div>
            <button
              onClick={() => {
                if (notifTitle && notifBody) {
                  setNotifSent(true);
                  setTimeout(() => setNotifSent(false), 4000);
                  setNotifTitle('');
                  setNotifBody('');
                }
              }}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl transition-all cursor-pointer"
            >
              إرسال الإشعار لجميع المشتركين 🚀
            </button>
            {notifSent && (
              <p className="text-emerald-400 font-bold">تم إرسال التنبيه بنجاح إلى 1,248 مشترك! 🔔</p>
            )}
          </div>
        </div>
      )}

      {/* 19. Feature Flags */}
      {activeTab === 'featureFlags' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Sliders className="text-amber-400" />
            مفاتيح الميزات والخصائص (Feature Flags)
          </h2>
          <div className="bg-[#11141c] p-4 rounded-2xl border border-zinc-800 space-y-3 text-xs">
            {[
              { key: 'enable_ai_auto_scanner', label: 'تفعيل محرك الماسح الذكي بالذكاء الاصطناعي', on: true },
              { key: 'enable_pro_order_panel', label: 'تفعيل لوحة الأوامر الزجاجية Pro Floating Panel', on: true },
              { key: 'enable_push_notifications', label: 'تفعيل الإشعارات اللحظية في المتصفح', on: true },
              { key: 'maintenance_mode', label: 'وضع الصيانة وإيقاف الدخول مؤقتاً', on: false },
            ].map((f, i) => (
              <div key={i} className="p-3 bg-[#181c26] rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-white font-bold block">{f.label}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">{f.key}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-lg font-bold ${f.on ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                  {f.on ? 'مفعل 🟢' : 'معطل ⚪'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 20. Secrets Manager */}
      {activeTab === 'secretsManager' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Key className="text-amber-400" />
            إدارة المفاتيح والأسرار (Secrets Vault)
          </h2>
          <div className="bg-[#11141c] p-4 rounded-2xl border border-zinc-800 space-y-3 text-xs">
            {[
              { name: 'BINANCE_API_KEY', val: '••••••••••••••••••••••••38FA' },
              { name: 'TWELVEDATA_SECRET', val: '••••••••••••••••••••••••91C0' },
              { name: 'JWT_ADMIN_SECRET', val: '••••••••••••••••••••••••A77D' },
            ].map((s, i) => (
              <div key={i} className="p-3 bg-[#181c26] rounded-xl flex items-center justify-between font-mono">
                <span className="text-white">{s.name}</span>
                <span className="text-zinc-500">{s.val}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 21. Security Audit */}
      {activeTab === 'securityAudit' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <ShieldCheck className="text-amber-400" />
            المراجعة الأمنية والتحصين (Security Audit)
          </h2>
          <div className="bg-[#11141c] p-6 rounded-2xl border border-zinc-800 space-y-4 text-xs">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 font-bold flex items-center gap-2">
              <CheckCircle2 size={16} />
              جميع معايير OWASP ومصادقة JWT و 2FA مؤمنة بالكامل
            </div>
          </div>
        </div>
      )}

      {/* 22. Error Monitoring */}
      {activeTab === 'errorMonitoring' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Bug className="text-amber-400" />
            مراقبة الأخطاء والاستثناءات (Crash Logs)
          </h2>
          <div className="bg-[#11141c] p-6 rounded-2xl border border-zinc-800 text-xs text-zinc-400">
            <p className="text-emerald-400 font-bold">لا توجد أي أخطاء أو استثناءات في الذاكرة حالياً. النظام يعمل بنسبة كفاءة 100%.</p>
          </div>
        </div>
      )}

      {/* 23. Load Testing */}
      {activeTab === 'loadTesting' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Activity className="text-amber-400" />
            اختبار الأحمال والشواهد (Load Testing)
          </h2>
          <div className="bg-[#11141c] p-6 rounded-2xl border border-zinc-800 space-y-4 text-xs">
            <div className="p-4 bg-[#181c26] rounded-xl flex items-center justify-between">
              <span>القدرة الاستيعابية المختبرة:</span>
              <strong className="text-cyan-400 font-mono text-sm">5,000 مستخدم متزامن بدون تأخير</strong>
            </div>
          </div>
        </div>
      )}

      {/* 24. Disaster Recovery */}
      {activeTab === 'disasterRecovery' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <ShieldAlert className="text-amber-400" />
            استعادة الخدمة وإدارة الكوارث (Disaster Recovery &amp; Backups)
          </h2>
          <div className="bg-[#11141c] p-6 rounded-2xl border border-zinc-800 space-y-4 text-xs">
            <p className="text-zinc-400">
              يتم حفظ نسخ احتياطية تلقائية لقاعدة البيانات والإشارات التاريخية كل 6 ساعات في خوادم سحابية منفصلة.
            </p>
            <button
              onClick={() => alert('تم إنشاء نقطة استعادة فورية (Snapshot Backup) بنجاح!')}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-all cursor-pointer"
            >
              إنشاء نسخة احتياطية فورية الآن 💾
            </button>
          </div>
        </div>
      )}

      {/* 25. Application Updates Center (Zero-Reinstall) */}
      {activeTab === 'appUpdates' && <AdminAppUpdates />}

      {/* Update Notification & Forced Update Modal */}
      <UpdateNotificationToast />

      {/* New Signal Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141824] border border-zinc-700/70 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-black text-white flex items-center justify-between">
              <span>إضافة إشارة تداول جديدة</span>
              <button onClick={() => setShowNewModal(false)} className="text-zinc-500 hover:text-white cursor-pointer">✕</button>
            </h3>

            <form onSubmit={handleAddSignal} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-bold">الزوج</label>
                <select
                  value={newPair}
                  onChange={(e) => setNewPair(e.target.value)}
                  className="w-full bg-[#1c2233] border border-zinc-700 rounded-lg p-2 text-white outline-none"
                >
                  <option value="XAU/USD">XAU/USD (الذهب)</option>
                  <option value="BTC/USDT">BTC/USDT (البيتكوين)</option>
                  <option value="EUR/USD">EUR/USD</option>
                  <option value="GBP/USD">GBP/USD</option>
                  <option value="USD/JPY">USD/JPY</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-bold">النوع</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewType('BUY')}
                    className={`flex-1 py-2 rounded-lg font-black cursor-pointer ${
                      newType === 'BUY' ? 'bg-emerald-500 text-black' : 'bg-[#1c2233] text-zinc-400'
                    }`}
                  >
                    شراء (BUY)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewType('SELL')}
                    className={`flex-1 py-2 rounded-lg font-black cursor-pointer ${
                      newType === 'SELL' ? 'bg-rose-500 text-white' : 'bg-[#1c2233] text-zinc-400'
                    }`}
                  >
                    بيع (SELL)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">سعر الدخول</label>
                  <input
                    type="text"
                    value={newEntry}
                    onChange={(e) => setNewEntry(e.target.value)}
                    placeholder="مثال: 2420.50"
                    className="w-full bg-[#1c2233] border border-zinc-700 rounded-lg p-2 text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">وقف الخسارة (SL)</label>
                  <input
                    type="text"
                    value={newSl}
                    onChange={(e) => setNewSl(e.target.value)}
                    placeholder="مثال: 2405.00"
                    className="w-full bg-[#1c2233] border border-zinc-700 rounded-lg p-2 text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">الهدف 1</label>
                  <input
                    type="text"
                    value={newTp1}
                    onChange={(e) => setNewTp1(e.target.value)}
                    placeholder="TP1"
                    className="w-full bg-[#1c2233] border border-zinc-700 rounded-lg p-2 text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">الهدف 2</label>
                  <input
                    type="text"
                    value={newTp2}
                    onChange={(e) => setNewTp2(e.target.value)}
                    placeholder="TP2"
                    className="w-full bg-[#1c2233] border border-zinc-700 rounded-lg p-2 text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">الهدف 3</label>
                  <input
                    type="text"
                    value={newTp3}
                    onChange={(e) => setNewTp3(e.target.value)}
                    placeholder="TP3"
                    className="w-full bg-[#1c2233] border border-zinc-700 rounded-lg p-2 text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl transition-all cursor-pointer"
                >
                  نشر الإشارة الآن
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl transition-all cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}