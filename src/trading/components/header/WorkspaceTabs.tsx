import React, { useState } from 'react';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { Plus, MoreVertical, X, Copy, Save, Edit2 } from 'lucide-react';

export const WorkspaceTabs: React.FC = () => {
  const {
    workspaces,
    activeWorkspaceId,
    createWorkspace,
    switchWorkspace,
    renameWorkspace,
    duplicateWorkspace,
    closeWorkspace,
    closeOtherWorkspaces
  } = useWorkspaceStore();

  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreate = () => {
    createWorkspace('مساحة عمل جديدة', 'EUR/USD', '1h');
  };

  const handleRenameSubmit = (id: string) => {
    if (editName.trim()) {
      renameWorkspace(id, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="flex items-center gap-1 bg-white/90 backdrop-blur-xl border border-black/10 rounded-lg p-1 h-10 shadow-sm overflow-x-auto max-w-full">
      {workspaces.map((ws) => (
        <div
          key={ws.id}
          className={`group flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition-all text-sm font-medium relative ${
            activeWorkspaceId === ws.id
              ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
          onClick={() => switchWorkspace(ws.id)}
        >
          {editingId === ws.id ? (
            <input
              autoFocus
              className="bg-transparent border-none outline-none text-blue-700 w-24 text-sm font-medium"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={() => handleRenameSubmit(ws.id)}
              onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit(ws.id)}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="whitespace-nowrap">{ws.name}</span>
          )}

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpenId(menuOpenId === ws.id ? null : ws.id);
              }}
              className="p-0.5 rounded hover:bg-black/5 text-gray-500 hover:text-gray-700"
            >
              <MoreVertical size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeWorkspace(ws.id);
              }}
              className="p-0.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-600"
            >
              <X size={14} />
            </button>
          </div>

          {/* Dropdown Menu */}
          {menuOpenId === ws.id && (
            <div
              className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  setEditName(ws.name);
                  setEditingId(ws.id);
                  setMenuOpenId(null);
                }}
              >
                <Edit2 size={14} />
                تغيير الاسم
              </button>
              <button
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  duplicateWorkspace(ws.id);
                  setMenuOpenId(null);
                }}
              >
                <Copy size={14} />
                تكرار
              </button>
              <button
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  // Save logic would go here
                  setMenuOpenId(null);
                }}
              >
                <Save size={14} />
                حفظ
              </button>
              <div className="h-px bg-gray-100 my-1" />
              <button
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  closeOtherWorkspaces(ws.id);
                  setMenuOpenId(null);
                }}
              >
                <X size={14} />
                إغلاق الأخرى
              </button>
            </div>
          )}
        </div>
      ))}

      <button
        onClick={handleCreate}
        className="flex items-center justify-center w-8 h-8 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors ml-1"
        title="مساحة عمل جديدة"
      >
        <Plus size={16} />
      </button>
    </div>
  );
};
