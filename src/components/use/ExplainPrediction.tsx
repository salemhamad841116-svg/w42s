import React from 'react';

interface FeatureContribution {
  feature: string;
  contribution: number;
  description: string;
}

interface Props {
  supporting?: FeatureContribution[];
  contradicting?: FeatureContribution[];
}

export const ExplainPrediction: React.FC<Props> = ({ supporting = [], contradicting = [] }) => {
  if (supporting.length === 0 && contradicting.length === 0) return null;

  return (
    <div className="bg-white/90 backdrop-blur-xl border border-black/10 rounded-xl p-5 shadow-sm mt-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">تفسير التوقع (Feature Importance)</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Supporting Factors */}
        <div>
          <h4 className="text-sm font-medium text-green-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            عوامل داعمة (Supporting)
          </h4>
          <div className="space-y-3">
            {supporting.map((item, idx) => (
              <div key={idx} className="relative pt-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-800">{item.feature}</span>
                  <span className="text-sm font-mono tabular-nums text-green-600">+{item.contribution.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full" 
                      style={{ width: `${Math.min(100, (item.contribution / 10) * 100)}%` }} 
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{item.description}</p>
              </div>
            ))}
            {supporting.length === 0 && <p className="text-sm text-gray-400">لا توجد عوامل داعمة قوية</p>}
          </div>
        </div>

        {/* Contradicting Factors */}
        <div>
          <h4 className="text-sm font-medium text-red-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            عوامل معارضة (Contradicting)
          </h4>
          <div className="space-y-3">
            {contradicting.map((item, idx) => (
              <div key={idx} className="relative pt-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-800">{item.feature}</span>
                  <span className="text-sm font-mono tabular-nums text-red-600">-{Math.abs(item.contribution).toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500 rounded-full" 
                      style={{ width: `${Math.min(100, (Math.abs(item.contribution) / 10) * 100)}%` }} 
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{item.description}</p>
              </div>
            ))}
            {contradicting.length === 0 && <p className="text-sm text-gray-400">لا توجد عوامل معارضة قوية</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
