import React from 'react';

interface ConfluencePanelProps {
  confluence: any;
}

export const ConfluencePanel: React.FC<ConfluencePanelProps> = ({ confluence }) => {
  if (!confluence) return null;

  const { pipeline, expectedValue, grade, finalDecision } = confluence;

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'bg-emerald-500 text-white';
      case 'A': return 'bg-green-500 text-white';
      case 'B': return 'bg-blue-500 text-white';
      case 'C': return 'bg-amber-500 text-white';
      default: return 'bg-gray-500 text-white'; // NO_TRADE
    }
  };

  const getDecisionColor = (decision: string) => {
    if (decision?.includes('BUY')) return 'text-green-600';
    if (decision?.includes('SELL')) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl border border-black/10 rounded-2xl p-6 shadow-lg mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        
        {/* Left/Top: Pipeline */}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-4">مسار اتخاذ القرار (Pipeline)</h3>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <div className="flex flex-col items-center p-3 bg-gray-50 border border-gray-200 rounded-xl min-w-[100px]">
              <span className="text-xs text-gray-500 mb-1">الوضع (Regime)</span>
              <span className="font-semibold text-gray-800">{pipeline?.regime || '-'}</span>
            </div>
            <div className="text-gray-400">→</div>
            <div className="flex flex-col items-center p-3 bg-gray-50 border border-gray-200 rounded-xl min-w-[100px]">
              <span className="text-xs text-gray-500 mb-1">إطار كبير (HTF)</span>
              <span className="font-semibold text-gray-800">{pipeline?.htf || '-'}</span>
            </div>
            <div className="text-gray-400">→</div>
            <div className="flex flex-col items-center p-3 bg-gray-50 border border-gray-200 rounded-xl min-w-[100px]">
              <span className="text-xs text-gray-500 mb-1">إطار صغير (LTF)</span>
              <span className="font-semibold text-gray-800">{pipeline?.ltf || '-'}</span>
            </div>
            <div className="text-gray-400">→</div>
            <div className="flex flex-col items-center p-3 bg-gray-50 border border-gray-200 rounded-xl min-w-[100px]">
              <span className="text-xs text-gray-500 mb-1">الشمعة القادمة</span>
              <span className="font-semibold text-gray-800">{pipeline?.nextCandle || '-'}</span>
            </div>
          </div>
        </div>

        {/* Center: EV Math */}
        <div className="flex-1 bg-blue-50/50 p-4 rounded-xl border border-blue-100 w-full">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">القيمة المتوقعة (EV)</h3>
          {expectedValue ? (
            <div className="font-mono text-sm text-gray-700">
              <div className="flex justify-between mb-1">
                <span>Win %:</span>
                <span className="font-semibold">{(expectedValue.winProb * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Avg Win / Loss:</span>
                <span className="font-semibold">{expectedValue.avgWin.toFixed(2)} / {expectedValue.avgLoss.toFixed(2)}</span>
              </div>
              <div className="mt-2 pt-2 border-t border-blue-200 flex justify-between items-center">
                <span className="font-bold text-blue-900">EV:</span>
                <span className={`font-bold text-lg ${expectedValue.ev > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {expectedValue.ev > 0 ? '+' : ''}{expectedValue.ev.toFixed(4)}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">جاري الحساب...</div>
          )}
        </div>

        {/* Right: Grade & Decision */}
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-500 mb-1">التقييم</span>
              <div className={`text-2xl font-bold w-12 h-12 flex items-center justify-center rounded-full shadow-inner ${getGradeColor(grade)}`}>
                {grade || '-'}
              </div>
            </div>
            
            <div className="h-10 w-px bg-gray-200"></div>
            
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-500 mb-1">القرار النهائي</span>
              <div className={`text-xl font-bold uppercase ${getDecisionColor(finalDecision || '')}`}>
                {finalDecision ? finalDecision.replace('_', ' ') : '-'}
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};
