import React from 'react';
import { AppState } from '../types';
import { VIETNAM_PROVINCES } from '../constants';
import { cn } from '../lib/utils';
import { MapPin, Building, Minimize2, Map, Home, Landmark, Navigation, Bed, Bath, Sofa, Flame, Layers, BookOpen, Shirt, Coins, AlertTriangle, Info } from 'lucide-react';
import { calculateTotalCoefficient } from '../lib/calculator';

interface Props {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
  theme?: string;
}

export default function Step1({ state, updateState, theme }: Props) {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let finalValue: any = value;
    
    if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      finalValue = Number(value);
    }

    updateState({ [name]: finalValue });
  };

  const coefficient = calculateTotalCoefficient(state);

  const Label = ({ icon: Icon, text }: { icon: any, text: string }) => (
    <label className="flex items-center gap-2 text-sm font-bold mb-1">
      <Icon className={cn("w-4 h-4", theme === 'dark' ? "text-blue-400" : "text-blue-600")} />
      <span className={theme === 'dark' ? "text-slate-200" : "text-slate-700"}>{text}</span>
      <Info className="w-3.5 h-3.5 text-gray-400 ml-1" />
    </label>
  );

  const CheckboxLabel = ({ icon: Icon, text }: { icon: any, text: string }) => (
    <>
      <Icon className={cn("w-4 h-4 ml-2", theme === 'dark' ? "text-blue-400" : "text-blue-600")} />
      <label className={cn("ml-2 flex items-center gap-1 text-sm font-bold", theme === 'dark' ? "text-slate-200" : "text-slate-700")}>
        {text}
        <Info className="w-3.5 h-3.5 text-gray-400" />
      </label>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-2 mb-4 shrink-0">
        <h3 className={cn(
          "text-xl font-bold uppercase",
          theme === 'dark' ? "text-blue-400" : "text-blue-700"
        )}>THÔNG TIN DỰ ÁN</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <Label icon={MapPin} text="Địa điểm xây dựng" />
            <select name="location" value={state.location} onChange={handleChange} className="w-full bg-white border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border">
              {VIETNAM_PROVINCES.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <Label icon={Building} text="Số mặt tiền" />
            <select name="facades" value={state.facades} onChange={handleChange} className="w-full bg-white border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border">
              <option value="Một mặt tiền (chuẩn)">Một mặt tiền (chuẩn)</option>
              <option value="Hai mặt tiền (+2%)">Hai mặt tiền (+2%)</option>
              <option value="Ba mặt tiền (+4%)">Ba mặt tiền (+4%)</option>
            </select>
          </div>

          <div>
            <Label icon={Minimize2} text="Hệ số bất lợi diện tích nhỏ" />
            <select name="smallAreaDisadvantage" value={state.smallAreaDisadvantage} onChange={handleChange} className="w-full bg-white border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border">
              <option value="Lớn hơn 70m2 (chuẩn)">Lớn hơn 70m2 (chuẩn)</option>
              <option value="60-70m2 (+1%)">60-70m2 (+1%)</option>
              <option value="50-60m2 (+2.5%)">50-60m2 (+2.5%)</option>
              <option value="40-50m2 (+4%)">40-50m2 (+4%)</option>
              <option value="30-40m2 (+5%)">30-40m2 (+5%)</option>
            </select>
          </div>

          <div>
            <Label icon={Map} text="Vị trí đất" />
            <select name="landPosition" value={state.landPosition} onChange={handleChange} className="w-full bg-white border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border">
              <option value="Xây chen, các phía đã có nhà (chuẩn)">Xây chen, các phía đã có nhà (chuẩn)</option>
              <option value="Đất trống 1 bên (+1%)">Đất trống 1 bên (+1%)</option>
              <option value="Đất trống 2 bên (+2%)">Đất trống 2 bên (+2%)</option>
              <option value="Đất trống 3 bên (+2.5%)">Đất trống 3 bên (+2.5%)</option>
            </select>
          </div>

          <div className="flex items-center">
            <input type="checkbox" name="splitLevel" checked={state.splitLevel} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
            <CheckboxLabel icon={Layers} text="Thi công nhà lệch tầng (+2%)" />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div>
            <Label icon={Home} text="Loại công trình" />
            <select name="buildingType" value={state.buildingType} onChange={handleChange} className="w-full bg-white border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border">
              <option value="Nhà phố (chuẩn)">Nhà phố (chuẩn)</option>
              <option value="Nhà cấp 4 (-15%)">Nhà cấp 4 (-15%)</option>
              <option value="Biệt thự (+15%)">Biệt thự (+15%)</option>
            </select>
          </div>

          <div>
            <Label icon={Landmark} text="Loại kiến trúc" />
            <select name="architectureType" value={state.architectureType} onChange={handleChange} className="w-full bg-white border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border">
              <option value="Hiện đại (chuẩn)">Hiện đại (chuẩn)</option>
              <option value="Cổ điển, tân cổ điển (+5%)">Cổ điển, tân cổ điển (+5%)</option>
            </select>
          </div>

          <div>
            <Label icon={Navigation} text="Hệ số bất lợi hẻm nhỏ" />
            <select name="smallAlleyDisadvantage" value={state.smallAlleyDisadvantage} onChange={handleChange} className="w-full bg-white border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border">
              <option value="Đường xe tải (chuẩn)">Đường xe tải (chuẩn)</option>
              <option value="Hẻm 5-6m (+1%)">Hẻm 5-6m (+1%)</option>
              <option value="Hẻm 4-5m (+2%)">Hẻm 4-5m (+2%)</option>
              <option value="Hẻm 3-4m (+3%)">Hẻm 3-4m (+3%)</option>
              <option value="Hẻm 2-3m (+4%)">Hẻm 2-3m (+4%)</option>
              <option value="Hẻm dưới 2m (+5%)">Hẻm dưới 2m (+5%)</option>
            </select>
          </div>

          <div className="flex items-center pt-6">
            <input type="checkbox" name="difficultCondition" checked={state.difficultCondition} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
            <CheckboxLabel icon={AlertTriangle} text="Điều kiện thi công khó khăn (+4%)" />
          </div>
        </div>
      </div>

      {/* Room counts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
        <div>
          <Label icon={Bed} text="Số phòng ngủ" />
          <input type="number" name="bedrooms" value={state.bedrooms} onChange={handleChange} className="w-full bg-white border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border" />
        </div>
        <div>
          <Label icon={Bath} text="Số phòng WC" />
          <input type="number" name="bathrooms" value={state.bathrooms} onChange={handleChange} className="w-full bg-white border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border" />
        </div>
        <div>
          <Label icon={Sofa} text="Số phòng sinh hoạt chung" />
          <input type="number" name="livingRooms" value={state.livingRooms} onChange={handleChange} className="w-full bg-white border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border" />
        </div>
        <div>
          <Label icon={Flame} text="Số phòng thờ" />
          <input type="number" name="worshipRooms" value={state.worshipRooms} onChange={handleChange} className="w-full bg-white border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border" />
        </div>
        <div>
          <Label icon={Layers} text="Số tầng lửng" />
          <input type="number" name="mezzanines" value={state.mezzanines} onChange={handleChange} className="w-full bg-white border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border" />
        </div>
        <div>
          <Label icon={BookOpen} text="Số phòng đọc sách" />
          <input type="number" name="readingRooms" value={state.readingRooms} onChange={handleChange} className="w-full bg-white border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border" />
        </div>
        <div>
          <Label icon={Shirt} text="Số phòng thay đồ" />
          <input type="number" name="dressingRooms" value={state.dressingRooms} onChange={handleChange} className="w-full bg-white border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border" />
        </div>
      </div>

      {/* Prices */}
      <div className="space-y-4 pt-4 border-t">
        <div>
          <Label icon={Coins} text="Đơn giá nhân công (vnđ/m²)" />
          <input 
            type="text" 
            name="laborPrice" 
            value={formatNumber(state.laborPrice * coefficient)} 
            readOnly
            disabled
            className={cn(
              "w-full rounded-md shadow-sm sm:text-sm p-2 border font-medium cursor-not-allowed",
              theme === 'dark' ? "bg-slate-800 border-slate-700 text-slate-400" : "bg-gray-100 border-gray-300 text-gray-500"
            )} 
          />
        </div>
        <div>
          <Label icon={Coins} text="Đơn giá phần thô và nhân công hoàn thiện (vnđ/m²)" />
          <input 
            type="text" 
            name="roughPrice" 
            value={formatNumber(state.roughPrice * coefficient)} 
            readOnly
            disabled
            className={cn(
              "w-full rounded-md shadow-sm sm:text-sm p-2 border font-medium cursor-not-allowed",
              theme === 'dark' ? "bg-slate-800 border-slate-700 text-slate-400" : "bg-gray-100 border-gray-300 text-gray-500"
            )} 
          />
        </div>
        <div>
          <Label icon={Coins} text="Đơn giá trọn gói (vnđ/m²)" />
          <input 
            type="text" 
            name="packagePrice" 
            value={formatNumber(state.packagePrice * coefficient)} 
            readOnly
            disabled
            className={cn(
              "w-full rounded-md shadow-sm sm:text-sm p-2 border font-medium cursor-not-allowed",
              theme === 'dark' ? "bg-slate-800 border-slate-700 text-slate-400" : "bg-gray-100 border-gray-300 text-gray-500"
            )} 
          />
        </div>
      </div>
    </div>
  );
}
