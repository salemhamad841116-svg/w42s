import React, { useState } from 'react';
import { Settings, Moon, Sun, Monitor, Type, AlignRight, FileText, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface AppSettingsTabProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function AppSettingsTab({ isDarkMode, onToggleDarkMode }: AppSettingsTabProps) {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(isDarkMode ? 'dark' : 'light');
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('Cairo');
  const [direction, setDirection] = useState<'rtl' | 'ltr'>('rtl');
  
  const [editorSettings, setEditorSettings] = useState({
    autoSave: true,
    autoSaveInterval: 5,
    showLineNumbers: false,
    autoFormatOnPaste: true
  });

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    if ((newTheme === 'dark' && !isDarkMode) || (newTheme === 'light' && isDarkMode)) {
      onToggleDarkMode();
    }
  };

  const fonts = [
    { id: 'Cairo', name: 'كايرو (Cairo)', preview: 'نظام الملاحظات المتداخلة' },
    { id: 'Tajawal', name: 'تجوال (Tajawal)', preview: 'نظام الملاحظات المتداخلة' },
    { id: 'Amiri', name: 'أميري (Amiri)', preview: 'نظام الملاحظات المتداخلة' },
    { id: 'Inter', name: 'إنتر (Inter)', preview: 'Infinite Notes System' },
  ];

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-6 h-6 text-blue-500" />
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">إعدادات التطبيق</h3>
      </div>

      {/* Theme Section */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Moon className="w-5 h-5 text-indigo-500" />
          <h4 className="font-bold text-slate-800 dark:text-white">المظهر</h4>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { id: 'light', icon: Sun, label: 'فاتح' },
            { id: 'dark', icon: Moon, label: 'داكن' },
            { id: 'system', icon: Monitor, label: 'تلقائي' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => handleThemeChange(t.id as any)}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all
                ${theme === t.id 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                  : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-slate-600 text-slate-500'
                }
              `}
            >
              <t.icon className={`w-8 h-8 mb-2 ${theme === t.id ? 'text-blue-500' : 'text-slate-400'}`} />
              <span className="font-bold text-sm">{t.label}</span>
              {theme === t.id && (
                <motion.div layoutId="themeCheck" className="mt-2 text-blue-500">
                  <Check className="w-4 h-4" />
                </motion.div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Typography Section */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Type className="w-5 h-5 text-emerald-500" />
          <h4 className="font-bold text-slate-800 dark:text-white">الخطوط والنصوص</h4>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">عائلة الخط</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fonts.map(f => (
                <button
                  key={f.id}
                  onClick={() => setFontFamily(f.id)}
                  className={`p-3 rounded-xl border text-right transition-all flex flex-col gap-1
                    ${fontFamily === f.id 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }
                  `}
                >
                  <span className="text-xs text-slate-500">{f.name}</span>
                  <span className={`text-lg text-slate-800 dark:text-white`} style={{ fontFamily: f.id }}>{f.preview}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">حجم الخط</label>
              <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300 font-mono">{fontSize}px</span>
            </div>
            <input 
              type="range" 
              min="12" 
              max="24" 
              value={fontSize} 
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-full accent-blue-500"
            />
            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <p style={{ fontSize: `${fontSize}px`, fontFamily }} className="text-slate-800 dark:text-white transition-all">
                هذا النص لمعاينة حجم الخط المختار في المحرر.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Editor & Language Section */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-amber-500" />
          <h4 className="font-bold text-slate-800 dark:text-white">المحرر واللغة</h4>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="block font-bold text-slate-700 dark:text-slate-300">اتجاه النص (RTL/LTR)</span>
              <span className="text-xs text-slate-500">تغيير اتجاه واجهة المستخدم</span>
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button 
                onClick={() => setDirection('rtl')}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${direction === 'rtl' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}
              >
                اليمين لليسار
              </button>
              <button 
                onClick={() => setDirection('ltr')}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${direction === 'ltr' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}
              >
                اليسار لليمين
              </button>
            </div>
          </div>
          
          <hr className="border-slate-100 dark:border-slate-700/50" />
          
          <div className="flex items-center justify-between">
            <div>
              <span className="block font-bold text-slate-700 dark:text-slate-300">الحفظ التلقائي</span>
              <span className="text-xs text-slate-500">حفظ الملاحظات أثناء الكتابة</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={editorSettings.autoSave} onChange={() => setEditorSettings({...editorSettings, autoSave: !editorSettings.autoSave})} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:-translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="block font-bold text-slate-700 dark:text-slate-300">إظهار أرقام الأسطر</span>
              <span className="text-xs text-slate-500">في محرر الأكواد والنصوص</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={editorSettings.showLineNumbers} onChange={() => setEditorSettings({...editorSettings, showLineNumbers: !editorSettings.showLineNumbers})} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:-translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
