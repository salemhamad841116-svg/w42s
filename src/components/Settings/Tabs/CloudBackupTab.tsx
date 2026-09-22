import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Cloud, Mail, RefreshCw, Download, Upload, 
  ShieldCheck, Trash2, History, CheckCircle2 
} from 'lucide-react';
import { 
  getCloudBackupVersions, 
  saveCloudBackupVersion, 
  restoreCloudBackupVersion, 
  deleteCloudBackupVersion,
  exportLocalBackupJSON,
  importLocalBackupJSON
} from '../../../services/accountBoundSync';
import { initiateEmailLink, confirmEmailLink } from '../../../services/mailtrapService';
import { toast } from '../../PWA/ToastContainer';

interface Note {
  id: string;
  [key: string]: any;
}

interface CloudBackupTabProps {
  notes: Note[];
  onUpdateNotes: (notes: Note[]) => void;
}

export const CloudBackupTab: React.FC<CloudBackupTabProps> = ({ notes, onUpdateNotes }) => {
  const [linkedEmail, setLinkedEmail] = useState<string | null>(localStorage.getItem('linkedEmail'));
  const [emailInput, setEmailInput] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [isAutoBackup, setIsAutoBackup] = useState(localStorage.getItem('autoBackup') === 'true');

  useEffect(() => {
    if (linkedEmail) {
      loadVersions();
    }
  }, [linkedEmail]);

  const loadVersions = () => {
    if (linkedEmail) {
      const v = getCloudBackupVersions(linkedEmail);
      setVersions(v);
    }
  };

  const handleLinkEmail = async () => {
    if (!emailInput) return;
    try {
      await initiateEmailLink(emailInput);
      setIsVerifying(true);
      toast.success('تم إرسال كود التحقق إلى بريدك الإلكتروني');
    } catch (e) {
      toast.error('حدث خطأ أثناء إرسال الكود');
    }
  };

  const handleConfirmCode = async () => {
    if (!verifyCode) return;
    try {
      const success = await confirmEmailLink(emailInput, verifyCode);
      if (success) {
        setLinkedEmail(emailInput);
        localStorage.setItem('linkedEmail', emailInput);
        toast.success('تم ربط البريد الإلكتروني بنجاح');
        setIsVerifying(false);
      } else {
        toast.error('كود التحقق غير صحيح');
      }
    } catch (e) {
      toast.error('حدث خطأ أثناء تأكيد الكود');
    }
  };

  const handleChangeEmail = () => {
    setLinkedEmail(null);
    setEmailInput('');
    setVerifyCode('');
    setIsVerifying(false);
    localStorage.removeItem('linkedEmail');
  };

  const handleCreateBackup = async () => {
    if (!linkedEmail) return;
    try {
      await saveCloudBackupVersion(linkedEmail, notes, false);
      toast.success('تم إنشاء نسخة احتياطية سحابية بنجاح');
      loadVersions();
    } catch (e) {
      toast.error('فشل إنشاء النسخة الاحتياطية');
    }
  };

  const handleRestoreVersion = async (versionId: string) => {
    if (!linkedEmail) return;
    if (window.confirm('هل أنت متأكد من استعادة هذه النسخة؟ سيتم استبدال جميع ملاحظاتك الحالية.')) {
      try {
        const restoredNotes = await restoreCloudBackupVersion(linkedEmail, versionId);
        onUpdateNotes(restoredNotes);
        toast.success('تمت استعادة النسخة الاحتياطية بنجاح');
      } catch (e) {
        toast.error('فشل استعادة النسخة الاحتياطية');
      }
    }
  };

  const handleDeleteVersion = async (versionId: string) => {
    if (!linkedEmail) return;
    if (window.confirm('هل أنت متأكد من حذف هذه النسخة الاحتياطية؟')) {
      try {
        await deleteCloudBackupVersion(linkedEmail, versionId);
        toast.success('تم حذف النسخة الاحتياطية');
        loadVersions();
      } catch (e) {
        toast.error('فشل حذف النسخة الاحتياطية');
      }
    }
  };

  const handleToggleAutoBackup = () => {
    const newValue = !isAutoBackup;
    setIsAutoBackup(newValue);
    localStorage.setItem('autoBackup', String(newValue));
    toast.success(newValue ? 'تم تفعيل النسخ الاحتياطي التلقائي' : 'تم إيقاف النسخ الاحتياطي التلقائي');
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
  };

  const handleImportLocal = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importLocalBackupJSON(file);
      onUpdateNotes(imported);
      toast.success('تم استيراد النسخة الاحتياطية المحلية بنجاح');
    } catch (error) {
      toast.error('فشل استيراد الملف. يرجى التأكد من صحة الملف.');
    }
  };

  return (
    <div className="space-y-6 text-gray-100" dir="rtl">
      {/* Header */}
      <div className="flex items-center space-x-3 space-x-reverse mb-6">
        <div className="p-3 bg-blue-500/20 rounded-xl">
          <Cloud className="w-6 h-6 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold">النسخ الاحتياطي والاستعادة</h2>
      </div>

      {/* Email Linking Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl"
      >
        <div className="flex items-center space-x-2 space-x-reverse mb-4">
          <Mail className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold">حساب النسخ الاحتياطي</h3>
        </div>
        
        {!linkedEmail ? (
          <div className="space-y-4">
            {!isVerifying ? (
              <div className="flex items-end space-x-3 space-x-reverse">
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>
                <button
                  onClick={handleLinkEmail}
                  className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 rounded-xl font-medium transition-colors"
                >
                  ربط البريد الإلكتروني
                </button>
              </div>
            ) : (
              <div className="flex items-end space-x-3 space-x-reverse">
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-1">كود التحقق (6 أرقام)</label>
                  <input
                    type="text"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value)}
                    placeholder="123456"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-purple-500/50 transition-colors text-center tracking-widest font-mono"
                    maxLength={6}
                  />
                </div>
                <button
                  onClick={handleConfirmCode}
                  className="px-6 py-2.5 bg-purple-500 hover:bg-purple-600 rounded-xl font-medium transition-colors"
                >
                  تأكيد الكود عبر Mailtrap SMTP
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
            <div className="flex items-center space-x-3 space-x-reverse">
              <ShieldCheck className="w-6 h-6 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">البريد الإلكتروني المرتبط</p>
                <p className="font-medium text-green-400">{linkedEmail}</p>
              </div>
            </div>
            <button
              onClick={handleChangeEmail}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors"
            >
              تغيير البريد الإلكتروني
            </button>
          </div>
        )}
      </motion.div>

      {/* Backup Status & Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl ${!linkedEmail ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2 space-x-reverse">
            <RefreshCw className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold">حالة النسخ السحابي</h3>
          </div>
          <div className="flex items-center space-x-3 space-x-reverse">
            <span className="text-sm text-gray-400">النسخ التلقائي</span>
            <button 
              onClick={handleToggleAutoBackup}
              className={`w-12 h-6 rounded-full transition-colors relative ${isAutoBackup ? 'bg-blue-500' : 'bg-gray-600'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${isAutoBackup ? 'left-1' : 'left-7'}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-white/5 rounded-xl text-center">
            <p className="text-gray-400 text-sm mb-1">عدد الملاحظات الحالية</p>
            <p className="text-xl font-bold">{notes.length}</p>
          </div>
          <div className="p-4 bg-white/5 rounded-xl text-center">
            <p className="text-gray-400 text-sm mb-1">أحدث نسخة سحابية</p>
            <p className="text-lg font-bold">{versions.length > 0 ? new Date(versions[0].date).toLocaleDateString('ar-EG') : 'لا يوجد'}</p>
          </div>
          <div className="p-4 bg-white/5 rounded-xl text-center">
            <p className="text-gray-400 text-sm mb-1">إجمالي الحجم</p>
            <p className="text-lg font-bold">{formatSize(new Blob([JSON.stringify(notes)]).size)}</p>
          </div>
        </div>

        <button
          onClick={handleCreateBackup}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center space-x-2 space-x-reverse"
        >
          <Cloud className="w-5 h-5" />
          <span>إنشاء نسخة احتياطية سحابية الآن</span>
        </button>
      </motion.div>

      {/* Cloud Versions Restore List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl ${!linkedEmail ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <div className="flex items-center space-x-2 space-x-reverse mb-6">
          <History className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-semibold">تاريخ النسخ الاحتياطية السحابية</h3>
        </div>

        <div className="space-y-3">
          {versions.length === 0 ? (
            <p className="text-center text-gray-500 py-4">لا توجد نسخ احتياطية محفوظة لهذا الحساب.</p>
          ) : (
            versions.map((version) => (
              <div key={version.id} className="flex flex-col md:flex-row items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-colors">
                <div className="flex items-center space-x-4 space-x-reverse mb-4 md:mb-0">
                  <div className={`p-2 rounded-lg ${version.isAutoBackup ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {version.isAutoBackup ? <RefreshCw className="w-5 h-5" /> : <Cloud className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-medium">{new Date(version.date).toLocaleString('ar-EG')}</p>
                    <div className="flex items-center text-sm text-gray-400 space-x-3 space-x-reverse mt-1">
                      <span>{version.noteCount} ملاحظة</span>
                      <span>•</span>
                      <span>{formatSize(version.size)}</span>
                      <span>•</span>
                      <span className={version.isAutoBackup ? 'text-purple-400' : 'text-blue-400'}>
                        {version.isAutoBackup ? 'تلقائي' : 'يدوي'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse w-full md:w-auto">
                  <button
                    onClick={() => handleRestoreVersion(version.id)}
                    className="flex-1 md:flex-none flex items-center justify-center space-x-1 space-x-reverse px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>استعادة هذه النسخة</span>
                  </button>
                  <button
                    onClick={() => handleDeleteVersion(version.id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                    title="حذف النسخة"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Local File Backup */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl"
      >
        <div className="flex items-center space-x-2 space-x-reverse mb-6">
          <Download className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold">النسخ الاحتياطي المحلي</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => exportLocalBackupJSON(notes)}
            className="flex items-center justify-center space-x-2 space-x-reverse p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
          >
            <Download className="w-5 h-5 text-gray-300" />
            <span>تنزيل نسخة احتياطية محلياً (JSON)</span>
          </button>

          <label className="flex items-center justify-center space-x-2 space-x-reverse p-4 bg-white/5 hover:bg-white/10 border border-white/10 border-dashed rounded-xl transition-colors cursor-pointer">
            <Upload className="w-5 h-5 text-gray-300" />
            <span>استيراد نسخة احتياطية من ملف</span>
            <input 
              type="file" 
              accept=".json" 
              className="hidden" 
              onChange={handleImportLocal}
            />
          </label>
        </div>
      </motion.div>
    </div>
  );
};
