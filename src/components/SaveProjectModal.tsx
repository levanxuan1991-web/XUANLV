import React, { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  theme: 'light' | 'dark';
  defaultName: string;
}

export default function SaveProjectModal({ isOpen, onClose, onSave, theme, defaultName }: Props) {
  const [name, setName] = useState(defaultName);

  if (!isOpen) return null;

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
      onClose();
    } else {
      alert("Vui lòng nhập tên dự án");
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={cn(
        "w-full max-w-md rounded-xl shadow-2xl p-6 transition-all",
        theme === 'dark' ? "bg-slate-900 border border-slate-700" : "bg-white"
      )}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={cn("text-lg font-bold", theme === 'dark' ? "text-white" : "text-slate-800")}>
            Lưu dự án
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="mb-6 space-y-2">
          <label className={cn("text-xs font-bold uppercase tracking-wider", theme === 'dark' ? "text-slate-400" : "text-slate-500")}>
            Tên dự án
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nhập tên dự án..."
            className={cn(
              "w-full p-3 border-2 rounded-lg text-base font-medium focus:outline-none transition-all",
              theme === 'dark' 
                ? "bg-slate-800 border-slate-700 text-white focus:border-blue-500" 
                : "bg-white border-slate-200 text-slate-900 focus:border-blue-500"
            )}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
            }}
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className={cn(
              "px-6 py-2 font-bold rounded-lg transition-all",
              theme === 'dark' ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            )}
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all shadow-md active:scale-95"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
