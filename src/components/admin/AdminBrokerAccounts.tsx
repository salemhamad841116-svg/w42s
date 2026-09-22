import React, { useState } from 'react';
import {
  Server,
  Coins,
  RefreshCw,
  Zap,
  Activity,
  Trash2,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Play,
  Layers,
} from 'lucide-react';
import { useBrokerStore, BrokerType } from '../../trading/stores/brokerStore';
import { brokerService } from '../../trading/services/brokerService';

const MT5_PRESETS = [
  'Exness-Trial01',
  'MetaQuotes-Demo',
  'ICMarkets-Demo01',
  'XMGlobal-Demo3',
  'Tickmill-Demo',
];

export const AdminBrokerAccounts: React.FC = () => {
  const {
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

  const [testingMT5, setTestingMT5] = useState(false);
  const [testingBinance, setTestingBinance] = useState(false);
  const [testOrderRunning, setTestOrderRunning] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<any | null>(null);

  // Quick Test Order state
  const [testSymbol, setTestSymbol] = useState('BTC/USDT');
  const [testSide, setTestSide] = useState<'BUY' | 'SELL'>('BUY');
  const [testLot, setTestLot] = useState('0.01');

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

  const handleSendTestOrder = async () => {
    setTestOrderRunning(true);
    try {
      await brokerService.executeOrder({
        symbol: testSymbol,
        side: testSide,
        type: 'MARKET',
        amount: parseFloat(testLot) || 0.01,
      });
    } finally {
      setTestOrderRunning(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Zap className="text-amber-400" />
            إدارة وتأكيد حسابات التداول الحية والتجريبية (MT5 Live & Binance Mainnet)
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            إعداد قنوات الاتصال بالوسطاء الحقيقيين والتجريبيين للتداول المباشر وسحب الهامش والرصيد الحي
          </p>
        </div>

        {/* Active Broker Switcher */}
        <div className="flex items-center gap-1.5 bg-[#11141c] p-1.5 rounded-2xl border border-zinc-800 flex-wrap">
          <span className="text-xs font-bold text-zinc-400 px-2">الوسيط النشط:</span>
          {(
            [
              { id: 'MT5_LIVE', label: 'MT5 Live ⚡' },
              { id: 'BINANCE_LIVE', label: 'Binance Live 🟡' },
              { id: 'MT5_DEMO', label: 'MT5 Demo' },
              { id: 'BINANCE_TESTNET', label: 'Binance Testnet' },
              { id: 'DEMO_SANDBOX', label: 'Sandbox 🟢' },
            ] as const
          ).map((b) => (
            <button
              key={b.id}
              onClick={() => setActiveBroker(b.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeBroker === b.id
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: MT5 on Left / Binance on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: MT5 Live & Demo via MetaApi */}
        <div className="p-6 bg-[#11141c] border border-zinc-800 rounded-3xl space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Server size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">حساب MetaTrader 5 (MetaApi Cloud)</h3>
                <span className="text-[11px] text-zinc-500 font-mono">سيرفر الوسيط: {mt5Account.server}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${mt5Account.status === 'CONNECTED' ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
              <span className="text-xs font-bold text-zinc-400">
                {mt5Account.status === 'CONNECTED' ? 'متصل' : 'منقطع'}
              </span>
            </div>
          </div>

          {/* Live Metrics */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-[#161B29] rounded-2xl border border-zinc-800/80">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">الرصيد</span>
              <span className="text-base font-black font-mono text-white">
                ${mt5Account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">الهامش المتاح</span>
              <span className="text-base font-black font-mono text-emerald-400">
                ${mt5Account.freeMargin.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">الرافعة</span>
              <span className="text-base font-black font-mono text-amber-400">
                1:{mt5Account.leverage}
              </span>
            </div>
          </div>

          {/* Inputs */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">بيئة MT5 (Environment)</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMT5Credentials({ isLive: true, environment: 'live' })}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    mt5Credentials.isLive !== false
                      ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                      : 'bg-[#181C28] text-zinc-400 border border-zinc-700/60'
                  }`}
                >
                  ⚡ MT5 Live (حقيقي)
                </button>
                <button
                  type="button"
                  onClick={() => setMT5Credentials({ isLive: false, environment: 'demo' })}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    mt5Credentials.isLive === false
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                      : 'bg-[#181C28] text-zinc-400 border border-zinc-700/60'
                  }`}
                >
                  🛡️ MT5 Demo (تجريبي)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">MetaApi Live Account ID</label>
              <input
                type="text"
                placeholder="e.g. 5f8b2c45-9a12-4c3e-b678-abcdef012345"
                value={mt5Credentials.accountId || ''}
                onChange={(e) => setMT5Credentials({ accountId: e.target.value })}
                className="w-full bg-[#181C28] border border-zinc-700/60 rounded-xl px-3.5 py-2 text-xs text-white font-mono outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">رقم الحساب (Login ID)</label>
              <input
                type="text"
                value={mt5Credentials.login}
                onChange={(e) => setMT5Credentials({ login: e.target.value })}
                className="w-full bg-[#181C28] border border-zinc-700/60 rounded-xl px-3.5 py-2 text-xs text-white font-mono outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">كلمة مرور التداول (Password)</label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={mt5Credentials.password || ''}
                onChange={(e) => setMT5Credentials({ password: e.target.value })}
                className="w-full bg-[#181C28] border border-zinc-700/60 rounded-xl px-3.5 py-2 text-xs text-white font-mono outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">اسم سيرفر الوسيط (Server Name)</label>
              <input
                type="text"
                value={mt5Credentials.server}
                onChange={(e) => setMT5Credentials({ server: e.target.value })}
                className="w-full bg-[#181C28] border border-zinc-700/60 rounded-xl px-3.5 py-2 text-xs text-white font-mono outline-none focus:border-amber-500 mb-1.5"
              />
              <div className="flex flex-wrap gap-1">
                {MT5_PRESETS.map((srv) => (
                  <button
                    key={srv}
                    onClick={() => setMT5Credentials({ server: srv })}
                    className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[10px] font-mono transition-colors"
                  >
                    {srv}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">MetaApi Cloud Token</label>
              <input
                type="password"
                placeholder="أدخل Token حساب MetaApi للتكامل السحابي المباشر"
                value={mt5Credentials.metaApiToken || ''}
                onChange={(e) => setMT5Credentials({ metaApiToken: e.target.value })}
                className="w-full bg-[#181C28] border border-zinc-700/60 rounded-xl px-3.5 py-2 text-xs text-white font-mono outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <button
            onClick={handleTestMT5}
            disabled={testingMT5}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={testingMT5 ? 'animate-spin' : ''} />
            <span>فحص اتصال MT5 وجلب الرصيد الحي</span>
          </button>
        </div>

        {/* Card 2: Binance Mainnet / Testnet */}
        <div className="p-6 bg-[#11141c] border border-zinc-800 rounded-3xl space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Coins size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">
                  {binanceCredentials.isLive !== false ? 'حساب Binance Mainnet (الحقيقي)' : 'حساب Binance Testnet (تجريبي)'}
                </h3>
                <span className="text-[11px] text-zinc-500 font-mono">الشبكة: {binanceCredentials.network.toUpperCase()}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${binanceAccount.status === 'CONNECTED' ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
              <span className="text-xs font-bold text-zinc-400">
                {binanceAccount.status === 'CONNECTED' ? 'متصل' : 'منقطع'}
              </span>
            </div>
          </div>

          {/* Live Metrics */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-[#161B29] rounded-2xl border border-zinc-800/80">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">رصيد USDT المتاح</span>
              <span className="text-base font-black font-mono text-emerald-400">
                {binanceAccount.availableUSDT.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT
              </span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">إجمالي رصيد المحفظة</span>
              <span className="text-base font-black font-mono text-white">
                {binanceAccount.balanceUSDT.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT
              </span>
            </div>
          </div>

          {/* Inputs */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">بيئة شبكة Binance (Environment)</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBinanceCredentials({ isLive: true, environment: 'live' })}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    binanceCredentials.isLive !== false
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                      : 'bg-[#181C28] text-zinc-400 border border-zinc-700/60'
                  }`}
                >
                  🟡 Live Mainnet (حقيقي)
                </button>
                <button
                  type="button"
                  onClick={() => setBinanceCredentials({ isLive: false, environment: 'testnet' })}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    binanceCredentials.isLive === false
                      ? 'bg-zinc-700 text-white'
                      : 'bg-[#181C28] text-zinc-400 border border-zinc-700/60'
                  }`}
                >
                  🧪 Testnet (تجريبي)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">سوق التداول</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBinanceCredentials({ network: 'futures' })}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    binanceCredentials.network === 'futures'
                      ? 'bg-amber-500 text-black'
                      : 'bg-[#181C28] text-zinc-400 border border-zinc-700/60'
                  }`}
                >
                  Futures (عقود آجلة)
                </button>
                <button
                  type="button"
                  onClick={() => setBinanceCredentials({ network: 'spot' })}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    binanceCredentials.network === 'spot'
                      ? 'bg-amber-500 text-black'
                      : 'bg-[#181C28] text-zinc-400 border border-zinc-700/60'
                  }`}
                >
                  Spot (فوري)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">
                {binanceCredentials.isLive !== false ? 'Live API Key' : 'Testnet API Key'}
              </label>
              <input
                type="text"
                placeholder={binanceCredentials.isLive !== false ? 'أدخل Live Binance API Key' : 'أدخل Binance Testnet API Key'}
                value={binanceCredentials.apiKey}
                onChange={(e) => setBinanceCredentials({ apiKey: e.target.value })}
                className="w-full bg-[#181C28] border border-zinc-700/60 rounded-xl px-3.5 py-2 text-xs text-white font-mono outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">
                {binanceCredentials.isLive !== false ? 'Live API Secret' : 'Testnet API Secret'}
              </label>
              <input
                type="password"
                placeholder={binanceCredentials.isLive !== false ? 'أدخل Live Binance API Secret' : 'أدخل Binance Testnet API Secret'}
                value={binanceCredentials.apiSecret}
                onChange={(e) => setBinanceCredentials({ apiSecret: e.target.value })}
                className="w-full bg-[#181C28] border border-zinc-700/60 rounded-xl px-3.5 py-2 text-xs text-white font-mono outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <button
            onClick={handleTestBinance}
            disabled={testingBinance}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={testingBinance ? 'animate-spin' : ''} />
            <span>فحص اتصال Binance وجلب الرصيد الحي</span>
          </button>
        </div>
      </div>

      {/* Section 2: Order Flow Live Tester */}
      <div className="p-6 bg-[#11141c] border border-zinc-800 rounded-3xl space-y-4">
        <h3 className="text-sm font-black text-white flex items-center gap-2">
          <Play size={16} className="text-amber-400" />
          اختبار دورة تنفيذ الأوامر المباشرة (Order Flow Simulator)
        </h3>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={testSymbol}
            onChange={(e) => setTestSymbol(e.target.value)}
            className="bg-[#181C28] border border-zinc-700/60 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
          >
            <option value="BTC/USDT">BTC/USDT</option>
            <option value="ETH/USDT">ETH/USDT</option>
            <option value="XAU/USD">XAU/USD (Gold)</option>
            <option value="EUR/USD">EUR/USD</option>
          </select>

          <div className="flex gap-1">
            <button
              onClick={() => setTestSide('BUY')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                testSide === 'BUY' ? 'bg-emerald-500 text-white' : 'bg-[#181C28] text-zinc-400'
              }`}
            >
              شراء (BUY)
            </button>
            <button
              onClick={() => setTestSide('SELL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                testSide === 'SELL' ? 'bg-rose-500 text-white' : 'bg-[#181C28] text-zinc-400'
              }`}
            >
              بيع (SELL)
            </button>
          </div>

          <input
            type="text"
            value={testLot}
            onChange={(e) => setTestLot(e.target.value)}
            placeholder="0.01"
            className="w-20 bg-[#181C28] border border-zinc-700/60 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none text-center"
          />

          <button
            onClick={handleSendTestOrder}
            disabled={testOrderRunning}
            className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-400 text-black font-black text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
          >
            <Zap size={14} />
            <span>إرسال أمر تجريبي إلى {activeBroker}</span>
          </button>
        </div>
      </div>

      {/* Section 3: Live Execution Logs */}
      <div className="p-6 bg-[#11141c] border border-zinc-800 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Activity size={16} className="text-emerald-400" />
            سجل تدفق الأوامر والتذاكر الحية ({executionLogs.length})
          </h3>
          {executionLogs.length > 0 && (
            <button
              onClick={clearExecutionLogs}
              className="px-3 py-1 bg-zinc-800 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <Trash2 size={12} />
              <span>تفريغ السجل</span>
            </button>
          )}
        </div>

        {executionLogs.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 bg-[#161B29] border border-zinc-800/80 rounded-2xl text-xs">
            لم يتم تسجيل أي تذاكر تنفيذ حتى الآن. استخدم زر الإرسال التجريبي بالأعلى لاختبار تدفق الأوامر.
          </div>
        ) : (
          <div className="space-y-2">
            {executionLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 bg-[#161B29] border border-zinc-800/80 rounded-2xl flex items-center justify-between gap-4 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl font-bold text-xs ${
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
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-bold">
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
                  onClick={() => setSelectedResponse(log)}
                  className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-mono transition-colors"
                >
                  عرض JSON
                </button>
              </div>
            ))}
          </div>
        )}

        {selectedResponse && (
          <div className="p-4 bg-black/95 border border-zinc-800 rounded-2xl text-xs font-mono space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="font-bold">Broker Response JSON:</span>
              <button
                onClick={() => setSelectedResponse(null)}
                className="text-zinc-400 hover:text-white"
              >
                إغلاق ✕
              </button>
            </div>
            <pre className="p-3 bg-zinc-950 rounded-xl overflow-x-auto text-emerald-400 text-[11px] leading-relaxed max-h-48">
              {JSON.stringify(selectedResponse.rawResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
