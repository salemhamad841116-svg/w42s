import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Server,
  Key,
  Lock,
  Wallet,
  Activity,
  ChevronRight,
  Trash2,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Coins,
} from 'lucide-react';
import { useBrokerStore, BrokerType } from '../../stores/brokerStore';
import { brokerService } from '../../services/brokerService';

const MT5_COMMON_SERVERS = [
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200" dir="rtl">
      <div className="relative w-full max-w-3xl bg-[#0F121C] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-[#141824]/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Zap size={20} />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                ربط وتأكيد حسابات الوسطاء (Live Mainnet & MT5 MetaApi)
              </h2>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                توصيل وتنفيذ صفقات السوق الحقيقي عبر MT5 Live (MetaApi) و Binance Mainnet (Spot & Futures)
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(false)}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Active Broker Selector Banner */}
        <div className="px-6 py-3 bg-[#161B29] border-b border-zinc-800 flex items-center justify-between flex-wrap gap-3">
          <span className="text-xs font-bold text-zinc-400">حساب التداول النشط للتنفيذ:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {(
              [
                { id: 'MT5_LIVE', label: 'MT5 Live ⚡', icon: Server },
                { id: 'BINANCE_LIVE', label: 'Binance Live 🟡', icon: Coins },
                { id: 'MT5_DEMO', label: 'MT5 Demo', icon: Server },
                { id: 'BINANCE_TESTNET', label: 'Binance Testnet', icon: Coins },
                { id: 'DEMO_SANDBOX', label: 'Sandbox', icon: Layers },
              ] as const
            ).map((b) => {
              const Icon = b.icon;
              const isActive = activeBroker === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => setActiveBroker(b.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                      : 'bg-zinc-800/60 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Icon size={14} />
                  <span>{b.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex px-6 pt-3 border-b border-zinc-800 gap-2">
          <button
            onClick={() => setActiveTab('mt5')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'mt5'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Server size={15} />
            <span>حساب MT5 Live & Demo (MetaApi)</span>
            <span className={`w-2 h-2 rounded-full ${mt5Account.status === 'CONNECTED' ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
          </button>

          <button
            onClick={() => setActiveTab('binance')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'binance'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Coins size={15} />
            <span>حساب Binance Mainnet & Testnet</span>
            <span className={`w-2 h-2 rounded-full ${binanceAccount.status === 'CONNECTED' ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
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
          {/* 1. MT5 Tab */}
          {activeTab === 'mt5' && (
            <div className="space-y-6">
              {/* Account Balance Card */}
              <div className="p-5 rounded-2xl bg-[#141824] border border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">الرصيد (Balance)</span>
                  <span className="text-lg font-black font-mono text-white">
                    ${mt5Account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">السيولة (Equity)</span>
                  <span className="text-lg font-black font-mono text-emerald-400">
                    ${mt5Account.equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">الهامش المتاح (Free Margin)</span>
                  <span className="text-lg font-black font-mono text-cyan-400">
                    ${mt5Account.freeMargin.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">الرافعة (Leverage)</span>
                  <span className="text-lg font-black font-mono text-amber-400">
                    1:{mt5Account.leverage}
                  </span>
                </div>
              </div>

              {/* Form Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1.5">رقم الحساب (Login ID)</label>
                  <input
                    type="text"
                    placeholder="مثال: 10982345"
                    value={mt5Credentials.login}
                    onChange={(e) => setMT5Credentials({ login: e.target.value })}
                    className="w-full bg-[#161B29] border border-zinc-700/70 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1.5">كلمة مرور التداول (Password)</label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={mt5Credentials.password || ''}
                    onChange={(e) => setMT5Credentials({ password: e.target.value })}
                    className="w-full bg-[#161B29] border border-zinc-700/70 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-400 mb-1.5">اسم سيرفر الوسيط (Server Name)</label>
                  <input
                    type="text"
                    placeholder="مثال: Exness-Trial01"
                    value={mt5Credentials.server}
                    onChange={(e) => setMT5Credentials({ server: e.target.value })}
                    className="w-full bg-[#161B29] border border-zinc-700/70 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-amber-500 outline-none mb-2"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] text-zinc-500 self-center">مقترحات:</span>
                    {MT5_COMMON_SERVERS.map((srv) => (
                      <button
                        key={srv}
                        type="button"
                        onClick={() => setMT5Credentials({ server: srv })}
                        className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[10px] font-mono transition-colors"
                      >
                        {srv}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-400 mb-1.5">بيئة تشغيل MT5 (Environment)</label>
                  <div className="flex gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setMT5Credentials({ isLive: true, environment: 'live' })}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                        mt5Credentials.isLive !== false
                          ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                          : 'bg-[#161B29] text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      ⚡ MT5 Live Production (MetaApi)
                    </button>
                    <button
                      type="button"
                      onClick={() => setMT5Credentials({ isLive: false, environment: 'demo' })}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                        mt5Credentials.isLive === false
                          ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                          : 'bg-[#161B29] text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      🛡️ MT5 Demo / Trial
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-400 mb-1.5">MetaApi Live Account ID (معرّف الحساب السحابي)</label>
                  <input
                    type="text"
                    placeholder="e.g. 5f8b2c45-9a12-4c3e-b678-abcdef012345"
                    value={mt5Credentials.accountId || ''}
                    onChange={(e) => setMT5Credentials({ accountId: e.target.value })}
                    className="w-full bg-[#161B29] border border-zinc-700/70 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-400 mb-1.5">مفتاح MetaApi Cloud Token</label>
                  <input
                    type="password"
                    placeholder="أدخل MetaApi Token للتنفيذ المباشر"
                    value={mt5Credentials.metaApiToken || ''}
                    onChange={(e) => setMT5Credentials({ metaApiToken: e.target.value })}
                    className="w-full bg-[#161B29] border border-zinc-700/70 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${mt5Account.status === 'CONNECTED' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-zinc-500'}`} />
                  <span className="text-xs text-zinc-400">
                    الحالة: {mt5Account.status === 'CONNECTED' ? 'متصل بنجاح' : 'غير متصل'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTestMT5}
                    disabled={testingMT5}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={testingMT5 ? 'animate-spin' : ''} />
                    <span>فحص الاتصال وجلب الرصيد</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. Binance Testnet Tab */}
          {activeTab === 'binance' && (
            <div className="space-y-6">
              {/* Account Balance Card */}
              <div className="p-5 rounded-2xl bg-[#141824] border border-zinc-800/80 grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">محفظة USDT المتاحة</span>
                  <span className="text-lg font-black font-mono text-emerald-400">
                    {binanceAccount.availableUSDT.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">إجمالي رصيد المحفظة</span>
                  <span className="text-lg font-black font-mono text-white">
                    {binanceAccount.balanceUSDT.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">شبكة التداول</span>
                  <span className="text-lg font-black font-mono text-amber-400 uppercase">
                    {binanceCredentials.network}
                  </span>
                </div>
              </div>

              {/* Form Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1.5">بيئة شبكة Binance (Environment)</label>
                  <div className="flex gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setBinanceCredentials({ isLive: true, environment: 'live' })}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                        binanceCredentials.isLive !== false
                          ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                          : 'bg-[#161B29] text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      🟡 Binance Live Mainnet (الحساب الحقيقي)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBinanceCredentials({ isLive: false, environment: 'testnet' })}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                        binanceCredentials.isLive === false
                          ? 'bg-zinc-700 text-white'
                          : 'bg-[#161B29] text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      🧪 Binance Testnet (تجريبي)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1.5">سوق التداول (Market Segment)</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setBinanceCredentials({ network: 'futures' })}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                        binanceCredentials.network === 'futures'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-[#161B29] text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      USDⓈ-M Futures (العقود الآجلة)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBinanceCredentials({ network: 'spot' })}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                        binanceCredentials.network === 'spot'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-[#161B29] text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      Spot Market (التداول الفوري)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1.5">Binance API Key</label>
                  <input
                    type="text"
                    placeholder="أدخل مفتاح Binance API Key (أو يُحقن تلقائياً من Cloud Run)"
                    value={binanceCredentials.apiKey}
                    onChange={(e) => setBinanceCredentials({ apiKey: e.target.value })}
                    className="w-full bg-[#161B29] border border-zinc-700/70 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1.5">Binance API Secret</label>
                  <input
                    type="password"
                    placeholder="أدخل مفتاح Binance API Secret (أو يُحقن تلقائياً من Cloud Run)"
                    value={binanceCredentials.apiSecret}
                    onChange={(e) => setBinanceCredentials({ apiSecret: e.target.value })}
                    className="w-full bg-[#161B29] border border-zinc-700/70 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${binanceAccount.status === 'CONNECTED' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-zinc-500'}`} />
                  <span className="text-xs text-zinc-400">
                    الحالة: {binanceAccount.status === 'CONNECTED' ? 'متصل بنجاح' : 'غير متصل'}
                  </span>
                </div>

                <button
                  onClick={handleTestBinance}
                  disabled={testingBinance}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw size={14} className={testingBinance ? 'animate-spin' : ''} />
                  <span>فحص اتصال Testnet وجلب الرصيد</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. Execution Logs Tab */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400">
                  سجل استجابات وتذاكر التنفيذ الحية الصادرة إلى خوادم الوسطاء
                </span>
                {executionLogs.length > 0 && (
                  <button
                    onClick={clearExecutionLogs}
                    className="px-3 py-1 bg-zinc-800 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Trash2 size={12} />
                    <span>تفريغ السجل</span>
                  </button>
                )}
              </div>

              {executionLogs.length === 0 ? (
                <div className="p-12 text-center text-zinc-500 bg-[#141824] border border-zinc-800 rounded-2xl">
                  لم يتم تنفيذ أي صفقات تجريبية حتى الآن. جرب إرسال أمر من لوحة الأوامر أو الشارت.
                </div>
              ) : (
                <div className="space-y-2">
                  {executionLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3.5 bg-[#141824] border border-zinc-800/80 rounded-xl flex items-center justify-between gap-4 hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg font-bold text-xs ${
                            log.side === 'BUY'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {log.side === 'BUY' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-white">{log.symbol}</span>
                            <span className="text-[10px] font-mono uppercase bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded">
                              {log.broker}
                            </span>
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
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
                        onClick={() => setSelectedLogResponse(log)}
                        className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-mono transition-colors"
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

        {/* JSON Response Drawer if selected */}
        {selectedLogResponse && (
          <div className="p-4 bg-black/90 border-t border-zinc-800 text-xs font-mono space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="font-bold">استجابة الوسيط الرسمية (Broker Response Payload):</span>
              <button
                onClick={() => setSelectedLogResponse(null)}
                className="text-zinc-400 hover:text-white"
              >
                إغلاق ✕
              </button>
            </div>
            <pre className="p-3 bg-zinc-950 rounded-xl overflow-x-auto text-emerald-400 text-[11px] leading-relaxed max-h-40">
              {JSON.stringify(selectedLogResponse.rawResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
