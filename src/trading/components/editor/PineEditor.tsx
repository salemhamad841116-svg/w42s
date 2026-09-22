import React, { useState, useEffect } from 'react';
import { useScriptStore } from '../../stores/useScriptStore';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { 
  ChevronDown, 
  Save, 
  Copy, 
  Edit3, 
  Clock, 
  Plus, 
  History, 
  Play, 
  X,
  AlertTriangle,
  MoreHorizontal, CloudUpload, FileCode, CheckSquare, Layers, Settings, Maximize2, ExternalLink, Activity, Terminal, Info, HelpCircle
} from 'lucide-react';

export const PineEditor: React.FC = () => {
  const {
    scripts,
    editorScriptId,
    editorCode,
    isDirty,
    versions,
    setEditorCode,
    saveScript,
    duplicateScript,
    renameScript,
    createScript,
    restoreVersion,
    openScriptInEditor,
    resetDirtyState
  } = useScriptStore();

  const { activeWorkspaceId, addIndicatorToWorkspace } = useWorkspaceStore();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isOptionsDropdownOpen, setIsOptionsDropdownOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [isUnsavedModalOpen, setIsUnsavedModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const [newName, setNewName] = useState('');
  
  const activeScript = scripts.find(s => s.id === editorScriptId);

  // Keyboard shortcut for saving
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (editorScriptId && isDirty) {
          saveScript(editorScriptId, editorCode, 'Manual save');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editorScriptId, editorCode, isDirty, saveScript]);

  const handleSave = () => {
    if (editorScriptId) {
      saveScript(editorScriptId, editorCode, 'Manual save');
    }
    setIsDropdownOpen(false);
  };

  const handleActionWithGuard = (action: () => void) => {
    if (isDirty) {
      setPendingAction(() => action);
      setIsUnsavedModalOpen(true);
    } else {
      action();
    }
  };

  const handleRenameSubmit = () => {
    if (editorScriptId && newName.trim()) {
      renameScript(editorScriptId, newName.trim());
      setIsRenameModalOpen(false);
    }
  };

  const handleAddToChart = () => {
    if (activeWorkspaceId && editorScriptId) {
      addIndicatorToWorkspace(activeWorkspaceId, editorScriptId);
    }
  };

  const recentScripts = scripts
    .filter(s => s.id !== editorScriptId)
    .sort((a, b) => b.lastOpenedAt - a.lastOpenedAt)
    .slice(0, 5);

  const activeVersions = versions
    .filter(v => v.scriptId === editorScriptId)
    .sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="flex flex-col h-full bg-white/90 backdrop-blur-xl border border-black/10 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-1.5 border-b border-black/10 bg-white/50">
        <div className="flex items-center gap-1">
          {/* Options Menu (...) */}
          <div className="relative">
            <button 
              onClick={() => { setIsOptionsDropdownOpen(!isOptionsDropdownOpen); setIsDropdownOpen(false); }}
              className="p-1.5 hover:bg-black/5 text-gray-600 rounded-md transition-colors"
              title="خيارات المحرر"
            >
              <MoreHorizontal size={16} />
            </button>
            {isOptionsDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 w-56 bg-white border border-black/10 rounded-lg shadow-xl py-2 z-50 text-right" dir="rtl">
                <button className="w-full px-4 py-1.5 hover:bg-black/5 flex items-center justify-start gap-3 text-[13px] text-gray-700">
                  <Settings size={14} />
                  <span>إعدادات المحرر...</span>
                </button>
                <div className="h-px bg-black/10 my-1"></div>
                <div className="px-4 py-1 text-[11px] font-bold text-gray-400">فتح المحرر</div>
                <button className="w-full px-4 py-1.5 hover:bg-black/5 flex items-center justify-start gap-3 text-[13px] text-gray-700">
                  <ExternalLink size={14} />
                  <span>نافذة جديدة</span>
                </button>
                <button className="w-full px-4 py-1.5 hover:bg-black/5 flex items-center justify-start gap-3 text-[13px] text-gray-700">
                  <Maximize2 size={14} />
                  <span>تبويبة جديدة</span>
                </button>
                <div className="h-px bg-black/10 my-1"></div>
                <div className="px-4 py-1 text-[11px] font-bold text-gray-400">أدوات المطور</div>
                <button className="w-full px-4 py-1.5 hover:bg-black/5 flex items-center justify-between text-[13px] text-gray-700 group">
                  <div className="flex items-center gap-3">
                    <Activity size={14} />
                    <span>وضع Profiler</span>
                  </div>
                  <div className="w-6 h-3.5 bg-gray-300 rounded-full relative group-hover:bg-gray-400 transition-colors">
                    <div className="absolute left-0.5 top-0.5 w-2.5 h-2.5 bg-white rounded-full"></div>
                  </div>
                </button>
                <button className="w-full px-4 py-1.5 hover:bg-black/5 flex items-center justify-start gap-3 text-[13px] text-gray-700">
                  <Terminal size={14} />
                  <span>سجلات Pine</span>
                </button>
                <button className="w-full px-4 py-1.5 hover:bg-black/5 flex items-center justify-start gap-3 text-[13px] text-gray-700">
                  <FileCode size={14} />
                  <span>لوحة الأوامر</span>
                </button>
                <div className="h-px bg-black/10 my-1"></div>
                <button className="w-full px-4 py-1.5 hover:bg-black/5 flex items-center justify-start gap-3 text-[13px] text-gray-700">
                  <Info size={14} />
                  <span>ملاحظات الإصدار</span>
                </button>
                <button className="w-full px-4 py-1.5 hover:bg-black/5 flex items-center justify-start gap-3 text-[13px] text-gray-700">
                  <HelpCircle size={14} />
                  <span>المساعدة</span>
                </button>
              </div>
            )}
          </div>
          
          <div className="w-px h-4 bg-black/20 mx-1"></div>

          {/* Script Dropdown */}
          <div className="relative">
            <button 
              onClick={() => { setIsDropdownOpen(!isDropdownOpen); setIsOptionsDropdownOpen(false); }}
              className="flex items-center gap-2 px-2 py-1 hover:bg-black/5 rounded-md transition-colors"
            >
              <ChevronDown size={14} className="text-gray-500" />
              <span className="font-semibold text-gray-800 text-[13px]">
                {activeScript?.name || 'سكربت بدون عنوان'}
              </span>
              {isDirty && <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>}
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-black/10 rounded-lg shadow-xl py-2 z-50 text-right" dir="rtl">
                <button onClick={() => { setIsDropdownOpen(false); setIsSaveModalOpen(true); }} className="w-full px-4 py-1.5 hover:bg-black/5 flex items-center justify-start gap-3 text-[13px] text-gray-700">
                  <CloudUpload size={14} />
                  <span>حفظ النص البرمجي</span>
                </button>
                <button 
                  onClick={() => {
                    if (activeScript) duplicateScript(activeScript.id, `${activeScript.name} Copy`);
                    setIsDropdownOpen(false);
                  }} 
                  className="w-full px-4 py-1.5 hover:bg-black/5 flex items-center justify-start gap-3 text-[13px] text-gray-700"
                >
                  <Copy size={14} />
                  <span>إنشاء نسخة...</span>
                </button>
                <button 
                  onClick={() => {
                    setNewName(activeScript?.name || '');
                    setIsRenameModalOpen(true);
                    setIsDropdownOpen(false);
                  }} 
                  className="w-full px-4 py-1.5 hover:bg-black/5 flex items-center justify-start gap-3 text-[13px] text-gray-700"
                >
                  <Edit3 size={14} />
                  <span>تغيير الاسم...</span>
                </button>
                <button 
                  onClick={() => {
                    setIsVersionModalOpen(true);
                    setIsDropdownOpen(false);
                  }} 
                  className="w-full px-4 py-1.5 hover:bg-black/5 flex items-center justify-start gap-3 text-[13px] text-gray-700"
                >
                  <History size={14} />
                  <span>سجل الإصدارات...</span>
                </button>
                <button className="w-full px-4 py-1.5 hover:bg-black/5 flex items-center justify-start gap-3 text-[13px] text-gray-700">
                  <ChevronDown size={14} />
                  <span>Move script to bottom</span>
                </button>
                <div className="h-px bg-black/10 my-1"></div>
                
                {/* Create New Submenu */}
                <div className="relative group">
                  <button className="w-full px-4 py-1.5 hover:bg-black/5 flex items-center justify-start gap-3 text-[13px] text-gray-700">
                    <Plus size={14} />
                    <span>إنشاء عنصر جديد</span>
                  </button>
                  <div className="absolute right-full top-0 mt-0 mr-1 w-48 bg-white border border-black/10 rounded-lg shadow-xl py-2 hidden group-hover:block z-50">
                    <button onClick={() => handleActionWithGuard(() => { createScript('New Indicator', 'Indicator', '//@version=6\\nindicator("New Indicator")'); setIsDropdownOpen(false); })} className="w-full px-4 py-1.5 hover:bg-black/5 flex items-center justify-start gap-3 text-[13px] text-gray-700">
                      <Activity size={14} />
                      <span>مؤشر</span>
                    </button>
                    <button onClick={() => handleActionWithGuard(() => { createScript('New Strategy', 'Strategy', '//@version=6\\nstrategy("New Strategy")'); setIsDropdownOpen(false); })} className="w-full px-4 py-1.5 hover:bg-black/5 flex items-center justify-start gap-3 text-[13px] text-gray-700">
                      <CheckSquare size={14} />
                      <span>استراتيجية</span>
                    </button>
                    <button onClick={() => handleActionWithGuard(() => { createScript('New Library', 'Library', '//@version=6\\nlibrary("New Library")'); setIsDropdownOpen(false); })} className="w-full px-4 py-1.5 hover:bg-black/5 flex items-center justify-start gap-3 text-[13px] text-gray-700">
                      <Layers size={14} />
                      <span>مكتبة</span>
                    </button>
                    <button onClick={() => handleActionWithGuard(() => { createScript('New Boilerplate', 'Indicator', '//@version=6\\nindicator("Boilerplate")'); setIsDropdownOpen(false); })} className="w-full px-4 py-1.5 hover:bg-black/5 flex items-center justify-start gap-3 text-[13px] text-gray-700">
                      <FileCode size={14} />
                      <span>منشج</span>
                    </button>
                  </div>
                </div>

                {recentScripts.length > 0 && (
                  <>
                    <div className="h-px bg-black/10 my-1"></div>
                    {recentScripts.map(rs => (
                      <button 
                        key={rs.id}
                        onClick={() => handleActionWithGuard(() => {
                          openScriptInEditor(rs.id);
                          setIsDropdownOpen(false);
                        })}
                        className="w-full px-4 py-1.5 hover:bg-black/5 flex items-center justify-start gap-3 text-[13px] text-gray-700"
                      >
                        <FileCode size={14} />
                        <span className="truncate">{rs.name}</span>
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2" dir="rtl">
          <button 
            onClick={() => { setIsSaveModalOpen(true); }}
            className="flex items-center gap-1.5 px-2 py-1 text-gray-700 hover:bg-black/5 rounded-md transition-colors text-[13px]"
          >
            <span>نشر النص البرمجي</span>
            <AlertTriangle size={14} className="text-gray-600" />
          </button>

          <button 
            onClick={() => { setIsSaveModalOpen(true); }}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="حفظ النص البرمجي"
          >
            <CloudUpload size={18} />
          </button>
          
          <button 
            onClick={handleAddToChart}
            disabled={!activeWorkspaceId || !editorScriptId}
            className="p-1 text-gray-600 hover:bg-black/5 rounded transition-colors disabled:opacity-50"
            title="إضافة إلى الرسم البياني"
          >
            <Play size={16} />
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 p-2 bg-black/5">
        <textarea
          value={editorCode}
          onChange={(e) => setEditorCode(e.target.value)}
          className="w-full h-full p-4 font-mono text-sm bg-white/50 rounded-md border border-black/5 focus:outline-none focus:border-blue-500/50 resize-none text-gray-800"
          spellCheck={false}
          dir="ltr"
        />
      </div>


      {/* Save Dialog Modal */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-white/95 backdrop-blur-xl border border-black/10 p-5 rounded-xl shadow-2xl w-[400px] max-w-[90vw]" dir="rtl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">حفظ النص البرمجي</h3>
            <div className="mb-6">
              <label className="block text-[11px] font-bold text-gray-500 mb-1.5">اسم النص البرمجي</label>
              <input 
                type="text" 
                value={newName || activeScript?.name || 'سكربت بدون عنوان'}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                dir="auto"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setIsSaveModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-black/5 rounded-lg text-sm font-semibold transition-colors"
              >
                إلغاء
              </button>
              <button 
                onClick={() => {
                  if (editorScriptId) {
                    if (newName.trim() && newName.trim() !== activeScript?.name) {
                      renameScript(editorScriptId, newName.trim());
                    }
                    saveScript(editorScriptId, editorCode, 'Manual save');
                  }
                  setIsSaveModalOpen(false);
                }}
                className="px-6 py-2 bg-[#2962FF] text-white hover:bg-blue-600 rounded-lg text-sm font-semibold transition-colors shadow-sm"
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Dialog */}
      {isRenameModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-xl border border-black/10 p-6 rounded-xl shadow-2xl w-96 max-w-[90vw]">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-right">تغيير الاسم...</h3>
            <input 
              type="text" 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-2 border border-black/10 rounded-md mb-4 text-right focus:outline-none focus:border-blue-500"
              dir="auto"
            />
            <div className="flex justify-start gap-2 flex-row-reverse">
              <button 
                onClick={handleRenameSubmit}
                className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-md text-sm"
              >
                حفظ
              </button>
              <button 
                onClick={() => setIsRenameModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-black/5 rounded-md text-sm"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {isVersionModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-xl border border-black/10 p-6 rounded-xl shadow-2xl w-[600px] max-w-[90vw] max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <button onClick={() => setIsVersionModalOpen(false)} className="text-gray-500 hover:bg-black/5 p-1 rounded-md">
                <X size={20} />
              </button>
              <h3 className="text-lg font-semibold text-gray-900">سجل الإصدارات...</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-2">
              {activeVersions.length === 0 ? (
                <p className="text-center text-gray-500 py-8">لا توجد إصدارات سابقة</p>
              ) : (
                activeVersions.map(v => (
                  <div key={v.versionId} className="flex justify-between items-center p-3 border border-black/5 rounded-lg bg-white/50 hover:bg-white/80 transition-colors">
                    <button 
                      onClick={() => {
                        restoreVersion(v.versionId);
                        setIsVersionModalOpen(false);
                      }}
                      className="px-3 py-1.5 text-xs bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 rounded font-medium"
                    >
                      استعادة
                    </button>
                    <div className="text-right">
                      <div className="font-medium text-sm text-gray-800">الإصدار {v.versionNumber}</div>
                      <div className="text-xs text-gray-500">{new Date(v.timestamp).toLocaleString('ar-AE')} - {v.changeNote}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Unsaved Changes Guard Dialog */}
      {isUnsavedModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-white/90 backdrop-blur-xl border border-black/10 p-6 rounded-xl shadow-2xl w-96 max-w-[90vw]">
            <div className="flex items-center gap-3 justify-end mb-4 text-yellow-600">
              <h3 className="text-lg font-semibold text-gray-900">تغييرات غير محفوظة</h3>
              <AlertTriangle size={24} />
            </div>
            <p className="text-gray-600 text-right mb-6 text-sm">
              لديك تغييرات غير محفوظة في النص البرمجي الحالي. هل تريد حفظها قبل المتابعة؟
            </p>
            <div className="flex justify-start gap-2 flex-row-reverse">
              <button 
                onClick={() => {
                  handleSave();
                  setIsUnsavedModalOpen(false);
                  if (pendingAction) pendingAction();
                }}
                className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-md text-sm"
              >
                حفظ
              </button>
              <button 
                onClick={() => {
                  resetDirtyState();
                  setIsUnsavedModalOpen(false);
                  if (pendingAction) pendingAction();
                }}
                className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-md text-sm"
              >
                تجاهل
              </button>
              <button 
                onClick={() => setIsUnsavedModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-black/5 rounded-md text-sm"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
