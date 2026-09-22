import React, { useEffect } from 'react';
import { RefreshCw, Sparkles, AlertCircle, X, ArrowUpCircle } from 'lucide-react';
import { useAppUpdateStore } from '../../trading/stores/useAppUpdateStore';
import { registerServiceWorker } from '../../services/serviceWorkerRegistration';

export const UpdateNotificationToast: React.FC = () => {
  const {
    isUpdateAvailable,
    isForceUpdate,
    latestVersion,
    currentVersion,
    releaseNotes,
    isApplyingUpdate,
    checkForUpdates,
    applyUpdate,
    dismissToast,
  } = useAppUpdateStore();

  useEffect(() => {
    // Register Service Worker with update detection
    registerServiceWorker({
      onUpdate: () => {
        checkForUpdates();
      },
    });

    // Initial check
    checkForUpdates();

    // Check every 60 seconds
    const interval = setInterval(() => {
      checkForUpdates();
    }, 60_000);

    return () => clearInterval(interval);
  }, [checkForUpdates]);

  if (!isUpdateAvailable) return null;

  // 1. Critical / Forced Update Full-Screen Modal
  if (isForceUpdate) {
    return (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl select-none" dir="rtl">
        <div className="relative w-full max-w-md p-6 bg-[#161A26] border border-amber-500/40 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.2)] text-right">
          <button
            onClick={dismissToast}
            className="absolute top-5 left-5 text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            title="إغلاق ومتابعة للمنصة"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
              <AlertCircle size={28} />
            </div>
            <div>
              <h2 className="text-white text-lg font-black">تحديث إلزامي للمنصة</h2>
              <p className="text-amber-400 text-xs font-mono">الإصدار: v{latestVersion || '2.5.0'}</p>
            </div>
          </div>

          <p className="text-zinc-300 text-xs leading-relaxed mb-4">
            تم نشر تحديثات هامة وأساسية للتوافق مع خوادم التداول ومحرك الذكاء الاصطناعي. يرجى تفعيل التحديث للاستمرار دون انقطاع. سيتم حفظ مساحة عملك تلقائياً.
          </p>

          {releaseNotes && releaseNotes.length > 0 && (
            <div className="mb-5 p-3 rounded-xl bg-[#1D2232] border border-[#2B3144] max-h-36 overflow-y-auto">
              <div className="text-[11px] font-bold text-zinc-400 mb-1.5 flex items-center gap-1">
                <Sparkles size={13} className="text-amber-400" />
                <span>أبرز التحسينات الجديدة:</span>
              </div>
              <ul className="text-[11px] text-zinc-300 space-y-1 list-disc list-inside">
                {releaseNotes.map((note, i) => (
                  <li key={i}>{note}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={applyUpdate}
            disabled={isApplyingUpdate}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-sm rounded-xl transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={16} className={isApplyingUpdate ? 'animate-spin' : ''} />
            <span>{isApplyingUpdate ? 'جارٍ تثبيت التحديث وتحديث المنصة...' : 'تحديث المنصة الفوري الآن'}</span>
          </button>

          <button
            onClick={dismissToast}
            className="w-full mt-2.5 py-2.5 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-semibold rounded-xl transition-all border border-white/10 cursor-pointer text-center"
          >
            المتابعة إلى المنصة الآن
          </button>
        </div>
      </div>
    );
  }

  // 2. Non-Intrusive Floating Toast for Regular Updates
  return (
    <div
      className="fixed bottom-12 right-6 z-[9999] max-w-sm w-full bg-[#181C28]/95 backdrop-blur-xl border border-blue-500/40 rounded-2xl shadow-2xl p-3.5 text-right animate-in fade-in slide-in-from-bottom-4 duration-200"
      dir="rtl"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <ArrowUpCircle size={18} />
          </div>
          <div>
            <div className="text-white text-xs font-bold">تحديث جديد متوفر ({latestVersion})</div>
            <div className="text-zinc-400 text-[10px]">الإصدار الحالي: v{currentVersion}</div>
          </div>
        </div>
        <button
          onClick={dismissToast}
          className="text-zinc-500 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>

      {releaseNotes && releaseNotes.length > 0 && (
        <div className="text-[11px] text-zinc-300 mb-3 line-clamp-2 px-1">
          {releaseNotes[0]}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={applyUpdate}
          disabled={isApplyingUpdate}
          className="flex-1 py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={13} className={isApplyingUpdate ? 'animate-spin' : ''} />
          <span>{isApplyingUpdate ? 'جارٍ التحديث...' : 'تحديث وإعادة التحميل'}</span>
        </button>

        <button
          onClick={dismissToast}
          className="py-1.5 px-3 bg-[#222738] hover:bg-[#2C3348] text-zinc-400 hover:text-white text-xs rounded-xl font-medium transition-colors cursor-pointer"
        >
          لاحقاً
        </button>
      </div>
    </div>
  );
};
