import React, { useState } from 'react';
import {
  X,
  Zap,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Server,
  Key,
  Lock,
  Wallet,
  Activity,
  Trash2,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Coins,
  Eye,
  EyeOff,
  ExternalLink,
  ShieldCheck,
  Globe,
  Radio,
} from 'lucide-react';
import { useBrokerStore, BrokerType } from '../../stores/brokerStore';
import { brokerService } from '../../services/brokerService';

const MT5_COMMON_SERVERS = [
  'adss-Live3',
  'adss-Live2',
  'adss-Live',
  'adss-Demo',
  'Exness-Trial01',
  'MetaQuotes-Demo',
  'ICMarkets-Demo01',
  'XMGlobal-Demo3',
  'Tickmill-Demo',
];

export const BrokerAccountsModal: React.FC = () => {
  const {
    isModalOpen,
    setIsModalOpen,
    activeBroker,
    setActiveBroker,
    mt5Credentials,
    setMT5Credentials,
    mt5Account,
    binanceCredentials,
    setBinanceCredentials,
    binanceAccount,
    executionLogs,
    clearExecutionLogs,
  } = useBrokerStore();

  const [activeTab, setActiveTab] = useState<'mt5' | 'binance' | 'logs'>('mt5');
  const [testingMT5, setTestingMT5] = useState(false);
  const [testingBinance, setTestingBinance] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showMetaToken, setShowMetaToken] = useState(false);
  const [showBinanceSecret, setShowBinanceSecret] = useState(false);
  const [selectedLogResponse, setSelectedLogResponse] = useState<any | null>(null);

  if (!isModalOpen) return null;

  const handleTestMT5 = async () => {
    setTestingMT5(true);
    try {
      await brokerService.testMT5Connection(mt5Credentials);
    } finally {
      setTestingMT5(false);
    }
  };

  const handleTestBinance = async () => {
    setTestingBinance(true);
    try {
      await brokerService.testBinanceConnection(binanceCredentials);
    } finally {
      setTestingBinance(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200"
      dir="rtl"
    >
      <div className="relative w-full max-w-4xl bg-[#0F121C] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-[#141824]/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Zap size={22} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                ربط وتأكيد حسابات الوسطاء (Live MetaApi & Binance)
              </h2>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                إدارة خوادم التداول الحية وتنفيذ الصفقات المباشرة عبر MetaApi (MT4/MT5) وبينانس
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors cursor-pointer"
            title="إغلاق"
          >
            <X size={20} />
          </button>
        </div>

        {/* Active Broker Switcher Banner */}
        <div className="px-6 py-3 bg-[#121624] border-b border-zinc-800/80 flex items-center justify-between flex-wrap gap-2.5">
          <div className="flex items-center gap-2">
            <Radio size={14} className="text-amber-400 animate-pulse" />
            <span className="text-xs font-bold text-zinc-300">حساب التنفيذ النشط حالياً:</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {(
              [
                { id: 'MT5_LIVE', label: 'MT5 Live ⚡', icon: Server, color: 'emerald' },
                { id: 'BINANCE_LIVE', label: 'Binance Live 🟡', icon: Coins, color: 'amber' },
                { id: 'MT5_DEMO', label: 'MT5 Demo', icon: Server, color: 'blue' },
                { id: 'BINANCE_TESTNET', label: 'Binance Testnet', icon: Coins, color: 'purple' },
                { id: 'DEMO_SANDBOX', label: 'Sandbox (محاكاة)', icon: Layers, color: 'zinc' },
              ] as const
            ).map((b) => {
              const Icon = b.icon;
              const isActive = activeBroker === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setActiveBroker(b.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/40'
                      : 'bg-zinc-800/70 text-zinc-400 hover:text-white hover:bg-zinc-700/60'
                  }`}
                >
                  <Icon size={13} />
                  <span>{b.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex px-6 pt-3 border-b border-zinc-800/80 bg-[#141824]/40 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('mt5')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'mt5'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Server size={15} />
            <span>خادم MetaTrader 5 / 4 (MetaApi)</span>
            <span
              className={`w-2 h-2 rounded-full ${
                mt5Account.status === 'CONNECTED'
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                  : mt5Account.status === 'CONNECTING'
                  ? 'bg-amber-400 animate-ping'
                  : mt5Account.status === 'ERROR'
                  ? 'bg-rose-400'
                  : 'bg-zinc-600'
              }`}
            />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('binance')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'binance'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Coins size={15} />
            <span>منصة Binance (Spot & Futures)</span>
            <span
              className={`w-2 h-2 rounded-full ${
                binanceAccount.status === 'CONNECTED'
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                  : binanceAccount.status === 'CONNECTING'
                  ? 'bg-amber-400 animate-ping'
                  : binanceAccount.status === 'ERROR'
                  ? 'bg-rose-400'
                  : 'bg-zinc-600'
              }`}
            />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'logs'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Activity size={15} />
            <span>سجل دورة التنفيذ ({executionLogs.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* ================= MT5 / MT4 TAB ================= */}
          {activeTab === 'mt5' && (
            <div className="space-y-6">
              {/* Account Balance Metrics Cards */}
              <div className="p-5 rounded-2xl bg-[#141824] border border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">
                    الرصيد الحقيقي (Balance)
                  </span>
                  <span className="text-xl font-black font-mono text-white tracking-tight">
                    ${(mt5Account.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">
                    السيولة الحية (Equity)
                  </span>
                  <span className="text-xl font-black font-mono text-emerald-400 tracking-tight">
                    ${(mt5Account.equity || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">
                    الهامش المتاح (Free Margin)
                  </span>
                  <span className="text-xl font-black font-mono text-cyan-400 tracking-tight">
                    ${(mt5Account.freeMargin || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">
                    الرافعة (Leverage)
                  </span>
                  <span className="text-xl font-black font-mono text-amber-400 tracking-tight">
                    1:{mt5Account.leverage || 100}
                  </span>
                </div>
              </div>

              {/* Form Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Environment Selector */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">بيئة تشغيل MT5 (Environment)</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setMT5Credentials({ isLive: true, environment: 'live' })}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        mt5Credentials.isLive !== false
                          ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-black'
                          : 'bg-[#161B29] text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      ⚡ MT5 Live Production (الحساب الحقيقي MetaApi)
                    </button>
                    <button
                      type="button"
                      onClick={() => setMT5Credentials({ isLive: false, environment: 'demo' })}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        mt5Credentials.isLive === false
                          ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-black'
                          : 'bg-[#161B29] text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      🛡️ MT5 Demo / Trial (حساب تجريبي)
                    </button>
                  </div>
                </div>

                {/* Server Name with Preset Chips */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center justify-between">
                    <span>اسم سيرفر الوسيط (Broker Server Name)</span>
                    <span className="text-[10px] font-normal text-zinc-400">اختر من القائمة أو اكتب يدوياً</span>
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: adss-Live3 أو Exness-Trial01"
                    value={mt5Credentials.server || ''}
                    onChange={(e) => setMT5Credentials({ server: e.target.value })}
                    className="w-full bg-[#161B29] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 outline-none mb-2.5"
                  />
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-zinc-400 font-bold ml-1">سيرفرات سريعة:</span>
                    {MT5_COMMON_SERVERS.map((srv) => (
                      <button
                        key={srv}
                        type="button"
                        onClick={() => setMT5Credentials({ server: srv })}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer ${
                          mt5Credentials.server === srv
                            ? 'bg-amber-500 text-black font-bold shadow-sm'
                            : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/50'
                        }`}
                      >
                        {srv}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Login ID */}
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">رقم حساب التداول (Login ID)</label>
                  <input
                    type="text"
                    placeholder="مثال: 145044257"
                    value={mt5Credentials.login || ''}
                    onChange={(e) => setMT5Credentials({ login: e.target.value })}
                    className="w-full bg-[#161B29] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-amber-500 outline-none"
                  />
                </div>

                {/* Password with Toggle */}
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">كلمة مرور التداول (Password)</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      value={mt5Credentials.password || ''}
                      onChange={(e) => setMT5Credentials({ password: e.target.value })}
                      className="w-full bg-[#161B29] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-amber-500 outline-none pl-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-2.5 text-zinc-400 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* MetaApi Account ID */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center justify-between">
                    <span>MetaApi Live Account ID (معرّف الحساب السحابي)</span>
                    <span className="text-[10px] font-normal text-amber-400">مطلوب للتنفيذ السحابي المباشر</span>
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: 58366593-8434-44eb-88f7-ed7896a17943"
                    value={mt5Credentials.accountId || ''}
                    onChange={(e) => setMT5Credentials({ accountId: e.target.value })}
                    className="w-full bg-[#161B29] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-amber-500 outline-none"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">
                    انسخ الـ Account ID من لوحة حسابات MetaApi Cloud الخاصة بك لربط حساب MT4 / MT5.
                  </p>
                </div>

                {/* MetaApi Cloud Token */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center justify-between">
                    <span>مفتاح MetaApi Cloud Token (API Key)</span>
                    <span className="text-[10px] font-normal text-amber-400">مطلوب للتحقق والتفويض</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showMetaToken ? 'text' : 'password'}
                      placeholder="أدخل مفتاح MetaApi Access Token للتنفيذ المباشر"
                      value={mt5Credentials.metaApiToken || ''}
                      onChange={(e) => setMT5Credentials({ metaApiToken: e.target.value })}
                      className="w-full bg-[#161B29] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-amber-500 outline-none pl-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowMetaToken(!showMetaToken)}
                      className="absolute left-3 top-2.5 text-zinc-400 hover:text-white cursor-pointer"
                    >
                      {showMetaToken ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons & Comprehensive Status */}
              <div className="space-y-3 pt-3 border-t border-zinc-800/80">
                {/* Error Banner with Tips */}
                {mt5Account.error && (mt5Account.status === 'ERROR' || mt5Account.status === 'DISCONNECTED') && (
                  <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-300 font-mono space-y-1 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2 font-bold text-rose-400">
                      <AlertCircle size={16} />
                      <span>تفاصيل خطأ الاتصال:</span>
                    </div>
                    <p className="text-[11px] leading-relaxed pr-6" dir="ltr">
                      {mt5Account.error}
                    </p>
                    <p className="text-[10px] text-zinc-400 pr-6 pt-1 font-sans">
                      💡 نصيحة: تأكد من أن الحساب في حالة <b>DEPLOYED</b> في لوحة تحكم MetaApi وأن التوكن ساري المفعول.
                    </p>
                  </div>
                )}

                {/* Status Bar & Trigger */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-3 h-3 rounded-full transition-all ${
                        mt5Account.status === 'CONNECTED'
                          ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]'
                          : mt5Account.status === 'CONNECTING'
                          ? 'bg-amber-400 animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.6)]'
                          : mt5Account.status === 'ERROR'
                          ? 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.5)]'
                          : 'bg-zinc-600'
                      }`}
                    />
                    <div className="text-xs">
                      <span
                        className={`font-bold ${
                          mt5Account.status === 'CONNECTED'
                            ? 'text-emerald-400'
                            : mt5Account.status === 'CONNECTING'
                            ? 'text-amber-400'
                            : mt5Account.status === 'ERROR'
                            ? 'text-rose-400'
                            : 'text-zinc-400'
                        }`}
                      >
                        {mt5Account.status === 'CONNECTED' && `متصل بنجاح 🟢 (${mt5Account.server || mt5Credentials.server})`}
                        {mt5Account.status === 'CONNECTING' && 'جاري فحص الاتصال بالخادم والتحقق... 🟡'}
                        {mt5Account.status === 'ERROR' && 'فشل الاتصال بالوسيط 🔴'}
                        {mt5Account.status === 'DISCONNECTED' && 'الحالة: غير متصل'}
                      </span>
                      {mt5Account.lastSyncTime && mt5Account.status === 'CONNECTED' && (
                        <span className="text-[10px] text-zinc-500 font-mono mr-2">
                          (آخر تحديث: {new Date(mt5Account.lastSyncTime).toLocaleTimeString()})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleTestMT5}
                      disabled={testingMT5}
                      className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-black text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw size={14} className={testingMT5 ? 'animate-spin' : ''} />
                      <span>{testingMT5 ? 'جاري الفحص والمزامنة...' : 'فحص الاتصال وجلب الرصيد الحقيقي ⚡'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= BINANCE TAB ================= */}
          {activeTab === 'binance' && (
            <div className="space-y-6">
              {/* Account Balance Metrics Cards */}
              <div className="p-5 rounded-2xl bg-[#141824] border border-zinc-800/80 grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">محفظة USDT المتاحة</span>
                  <span className="text-xl font-black font-mono text-emerald-400">
                    {(binanceAccount.availableUSDT || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">إجمالي رصيد المحفظة</span>
                  <span className="text-xl font-black font-mono text-white">
                    {(binanceAccount.balanceUSDT || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">سوق التداول</span>
                  <span className="text-xl font-black font-mono text-amber-400 uppercase">
                    {binanceCredentials.network || 'futures'}
                  </span>
                </div>
              </div>

              {/* Form Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">بيئة شبكة Binance (Environment)</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setBinanceCredentials({ isLive: true, environment: 'live' })}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        binanceCredentials.isLive !== false
                          ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-black'
                          : 'bg-[#161B29] text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      🟡 Binance Live Mainnet (الحساب الحقيقي)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBinanceCredentials({ isLive: false, environment: 'testnet' })}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        binanceCredentials.isLive === false
                          ? 'bg-zinc-700 text-white font-black'
                          : 'bg-[#161B29] text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      🧪 Binance Testnet (تجريبي)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">سوق التداول (Market Segment)</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setBinanceCredentials({ network: 'futures' })}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        binanceCredentials.network === 'futures'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black'
                          : 'bg-[#161B29] text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      USDⓈ-M Futures (العقود الآجلة)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBinanceCredentials({ network: 'spot' })}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        binanceCredentials.network === 'spot'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black'
                          : 'bg-[#161B29] text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      Spot Market (التداول الفوري)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">Binance API Key</label>
                  <input
                    type="text"
                    placeholder="أدخل مفتاح Binance API Key"
                    value={binanceCredentials.apiKey || ''}
                    onChange={(e) => setBinanceCredentials({ apiKey: e.target.value })}
                    className="w-full bg-[#161B29] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">Binance API Secret</label>
                  <div className="relative">
                    <input
                      type={showBinanceSecret ? 'text' : 'password'}
                      placeholder="أدخل مفتاح Binance API Secret"
                      value={binanceCredentials.apiSecret || ''}
                      onChange={(e) => setBinanceCredentials({ apiSecret: e.target.value })}
                      className="w-full bg-[#161B29] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-amber-500 outline-none pl-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowBinanceSecret(!showBinanceSecret)}
                      className="absolute left-3 top-2.5 text-zinc-400 hover:text-white cursor-pointer"
                    >
                      {showBinanceSecret ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons & Status */}
              <div className="space-y-3 pt-3 border-t border-zinc-800/80">
                {binanceAccount.error && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-300 font-mono">
                    {binanceAccount.error}
                  </div>
                )}

                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        binanceAccount.status === 'CONNECTED'
                          ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]'
                          : binanceAccount.status === 'CONNECTING'
                          ? 'bg-amber-400 animate-pulse'
                          : binanceAccount.status === 'ERROR'
                          ? 'bg-rose-400'
                          : 'bg-zinc-600'
                      }`}
                    />
                    <span
                      className={`text-xs font-bold ${
                        binanceAccount.status === 'CONNECTED'
                          ? 'text-emerald-400'
                          : binanceAccount.status === 'CONNECTING'
                          ? 'text-amber-400'
                          : binanceAccount.status === 'ERROR'
                          ? 'text-rose-400'
                          : 'text-zinc-400'
                      }`}
                    >
                      {binanceAccount.status === 'CONNECTED' ? 'متصل بنجاح 🟢' : binanceAccount.status === 'CONNECTING' ? 'جاري الفحص... 🟡' : 'غير متصل'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleTestBinance}
                    disabled={testingBinance}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={testingBinance ? 'animate-spin' : ''} />
                    <span>{testingBinance ? 'جاري الفحص...' : 'فحص اتصال Binance وجلب الرصيد 🟡'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= EXECUTION LOGS TAB ================= */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300">
                  سجل استجابات وتذاكر التنفيذ الحية الصادرة إلى خوادم الوسطاء
                </span>
                {executionLogs.length > 0 && (
                  <button
                    type="button"
                    onClick={clearExecutionLogs}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>تفريغ السجل</span>
                  </button>
                )}
              </div>

              {executionLogs.length === 0 ? (
                <div className="p-12 text-center text-zinc-500 bg-[#141824] border border-zinc-800 rounded-2xl space-y-2">
                  <Activity size={28} className="mx-auto text-zinc-600 animate-pulse" />
                  <p className="text-xs font-bold">لم يتم تسجيل أي صفقات تنفيذ مباشرة حتى الآن.</p>
                  <p className="text-[11px] text-zinc-600">سيتم توثيق كل تذكرة أمر يتم إرسالها إلى خوادم الوسطاء هنا لحظياً.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {executionLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3.5 bg-[#141824] border border-zinc-800/80 rounded-2xl flex items-center justify-between gap-4 hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-xl font-bold text-xs ${
                            log.side === 'BUY'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {log.side === 'BUY' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-white">{log.symbol}</span>
                            <span className="text-[10px] font-mono uppercase bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-md">
                              {log.broker}
                            </span>
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                              Ticket: {log.ticketId}
                            </span>
                          </div>
                          <div className="text-[10px] text-zinc-400 mt-1 flex items-center gap-2">
                            <span>الحجم: {log.volume} Lot</span>
                            <span>•</span>
                            <span>السعر: ${log.executedPrice?.toFixed(2)}</span>
                            <span>•</span>
                            <span>الزمن: {log.latencyMs}ms</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedLogResponse(log)}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-mono transition-colors cursor-pointer"
                      >
                        عرض JSON
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* JSON Response Drawer */}
        {selectedLogResponse && (
          <div className="p-4 bg-black/95 border-t border-zinc-800 text-xs font-mono space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="font-bold text-amber-400">استجابة السيرفر الرسمية (Raw Broker Payload):</span>
              <button
                type="button"
                onClick={() => setSelectedLogResponse(null)}
                className="text-zinc-400 hover:text-white cursor-pointer px-2 py-1 rounded bg-zinc-800"
              >
                إغلاق ✕
              </button>
            </div>
            <pre className="p-3 bg-zinc-950 rounded-xl overflow-x-auto text-emerald-400 text-[11px] leading-relaxed max-h-48 border border-zinc-800">
              {JSON.stringify(selectedLogResponse.rawResponse || selectedLogResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
