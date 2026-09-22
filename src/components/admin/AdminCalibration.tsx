import React, { useEffect, useState } from 'react';
import { Target, TrendingUp, AlertTriangle } from 'lucide-react';

interface CalibrationData {
  buckets: {
    bucket: string;       // e.g. "0.0 - 0.1", "0.9 - 1.0"
    count: number;
    predictedProb: number;
    actualProb: number;
  }[];
  calibrationError: number;
  rollingEV: number;
}

export const AdminCalibration: React.FC = () => {
  const [data, setData] = useState<CalibrationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCalibration();
  }, []);

  const fetchCalibration = async () => {
    try {
      const res = await fetch('/api/use/admin/calibration');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error('Failed to fetch calibration data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-gray-400 p-8 text-center animate-pulse">جاري تحميل بيانات المعايرة...</div>;
  }

  if (!data) {
    return <div className="text-gray-500 p-8 text-center">لا توجد بيانات متاحة</div>;
  }

  return (
    <div className="bg-[#1A1F2E] border border-[#2A2E39] rounded-xl p-6 text-white">
      <div className="flex items-center gap-2 mb-6">
        <Target className="w-5 h-5 text-blue-500" />
        <h2 className="text-xl font-bold">لوحة المعايرة المباشرة (Live Calibration)</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#131722] p-6 rounded-lg border border-[#2A2E39] flex flex-col items-center justify-center">
          <span className="text-sm text-[#8F9CAE] mb-2">خطأ المعايرة (Calibration Error)</span>
          <span className={`text-3xl font-mono ${data.calibrationError > 0.1 ? 'text-red-400' : 'text-green-400'}`}>
            {(data.calibrationError * 100).toFixed(2)}%
          </span>
          {data.calibrationError > 0.1 && (
            <div className="flex items-center gap-1 text-amber-500 text-xs mt-2">
              <AlertTriangle className="w-4 h-4" /> نسبة الخطأ مرتفعة
            </div>
          )}
        </div>

        <div className="bg-[#131722] p-6 rounded-lg border border-[#2A2E39] flex flex-col items-center justify-center">
          <span className="text-sm text-[#8F9CAE] mb-2">القيمة المتوقعة المتراكمة (Rolling EV)</span>
          <span className={`text-3xl font-mono ${data.rollingEV > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {data.rollingEV > 0 ? '+' : ''}{data.rollingEV.toFixed(4)}
          </span>
          <div className="flex items-center gap-1 text-blue-400 text-xs mt-2">
            <TrendingUp className="w-4 h-4" /> أداء النظام المباشر
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-4 text-[#8F9CAE]">مقارنة الاحتمالات (Predicted vs Actual)</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#131722] text-[#8F9CAE]">
            <tr>
              <th className="p-3 rounded-l-lg text-right">الفئة (Bucket)</th>
              <th className="p-3 text-right">العدد (Count)</th>
              <th className="p-3 text-right">الاحتمال المتوقع (Predicted)</th>
              <th className="p-3 text-right">الاحتمال الفعلي (Actual)</th>
              <th className="p-3 rounded-r-lg text-right">الفرق (Delta)</th>
            </tr>
          </thead>
          <tbody>
            {data.buckets.map((b, i) => {
              const delta = Math.abs(b.predictedProb - b.actualProb);
              return (
                <tr key={i} className="border-b border-[#2A2E39] hover:bg-[#131722]/50 transition-colors">
                  <td className="p-3 font-mono text-center" dir="ltr">{b.bucket}</td>
                  <td className="p-3 font-mono text-center">{b.count}</td>
                  <td className="p-3 font-mono text-center">{(b.predictedProb * 100).toFixed(1)}%</td>
                  <td className="p-3 font-mono text-center">{(b.actualProb * 100).toFixed(1)}%</td>
                  <td className="p-3 font-mono text-center text-amber-400">{(delta * 100).toFixed(1)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
