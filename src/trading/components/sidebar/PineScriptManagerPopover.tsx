import React, { useState } from 'react';
import { useScriptStore, Script } from '../../stores/useScriptStore';
import {
  Code,
  Save,
  Copy,
  Edit3,
  History,
  Plus,
  ExternalLink,
  Check,
  X,
  Clock,
  FileCode,
} from 'lucide-react';

interface PineScriptManagerPopoverProps {
  onClose: () => void;
}

export const PineScriptManagerPopover: React.FC<PineScriptManagerPopoverProps> = ({
  onClose,
}) => {
  const {
    scripts,
    editorScriptId,
    editorCode,
    isDirty,
    versions,
    saveScript,
    duplicateScript,
    renameScript,
    createScript,
    openScriptInEditor,
  } = useScriptStore();

  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [showVersions, setShowVersions] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const activeScript: Script | undefined =
    scripts.find((s) => s.id === editorScriptId) || scripts[0];

  const showToast = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 2200);
  };

  const handleSave = () => {
    if (!activeScript) return;
    saveScript(activeScript.id, editorCode || activeScript.code, 'Quick save from sidebar');
    showToast('Script saved successfully!');
  };

  const handleDuplicate = () => {
    if (!activeScript) return;
    const newName = `${activeScript.name} (Copy)`;
    duplicateScript(activeScript.id, newName);
    showToast(`Created copy: ${newName}`);
  };

  const handleStartRename = () => {
    if (!activeScript) return;
    setRenameValue(activeScript.name);
    setIsRenaming(true);
  };

  const handleConfirmRename = () => {
    if (!activeScript || !renameValue.trim()) return;
    renameScript(activeScript.id, renameValue.trim());
    setIsRenaming(false);
    showToast(`Renamed to "${renameValue.trim()}"`);
  };

  const handleNewScript = () => {
    const defaultTemplate = `//@version=5\nindicator("My Custom Indicator", overlay=true)\nplot(close, color=color.blue)`;
    createScript('My Custom Script', 'Indicator', defaultTemplate);
    showToast('New script created!');
  };

  const handleOpenInEditor = () => {
    if (activeScript) {
      openScriptInEditor(activeScript.id);
    }
    window.dispatchEvent(
      new CustomEvent('open_bottom_tab', { detail: 'pine_editor' })
    );
    onClose();
  };

  const scriptVersions = activeScript
    ? versions.filter((v) => v.scriptId === activeScript.id)
    : [];

  return (
    <div
      className="w-80 bg-[#181C28] border border-[#2D3345] rounded-xl shadow-2xl overflow-hidden select-none animate-in fade-in zoom-in-95 duration-150 notranslate text-left"
      dir="ltr"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#262B3D] bg-[#12151F]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#00C087]/15 text-[#00C087] flex items-center justify-center font-bold text-xs">
            <Code size={13} />
          </div>
          <span className="text-xs font-bold text-white tracking-wide">
            Pine Script™ Manager
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-[#8F9CAE] hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          title="Close"
        >
          <X size={14} />
        </button>
      </div>

      {/* Action Toast Feedback */}
      {actionFeedback && (
        <div className="px-3 py-1.5 bg-[#00C087]/15 border-b border-[#00C087]/30 text-[#00C087] text-[11px] font-medium flex items-center gap-1.5 animate-in fade-in">
          <Check size={13} />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Active Script Card */}
      <div className="p-3 border-b border-[#262B3D] bg-[#151924]">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {isRenaming ? (
              <div className="flex items-center gap-1.5 mb-1">
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleConfirmRename()}
                  autoFocus
                  className="w-full h-7 px-2 bg-[#1E222D] border border-[#2962FF] rounded text-xs text-white focus:outline-none"
                />
                <button
                  onClick={handleConfirmRename}
                  className="p-1 text-emerald-400 hover:bg-emerald-400/10 rounded"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => setIsRenaming(false)}
                  className="p-1 text-gray-400 hover:bg-gray-400/10 rounded"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-white truncate">
                  {activeScript?.name || 'No Script Selected'}
                </h4>
                {isDirty && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" title="Unsaved changes" />
                )}
              </div>
            )}
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#202534] text-[#8F9CAE] font-medium font-mono">
                {activeScript?.type || 'Indicator'}
              </span>
              <span className="text-[10px] text-[#60687B]">
                {activeScript?.category || 'Custom'}
              </span>
            </div>
          </div>

          <button
            onClick={handleOpenInEditor}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#2962FF] hover:bg-[#1E53E5] text-white text-[11px] font-semibold transition-colors shrink-0 shadow-sm cursor-pointer"
            title="Open full editor in bottom panel"
          >
            <ExternalLink size={12} />
            <span>Open Editor</span>
          </button>
        </div>
      </div>

      {/* Quick Action Commands */}
      <div className="p-2 border-b border-[#262B3D] grid grid-cols-2 gap-1.5 bg-[#12151F]">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#1A1F2C] hover:bg-[#22283A] text-gray-200 hover:text-white border border-[#2B3144] text-[11px] font-medium transition-colors cursor-pointer"
        >
          <Save size={13} className="text-[#00C087]" />
          <span>Save Script</span>
        </button>

        <button
          onClick={handleDuplicate}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#1A1F2C] hover:bg-[#22283A] text-gray-200 hover:text-white border border-[#2B3144] text-[11px] font-medium transition-colors cursor-pointer"
        >
          <Copy size={13} className="text-[#2962FF]" />
          <span>Make a Copy</span>
        </button>

        <button
          onClick={handleStartRename}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#1A1F2C] hover:bg-[#22283A] text-gray-200 hover:text-white border border-[#2B3144] text-[11px] font-medium transition-colors cursor-pointer"
        >
          <Edit3 size={13} className="text-amber-400" />
          <span>Rename</span>
        </button>

        <button
          onClick={() => setShowVersions(!showVersions)}
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer ${
            showVersions
              ? 'bg-[#2962FF]/20 text-[#2962FF] border-[#2962FF]/40'
              : 'bg-[#1A1F2C] hover:bg-[#22283A] text-gray-200 hover:text-white border-[#2B3144]'
          }`}
        >
          <History size={13} className="text-purple-400" />
          <span>Version History</span>
        </button>
      </div>

      {/* Version History Drawer (if open) */}
      {showVersions && (
        <div className="p-2 border-b border-[#262B3D] bg-[#10131B] max-h-36 overflow-y-auto">
          <div className="text-[10px] font-bold text-[#8F9CAE] uppercase tracking-wider mb-1 px-1">
            Version History ({scriptVersions.length})
          </div>
          {scriptVersions.length === 0 ? (
            <div className="py-2 text-center text-[#60687B] text-[11px]">
              No previous versions saved
            </div>
          ) : (
            scriptVersions.map((ver) => (
              <div
                key={ver.versionId}
                className="flex items-center justify-between p-1.5 rounded bg-[#161B26] border border-[#242938] mb-1 text-[11px]"
              >
                <div className="flex items-center gap-1.5">
                  <Clock size={11} className="text-gray-400" />
                  <span className="text-white font-mono font-semibold">
                    v{ver.versionNumber}
                  </span>
                  <span className="text-[#8F9CAE] text-[10px] truncate max-w-[120px]">
                    {ver.changeNote || 'Manual save'}
                  </span>
                </div>
                <span className="text-[10px] text-[#60687B]">
                  {new Date(ver.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Recently Used Scripts Header & New Script Action */}
      <div className="px-3 py-1.5 flex items-center justify-between bg-[#151924] border-b border-[#202534]">
        <span className="text-[10px] font-bold text-[#8F9CAE] uppercase tracking-wider">
          Recently Used Scripts
        </span>
        <button
          onClick={handleNewScript}
          className="flex items-center gap-1 text-[11px] text-[#2962FF] hover:text-[#5C93FF] font-semibold cursor-pointer"
        >
          <Plus size={12} />
          <span>New Script</span>
        </button>
      </div>

      {/* Scripts List */}
      <div className="max-h-48 overflow-y-auto divide-y divide-[#1D2230] p-1">
        {scripts.map((script) => {
          const isSelected = script.id === activeScript?.id;

          return (
            <button
              key={script.id}
              onClick={() => {
                openScriptInEditor(script.id);
                showToast(`Loaded "${script.name}"`);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors text-left cursor-pointer group ${
                isSelected
                  ? 'bg-[#1E222D] border border-[#2962FF]/40 text-white'
                  : 'hover:bg-[#1E2336] border border-transparent text-[#8F9CAE] hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <FileCode
                  size={14}
                  className={isSelected ? 'text-[#00C087]' : 'text-[#60687B] group-hover:text-gray-400'}
                />
                <span className="text-xs font-medium truncate">{script.name}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[9px] px-1 rounded bg-[#202534] text-[#8F9CAE] font-mono">
                  {script.type}
                </span>
                {isSelected && <Check size={12} className="text-[#00C087]" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
