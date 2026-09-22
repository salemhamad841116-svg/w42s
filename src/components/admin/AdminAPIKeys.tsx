import React, { useEffect, useState } from 'react';
import { KeyRound, Check, Save, Lock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface KeysData {
  [service: string]: string;
}

export function AdminAPIKeys() {
  const [keys, setKeys] = useState<KeysData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  // New values typed by user
  const [inputs, setInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/admin/keys')
      .then(res => res.json())
      .then(data => {
        setKeys(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load keys', err);
        setLoading(false);
      });
  }, []);

  const handleUpdate = async (service: string) => {
    const value = inputs[service];
    if (!value) return;

    setSaving(service);
    try {
      const res = await fetch('/api/admin/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service, key: value })
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(`تم تحديث مفتاح ${service.toUpperCase()} بنجاح`);
        setKeys(prev => ({ ...prev, [service]: data.masked }));
        setInputs(prev => ({ ...prev, [service]: '' }));
      } else {
        toast.error(data.error || 'فشل التحديث');
      }
    } catch (err) {
      toast.error('خطأ في الاتصال بالسيرفر');
    }
    setSaving(null);
  };

  const services = [
    {
      id: 'gemini',
      name: 'Google Gemini API',
      description: 'المفتاح الخاص بمحرك الذكاء الاصطناعي (AI Decision Engine). يتم التحديث لحظياً (Hot Reload).',
      icon: '🧠'
    },
    {
      id: 'finnhub',
      name: 'Finnhub API',
      description: 'مفتاح مزود الأخبار العاجلة للسوق (News Feed).',
      icon: '📰'
    },
    {
      id: 'mt5',
      name: 'MetaTrader 5 API',
      description: 'مفتاح الوسيط الخاص بـ MetaApi (يُستخدم للتنفيذ مستقبلاً من السيرفر).',
      icon: '📈'
    }
  ];

  if (loading) {
    return <div className="text-[#8F9CAE] p-8">جاري تحميل المفاتيح...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <KeyRound className="w-7 h-7 text-blue-400" />
          إدارة مفاتيح الـ API (API Keys Manager)
        </h2>
        <p className="text-[#8F9CAE] text-sm mt-1">
          إدارة المفاتيح المركزية للنظام. يتم تشفير المفاتيح (AES-256) في قاعدة البيانات واستخدامها مباشرة من الذاكرة العشوائية لتحقيق أسرع أداء (Zero Latency) بدون كشفها.
        </p>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex gap-3 text-blue-200 text-sm">
        <Lock className="w-5 h-5 flex-shrink-0" />
        <p>
          يتم تشويش المفاتيح (Masking) المعروضة هنا لحمايتها. عند إدخال مفتاح جديد، سيتم تشفيره وحفظه وتفعيل العمل به تلقائياً.
        </p>
      </div>

      <div className="grid gap-6">
        {services.map(svc => (
          <div key={svc.id} className="bg-[#131722] rounded-xl border border-[#2A2E39] p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span>{svc.icon}</span> {svc.name}
                </h3>
                <p className="text-xs text-[#8F9CAE] mt-1">{svc.description}</p>
              </div>
              {keys[svc.id] ? (
                <span className="flex items-center gap-1 text-xs text-[#00C087] bg-[#00C087]/10 px-2 py-1 rounded">
                  <Check className="w-3 h-3" /> متصل
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-[#F23645] bg-[#F23645]/10 px-2 py-1 rounded">
                  <AlertCircle className="w-3 h-3" /> غير متوفر
                </span>
              )}
            </div>

            <div className="flex gap-4 items-end">
              <div className="flex-1 space-y-1">
                <label className="text-xs font-medium text-[#8F9CAE]">المفتاح الحالي (مشفر):</label>
                <input 
                  type="text" 
                  disabled 
                  value={keys[svc.id] || 'لم يتم الضبط بعد'} 
                  className="w-full bg-[#0B0E14] border border-[#2A2E39] rounded text-white px-3 py-2 text-sm font-mono opacity-50 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex gap-4 items-end mt-4 pt-4 border-t border-[#2A2E39]/50">
              <div className="flex-1 space-y-1">
                <label className="text-xs font-medium text-[#8F9CAE]">تعيين مفتاح جديد:</label>
                <input 
                  type="password" 
                  placeholder="أدخل المفتاح الجديد هنا..." 
                  value={inputs[svc.id] || ''}
                  onChange={(e) => setInputs(prev => ({ ...prev, [svc.id]: e.target.value }))}
                  className="w-full bg-[#181C25] border border-[#2A2E39] rounded text-white px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none transition-colors placeholder:text-[#8F9CAE]/30"
                />
              </div>
              <button 
                onClick={() => handleUpdate(svc.id)}
                disabled={!inputs[svc.id] || saving === svc.id}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 h-[38px]"
              >
                {saving === svc.id ? 'جاري الحفظ...' : (
                  <>
                    <Save className="w-4 h-4" /> حفظ وتحديث
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
