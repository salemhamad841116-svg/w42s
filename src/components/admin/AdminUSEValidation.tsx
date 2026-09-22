import React, { useEffect, useState } from 'react';
import { Activity, AlertCircle, RefreshCw, DollarSign, Percent, TrendingUp, AlertTriangle } from 'lucide-react';

interface ValidationData {
  account: {
    balance: number;
    equity: number;
    totalReturn: number;
    driftWarning: boolean;
  };
  comparison: {
    metric: string;
    historical: number;
    oos: number;
    forward: number;
  }[];
  grades: {
    grade: string;
    count: number;
    winRate: number;
    pnl: number;
  }[];
  breakdowns: {
    symbol: Record<string, number>;
    timeframe: Record<string, number>;
    regime: Record<string, number>;
    hour: Record<string, number>;
    weekday: Record<string, number>;
  };
  calibration: {
    bucket: string;
    actualWinRate: number;
  }[];
}

export function AdminUSEValidation() {
  const [data, setData] = useState<ValidationData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/use/admin/validation-dashboard');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        // Mock data for display purposes when API is not implemented
        setData({
          account: { balance: 100000, equity: 105230, totalReturn: 5.23, driftWarning: true },
          comparison: [
            { metric: 'Win Rate', historical: 65, oos: 62, forward: 58 },
            { metric: 'Expectancy', historical: 1.2, oos: 1.0, forward: 0.8 },
            { metric: 'Profit Factor', historical: 1.8, oos: 1.5, forward: 1.2 }
          ],
          grades: [
            { grade: 'A+', count: 120, winRate: 75, pnl: 2500 },
            { grade: 'A', count: 300, winRate: 68, pnl: 4000 },
            { grade: 'B', count: 500, winRate: 55, pnl: 1000 },
            { grade: 'C', count: 200, winRate: 45, pnl: -1200 }
          ],
          breakdowns: {
            symbol: { EURUSD: 45, GBPUSD: 30, XAUUSD: 25 },
            timeframe: { '15m': 20, '1h': 50, '4h': 30 },
            regime: { Trending: 60, Ranging: 40 },
            hour: { '08:00': 15, '14:00': 25, '02:00': 5 },
            weekday: { Monday: 20, Wednesday: 25, Friday: 15 }
          },
          calibration: [
            { bucket: '90-100%', actualWinRate: 88 },
            { bucket: '80-90%', actualWinRate: 82 },
            { bucket: '70-80%', actualWinRate: 68 },
            { bucket: '60-70%', actualWinRate: 65 }
          ]
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleResetAccount = async () => {
    try {
      await fetch('/api/use/admin/paper-account/reset', { method: 'POST' });
      fetchDashboardData();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !data) {
    return <div className="p-6 text-[#8F9CAE]">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#1A1F2E] border border-[#2A2E39] p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-sm text-[#8F9CAE]">رصيد الحساب الوهمي</div>
            <div className="text-2xl font-bold text-white font-mono tabular-nums">${data.account.balance.toLocaleString()}</div>
          </div>
          <DollarSign className="text-blue-500 w-8 h-8 opacity-50" />
        </div>
        
        <div className="bg-[#1A1F2E] border border-[#2A2E39] p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-sm text-[#8F9CAE]">حقوق الملكية (Equity)</div>
            <div className="text-2xl font-bold text-white font-mono tabular-nums">${data.account.equity.toLocaleString()}</div>
          </div>
          <Activity className="text-emerald-500 w-8 h-8 opacity-50" />
        </div>

        <div className="bg-[#1A1F2E] border border-[#2A2E39] p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-sm text-[#8F9CAE]">العائد الإجمالي (Total Return)</div>
            <div className={`text-2xl font-bold font-mono tabular-nums ${data.account.totalReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {data.account.totalReturn >= 0 ? '+' : ''}{data.account.totalReturn}%
            </div>
          </div>
          <Percent className="text-purple-500 w-8 h-8 opacity-50" />
        </div>

        <div className={`border p-4 rounded-xl flex items-center justify-between transition-colors ${data.account.driftWarning ? 'bg-red-500/10 border-red-500/50 animate-pulse' : 'bg-[#1A1F2E] border-[#2A2E39]'}`}>
          <div>
            <div className="text-sm text-[#8F9CAE]">تحذير الانحراف (Drift Warning)</div>
            <div className={`text-xl font-bold ${data.account.driftWarning ? 'text-red-500' : 'text-green-500'}`}>
              {data.account.driftWarning ? 'نشط (Active)' : 'طبيعي'}
            </div>
          </div>
          <AlertTriangle className={`w-8 h-8 ${data.account.driftWarning ? 'text-red-500' : 'text-green-500 opacity-50'}`} />
        </div>
      </div>

      {/* Account Actions */}
      <div className="flex justify-end">
        <button
          onClick={handleResetAccount}
          className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 px-4 py-2 rounded-lg transition-colors border border-red-500/50"
        >
          <RefreshCw className="w-4 h-4" />
          إعادة ضبط الحساب الورقي (Reset Paper Account)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Comparison Matrix */}
        <div className="bg-[#1A1F2E] border border-[#2A2E39] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#2A2E39] bg-[#131722]">
            <h3 className="font-bold text-white">مصفوفة المقارنة (Comparison Matrix)</h3>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-[#131722]/50 text-[#8F9CAE]">
              <tr>
                <th className="p-3 text-right">المقياس (Metric)</th>
                <th className="p-3 text-right">تاريخي (Historical)</th>
                <th className="p-3 text-right">خارج العينة (OOS)</th>
                <th className="p-3 text-right">مستقبلي (Forward)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2E39]">
              {data.comparison.map((row, i) => (
                <tr key={i} className="hover:bg-[#131722]/50">
                  <td className="p-3 font-medium text-[#8F9CAE]">{row.metric}</td>
                  <td className="p-3 font-mono tabular-nums text-white">{row.historical}</td>
                  <td className="p-3 font-mono tabular-nums text-white">{row.oos}</td>
                  <td className="p-3 font-mono tabular-nums text-white">{row.forward}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Performance by Grade */}
        <div className="bg-[#1A1F2E] border border-[#2A2E39] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#2A2E39] bg-[#131722]">
            <h3 className="font-bold text-white">الأداء حسب التقييم (Performance by Grade)</h3>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-[#131722]/50 text-[#8F9CAE]">
              <tr>
                <th className="p-3 text-right">التقييم (Grade)</th>
                <th className="p-3 text-right">عدد الصفقات (Count)</th>
                <th className="p-3 text-right">نسبة النجاح (Win Rate)</th>
                <th className="p-3 text-right">الربح/الخسارة (PnL)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2E39]">
              {data.grades.map((grade, i) => (
                <tr key={i} className="hover:bg-[#131722]/50">
                  <td className="p-3 font-bold text-white">{grade.grade}</td>
                  <td className="p-3 font-mono tabular-nums text-[#8F9CAE]">{grade.count}</td>
                  <td className="p-3 font-mono tabular-nums text-white">{grade.winRate}%</td>
                  <td className={`p-3 font-mono tabular-nums ${grade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ${grade.pnl}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calibration Curve */}
        <div className="bg-[#1A1F2E] border border-[#2A2E39] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#2A2E39] bg-[#131722]">
            <h3 className="font-bold text-white">منحنى المعايرة (Calibration Curve)</h3>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-[#131722]/50 text-[#8F9CAE]">
              <tr>
                <th className="p-3 text-right">النطاق المتوقع (Predicted Bucket)</th>
                <th className="p-3 text-right">النسبة الفعلية (Actual Win Rate)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2E39]">
              {data.calibration.map((cal, i) => (
                <tr key={i} className="hover:bg-[#131722]/50">
                  <td className="p-3 font-mono tabular-nums text-[#8F9CAE]">{cal.bucket}</td>
                  <td className="p-3 font-mono tabular-nums text-white">{cal.actualWinRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Breakdowns */}
        <div className="bg-[#1A1F2E] border border-[#2A2E39] rounded-xl p-4 lg:col-span-2">
          <h3 className="font-bold text-white mb-4">التحليلات التفصيلية (Breakdowns)</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-[#131722] p-3 rounded-lg border border-[#2A2E39]">
              <div className="text-xs text-[#8F9CAE] mb-2">حسب الرمز (Symbol)</div>
              {Object.entries(data.breakdowns.symbol).map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-[#8F9CAE]">{k}</span>
                  <span className="font-mono tabular-nums text-white">{v}%</span>
                </div>
              ))}
            </div>
            <div className="bg-[#131722] p-3 rounded-lg border border-[#2A2E39]">
              <div className="text-xs text-[#8F9CAE] mb-2">حسب الإطار (Timeframe)</div>
              {Object.entries(data.breakdowns.timeframe).map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-[#8F9CAE]">{k}</span>
                  <span className="font-mono tabular-nums text-white">{v}%</span>
                </div>
              ))}
            </div>
            <div className="bg-[#131722] p-3 rounded-lg border border-[#2A2E39]">
              <div className="text-xs text-[#8F9CAE] mb-2">حسب النظام (Regime)</div>
              {Object.entries(data.breakdowns.regime).map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-[#8F9CAE]">{k}</span>
                  <span className="font-mono tabular-nums text-white">{v}%</span>
                </div>
              ))}
            </div>
            <div className="bg-[#131722] p-3 rounded-lg border border-[#2A2E39]">
              <div className="text-xs text-[#8F9CAE] mb-2">حسب الساعة (Hour)</div>
              {Object.entries(data.breakdowns.hour).map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-[#8F9CAE]">{k}</span>
                  <span className="font-mono tabular-nums text-white">{v}%</span>
                </div>
              ))}
            </div>
            <div className="bg-[#131722] p-3 rounded-lg border border-[#2A2E39]">
              <div className="text-xs text-[#8F9CAE] mb-2">حسب اليوم (Weekday)</div>
              {Object.entries(data.breakdowns.weekday).map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-[#8F9CAE]">{k}</span>
                  <span className="font-mono tabular-nums text-white">{v}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
