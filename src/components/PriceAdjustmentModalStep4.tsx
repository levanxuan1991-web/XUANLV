import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';
import { AppState } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
  theme: 'light' | 'dark';
}

export default function PriceAdjustmentModalStep4({ isOpen, onClose, state, updateState, theme }: Props) {
  const [localState, setLocalState] = useState<Partial<AppState>>({});

  useEffect(() => {
    if (isOpen) {
      setLocalState({
        laborPrice: state.laborPrice,
        roughPrice: state.roughPrice,
        packagePrice: state.packagePrice,
        shoringPrice: state.shoringPrice,
        pilingPrice: state.pilingPrice,
        elevatorPrice: state.elevatorPrice,
        elevatorStopPrice: state.elevatorStopPrice,
        permitDrawingPrice: state.permitDrawingPrice,
        permitServicePrice: state.permitServicePrice,
        designPrice: state.designPrice,
        poolPrice: state.poolPrice,
      });
    }
  }, [isOpen, state]);

  if (!isOpen) return null;

  const handleApply = () => {
    updateState(localState);
    onClose();
  };

  const handleChange = (field: keyof AppState, value: string) => {
    const numValue = parseInt(value.replace(/\D/g, ''), 10);
    setLocalState(prev => ({ ...prev, [field]: isNaN(numValue) ? 0 : numValue }));
  };

  const formatNumber = (value: number | undefined) => {
    if (value === undefined) return '';
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  const inputFields = [
    { label: 'Đơn giá nhân công', field: 'laborPrice' as keyof AppState },
    { label: 'Đơn giá phần thô', field: 'roughPrice' as keyof AppState },
    { label: 'Đơn giá trọn gói', field: 'packagePrice' as keyof AppState },
    { label: 'Chi phí cừ chống đổ nhà hàng xóm', field: 'shoringPrice' as keyof AppState },
    { label: 'Đơn giá ép cọc', field: 'pilingPrice' as keyof AppState },
    { label: 'Đơn giá thang máy', field: 'elevatorPrice' as keyof AppState },
    { label: 'Đơn giá 1 điểm dừng thang máy', field: 'elevatorStopPrice' as keyof AppState },
    { label: 'Đơn giá bản vẽ XPXD', field: 'permitDrawingPrice' as keyof AppState },
    { label: 'Đơn giá dịch vụ xin phép XD', field: 'permitServicePrice' as keyof AppState },
    { label: 'Đơn giá chi phí thiết kế', field: 'designPrice' as keyof AppState },
    { label: 'Đơn giá thi công hồ bơi', field: 'poolPrice' as keyof AppState },
  ];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={cn(
        "w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] transition-all",
        theme === 'dark' ? "bg-slate-900 border border-slate-700" : "bg-white"
      )}>
        <div className={cn("flex items-center justify-between p-4 border-b shrink-0", theme === 'dark' ? "border-slate-700" : "border-gray-200")}>
          <h3 className={cn("text-lg font-bold uppercase", theme === 'dark' ? "text-white" : "text-slate-800")}>
            ĐIỀU CHỈNH ĐƠN GIÁ
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inputFields.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <label className={cn("block text-xs font-bold uppercase tracking-wider", theme === 'dark' ? "text-slate-400" : "text-gray-600")}>
                  {item.label}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formatNumber(localState[item.field] as number)}
                    onChange={(e) => handleChange(item.field, e.target.value)}
                    className={cn(
                      "w-full p-2.5 pr-12 border rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all",
                      theme === 'dark' 
                        ? "bg-slate-800 border-slate-700 text-white" 
                        : "bg-white border-gray-300 text-slate-900"
                    )}
                  />
                  <span className={cn("absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>
                    VNĐ
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={cn("p-4 border-t flex justify-end gap-3 shrink-0", theme === 'dark' ? "border-slate-700" : "border-gray-200")}>
          <button
            onClick={onClose}
            className={cn(
              "px-6 py-2 rounded-lg font-bold text-sm transition-colors",
              theme === 'dark' ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            Đóng
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors shadow-sm"
          >
            Lưu & Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
}
