import React, { useEffect, useState } from 'react';
import { Brain, Plus, Shield, Play, Check, X, AlertTriangle, FileCode, BarChart3, Clock, Target, TrendingUp } from 'lucide-react';
import { AdminCalibration } from './AdminCalibration';
import { AdminUSEValidation } from './AdminUSEValidation';

interface Strategy {
  id: string;
  name: string;
  description: string;
  language: string;
  status: 'DRAFT' | 'VALIDATED' | 'BACKTESTED' | 'APPROVED' | 'PUBLISHED' | 'DISABLED';
  createdAt: string;
  backtestResults?: BacktestResult | null;
}

interface BacktestResult {
  winRate: number;
  profitFactor: number;
  maxDrawdown: number;
  sharpeRatio: number;
  expectancy: number;
  overfittingRisk: boolean;
  oosPerformance: string;
}

interface PredictionLog {
  id: string;
  timestamp: string;
  symbol: string;
  timeframe: string;
  direction: 'UP' | 'DOWN' | 'NEUTRAL';
  confidence: number;
  result: 'PENDING' | 'CORRECT' | 'WRONG';
  regime: string;
}

export function AdminUSE() {
  const [activeTab, setActiveTab] = useState<'strategies' | 'calibration' | 'predictions' | 'validation'>('strategies');
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [predictions, setPredictions] = useState<PredictionLog[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newStrategy, setNewStrategy] = useState({ name: '', description: '', code: '' });
  
  // Backtest parameters
  const [backtestSymbol, setBacktestSymbol] = useState('EURUSD');
  const [backtestTimeframe, setBacktestTimeframe] = useState('1h');
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchStrategies();
    fetchPredictions();
  }, []);

  const fetchStrategies = async () => {
    try {
      const res = await fetch('/api/use/admin/strategies');
      if (res.ok) {
        const data = await res.json();
        setStrategies(data);
      }
    } catch (error) {
      console.error('Error fetching strategies:', error);
    }
  };

  const fetchPredictions = async () => {
    try {
      const res = await fetch('/api/use/admin/predictions?limit=50');
      if (res.ok) {
        const data = await res.json();
        setPredictions(data);
      }
    } catch (error) {
      console.error('Error fetching predictions:', error);
    }
  };

  const handleCreateStrategy = async () => {
    try {
      const res = await fetch('/api/use/admin/strategies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStrategy)
      });
      if (res.ok) {
        setIsCreateModalOpen(false);
        setNewStrategy({ name: '', description: '', code: '' });
        fetchStrategies();
      }
    } catch (error) {
      console.error('Error creating strategy:', error);
    }
  };

  const handleAction = async (id: string, action: string) => {
    setIsLoading(true);
    try {
      const url = action === 'backtest' 
        ? `/api/use/admin/strategies/${id}/backtest` 
        : `/api/use/admin/strategies/${id}/action`;
        
      const body = action === 'backtest' 
        ? JSON.stringify({ symbol: backtestSymbol, timeframe: backtestTimeframe })
        : JSON.stringify({ action });

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
      });
      if (res.ok) {
        fetchStrategies();
      }
    } catch (error) {
      console.error(`Error performing action ${action}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: Strategy['status']) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
      case 'VALIDATED': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'BACKTESTED': return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      case 'APPROVED': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'PUBLISHED': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      case 'DISABLED': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getResultColor = (result: PredictionLog['result']) => {
    switch (result) {
      case 'CORRECT': return 'text-green-500';
      case 'WRONG': return 'text-red-500';
      default: return 'text-amber-500';
    }
  };

  return (
    <div className="min-h-screen bg-[#131722] text-white p-6">
      {/* Section 1: Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-8 h-8 text-amber-400" />
            محرك الاستراتيجيات الكونية (Universal Strategy Engine)
          </h1>
          <p className="text-[#8F9CAE] mt-2">
            إدارة الاستراتيجيات ودورة حياتها: Draft &rarr; Validate &rarr; Backtest &rarr; Approve &rarr; Publish
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          إضافة استراتيجية
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-[#2A2E39] mb-8 pb-px">
        <button
          onClick={() => setActiveTab('strategies')}
          className={`pb-3 px-2 border-b-2 font-medium transition-colors ${
            activeTab === 'strategies' ? 'border-blue-500 text-blue-500' : 'border-transparent text-[#8F9CAE] hover:text-white'
          }`}
        >
          الاستراتيجيات
        </button>
        <button
          onClick={() => setActiveTab('calibration')}
          className={`pb-3 px-2 border-b-2 font-medium transition-colors ${
            activeTab === 'calibration' ? 'border-blue-500 text-blue-500' : 'border-transparent text-[#8F9CAE] hover:text-white'
          }`}
        >
          التعلم المباشر (Live Learning)
        </button>
        <button
          onClick={() => setActiveTab('predictions')}
          className={`pb-3 px-2 border-b-2 font-medium transition-colors ${
            activeTab === 'predictions' ? 'border-blue-500 text-blue-500' : 'border-transparent text-[#8F9CAE] hover:text-white'
          }`}
        >
          سجل التوقعات
        </button>
        <button
          onClick={() => setActiveTab('validation')}
          className={`pb-3 px-2 border-b-2 font-medium transition-colors ${
            activeTab === 'validation' ? 'border-blue-500 text-blue-500' : 'border-transparent text-[#8F9CAE] hover:text-white'
          }`}
        >
          التداول الورقي والتحقق المستقبلي
        </button>
      </div>

      {activeTab === 'strategies' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {strategies.map((strategy) => (
          <div key={strategy.id} className="bg-[#1A1F2E] border border-[#2A2E39] rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{strategy.name}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-mono bg-[#131722] border border-[#2A2E39] px-2 py-1 rounded text-[#8F9CAE]">
                    {strategy.language}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(strategy.status)}`}>
                    {strategy.status}
                  </span>
                </div>
              </div>
              <span className="text-xs text-[#8F9CAE] tabular-nums font-mono">
                {new Date(strategy.createdAt).toLocaleDateString()}
              </span>
            </div>

            <p className="text-sm text-[#8F9CAE] mb-6 line-clamp-2">{strategy.description}</p>

            {/* Backtest Results */}
            {strategy.backtestResults && (
              <div className="bg-[#131722] p-4 rounded-lg mb-6 border border-[#2A2E39]">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-3">
                  <div>
                    <div className="text-xs text-[#8F9CAE]">Win Rate</div>
                    <div className="font-mono tabular-nums text-green-400">
                      {(strategy.backtestResults.winRate * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#8F9CAE]">Profit Factor</div>
                    <div className="font-mono tabular-nums text-blue-400">
                      {strategy.backtestResults.profitFactor.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#8F9CAE]">Max Drawdown</div>
                    <div className="font-mono tabular-nums text-red-400">
                      {(strategy.backtestResults.maxDrawdown * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#8F9CAE]">Sharpe Ratio</div>
                    <div className="font-mono tabular-nums text-white">
                      {strategy.backtestResults.sharpeRatio.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#8F9CAE]">Expectancy</div>
                    <div className="font-mono tabular-nums text-white">
                      {strategy.backtestResults.expectancy.toFixed(4)}
                    </div>
                  </div>
                </div>
                
                {strategy.backtestResults.overfittingRisk && (
                  <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 p-2 rounded text-xs mt-2">
                    <AlertTriangle className="w-4 h-4" />
                    خطر التخصيص الزائد (Overfitting Risk)
                  </div>
                )}
                <div className="text-xs text-[#8F9CAE] mt-2 flex justify-between">
                  <span>أداء خارج العينة (OOS):</span>
                  <span className="font-mono text-white">{strategy.backtestResults.oosPerformance}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mt-auto">
              {strategy.status === 'DRAFT' && (
                <button
                  onClick={() => handleAction(strategy.id, 'validate')}
                  disabled={isLoading}
                  className="flex items-center gap-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-sm transition-colors"
                >
                  <Shield className="w-4 h-4" /> تحقق
                </button>
              )}
              
              {strategy.status === 'VALIDATED' && (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select 
                    value={backtestSymbol}
                    onChange={(e) => setBacktestSymbol(e.target.value)}
                    className="bg-[#131722] border border-[#2A2E39] rounded px-2 py-1.5 text-sm text-white"
                  >
                    <option value="EURUSD">EURUSD</option>
                    <option value="GBPUSD">GBPUSD</option>
                    <option value="XAUUSD">XAUUSD</option>
                    <option value="BTCUSD">BTCUSD</option>
                  </select>
                  <select
                    value={backtestTimeframe}
                    onChange={(e) => setBacktestTimeframe(e.target.value)}
                    className="bg-[#131722] border border-[#2A2E39] rounded px-2 py-1.5 text-sm text-white"
                  >
                    <option value="15m">15m</option>
                    <option value="1h">1h</option>
                    <option value="4h">4h</option>
                    <option value="1d">1d</option>
                  </select>
                  <button
                    onClick={() => handleAction(strategy.id, 'backtest')}
                    disabled={isLoading}
                    className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm transition-colors whitespace-nowrap"
                  >
                    <Play className="w-4 h-4" /> اختبار تاريخي
                  </button>
                </div>
              )}
              
              {strategy.status === 'BACKTESTED' && (
                <button
                  onClick={() => handleAction(strategy.id, 'approve')}
                  disabled={isLoading}
                  className="flex items-center gap-1 bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded text-sm transition-colors"
                >
                  <Check className="w-4 h-4" /> اعتماد
                </button>
              )}
              
              {strategy.status === 'APPROVED' && (
                <button
                  onClick={() => handleAction(strategy.id, 'publish')}
                  disabled={isLoading}
                  className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded text-sm transition-colors"
                >
                  <Target className="w-4 h-4" /> نشر
                </button>
              )}
              
              {strategy.status !== 'DISABLED' && (
                <button
                  onClick={() => handleAction(strategy.id, 'disable')}
                  disabled={isLoading}
                  className="flex items-center gap-1 bg-red-500/20 hover:bg-red-500/30 text-red-500 px-3 py-1.5 rounded text-sm transition-colors ml-auto"
                >
                  <X className="w-4 h-4" /> تعطيل
                </button>
              )}
            </div>
          </div>
        ))}
        {strategies.length === 0 && (
          <div className="col-span-full text-center py-12 text-[#8F9CAE]">
            لا توجد استراتيجيات حالياً
          </div>
        )}
      </div>
      )}

      {/* Calibration Tab */}
      {activeTab === 'calibration' && (
        <AdminCalibration />
      )}

      {/* Validation Tab */}
      {activeTab === 'validation' && (
        <div className="bg-[#1A1F2E] border border-[#2A2E39] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <h2 className="text-xl font-bold">التداول الورقي والتحقق المستقبلي (Forward Validation & Paper Trading)</h2>
          </div>
          <AdminUSEValidation />
        </div>
      )}

      {/* Section 5: Prediction Audit Log */}
      {activeTab === 'predictions' && (
      <div className="bg-[#1A1F2E] border border-[#2A2E39] rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-bold">سجل التوقعات (Prediction Audit Log)</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#131722] text-[#8F9CAE]">
              <tr>
                <th className="p-3 rounded-l-lg text-right">الوقت (Timestamp)</th>
                <th className="p-3 text-right">الرمز (Symbol)</th>
                <th className="p-3 text-right">الإطار (Timeframe)</th>
                <th className="p-3 text-right">الاتجاه (Direction)</th>
                <th className="p-3 text-right">الثقة (Confidence)</th>
                <th className="p-3 text-right">النظام (Regime)</th>
                <th className="p-3 rounded-r-lg text-right">النتيجة (Result)</th>
              </tr>
            </thead>
            <tbody>
              {predictions.map((log) => (
                <tr key={log.id} className="border-b border-[#2A2E39] hover:bg-[#131722]/50 transition-colors">
                  <td className="p-3 font-mono tabular-nums">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-3 font-mono">{log.symbol}</td>
                  <td className="p-3 font-mono">{log.timeframe}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      log.direction === 'UP' ? 'bg-green-500/20 text-green-400' :
                      log.direction === 'DOWN' ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {log.direction}
                    </span>
                  </td>
                  <td className="p-3 font-mono tabular-nums">{(log.confidence * 100).toFixed(1)}%</td>
                  <td className="p-3">{log.regime}</td>
                  <td className={`p-3 font-bold ${getResultColor(log.result)}`}>
                    {log.result === 'PENDING' ? 'قيد الانتظار' :
                     log.result === 'CORRECT' ? 'صحيح' : 'خاطئ'}
                  </td>
                </tr>
              ))}
              {predictions.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-[#8F9CAE]">لا توجد توقعات مسجلة</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Section 3: Create Strategy Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1A1F2E] border border-[#2A2E39] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#2A2E39] flex justify-between items-center sticky top-0 bg-[#1A1F2E]">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FileCode className="w-5 h-5 text-blue-500" />
                إضافة استراتيجية جديدة
              </h2>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[#8F9CAE] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#8F9CAE] mb-1">اسم الاستراتيجية</label>
                <input 
                  type="text"
                  value={newStrategy.name}
                  onChange={(e) => setNewStrategy({...newStrategy, name: e.target.value})}
                  className="w-full bg-[#131722] border border-[#2A2E39] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="مثال: Mean Reversion 1H"
                  dir="rtl"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#8F9CAE] mb-1">الوصف</label>
                <textarea 
                  value={newStrategy.description}
                  onChange={(e) => setNewStrategy({...newStrategy, description: e.target.value})}
                  className="w-full bg-[#131722] border border-[#2A2E39] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors h-24 resize-none"
                  placeholder="وصف مبدأ عمل الاستراتيجية..."
                  dir="rtl"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#8F9CAE] mb-1">الكود المصدري (Source Code)</label>
                <textarea 
                  value={newStrategy.code}
                  onChange={(e) => setNewStrategy({...newStrategy, code: e.target.value})}
                  className="w-full bg-[#131722] border border-[#2A2E39] rounded-lg px-4 py-3 text-green-400 font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors h-64"
                  placeholder="// Write your strategy logic here..."
                  dir="ltr"
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-[#2A2E39] flex justify-end gap-3 sticky bottom-0 bg-[#1A1F2E]">
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 rounded-lg text-[#8F9CAE] hover:bg-[#131722] transition-colors"
              >
                إلغاء
              </button>
              <button 
                onClick={handleCreateStrategy}
                disabled={!newStrategy.name || !newStrategy.code}
                className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors"
              >
                حفظ كمسودة (Save Draft)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
