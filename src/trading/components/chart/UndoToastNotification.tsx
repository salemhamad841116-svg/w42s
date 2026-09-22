import React, { useEffect, useRef } from 'react';

export interface UndoToastProps {
  message?: string;
  onUndo: () => void;
  onClose: () => void;
  duration?: number;
}

export const UndoToast: React.FC<UndoToastProps> = ({
  message = 'تم حذف الرسم بنجاح',
  onUndo,
  onClose,
  duration = 5000,
}) => {
  const autoDismissTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (duration > 0) {
      autoDismissTimerRef.current = setTimeout(() => {
        onClose();
      }, duration);
    }

    return () => {
      if (autoDismissTimerRef.current) {
        clearTimeout(autoDismissTimerRef.current);
        autoDismissTimerRef.current = null;
      }
    };
  }, [duration, onClose]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (autoDismissTimerRef.current) {
      clearTimeout(autoDismissTimerRef.current);
      autoDismissTimerRef.current = null;
    }
    onClose();
  };

  const handleUndo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (autoDismissTimerRef.current) {
      clearTimeout(autoDismissTimerRef.current);
      autoDismissTimerRef.current = null;
    }
    onUndo();
    onClose();
  };

  return (
    <div
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-[#1E222D]/95 border border-[#2A2E39] text-gray-200 text-xs px-3.5 py-2 rounded-lg shadow-xl backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-150 pointer-events-auto select-none"
      dir="rtl"
      role="alert"
    >
      {/* Toast Message */}
      <span className="text-gray-300 font-normal">{message}</span>

      {/* Undo Action Button */}
      <button
        type="button"
        onClick={handleUndo}
        className="bg-[#2962FF] hover:bg-[#1E53E5] text-white font-medium px-2.5 py-1 rounded transition-colors cursor-pointer text-xs"
      >
        تراجع (Undo)
      </button>

      {/* Divider */}
      <span className="w-[1px] h-4 bg-gray-600/50 mx-1.5" />

      {/* Dismiss (✕) Button */}
      <button
        type="button"
        onClick={handleDismiss}
        className="w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        aria-label="إغلاق التنبيه"
        title="إغلاق التنبيه"
      >
        <svg
          className="w-3.5 h-3.5"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M1 1l12 12M13 1L1 13" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
};

export const UndoToastNotification = UndoToast;
export default UndoToast;
