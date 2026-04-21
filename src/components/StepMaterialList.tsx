import React, { useState, useRef } from 'react';
import { AppState, MaterialItem } from '../types';
import { formatNumber, parseFormattedNumber, cn } from '../lib/utils';
import * as XLSX from 'xlsx';

interface StepMaterialListProps {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
  onCalculate?: () => void;
  theme?: string;
}

const StepMaterialList: React.FC<StepMaterialListProps> = ({ state, updateState, onCalculate, theme }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMaterialChange = (id: string, field: keyof MaterialItem, value: string) => {
    const newList = state.materialList.map(item => {
      if (item.id === id) {
        let processedValue: any = value;
        if (field === 'price') {
          processedValue = parseFormattedNumber(value);
        } else if (field === 'dinh_muc_m2') {
          // Allow empty string, trailing dot/comma, or valid numbers
          if (value === '' || value === '.' || value === ',') {
            processedValue = value;
          } else {
            // Replace comma with dot for parsing, but keep the original string if it ends with dot/comma
            const normalizedValue = value.replace(',', '.');
            if (normalizedValue.endsWith('.')) {
              processedValue = value;
            } else {
              const parsed = parseFloat(normalizedValue);
              processedValue = isNaN(parsed) ? 0 : parsed;
            }
          }
        }
        
        return {
          ...item,
          [field]: processedValue
        };
      }
      return item;
    });
    updateState({ materialList: newList });
  };

  const handleInsertRow = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    let category: 'PRODUCTION' | 'ROUGH' | 'FINISHING' | 'CONTRACTED' = 'ROUGH';
    if (selectedId) {
      const selectedItem = state.materialList.find(item => item.id === selectedId);
      if (selectedItem) category = selectedItem.category;
    }

    const newItem: MaterialItem = {
      id: newId,
      stt: '',
      name: 'Vật tư mới',
      brand: '',
      unit: '',
      price: 0,
      category: category,
      dinh_muc_m2: 0
    };

    let updatedItems;
    if (selectedId) {
      const index = state.materialList.findIndex(item => item.id === selectedId);
      updatedItems = [...state.materialList];
      updatedItems.splice(index + 1, 0, newItem);
    } else {
      updatedItems = [...state.materialList, newItem];
    }
    updateState({ materialList: updatedItems });
  };

  const handleDeleteRow = () => {
    if (!selectedId) return;
    const updatedItems = state.materialList.filter(item => item.id !== selectedId);
    updateState({ materialList: updatedItems });
    setSelectedId(null);
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

      const rows = data.slice(1);
      const importedItems: MaterialItem[] = rows.map((row) => ({
        id: Math.random().toString(36).substr(2, 9),
        stt: String(row[0] || ''),
        name: String(row[1] || ''),
        brand: String(row[2] || ''),
        unit: String(row[3] || ''),
        price: Number(row[4]) || 0,
        dinh_muc_m2: Number(row[5]) || 0,
        category: (String(row[6]) as any) || 'ROUGH'
      }));

      if (importedItems.length > 0) {
        updateState({ materialList: importedItems });
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  const handleExportExcel = () => {
    const exportData = state.materialList.map(item => ({
      'STT': item.stt,
      'Hạng mục / Vật tư': item.name,
      'Chủng loại / Quy cách': item.brand,
      'Đơn vị': item.unit,
      'Đơn giá': item.price,
      'Định mức (trên 1m2 sàn)': item.dinh_muc_m2,
      'Phân loại': item.category
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DanhMucVatTu");
    XLSX.writeFile(wb, "Danh_Muc_Vat_Tu.xlsx");
  };

  const sections = [
    { id: '1', title: 'CHI PHÍ TỔ CHỨC SẢN XUẤT', category: 'PRODUCTION' },
    { id: '2', title: 'CHI PHÍ VẬT LIỆU THÔ', category: 'ROUGH' },
    { id: '3', title: 'CHI PHÍ VẬT LIỆU HOÀN THIỆN', category: 'FINISHING' },
    { id: '4', title: 'CHI PHÍ GIAO KHOÁN (VẬT LIỆU VÀ NHÂN CÔNG)', category: 'CONTRACTED' },
  ];

  return (
    <div className="flex flex-col h-[75vh]">
      <div className="flex justify-between items-center border-b pb-2 mb-4 shrink-0">
        <h3 className={cn(
          "text-xl font-bold uppercase",
          theme === 'dark' ? "text-blue-400" : "text-blue-700"
        )}>DANH MỤC VẬT TƯ</h3>
      </div>

      <div className={cn(
        "flex-1 overflow-auto border rounded-lg shadow-sm custom-scrollbar mb-4",
        theme === 'dark' ? "border-white/60 bg-slate-900" : "border-gray-300 bg-white"
      )}>
        <table className={cn(
          "min-w-full border-collapse text-[13px] relative",
          theme === 'dark' ? "border-white/60" : "border-gray-300"
        )}>
          <thead className="bg-[#004282] text-white sticky top-0 z-20">
            <tr>
              <th className={cn("px-3 py-4 text-center font-bold border w-12", theme === 'dark' ? "border-white/60" : "border-gray-300")}>STT</th>
              <th className={cn("px-4 py-4 text-left font-bold border", theme === 'dark' ? "border-white/60" : "border-gray-300")}>Hạng mục / Vật tư</th>
              <th className={cn("px-4 py-4 text-left font-bold border", theme === 'dark' ? "border-white/60" : "border-gray-300")}>Chủng loại / Quy cách</th>
              <th className={cn("px-3 py-4 text-center font-bold border w-20", theme === 'dark' ? "border-white/60" : "border-gray-300")}>Đơn vị</th>
              <th className={cn("px-4 py-4 text-right font-bold border w-32", theme === 'dark' ? "border-white/60" : "border-gray-300")}>Đơn giá</th>
              <th className={cn("px-4 py-4 text-center font-bold border w-32", theme === 'dark' ? "border-white/60" : "border-gray-300")}>Định mức (trên 1m2 sàn)</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((section) => {
              const items = state.materialList.filter(item => item.category === section.category);
              if (items.length === 0) return null;

              return (
                <React.Fragment key={section.id}>
                  {/* Section Header Row */}
                  <tr className={cn(
                    "font-bold",
                    theme === 'dark' ? "bg-blue-900/60 text-blue-200" : "bg-blue-50 text-blue-900"
                  )}>
                    <td className={cn("px-4 py-3 border", theme === 'dark' ? "border-white/60" : "border-gray-300")} colSpan={6}>
                      {section.id}. {section.title}
                    </td>
                  </tr>
                  {/* Section Items */}
                  {items.map((item, index) => (
                    <tr 
                      key={item.id} 
                      className={cn(
                        "cursor-pointer transition-colors",
                        index % 2 === 0 
                          ? (theme === 'dark' ? "bg-slate-800" : "bg-white") 
                          : (theme === 'dark' ? "bg-slate-800/50" : "bg-gray-50"),
                        selectedId === item.id && (theme === 'dark' ? "bg-blue-900/40" : "bg-blue-100")
                      )}
                      onClick={() => setSelectedId(item.id)}
                    >
                      <td className={cn("px-3 py-3 border text-center", theme === 'dark' ? "border-white/60" : "border-gray-300")}>{item.stt}</td>
                      <td className={cn("px-4 py-3 border", theme === 'dark' ? "border-white/60" : "border-gray-300")}>{item.name}</td>
                      <td className={cn("p-0 border", theme === 'dark' ? "border-white/60" : "border-gray-300")}>
                        <input
                          type="text"
                          value={item.brand}
                          onChange={(e) => handleMaterialChange(item.id, 'brand', e.target.value)}
                          className="w-full h-full bg-transparent border-none focus:ring-1 focus:ring-blue-500 px-4 py-3 text-[13px]"
                        />
                      </td>
                      <td className={cn("px-3 py-3 border text-center", theme === 'dark' ? "border-white/60" : "border-gray-300")}>{item.unit}</td>
                      <td className={cn("p-0 border", theme === 'dark' ? "border-white/60" : "border-gray-300")}>
                        <input
                          type="text"
                          value={formatNumber(item.price)}
                          onChange={(e) => handleMaterialChange(item.id, 'price', e.target.value)}
                          className="w-full h-full bg-transparent border-none focus:ring-1 focus:ring-blue-500 px-4 py-3 text-right text-[13px]"
                        />
                      </td>
                      <td className={cn("p-0 border", theme === 'dark' ? "border-white/60" : "border-gray-300")}>
                        <input
                          type="text"
                          value={typeof item.dinh_muc_m2 === 'number' ? item.dinh_muc_m2.toString().replace('.', ',') : item.dinh_muc_m2}
                          onChange={(e) => handleMaterialChange(item.id, 'dinh_muc_m2', e.target.value)}
                          className="w-full h-full bg-transparent border-none focus:ring-1 focus:ring-blue-500 px-4 py-3 text-center text-[13px] text-red-600 font-medium"
                        />
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Fixed Footer Area */}
      <div className="shrink-0">
        <div className="flex w-full gap-1">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImportExcel} 
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
          />
          <button 
            onClick={onCalculate}
            className="flex-1 bg-red-700 text-white py-2 rounded shadow-sm font-bold hover:bg-red-800 transition-colors text-[10px] uppercase whitespace-nowrap"
          >
            Tính toán
          </button>
          <button 
            onClick={handleInsertRow}
            className="flex-1 bg-blue-600 text-white py-2 rounded shadow-sm font-bold hover:bg-blue-700 transition-colors text-[10px] uppercase whitespace-nowrap"
          >
            Chèn
          </button>
          <button 
            onClick={handleDeleteRow}
            className="flex-1 bg-blue-600 text-white py-2 rounded shadow-sm font-bold hover:bg-blue-700 transition-colors text-[10px] uppercase whitespace-nowrap"
          >
            Xóa
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 bg-green-600 text-white py-2 rounded shadow-sm font-bold hover:bg-green-700 transition-colors text-[10px] uppercase whitespace-nowrap"
          >
            Nhập Excel
          </button>
          <button 
            onClick={handleExportExcel}
            className="flex-1 bg-orange-600 text-white py-2 rounded shadow-sm font-bold hover:bg-orange-700 transition-colors text-[10px] uppercase whitespace-nowrap"
          >
            Xuất Excel
          </button>
          <button className="flex-1 bg-gray-700 text-white py-2 rounded shadow-sm font-bold hover:bg-gray-800 transition-colors text-[10px] uppercase whitespace-nowrap">Đóng</button>
        </div>
      </div>
    </div>
  );
};

export default StepMaterialList;
