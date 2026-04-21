import React, { useMemo } from 'react';
import { AppState } from '../types';
import { calculateEstimate } from '../lib/calculator';
import { cn } from '../lib/utils';
import { Hammer, Layers, Home, Building, Layout, Tent, Fence, Maximize2, Info, Plus, Minus } from 'lucide-react';
import { AREA_COEFFICIENTS } from '../constants';

interface Props {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
  theme?: string;
}

const formatNumberDisplay = (val: number | string) => {
  if (val === undefined || val === null || val === '') return '';
  const num = Number(val);
  if (isNaN(num)) return val.toString();
  return new Intl.NumberFormat('vi-VN').format(num);
};

const parseNumberInput = (val: string) => {
  const cleanVal = val.replace(/\./g, '');
  const num = Number(cleanVal);
  return isNaN(num) ? 0 : num;
};

const InputBlock = ({ icon: Icon, label, nameArea, nameType, options, state, handleChange, theme }: any) => (
  <div className={cn("p-4 rounded-xl border shadow-sm transition-shadow", theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200 hover:shadow-md")}>
    <label className="flex items-center gap-2 text-sm font-bold mb-3">
      <Icon className={cn("w-5 h-5", theme === 'dark' ? "text-blue-400" : "text-blue-600")} />
      <span className={theme === 'dark' ? "text-slate-200" : "text-slate-700"}>{label}</span>
      <Info className="w-3.5 h-3.5 text-gray-400 ml-1" />
    </label>
    <div className="flex flex-col gap-3">
      <select 
        name={nameType} 
        value={(state as any)[nameType]} 
        onChange={handleChange} 
        className={cn(
          "w-full rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm p-2.5 border font-medium",
          theme === 'dark' ? "bg-slate-700 border-slate-600 text-slate-200" : "bg-white border-gray-300 text-slate-700"
        )}
      >
        {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <input 
        type="text" 
        name={nameArea} 
        value={formatNumberDisplay((state as any)[nameArea])} 
        onChange={handleChange} 
        placeholder="Nhập diện tích (m²)"
        className={cn(
          "w-full rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm p-2.5 border font-bold",
          theme === 'dark' ? "bg-slate-700 border-slate-600 text-blue-400" : "bg-white border-gray-300 text-blue-700"
        )}
      />
    </div>
  </div>
);

const SimpleInputBlock = ({ icon: Icon, label, name, state, handleChange, theme }: any) => (
  <div className={cn("p-4 rounded-xl border shadow-sm transition-shadow", theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200 hover:shadow-md")}>
    <label className="flex items-center gap-2 text-sm font-bold mb-3">
      <Icon className={cn("w-5 h-5", theme === 'dark' ? "text-blue-400" : "text-blue-600")} />
      <span className={theme === 'dark' ? "text-slate-200" : "text-slate-700"}>{label}</span>
      <Info className="w-3.5 h-3.5 text-gray-400 ml-1" />
    </label>
    <input 
      type="text" 
      name={name} 
      value={formatNumberDisplay((state as any)[name])} 
      onChange={handleChange} 
      placeholder="Nhập giá trị"
      className={cn(
        "w-full rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm p-2.5 border font-bold",
        theme === 'dark' ? "bg-slate-700 border-slate-600 text-blue-400" : "bg-white border-gray-300 text-blue-700"
      )}
    />
  </div>
);

export default function Step2({ state, updateState, theme }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let finalValue: any = value;
    
    const stringFields = [
      'foundationType', 'basementDepth', 'groundFloorType', 'terraceType', 
      'roof1Type', 'roof2Type', 'roof3Type', 'roof4Type', 
      'frontYardType', 'backYardType', 'voidType'
    ];

    if (type === 'text' && !stringFields.includes(name)) {
      finalValue = parseNumberInput(value);
    } else if (type === 'number') {
      finalValue = Number(value);
    }

    updateState({ [name]: finalValue });
  };

  const handleFloorAreaChange = (index: number, value: string) => {
    const newAreas = [...state.floorAreas];
    newAreas[index] = parseNumberInput(value);
    updateState({ floorAreas: newAreas });
  };

  const adjustFloorsCount = (delta: number) => {
    const newCount = Math.max(0, state.floorsCount + delta);
    let newAreas = [...state.floorAreas];
    if (delta > 0) {
      for (let i = 0; i < delta; i++) newAreas.push(state.groundFloorArea || 75);
    } else {
      newAreas = newAreas.slice(0, newCount);
    }
    updateState({ floorsCount: newCount, floorAreas: newAreas });
  };

  const estimate = useMemo(() => calculateEstimate(state), [state]);

  // Diagram layers from bottom to top
  const diagramLayers = [
    { name: 'TẦNG HẦM', area: state.basementArea, type: 'basement' },
    { name: 'TẦNG 1', area: state.groundFloorArea, type: 'floor' },
    { name: 'TẦNG LỬNG', area: state.mezzanineArea, type: 'mezzanine' },
    ...state.floorAreas.map((area, i) => ({
      name: `TẦNG ${i + 2}`,
      area: area,
      type: 'floor'
    })),
    { name: 'TUM', area: state.tumArea, type: 'tum' },
    { name: 'MÁI', area: state.roof1Area + state.roof2Area + state.roof3Area + state.roof4Area, type: 'roof' },
  ].filter(layer => layer.area > 0);

  const maxArea = Math.max(...diagramLayers.map(l => l.area), 1);

  const layersWithWidth = diagramLayers.map(layer => ({
    ...layer,
    widthPercent: Math.max(30, (layer.area / maxArea) * 100)
  }));

  const layersWithLayout: any[] = [];
  for (let i = 0; i < layersWithWidth.length; i++) {
    const layer = layersWithWidth[i];
    let marginLeft = 0;
    if (layer.type === 'tum' || layer.type === 'roof') {
      if (i > 0) {
        const prevLayer = layersWithLayout[i - 1];
        marginLeft = prevLayer.marginLeft + (prevLayer.widthPercent - layer.widthPercent) / 2;
      }
    }
    layersWithLayout.push({ ...layer, marginLeft });
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b pb-2 mb-4 shrink-0">
        <h3 className={cn(
          "text-xl font-bold uppercase",
          theme === 'dark' ? "text-blue-400" : "text-blue-700"
        )}>QUY MÔ & DIỆN TÍCH XÂY DỰNG</h3>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr] gap-12">
        {/* Left Column: Inputs */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputBlock icon={Hammer} label="Móng (m²)" nameArea="foundationArea" nameType="foundationType" options={Object.keys(AREA_COEFFICIENTS.FOUNDATION)} state={state} handleChange={handleChange} theme={theme} />
            <InputBlock icon={Layers} label="Hầm (m²)" nameArea="basementArea" nameType="basementDepth" options={Object.keys(AREA_COEFFICIENTS.BASEMENT)} state={state} handleChange={handleChange} theme={theme} />
            
            <InputBlock icon={Home} label="Tầng 1 (trệt, m²)" nameArea="groundFloorArea" nameType="groundFloorType" options={Object.keys(AREA_COEFFICIENTS.GROUND_FLOOR)} state={state} handleChange={handleChange} theme={theme} />
            <SimpleInputBlock icon={Layers} label="Tầng lửng (m²)" name="mezzanineArea" state={state} handleChange={handleChange} theme={theme} />
            
            <div className={cn("p-4 rounded-xl border shadow-sm transition-shadow", theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200 hover:shadow-md")}>
              <label className="flex items-center justify-between text-sm font-bold mb-3">
                <div className="flex items-center gap-2">
                  <Building className={cn("w-5 h-5", theme === 'dark' ? "text-blue-400" : "text-blue-600")} />
                  <span className={theme === 'dark' ? "text-slate-200" : "text-slate-700"}>Số tầng (từ tầng 2 trở lên)</span>
                </div>
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button 
                    onClick={() => adjustFloorsCount(-1)}
                    className="p-1 hover:bg-white rounded-md transition-colors text-gray-600"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-3 font-bold text-blue-700">{state.floorsCount}</span>
                  <button 
                    onClick={() => adjustFloorsCount(1)}
                    className="p-1 hover:bg-white rounded-md transition-colors text-gray-600"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </label>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {state.floorAreas.map((area, index) => (
                  <div key={index} className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Tầng {index + 2} (lầu {index + 1}, m²)</label>
                    <input 
                      type="text" 
                      value={formatNumberDisplay(area)} 
                      onChange={(e) => handleFloorAreaChange(index, e.target.value)} 
                      placeholder={`Diện tích tầng ${index + 2}`}
                      className={cn(
                        "w-full rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm p-2 border font-bold",
                        theme === 'dark' ? "bg-slate-700 border-slate-600 text-blue-400" : "bg-white border-gray-300 text-blue-700"
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>

            <SimpleInputBlock icon={Layout} label="Ban công (Không mái che) (m²)" name="balconyArea" state={state} handleChange={handleChange} theme={theme} />
            
            <InputBlock icon={Layout} label="Sân thượng (m²)" nameArea="terraceArea" nameType="terraceType" options={Object.keys(AREA_COEFFICIENTS.TERRACE)} state={state} handleChange={handleChange} theme={theme} />
            <SimpleInputBlock icon={Layout} label="Tum (m²)" name="tumArea" state={state} handleChange={handleChange} theme={theme} />
            
            <InputBlock icon={Tent} label="Mái loại 1 (m²)" nameArea="roof1Area" nameType="roof1Type" options={Object.keys(AREA_COEFFICIENTS.ROOF)} state={state} handleChange={handleChange} theme={theme} />
            <InputBlock icon={Tent} label="Mái loại 2 (m²)" nameArea="roof2Area" nameType="roof2Type" options={Object.keys(AREA_COEFFICIENTS.ROOF)} state={state} handleChange={handleChange} theme={theme} />
            
            <InputBlock icon={Tent} label="Mái loại 3 (m²)" nameArea="roof3Area" nameType="roof3Type" options={Object.keys(AREA_COEFFICIENTS.ROOF)} state={state} handleChange={handleChange} theme={theme} />
            <InputBlock icon={Tent} label="Mái loại 4 (m²)" nameArea="roof4Area" nameType="roof4Type" options={Object.keys(AREA_COEFFICIENTS.ROOF)} state={state} handleChange={handleChange} theme={theme} />
            
            <InputBlock icon={Fence} label="Sân trước (m²)" nameArea="frontYardArea" nameType="frontYardType" options={Object.keys(AREA_COEFFICIENTS.YARD)} state={state} handleChange={handleChange} theme={theme} />
            <InputBlock icon={Fence} label="Sân sau (m²)" nameArea="backYardArea" nameType="backYardType" options={Object.keys(AREA_COEFFICIENTS.YARD)} state={state} handleChange={handleChange} theme={theme} />
            
            <InputBlock icon={Maximize2} label="Thông tầng (m²)" nameArea="voidArea" nameType="voidType" options={Object.keys(AREA_COEFFICIENTS.VOID)} state={state} handleChange={handleChange} theme={theme} />
          </div>
        </div>

        {/* Right Column: Visual Diagram */}
        <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 flex flex-col items-start min-h-[600px]">
          <div className="text-xs font-black text-gray-400 uppercase mb-10 tracking-[0.2em] w-full text-center">Sơ đồ tầng</div>
          <div className="w-full flex flex-col-reverse items-start gap-1.5">
            {/* Foundation blocks - Always present as requested */}
            <div 
              className="flex flex-col-reverse gap-0 mb-1"
              style={{ 
                width: `${layersWithLayout[0]?.widthPercent || 100}%`,
                marginLeft: `${layersWithLayout[0]?.marginLeft || 0}%`
              }}
            >
              <div className="flex justify-between w-full px-8">
                <div className="w-10 h-5 bg-slate-400 border-2 border-slate-500 rounded-sm shadow-inner"></div>
                <div className="w-10 h-5 bg-slate-400 border-2 border-slate-500 rounded-sm shadow-inner"></div>
              </div>
              <div className="w-full h-1.5 bg-slate-300 rounded-full"></div>
            </div>

            {layersWithLayout.map((layer, index) => (
              <div 
                key={index}
                style={{ 
                  width: `${layer.widthPercent}%`,
                  marginLeft: `${layer.marginLeft}%`
                }}
                className={cn(
                  "relative py-3 px-3 text-center border-2 transition-all duration-500 hover:brightness-110 cursor-default",
                  layer.type === 'roof' && "bg-blue-700 text-white border-blue-800 rounded-t-xl clip-path-trapezoid",
                  layer.type === 'tum' && "bg-blue-500 text-white border-blue-600",
                  layer.type === 'floor' && "bg-slate-400 text-white border-slate-300 shadow-sm",
                  layer.type === 'mezzanine' && "bg-slate-300 text-white border-slate-200 shadow-sm",
                  layer.type === 'basement' && "bg-slate-700 text-white border-slate-800 border-b-4"
                )}
              >
                <div className="flex flex-col items-center justify-center">
                  <span className="text-[12px] font-black uppercase tracking-wider leading-tight">
                    {layer.name}
                  </span>
                  <span className="text-[10px] font-bold opacity-80">({layer.area.toLocaleString('vi-VN')} m²)</span>
                </div>
              </div>
            ))}
            {diagramLayers.length === 0 && (
              <div className="text-gray-400 italic text-sm text-center py-24 border-2 border-dashed border-gray-200 rounded-xl w-full">
                Nhập diện tích để xem sơ đồ
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom: Detailed Calculation Table */}
      <div className="mt-12 bg-white rounded-2xl border border-blue-100 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-4">
          <div className="text-sm font-bold text-white uppercase tracking-widest">Bảng tính chi tiết diện tích xây dựng quy đổi</div>
        </div>
        <div className="p-8">
          <div className="divide-y divide-gray-100">
            {estimate.details.map((detail, index) => (
              <div key={index} className="flex justify-between items-center py-4 group hover:bg-blue-50/30 transition-colors px-2 rounded-lg">
                <div className="flex items-center space-x-8">
                  <span className="text-sm font-bold text-slate-700 w-48">{detail.name}</span>
                  <span className="text-sm text-slate-400 font-medium">
                    {detail.area.toLocaleString('vi-VN')} m² × {(detail.percentage * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-blue-600">
                    = {detail.calculatedArea.toLocaleString('vi-VN')} m²
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t-4 border-blue-600 flex justify-between items-center">
            <span className="text-xl font-black text-slate-800 uppercase tracking-tighter">Tổng diện tích xây dựng quy đổi:</span>
            <div className="text-right">
              <span className="text-3xl font-black text-blue-700">
                {estimate.totalArea.toLocaleString('vi-VN')} m²
              </span>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Giá trị dùng để tính toán chi phí</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .clip-path-trapezoid {
          clip-path: polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%);
        }
      `}</style>
    </div>
  );
}
