import React, { useState } from 'react';
import { RefreshCw, CheckCircle2, XCircle, Clock, WifiOff, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SyncTab() {
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error' | 'offline'>('synced');
  const [autoSync, setAutoSync] = useState(true);
  const [realTime, setRealTime] = useState(true);
  const [pendingChanges, setPendingChanges] = useState(0);

  const handleSyncNow = () => {
    setSyncStatus('syncing');
    setTimeout(() => {
      setSyncStatus('synced');
      setPendingChanges(0);
    }, 2000);
  };

  const syncLogs = [
    { id: 1, action: 'تحديث ملاحظة', status: 'success', time: '10:30 ص', details: 'مشروع التخرج' },
    { id: 2, action: 'إضافة مرفق', status: 'success', time: '10:28 ص', details: 'صورة.png' },
    { id: 3, action: 'مزامنة كاملة', status: 'error', time: '09:15 ص', details: 'فشل الاتصال بالخادم' },
  ];

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <RefreshCw className="w-6 h-6 text-blue-500" />
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">حالة المزامنة</h3>
      </div>

      {/* Main Status */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm p-8 text-center">
        <div className="relative inline-flex items-center justify-center mb-6">
          <motion.div
            animate={syncStatus === 'syncing' ? { rotate: 360 } : {}}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className={`w-24 h-24 rounded-full flex items-center justify-center
              ${syncStatus === 'synced' ? 'bg-emerald-100 text-emerald-500 dark:bg-emerald-900/30' : ''}
              ${syncStatus === 'syncing' ? 'bg-blue-100 text-blue-500 dark:bg-blue-900/30' : ''}
              ${syncStatus === 'error' ? 'bg-rose-100 text-rose-500 dark:bg-rose-900/30' : ''}
              ${syncStatus === 'offline' ? 'bg-slate-100 text-slate-500 dark:bg-slate-800' : ''}
            `}
          >
            {syncStatus === 'synced' && <CheckCircle2 className="w-12 h-12" />}
            {syncStatus === 'syncing' && <RefreshCw className="w-12 h-12" />}
            {syncStatus === 'error' && <XCircle className="w-12 h-12" />}
            {syncStatus === 'offline' && <WifiOff className="w-12 h-12" />}
          </motion.div>
          {pendingChanges > 0 && (
            <div className="absolute -top-2 -right-2 bg-amber-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg border-2 border-white dark:border-slate-800">
              {pendingChanges}
            </div>
          )}
        </div>
        
        <h4 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
          {syncStatus === 'synced' && 'تمت المزامنة بنجاح'}
          {syncStatus === 'syncing' && 'جاري المزامنة...'}
          {syncStatus === 'error' && 'حدث خطأ في المزامنة'}
          {syncStatus === 'offline' && 'أنت غير متصل بالإنترنت'}
        </h4>
        <p className="text-slate-500 mb-6 flex items-center justify-center gap-2">
          <Clock className="w-4 h-4" /> أخر مزامنة: منذ 5 دقائق
        </p>

        <button 
          onClick={handleSyncNow}
          disabled={syncStatus === 'syncing' || syncStatus === 'offline'}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl px-8 py-3 font-bold transition-all mx-auto flex items-center gap-2 shadow-lg shadow-blue-500/20"
        >
          <RefreshCw className={`w-5 h-5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
          مزامنة الآن
        </button>
      </div>

      {/* Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm p-5 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-800 dark:text-white">المزامنة التلقائية</h4>
            <p className="text-xs text-slate-500 mt-1">مزامنة التغييرات دورياً في الخلفية</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={autoSync} onChange={() => setAutoSync(!autoSync)} />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:-translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm p-5 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-800 dark:text-white">المزامنة الفورية</h4>
            <p className="text-xs text-slate-500 mt-1">مزامنة التغييرات لحظياً أثناء الكتابة</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={realTime} onChange={() => setRealTime(!realTime)} />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:-translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Sync Log */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center gap-2">
          <FileText className="w-5 h-5 text-slate-400" />
          <h4 className="font-bold text-slate-800 dark:text-white">سجل الأحداث</h4>
        </div>
        <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50">
          {syncLogs.map(log => (
            <div key={log.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-full ${log.status === 'success' ? 'bg-emerald-100 text-emerald-500 dark:bg-emerald-900/30' : 'bg-rose-100 text-rose-500 dark:bg-rose-900/30'}`}>
                  {log.status === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{log.action}</p>
                  <p className="text-xs text-slate-500">{log.details}</p>
                </div>
              </div>
              <span className="text-xs text-slate-400">{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
