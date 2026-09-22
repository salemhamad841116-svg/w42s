import React, { useEffect, useState, useCallback } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Wifi,
  WifiOff,
  Clock,
  Lock,
  Wallet,
  TrendingUp,
  X,
} from 'lucide-react';

/* ─── Toast Types ─── */
export type OrderToastType =
  | 'order_sent'
  | 'order_filled'
  | 'order_partial'
  | 'order_rejected'
  | 'market_closed'
  | 'insufficient_balance'
  | 'price_changed'
  | 'disconnected'
  | 'order_pending';

export interface OrderToastData {
  id: string;
  type: OrderToastType;
  message: string;
  detail?: string;
  persistent?: boolean; // stays until manually dismissed
}

const TOAST_CONFIG: Record<OrderToastType, {
  icon: React.FC<{ className?: string }>;
  color: string;
  glow: string;
  borderColor: string;
  duration: number; // ms, 0 = persistent
}> = {
  order_sent: {
    icon: CheckCircle2,
    color: 'text-emerald-400',
    glow: 'shadow-[0_0_20px_rgba(0,192,135,0.3)]',
    borderColor: 'border-emerald-500/30',
    duration: 2000,
  },
  order_filled: {
    icon: CheckCircle2,
    color: 'text-emerald-400',
    glow: 'shadow-[0_0_20px_rgba(0,192,135,0.4)]',
    borderColor: 'border-emerald-500/40',
    duration: 2000,
  },
  order_partial: {
    icon: TrendingUp,
    color: 'text-amber-400',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]',
    borderColor: 'border-amber-500/30',
    duration: 3000,
  },
  order_rejected: {
    icon: XCircle,
    color: 'text-red-400',
    glow: 'shadow-[0_0_20px_rgba(239,68,68,0.4)]',
    borderColor: 'border-red-500/40',
    duration: 5000,
  },
  market_closed: {
    icon: Lock,
    color: 'text-zinc-400',
    glow: 'shadow-[0_0_15px_rgba(113,113,122,0.3)]',
    borderColor: 'border-zinc-500/30',
    duration: 4000,
  },
  insufficient_balance: {
    icon: Wallet,
    color: 'text-red-400',
    glow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]',
    borderColor: 'border-red-500/30',
    duration: 4000,
  },
  price_changed: {
    icon: AlertTriangle,
    color: 'text-amber-400',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]',
    borderColor: 'border-amber-500/30',
    duration: 3000,
  },
  disconnected: {
    icon: WifiOff,
    color: 'text-red-400',
    glow: 'shadow-[0_0_25px_rgba(239,68,68,0.5)]',
    borderColor: 'border-red-500/50',
    duration: 0, // persistent
  },
  order_pending: {
    icon: Clock,
    color: 'text-blue-400',
    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]',
    borderColor: 'border-blue-500/30',
    duration: 0, // persistent until finished
  },
};

/* ─── Single Toast Item ─── */
const ToastItem: React.FC<{
  toast: OrderToastData;
  onDismiss: (id: string) => void;
}> = ({ toast, onDismiss }) => {
  const config = TOAST_CONFIG[toast.type];
  const Icon = config.icon;

  useEffect(() => {
    if (config.duration > 0 && !toast.persistent) {
      const timer = setTimeout(() => onDismiss(toast.id), config.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.persistent, config.duration, onDismiss]);

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl
        backdrop-blur-xl bg-black/60 border ${config.borderColor}
        ${config.glow}
        animate-in slide-in-from-bottom-3 fade-in duration-200
        pointer-events-auto cursor-default min-w-[280px] max-w-[400px]
      `}
      dir="rtl"
    >
      <Icon className={`w-5 h-5 ${config.color} shrink-0 drop-shadow-lg`} />
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-bold ${config.color}`}>{toast.message}</p>
        {toast.detail && (
          <p className="text-[10px] text-zinc-400 mt-0.5 truncate">{toast.detail}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 text-zinc-500 hover:text-white rounded-lg hover:bg-white/10 transition-colors shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

/* ─── Toast Container (Global) ─── */
// Simple pub/sub for toasts
type ToastListener = (toasts: OrderToastData[]) => void;
let toastListeners: ToastListener[] = [];
let currentToasts: OrderToastData[] = [];

function notifyListeners() {
  toastListeners.forEach((fn) => fn([...currentToasts]));
}

export function showOrderToast(type: OrderToastType, message: string, detail?: string) {
  const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const toast: OrderToastData = { id, type, message, detail };
  currentToasts = [...currentToasts, toast];
  notifyListeners();
}

export function dismissOrderToast(id: string) {
  currentToasts = currentToasts.filter((t) => t.id !== id);
  notifyListeners();
}

export function clearToastsByType(type: OrderToastType) {
  currentToasts = currentToasts.filter((t) => t.type !== type);
  notifyListeners();
}

export const OrderToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<OrderToastData[]>([]);

  useEffect(() => {
    const listener: ToastListener = (t) => setToasts(t);
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
    };
  }, []);

  const handleDismiss = useCallback((id: string) => {
    dismissOrderToast(id);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-[9998] flex flex-col-reverse gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={handleDismiss} />
      ))}
    </div>
  );
};
