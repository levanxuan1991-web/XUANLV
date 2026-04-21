import React, { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onApply: (percentage: number) => void;
  theme: 'light' | 'dark';
}

export default function PriceAdjustmentModal({ isOpen, onClose, onApply, theme }: Props) {
  const [percentage, setPercentage] = useState<string>('10');

  if (!isOpen) return null;

  const handleApply = () => {
    const num = parseFloat(percentage);
    if (!isNaN(num)) {
      onApply(num);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={cn(
        "w-full max-w-md rounded-xl shadow-2xl p-6 transition-all",
        theme === 'dark' ? "bg-slate-900 border border-slate-700" : "bg-white"
      )}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={cn("text-sm font-bold", theme === 'dark' ? "text-white" : "text-slate-800")}>
            Nhập phần trăm thay đổi đơn giá (ví dụ: nhập 10 để tăng 10%, nhập -5 để giảm 5%):
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="mb-6">
          <input
            type="number"
            value={percentage}
            onChange={(e) => setPercentage(e.target.value)}
            className={cn(
              "w-full p-3 border-2 rounded-lg text-lg font-bold focus:outline-none transition-all",
              theme === 'dark' 
                ? "bg-slate-800 border-slate-700 text-white focus:border-green-500" 
                : "bg-white border-green-600 text-slate-900 focus:border-green-700"
            )}
            autoFocus
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={handleApply}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-full transition-all shadow-md active:scale-95"
          >
            OK
          </button>
          <button
            onClick={onClose}
            className={cn(
              "px-6 py-2 font-bold rounded-full transition-all",
              theme === 'dark' ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-green-100 text-green-800 hover:bg-green-200"
            )}
          >
            Huỷ
          </button>
        </div>
      </div>
    </div>
  );
}
