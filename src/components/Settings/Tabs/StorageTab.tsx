import React from 'react';
import { HardDrive, FileText, Image, File, Trash2, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

interface StorageTabProps {
  notes?: any[];
}

export default function StorageTab({ notes = [] }: StorageTabProps) {
  // Mock data for UI demonstration
  const totalStorage = 500 * 1024 * 1024; // 500MB
  const notesSize = 15 * 1024 * 1024; // 15MB
  const mediaSize = 120 * 1024 * 1024; // 120MB
  const otherSize = 5 * 1024 * 1024; // 5MB
  const usedStorage = notesSize + mediaSize + otherSize;
  
  const percentage = Math.round((usedStorage / totalStorage) * 100);
  
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <HardDrive className="w-6 h-6 text-blue-500" />
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">التخزين والاستهلاك</h3>
      </div>

      {/* Storage Ring & Summary */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm p-8 flex flex-col md:flex-row items-center gap-8 justify-center">
        
        {/* Progress Ring */}
        <div className="relative w-48 h-48 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle cx="50" cy="50" r="45" fill="transparent" stroke="currentColor" strokeWidth="10" className="text-slate-100 dark:text-slate-700" />
            
            {/* Progress circle */}
            <motion.circle 
              cx="50" cy="50" r="45" fill="transparent" stroke="currentColor" strokeWidth="10" 
              className="text-blue-500"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={2 * Math.PI * 45 * (1 - percentage / 100)}
              strokeLinecap="round"
              initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - percentage / 100) }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-slate-800 dark:text-white">{percentage}%</span>
            <span className="text-xs text-slate-500">مستخدم</span>
          </div>
        </div>
        
        {/* Stats text */}
        <div className="flex-1 space-y-4 w-full">
          <div>
            <h4 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
              {formatSize(usedStorage)} <span className="text-slate-500 text-lg font-normal">من {formatSize(totalStorage)}</span>
            </h4>
            <p className="text-sm text-slate-500">مساحة التخزين السحابية الخاصة بك</p>
          </div>
          
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <FileText className="w-4 h-4" />
                <span className="text-sm">الملاحظات والنصوص</span>
              </div>
              <span className="font-bold text-sm text-slate-800 dark:text-white">{formatSize(notesSize)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                <Image className="w-4 h-4" />
                <span className="text-sm">الوسائط والصور</span>
              </div>
              <span className="font-bold text-sm text-slate-800 dark:text-white">{formatSize(mediaSize)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                <File className="w-4 h-4" />
                <span className="text-sm">ملفات أخرى</span>
              </div>
              <span className="font-bold text-sm text-slate-800 dark:text-white">{formatSize(otherSize)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Storage Breakdown Bar */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm p-6">
        <h4 className="font-bold text-slate-800 dark:text-white mb-4">التوزيع التفصيلي</h4>
        <div className="w-full h-4 rounded-full overflow-hidden flex mb-2 bg-slate-100 dark:bg-slate-700">
          <div className="h-full bg-blue-500" style={{ width: `${(notesSize/totalStorage)*100}%` }}></div>
          <div className="h-full bg-indigo-500" style={{ width: `${(mediaSize/totalStorage)*100}%` }}></div>
          <div className="h-full bg-slate-400" style={{ width: `${(otherSize/totalStorage)*100}%` }}></div>
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>0 GB</span>
          <span>{formatSize(totalStorage / 2)}</span>
          <span>{formatSize(totalStorage)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm p-5 flex flex-col justify-between">
          <div className="mb-4">
            <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-slate-500" />
              تنظيف الملفات المؤقتة
            </h4>
            <p className="text-xs text-slate-500 mt-1">حذف ذاكرة التخزين المؤقتة والملفات غير الضرورية لتوفير المساحة</p>
          </div>
          <button className="w-full py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-bold transition-colors">
            تفريغ الذاكرة (12MB)
          </button>
        </div>
        
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-rose-200/60 dark:border-rose-900/40 shadow-sm p-5 flex flex-col justify-between">
          <div className="mb-4">
            <h4 className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              حذف الوسائط غير المستخدمة
            </h4>
            <p className="text-xs text-rose-600/70 dark:text-rose-400/70 mt-1">حذف الصور والمرفقات التي لم تعد مرتبطة بأي ملاحظة</p>
          </div>
          <button className="w-full py-2 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-lg text-sm font-bold transition-colors">
            فحص وحذف
          </button>
        </div>
      </div>
    </div>
  );
}
