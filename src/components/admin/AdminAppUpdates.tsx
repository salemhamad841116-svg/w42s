import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Rocket,
  ShieldAlert,
  History,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
  FileCode,
  Zap,
  Globe,
  Radio,
} from 'lucide-react';
import { VersionInfo } from '../../trading/stores/useAppUpdateStore';

export const AdminAppUpdates: React.FC = () => {
  const [manifest, setManifest] = useState<VersionInfo | null>(null);
  const [history, setHistory] = useState<VersionInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // New Release Form State
  const [newVersion, setNewVersion] = useState('');
  const [newMinVersion, setNewMinVersion] = useState('');
  const [newForceUpdate, setNewForceUpdate] = useState(false);
  const [newReleaseNotes, setNewReleaseNotes] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  const fetchVersionData = async () => {
    setLoading(true);
    try {
      const [resCurrent, resHistory] = await Promise.all([
        fetch('/api/admin/version?t=' + Date.now()),
        fetch('/api/admin/version/history?t=' + Date.now()),
      ]);

      if (resCurrent.ok) {
        const data = await resCurrent.json();
        setManifest(data);
        setNewVersion(data.version);
        setNewMinVersion(data.minimumSupportedVersion);
      }
      if (resHistory.ok) {
        const histData = await resHistory.json();
        setHistory(histData);
      }
    } catch (err: any) {
      setActionError('فشل جلب بيانات الإصدارات من الخادم');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVersionData();
  }, []);

  const handlePublishRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionSuccess(null);
    setActionError(null);
    setIsPublishing(true);

    try {
      const notesArray = newReleaseNotes
        .split('\n')
        .map((n) => n.trim())
        .filter((n) => n.length > 0);

      const res = await fetch('/api/admin/version/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: newVersion.trim(),
          minimumSupportedVersion: newMinVersion.trim(),
          forceUpdate: newForceUpdate,
          releaseNotes: notesArray.length > 0 ? notesArray : ['تحديثات عامة وتحسينات في الأداء'],
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess(`تم نشر الإصدار ${newVersion} بنجاح لجميع المستخدمين.`);
        setManifest(data.manifest);
        setNewReleaseNotes('');
        fetchVersionData();
      } else {
        setActionError(data.error || 'فشل نشر الإصدار الجديد');
      }
    } catch (err: any) {
      setActionError(err.message || 'حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleToggleForceUpdate = async (force: boolean) => {
    setActionSuccess(null);
    setActionError(null);
    try {
      const res = await fetch('/api/admin/version/force-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setManifest(data.manifest);
        setActionSuccess(force ? 'تم تفعيل التحديث الإلزامي لجميع المستخدمين' : 'تم إلغاء التحديث الإلزامي');
      }
    } catch (err: any) {
      setActionError('فشل تعديل حالة التحديث الإلزامي');
    }
  };

  const handleRollback = async () => {
    if (!confirm('هل أنت متأكد من التراجع إلى الإصدار السابق؟')) return;
    setActionSuccess(null);
    setActionError(null);
    try {
      const res = await fetch('/api/admin/version/rollback', {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setManifest(data.manifest);
        setActionSuccess(`تم التراجع بنجاح إلى الإصدار ${data.manifest.version}`);
        fetchVersionData();
      } else {
        setActionError(data.error || 'لا يوجد إصدار سابق للتراجع إليه');
      }
    } catch (err: any) {
      setActionError('حدث خطأ أثناء محاولة التراجع');
    }
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Header Banner */}
      <div className="bg-[#11141c] p-6 rounded-2xl border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Rocket className="text-amber-500 w-6 h-6" />
            <h1 className="text-xl font-bold text-white">مركز تحديثات المنصة (Zero-Reinstall App Updates)</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              PWA Service Worker
            </span>
          </div>
          <p className="text-zinc-400 text-xs">
            إدارة إصدارات المنصة وتوزيع التحديثات الفورية للعملاء دون الحاجة لإعادة تثبيت أو مقاطعة مساحات العمل
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchVersionData}
            disabled={loading}
            className="px-3.5 py-2 bg-[#181c26] hover:bg-[#222838] text-zinc-300 font-bold text-xs rounded-xl border border-zinc-700/60 flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>تحديث البيانات</span>
          </button>
        </div>
      </div>

      {/* Action Alerts */}
      {actionSuccess && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
          <AlertTriangle size={16} />
          <span>{actionError}</span>
        </div>
      )}

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#11141c] p-4 rounded-2xl border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>الإصدار الفعّال حالياً</span>
            <Globe size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">v{manifest?.version || '2.4.0'}</div>
          <div className="text-[10px] text-zinc-500 font-mono mt-1 truncate">ID: {manifest?.buildId || 'initial'}</div>
        </div>

        <div className="bg-[#11141c] p-4 rounded-2xl border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>أدنى إصدار مدعوم</span>
            <Layers size={16} className="text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400 font-mono">v{manifest?.minimumSupportedVersion || '2.0.0'}</div>
          <div className="text-[10px] text-zinc-500 mt-1">أي إصدار أقل سيُجبر على التحديث</div>
        </div>

        <div className="bg-[#11141c] p-4 rounded-2xl border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>حالة التحديث الإلزامي</span>
            <ShieldAlert size={16} className={manifest?.forceUpdate ? 'text-rose-400' : 'text-zinc-500'} />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span
              className={`text-sm font-bold px-2.5 py-1 rounded-lg ${
                manifest?.forceUpdate
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {manifest?.forceUpdate ? 'مفعّل (إجباري)' : 'اختياري (سلس)'}
            </span>
            <button
              onClick={() => handleToggleForceUpdate(!manifest?.forceUpdate)}
              className="text-xs text-amber-400 hover:underline font-medium cursor-pointer"
            >
              {manifest?.forceUpdate ? 'تعطيل' : 'تفعيل'}
            </button>
          </div>
        </div>

        <div className="bg-[#11141c] p-4 rounded-2xl border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>إجراءات التراجع</span>
            <RotateCcw size={16} className="text-amber-400" />
          </div>
          <button
            onClick={handleRollback}
            className="w-full mt-1 py-1.5 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <RotateCcw size={13} />
            <span>تراجع للإصدار السابق</span>
          </button>
        </div>
      </div>

      {/* Main Form & Release Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Publish New Release Form */}
        <div className="lg:col-span-2 bg-[#11141c] p-6 rounded-2xl border border-zinc-800">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-amber-400 w-5 h-5" />
            <h2 className="text-base font-bold text-white">نشر إصدار وتحديث جديد للمنصة</h2>
          </div>

          <form onSubmit={handlePublishRelease} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1 font-bold">رقم الإصدار الجديد (Version)</label>
                <input
                  type="text"
                  required
                  value={newVersion}
                  onChange={(e) => setNewVersion(e.target.value)}
                  placeholder="2.5.0"
                  className="w-full bg-[#181c26] border border-zinc-700/60 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1 font-bold">أدنى إصدار متوافق (Min Version)</label>
                <input
                  type="text"
                  required
                  value={newMinVersion}
                  onChange={(e) => setNewMinVersion(e.target.value)}
                  placeholder="2.0.0"
                  className="w-full bg-[#181c26] border border-zinc-700/60 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-[#181c26] rounded-xl border border-zinc-700/60">
              <input
                type="checkbox"
                id="forceUpdateCheckbox"
                checked={newForceUpdate}
                onChange={(e) => setNewForceUpdate(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="forceUpdateCheckbox" className="text-xs text-zinc-300 font-medium cursor-pointer">
                فرض التحديث الإلزامي الفوري (Force Immediate Update)
              </label>
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1 font-bold">
                ملاحظات وتفاصيل الإصدار (Release Notes - سطر لكل ميزة)
              </label>
              <textarea
                rows={4}
                value={newReleaseNotes}
                onChange={(e) => setNewReleaseNotes(e.target.value)}
                placeholder="مثال:&#10;إضافة مؤشر قوة العملات في الشريط العلوي&#10;تحديث خوارزمية التداول الورقي والتحقق المستقبلي&#10;تحسين استهلاك الذاكرة في الرسوم البيانية"
                className="w-full bg-[#181c26] border border-zinc-700/60 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
              />
            </div>

            <button
              type="submit"
              disabled={isPublishing}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Rocket size={16} className={isPublishing ? 'animate-bounce' : ''} />
              <span>{isPublishing ? 'جارٍ نشر التحديث...' : 'نشر التحديث فوراً لجميع المستخدمين'}</span>
            </button>
          </form>
        </div>

        {/* Caching Architecture Information */}
        <div className="bg-[#11141c] p-6 rounded-2xl border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2">
            <Radio className="text-blue-400 w-5 h-5" />
            <h2 className="text-base font-bold text-white">معمارية التخزين المؤقت المطبقة</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-[#181c26] rounded-xl border border-zinc-700/40">
              <div className="font-bold text-emerald-400 mb-1">1. Network-First (الصفحات والمانيفست)</div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                يتم جلب HTML وملف <code className="text-zinc-300 font-mono">/api/version</code> دائماً من الخادم أولاً لضمان عدم بقاء المتصفح على كود قديم.
              </p>
            </div>

            <div className="p-3 bg-[#181c26] rounded-xl border border-zinc-700/40">
              <div className="font-bold text-blue-400 mb-1">2. Cache-First (الملفات الثابتة المشفّرة)</div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                ملفات JS و CSS الموسومة بهاش تُحفظ في الكاش لتحميل فوري دون استهلاك موارد الخادم.
              </p>
            </div>

            <div className="p-3 bg-[#181c26] rounded-xl border border-zinc-700/40">
              <div className="font-bold text-amber-400 mb-1">3. Network-Only (الأسعار والأوامر و USE)</div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                جميع بيانات التداول والصفقات والـ API محظورة تماماً من الكاش لضمان دقة الأسعار اللحظية.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Version History Table */}
      <div className="bg-[#11141c] rounded-2xl border border-zinc-800 overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="text-zinc-400 w-4 h-4" />
            <h3 className="text-sm font-bold text-white">سجل الإصدارات المنشورة</h3>
          </div>
          <span className="text-xs text-zinc-500">{history.length} إصدارات مسجلة</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-bold bg-[#141822]">
                <th className="p-3.5">الإصدار</th>
                <th className="p-3.5">معرف البناء (Build ID)</th>
                <th className="p-3.5">النوع</th>
                <th className="p-3.5">تاريخ النشر</th>
                <th className="p-3.5">ملاحظات الإصدار</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {history.map((h, i) => (
                <tr key={i} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="p-3.5 font-bold font-mono text-white">v{h.version}</td>
                  <td className="p-3.5 font-mono text-zinc-400 text-[11px]">{h.buildId}</td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        h.forceUpdate
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {h.forceUpdate ? 'إلزامي' : 'عادي'}
                    </span>
                  </td>
                  <td className="p-3.5 text-zinc-400 font-mono text-[11px]">
                    {new Date(h.releasedAt).toLocaleString('ar-SA')}
                  </td>
                  <td className="p-3.5 text-zinc-300 text-[11px]">
                    {Array.isArray(h.releaseNotes) && h.releaseNotes.length > 0
                      ? h.releaseNotes.join(' • ')
                      : 'تحديثات عامة'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
