import React from 'react';
import { AppState } from '../types';
import { cn } from '../lib/utils';
import { Shield, ArrowUpDown, FileText, ArrowDownToLine, Waves, PenTool, Coins } from 'lucide-react';

interface Props {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
  theme?: string;
}

export default function Step3({ state, updateState, theme }: Props) {
  const formatNumber = (val: number | string) => {
    if (val === undefined || val === null || val === '') return '';
    const num = Number(val);
    if (isNaN(num)) return val.toString();
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const parseNumber = (val: string) => {
    const cleanVal = val.replace(/\./g, '');
    const num = Number(cleanVal);
    return isNaN(num) ? 0 : num;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      updateState({ [name]: checked });
    } else if (type === 'text') {
      updateState({ [name]: parseNumber(value) });
    } else if (type === 'number') {
      updateState({ [name]: Number(value) });
    }
  };

  const Label = ({ icon: Icon, text }: { icon: any, text: string }) => (
    <label className="flex items-center gap-2 text-sm font-bold mb-1">
      <Icon className={cn("w-4 h-4", theme === 'dark' ? "text-blue-400" : "text-blue-600")} />
      <span className={theme === 'dark' ? "text-slate-200" : "text-slate-700"}>{text}</span>
    </label>
  );

  const CheckboxLabel = ({ icon: Icon, text }: { icon: any, text: string }) => (
    <>
      <Icon className={cn("w-4 h-4 ml-2", theme === 'dark' ? "text-blue-400" : "text-blue-600")} />
      <label className={cn("ml-2 block text-sm font-bold", theme === 'dark' ? "text-slate-200" : "text-slate-700")}>{text}</label>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-2 mb-4 shrink-0">
        <h3 className={cn(
          "text-xl font-bold uppercase",
          theme === 'dark' ? "text-blue-400" : "text-blue-700"
        )}>HẠNG MỤC KHÁC</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 h-10">
            <input type="checkbox" name="shoring" checked={state.shoring} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
            <CheckboxLabel icon={Shield} text="Cừ chống đổ nhà hàng xóm (md):" />
            <input type="text" name="shoringLength" value={formatNumber(state.shoringLength)} onChange={handleChange} disabled={!state.shoring} className="w-24 bg-white border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-1 border disabled:bg-gray-100" />
          </div>

          <div className="flex items-center space-x-2 h-10">
            <input type="checkbox" name="elevator" checked={state.elevator} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
            <CheckboxLabel icon={ArrowUpDown} text="Thang máy (điểm dừng):" />
            <input type="text" name="elevatorStops" value={formatNumber(state.elevatorStops)} onChange={handleChange} disabled={!state.elevator} className="w-24 bg-white border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-1 border disabled:bg-gray-100" />
          </div>

          <div className="flex items-center h-10">
            <input type="checkbox" name="permit" checked={state.permit} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
            <CheckboxLabel icon={FileText} text="Xin phép xây dựng (Bản vẽ + Dịch vụ)" />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 h-10">
            <input type="checkbox" name="piling" checked={state.piling} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
            <CheckboxLabel icon={ArrowDownToLine} text="Đóng, ép cọc (md):" />
            <input type="text" name="pilingLength" value={formatNumber(state.pilingLength)} onChange={handleChange} disabled={!state.piling} className="w-24 bg-white border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-1 border disabled:bg-gray-100" />
          </div>

          <div className="flex items-center space-x-2 h-10">
            <input type="checkbox" name="pool" checked={state.pool} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
            <CheckboxLabel icon={Waves} text="Hồ bơi (m²):" />
            <input type="text" name="poolArea" value={formatNumber(state.poolArea)} onChange={handleChange} disabled={!state.pool} className="w-24 bg-white border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-1 border disabled:bg-gray-100" />
          </div>

          <div className="flex items-center h-10">
            <input type="checkbox" name="design2D" checked={state.design2D} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
            <CheckboxLabel icon={PenTool} text="Thiết kế kỹ thuật 2D" />
          </div>
        </div>
      </div>

      <div className="border-b border-blue-800 my-6"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        <div className="space-y-1">
          <Label icon={Coins} text="Chi phí cừ chống đổ nhà hàng xóm (vnđ/m)" />
          <input type="text" name="shoringPrice" value={formatNumber(state.shoringPrice)} onChange={handleChange} className="w-full bg-white border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border" />
        </div>
        <div className="space-y-1">
          <Label icon={Coins} text="Đơn giá ép cọc (vnđ/m)" />
          <input type="text" name="pilingPrice" value={formatNumber(state.pilingPrice)} onChange={handleChange} className="w-full bg-white border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border" />
        </div>
        <div className="space-y-1">
          <Label icon={Coins} text="Đơn giá thang máy (vnđ/cái)" />
          <input type="text" name="elevatorPrice" value={formatNumber(state.elevatorPrice)} onChange={handleChange} className="w-full bg-white border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border" />
        </div>
        <div className="space-y-1">
          <Label icon={Coins} text="Đơn giá 1 điểm dừng thang máy (vnđ/điểm)" />
          <input type="text" name="elevatorStopPrice" value={formatNumber(state.elevatorStopPrice)} onChange={handleChange} className="w-full bg-white border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border" />
        </div>
        <div className="space-y-1">
          <Label icon={Coins} text="Đơn giá bản vẽ XPXD (vnđ/m2)" />
          <input type="text" name="permitDrawingPrice" value={formatNumber(state.permitDrawingPrice)} onChange={handleChange} className="w-full bg-white border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border" />
        </div>
        <div className="space-y-1">
          <Label icon={Coins} text="Đơn giá dịch vụ xin phép XD (vnđ/m2)" />
          <input type="text" name="permitServicePrice" value={formatNumber(state.permitServicePrice)} onChange={handleChange} className="w-full bg-white border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border" />
        </div>
        <div className="space-y-1">
          <Label icon={Coins} text="Đơn giá chi phí thiết kế (vnđ/m2)" />
          <input type="text" name="designPrice" value={formatNumber(state.designPrice)} onChange={handleChange} className="w-full bg-white border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border" />
        </div>
        <div className="space-y-1">
          <Label icon={Coins} text="Đơn giá thi công hồ bơi (vnđ/m2)" />
          <input type="text" name="poolPrice" value={formatNumber(state.poolPrice)} onChange={handleChange} className="w-full bg-white border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border" />
        </div>
      </div>
    </div>
  );
}
