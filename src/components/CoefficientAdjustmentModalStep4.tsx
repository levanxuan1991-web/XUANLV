import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';
import { AppState } from '../types';
import { AREA_COEFFICIENTS, PRICE_COEFFICIENTS } from '../constants';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
  theme: 'light' | 'dark';
}

export default function CoefficientAdjustmentModalStep4({ isOpen, onClose, state, updateState, theme }: Props) {
  const [localState, setLocalState] = useState<Partial<AppState>>({});

  useEffect(() => {
    if (isOpen) {
      setLocalState({
        smallAreaDisadvantage: state.smallAreaDisadvantage,
        smallAlleyDisadvantage: state.smallAlleyDisadvantage,
        facades: state.facades,
        buildingType: state.buildingType,
        architectureType: state.architectureType,
        landPosition: state.landPosition,
        difficultCondition: state.difficultCondition,
        splitLevel: state.splitLevel,
        
        foundationType: state.foundationType,
        basementDepth: state.basementDepth,
        groundFloorType: state.groundFloorType,
        terraceType: state.terraceType,
        voidType: state.voidType,
        roof1Type: state.roof1Type,
        roof2Type: state.roof2Type,
        roof3Type: state.roof3Type,
        roof4Type: state.roof4Type,
        frontYardType: state.frontYardType,
        backYardType: state.backYardType,
      });
    }
  }, [isOpen, state]);

  if (!isOpen) return null;

  const handleApply = () => {
    updateState(localState);
    onClose();
  };

  const handleChange = (field: keyof AppState, value: any) => {
    setLocalState(prev => ({ ...prev, [field]: value }));
  };

  const renderSelect = (label: string, field: keyof AppState, options: string[]) => (
    <div className="space-y-1">
      <label className={cn("block text-xs font-bold uppercase tracking-wider", theme === 'dark' ? "text-slate-400" : "text-gray-600")}>
        {label}
      </label>
      <select
        value={localState[field] as string}
        onChange={(e) => handleChange(field, e.target.value)}
        className={cn(
          "w-full p-2.5 border rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all",
          theme === 'dark' 
            ? "bg-slate-800 border-slate-700 text-white" 
            : "bg-white border-gray-300 text-slate-900"
        )}
      >
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );

  const renderCheckbox = (label: string, field: keyof AppState) => (
    <div className="flex items-center space-x-2 mt-6">
      <input
        type="checkbox"
        checked={localState[field] as boolean}
        onChange={(e) => handleChange(field, e.target.checked)}
        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
      />
      <label className={cn("text-sm font-bold uppercase tracking-wider", theme === 'dark' ? "text-slate-300" : "text-gray-700")}>
        {label}
      </label>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={cn(
        "w-full max-w-4xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] transition-all",
        theme === 'dark' ? "bg-slate-900 border border-slate-700" : "bg-white"
      )}>
        <div className={cn("flex items-center justify-between p-4 border-b shrink-0", theme === 'dark' ? "border-slate-700" : "border-gray-200")}>
          <h3 className={cn("text-lg font-bold uppercase", theme === 'dark' ? "text-white" : "text-slate-800")}>
            ĐIỀU CHỈNH HỆ SỐ TÍNH TOÁN
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="space-y-8">
            {/* Section I */}
            <div>
              <h4 className={cn("text-md font-bold uppercase mb-4", theme === 'dark' ? "text-blue-400" : "text-blue-700")}>
                I. Hệ số bất lợi (điều chỉnh đơn giá)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderSelect('Diện tích xây dựng', 'smallAreaDisadvantage', Object.keys(PRICE_COEFFICIENTS.SMALL_AREA))}
                {renderSelect('Hẻm thi công', 'smallAlleyDisadvantage', Object.keys(PRICE_COEFFICIENTS.SMALL_ALLEY))}
                {renderSelect('Mặt tiền', 'facades', Object.keys(PRICE_COEFFICIENTS.FACADES))}
                {renderSelect('Loại công trình', 'buildingType', Object.keys(PRICE_COEFFICIENTS.BUILDING_TYPE))}
                {renderSelect('Kiến trúc', 'architectureType', Object.keys(PRICE_COEFFICIENTS.ARCHITECTURE_TYPE))}
                {renderSelect('Vị trí đất', 'landPosition', Object.keys(PRICE_COEFFICIENTS.LAND_POSITION))}
                {renderCheckbox('Điều kiện thi công khó khăn', 'difficultCondition')}
                {renderCheckbox('Lệch tầng', 'splitLevel')}
              </div>
            </div>

            {/* Section II */}
            <div>
              <h4 className={cn("text-md font-bold uppercase mb-4", theme === 'dark' ? "text-blue-400" : "text-blue-700")}>
                II. Hệ số quy đổi diện tích xây dựng
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderSelect('Móng', 'foundationType', Object.keys(AREA_COEFFICIENTS.FOUNDATION))}
                {renderSelect('Tầng hầm', 'basementDepth', Object.keys(AREA_COEFFICIENTS.BASEMENT))}
                {renderSelect('Tầng 1 (Trệt)', 'groundFloorType', Object.keys(AREA_COEFFICIENTS.GROUND_FLOOR))}
                {renderSelect('Sân thượng', 'terraceType', Object.keys(AREA_COEFFICIENTS.TERRACE))}
                {renderSelect('Thông tầng', 'voidType', Object.keys(AREA_COEFFICIENTS.VOID))}
                {renderSelect('Mái 1', 'roof1Type', Object.keys(AREA_COEFFICIENTS.ROOF))}
                {renderSelect('Mái 2', 'roof2Type', Object.keys(AREA_COEFFICIENTS.ROOF))}
                {renderSelect('Mái 3', 'roof3Type', Object.keys(AREA_COEFFICIENTS.ROOF))}
                {renderSelect('Mái 4', 'roof4Type', Object.keys(AREA_COEFFICIENTS.ROOF))}
                {renderSelect('Sân trước', 'frontYardType', Object.keys(AREA_COEFFICIENTS.YARD))}
                {renderSelect('Sân sau', 'backYardType', Object.keys(AREA_COEFFICIENTS.YARD))}
              </div>
            </div>
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
