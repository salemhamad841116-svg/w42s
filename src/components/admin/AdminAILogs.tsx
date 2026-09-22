import React, { useEffect, useState } from 'react';
import { Brain, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, AlertTriangle, ShieldAlert, Power, Settings2 } from 'lucide-react';
import { type AISignal } from '../../trading/components/AIGatewayProvider';
import { useAISettingsStore } from '../../trading/stores/useAISettingsStore';

export function AdminAILogs() {
  const [logs, setLogs] = useState<AISignal[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAIEnabled, maxRiskPerTradePercent, toggleAI, setMaxRisk } = useAISettingsStore();

  // Initial fetch and SSE stream
  useEffect(() => {
    // 1. Fetch historical logs
    fetch('/api/ai/logs')
      .then(res => res.json())
      .then(data => {
        setLogs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch AI logs:', err);
        setLoading(false);
      });

    // 2. Listen to real-time decisions
    const eventSource = new EventSource('/api/ai/stream');
    eventSource.onmessage = (event) => {
      try {
        const signal: AISignal = JSON.parse(event.data);
        setLogs(prev => [signal, ...prev].slice(0, 100)); // Keep last 100
      } catch (err) {}
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Brain className="w-7 h-7 text-purple-400" />
            قرارات محرك الذكاء الاصطناعي (AI Execution Logs)
          </h2>
          <p className="text-[#8F9CAE] text-sm mt-1">
            مراقبة حية لحظية لقرارات محرك Gemini بناءً على الأخبار ومطابقة البيانات التاريخية.
          </p>
        </div>
      </div>

      {/* --- Risk Settings Panel --- */}
      <div className="bg-[#131722] rounded-xl border border-[#2A2E39] p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
            <Settings2 className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-white font-medium text-lg">إدارة المخاطر والتنفيذ الآلي (Risk Control)</h3>
            <p className="text-sm text-[#8F9CAE]">ضبط مدى شراسة الذكاء الاصطناعي وتفعيل/إيقاف التداول الآلي.</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#8F9CAE] flex items-center gap-1">
              <ShieldAlert className="w-4 h-4" /> نسبة المخاطرة للصفقة (Max Risk %):
            </label>
            <div className="flex items-center gap-3">
              <input 
                type="range" 
                min="0.1" 
                max="5.0" 
                step="0.1" 
                value={maxRiskPerTradePercent}
                onChange={(e) => setMaxRisk(parseFloat(e.target.value))}
                className="w-48 accent-purple-500"
              />
              <span className="text-white font-mono bg-[#181C25] px-3 py-1 rounded border border-[#2A2E39]">
                {maxRiskPerTradePercent.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="h-10 w-px bg-[#2A2E39]"></div>

          <button
            onClick={toggleAI}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${
              isAIEnabled 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.1)] hover:bg-green-500/30' 
                : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
            }`}
          >
            <Power className="w-5 h-5" />
            {isAIEnabled ? 'النظام الآلي نشط (ON)' : 'النظام الآلي متوقف (OFF)'}
          </button>
        </div>
      </div>
      {/* --------------------------- */}

      <div className="bg-[#131722] rounded-xl border border-[#2A2E39] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[#8F9CAE]">جاري التحميل...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center text-[#8F9CAE]">
            <Brain className="w-12 h-12 mb-4 opacity-20" />
            <p>لا توجد قرارات مسجلة حتى الآن.</p>
            <p className="text-xs mt-2 opacity-50">المحرك يعمل وينتظر أخباراً عاجلة قوية.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#8F9CAE]">
              <thead className="bg-[#181C25] text-xs uppercase border-b border-[#2A2E39]">
                <tr>
                  <th className="px-6 py-4 font-medium text-right">الوقت</th>
                  <th className="px-6 py-4 font-medium text-right">الزوج / الاتجاه</th>
                  <th className="px-6 py-4 font-medium text-right">عنوان الخبر (المحفز)</th>
                  <th className="px-6 py-4 font-medium text-right">ثقة AI (Gemini)</th>
                  <th className="px-6 py-4 font-medium text-right">دعم السوابق (SQLite)</th>
                  <th className="px-6 py-4 font-medium text-right">المستويات (SL / TP)</th>
                  <th className="px-6 py-4 font-medium text-right">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2E39]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#181C25]/50 transition-colors">
                    {/* Time */}
                    <td className="px-6 py-4 whitespace-nowrap text-right flex items-center gap-2">
                      <Clock className="w-4 h-4 opacity-50" />
                      {new Date(log.timestamp).toLocaleTimeString('ar-SA')}
                    </td>

                    {/* Symbol & Direction */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center gap-2">
                        {log.direction === 'BUY' ? (
                          <span className="flex items-center gap-1 text-[#00C087] bg-[#00C087]/10 px-2 py-1 rounded">
                            <TrendingUp className="w-4 h-4" /> شراء
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[#F23645] bg-[#F23645]/10 px-2 py-1 rounded">
                            <TrendingDown className="w-4 h-4" /> بيع
                          </span>
                        )}
                        <span className="font-bold text-white tabular-nums">{log.symbol}</span>
                      </div>
                    </td>

                    {/* News Headline */}
                    <td className="px-6 py-4 text-right">
                      <p className="text-white text-xs max-w-[250px] truncate" title={log.newsHeadline}>
                        {log.newsHeadline}
                      </p>
                      <p className="text-[10px] text-purple-400 mt-1 truncate max-w-[250px]" title={log.reason}>
                        السبب: {log.reason}
                      </p>
                    </td>

                    {/* AI Confidence */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-[#2A2E39] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${log.confidence}%` }}
                          />
                        </div>
                        <span className="text-white font-mono">{log.confidence}%</span>
                      </div>
                    </td>

                    {/* Historical Match */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                      <div className="flex flex-col gap-1">
                        <span className="text-white">{log.historicalMatch.winRate}% نجاح تاريخي</span>
                        <span className="opacity-70">بناءً على {log.historicalMatch.similarEventsFound} سابقة</span>
                      </div>
                    </td>

                    {/* Dynamic Levels */}
                    <td className="px-6 py-4 whitespace-nowrap text-right font-mono text-xs">
                      <div className="flex flex-col gap-1">
                        <span className="text-[#F23645]">SL: {log.levels.sl}</span>
                        <span className="text-[#00C087]">TP: {log.levels.tp}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {log.status === 'EXECUTED' ? (
                        <span className="inline-flex items-center gap-1 text-[#00C087] text-xs font-medium">
                          <CheckCircle className="w-4 h-4" />
                          تم التنفيذ
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[#8F9CAE] text-xs font-medium">
                          <AlertTriangle className="w-4 h-4" />
                          تجاهل (ثقة منخفضة)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
