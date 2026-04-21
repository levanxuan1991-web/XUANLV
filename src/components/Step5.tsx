import React, { useState, useRef } from 'react';
import { AppState, EstimateItem, SavedProject } from '../types';
import * as XLSX from 'xlsx';
import { cn, parseFormattedNumber } from '../lib/utils';
import AnalysisModal from './AnalysisModal';
import PriceAdjustmentModal from './PriceAdjustmentModal';
import SaveProjectModal from './SaveProjectModal';
import QuotePreviewModal from './QuotePreviewModal';
import { PieChart, TrendingUp } from 'lucide-react';

interface Props {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
  result: any;
  onCalculate?: () => void;
  theme?: string;
}

export default function Step5({ state, updateState, result, onCalculate, theme }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [isPriceAdjustmentOpen, setIsPriceAdjustmentOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isQuotePreviewOpen, setIsQuotePreviewOpen] = useState(false);
  const [showOnlySummary, setShowOnlySummary] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(Math.round(value));
  };

  const formatQuantity = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  };

  const recalculateEstimateItems = (items: EstimateItem[]) => {
    let updatedItems = [...items];

    // 1. Special calculation for items 1.1.2, 1.2.1, 1.2.2, 1.2.3
    const directCostItems = updatedItems.filter(item => 
      !item.isParent && (
        item.stt.startsWith('2.') || 
        item.stt.startsWith('3.') || 
        item.stt.startsWith('4.') || 
        item.stt === '1.1.1'
      )
    );
    const totalDirectCost = directCostItems.reduce((sum, item) => sum + item.thanh_tien, 0);

    updatedItems = updatedItems.map(item => {
      if (['1.1.2', '1.2.1', '1.2.2', '1.2.3'].includes(item.stt)) {
        const updatedDonGia = totalDirectCost;
        const updatedThanhTien = Math.round(item.so_luong * updatedDonGia);
        return {
          ...item,
          don_gia: updatedDonGia,
          thanh_tien: updatedThanhTien
        };
      }
      return item;
    });

    // 2. Calculate parent totals iteratively from deepest level up
    const maxDepth = Math.max(...updatedItems.map(item => item.stt.split('.').length), 1);
    
    for (let depth = maxDepth - 1; depth >= 1; depth--) {
      updatedItems = updatedItems.map(item => {
        if (item.isParent && item.stt.split('.').length === depth) {
          const children = updatedItems.filter(child => {
            const childParts = child.stt.split('.');
            return child.stt.startsWith(item.stt + '.') && childParts.length === depth + 1;
          });
          const totalThanhTien = children.reduce((sum, child) => sum + child.thanh_tien, 0);
          return { ...item, thanh_tien: totalThanhTien };
        }
        return item;
      });
    }

    return updatedItems;
  };

  const handleItemChange = (id: string, field: keyof EstimateItem, value: any) => {
    let updatedItems = state.duToanChiTiet.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate derived fields
        if (field === 'so_luong' || field === 'he_so') {
          updatedItem.tong_so_luong = updatedItem.so_luong * updatedItem.he_so;
          updatedItem.thanh_tien = updatedItem.tong_so_luong * updatedItem.don_gia;
        } else if (field === 'don_gia') {
          updatedItem.thanh_tien = updatedItem.tong_so_luong * updatedItem.don_gia;
        } else if (field === 'dinh_muc_m2') {
          // If norm changes, update so_luong based on total area
          updatedItem.so_luong = (result?.totalArea || 0) * value;
          updatedItem.tong_so_luong = updatedItem.so_luong * updatedItem.he_so;
          updatedItem.thanh_tien = updatedItem.tong_so_luong * updatedItem.don_gia;
        }
        
        return updatedItem;
      }
      return item;
    });
    
    updatedItems = recalculateEstimateItems(updatedItems);
    updateState({ duToanChiTiet: updatedItems });
  };

  const handleInsertRow = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newItem: EstimateItem = {
      id: newId,
      stt: '',
      hang_muc: 'Hạng mục mới',
      dvt: '',
      chung_loai: '',
      so_luong: 0,
      he_so: 1,
      tong_so_luong: 0,
      don_gia: 0,
      thanh_tien: 0,
      ghi_chu: '',
      isParent: false,
      dinh_muc_m2: 0
    };

    let updatedItems;
    if (selectedIds.length > 0) {
      const lastSelectedId = selectedIds[selectedIds.length - 1];
      const index = state.duToanChiTiet.findIndex(item => item.id === lastSelectedId);
      updatedItems = [...state.duToanChiTiet];
      updatedItems.splice(index + 1, 0, newItem);
    } else {
      updatedItems = [...state.duToanChiTiet, newItem];
    }
    
    updatedItems = recalculateEstimateItems(updatedItems);
    updateState({ duToanChiTiet: updatedItems });
  };

  const handleDeleteRow = () => {
    if (selectedIds.length === 0) return;
    let updatedItems = state.duToanChiTiet.filter(item => !selectedIds.includes(item.id));
    updatedItems = recalculateEstimateItems(updatedItems);
    updateState({ duToanChiTiet: updatedItems });
    setSelectedIds([]);
  };

  const handlePriceAdjustment = (percentage: number) => {
    if (selectedIds.length === 0) return;
    
    let updatedItems = state.duToanChiTiet.map(item => {
      if (selectedIds.includes(item.id) && !item.isParent) {
        const newDonGia = Math.round(item.don_gia * (1 + percentage / 100));
        return {
          ...item,
          don_gia: newDonGia,
          thanh_tien: item.tong_so_luong * newDonGia
        };
      }
      return item;
    });
    
    updatedItems = recalculateEstimateItems(updatedItems);
    updateState({ duToanChiTiet: updatedItems });
  };

  const handleSaveProject = () => {
    setIsSaveModalOpen(true);
  };

  const confirmSaveProject = (projectName: string) => {
    // Create a copy of the state without the savedProjects list to avoid recursion
    const { savedProjects, ...projectData } = state;
    
    const newProject: SavedProject = {
      id: Math.random().toString(36).substr(2, 9),
      name: projectName,
      date: new Date().toLocaleString('vi-VN'),
      data: projectData
    };
    
    updateState({
      savedProjects: [...state.savedProjects, newProject]
    });
    
    alert(`Dự án "${projectName}" đã được lưu thành công vào mục "7. Dự án đã lưu"`);
    setIsSaveModalOpen(false);
  };

  const toggleRowSelection = (id: string, event: React.MouseEvent, isCheckbox: boolean = false) => {
    if (isCheckbox) {
      setSelectedIds(prev => 
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
      return;
    }

    if (event.ctrlKey || event.metaKey) {
      setSelectedIds(prev => 
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
    } else if (event.shiftKey && selectedIds.length > 0) {
      const lastId = selectedIds[selectedIds.length - 1];
      const items = state.duToanChiTiet;
      const lastIndex = items.findIndex(i => i.id === lastId);
      const currentIndex = items.findIndex(i => i.id === id);
      
      const start = Math.min(lastIndex, currentIndex);
      const end = Math.max(lastIndex, currentIndex);
      
      const newSelection = items.slice(start, end + 1).map(i => i.id);
      setSelectedIds(Array.from(new Set([...selectedIds, ...newSelection])));
    } else {
      setSelectedIds(prev => 
        prev.includes(id) && prev.length === 1 ? [] : [id]
      );
    }
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

      // Skip header row (assuming first row is header)
      const rows = data.slice(1);
      
      const importedItems: EstimateItem[] = rows.map((row) => {
        const so_luong = Number(row[4]) || 0;
        const he_so = Number(row[5]) || 0;
        const tong_so_luong = Number(row[6]) || (so_luong * he_so);
        const don_gia = Number(row[7]) || 0;
        const thanh_tien = Number(row[8]) || (tong_so_luong * don_gia);

        return {
          id: Math.random().toString(36).substr(2, 9),
          stt: String(row[0] || ''),
          hang_muc: String(row[1] || ''),
          dinh_muc_m2: 0, // We don't import this anymore
          dvt: String(row[2] || ''),
          chung_loai: String(row[3] || ''),
          so_luong: so_luong,
          he_so: he_so,
          tong_so_luong: tong_so_luong,
          don_gia: don_gia,
          thanh_tien: thanh_tien,
          ghi_chu: String(row[9] || ''),
          isParent: String(row[0]).match(/^[I|V|X]+$/) ? true : false,
        };
      });

      if (importedItems.length > 0) {
        const recalculatedItems = recalculateEstimateItems(importedItems);
        updateState({ duToanChiTiet: recalculatedItems });
      }
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  const handleExportExcel = () => {
    const exportData = state.duToanChiTiet.map(item => ({
      'STT': item.stt,
      'Hạng mục': item.hang_muc,
      'ĐVT': item.dvt,
      'Chủng loại/ Quy cách': item.chung_loai,
      'Số lượng': item.so_luong,
      'Hệ số': item.he_so,
      'Tổng SL': item.tong_so_luong,
      'Đơn giá': item.don_gia,
      'Thành tiền': item.thanh_tien,
      'Ghi chú': item.ghi_chu
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DuToanChiTiet");
    XLSX.writeFile(wb, "DuToan_ChiTiet.xlsx");
  };

  const totalEstimate = (state.duToanChiTiet || [])
    .filter(item => item.isParent && item.stt && item.stt.split('.').length === 1)
    .reduce((sum, item) => sum + (item.thanh_tien || 0), 0);

  const displayedItems = showOnlySummary 
    ? state.duToanChiTiet.filter(item => item.isParent) 
    : state.duToanChiTiet;

  return (
    <div className="flex flex-col h-[75vh]">
      <div className="flex justify-between items-center border-b pb-2 mb-4 shrink-0">
        <h3 className={cn(
          "text-xl font-bold uppercase",
          theme === 'dark' ? "text-blue-400" : "text-blue-700"
        )}>DỰ TOÁN CHI TIẾT</h3>
        <button
          onClick={() => setShowOnlySummary(!showOnlySummary)}
          className={cn(
            "px-4 py-2 rounded shadow-sm font-bold text-xs uppercase transition-colors",
            theme === 'dark' ? "bg-slate-700 text-white hover:bg-slate-600" : "bg-white border text-slate-700 hover:bg-slate-50"
          )}
        >
          {showOnlySummary ? "Hiện tất cả" : "Ẩn dòng con"}
        </button>
      </div>

      <div className={cn(
        "flex-1 overflow-auto border rounded-lg shadow-sm custom-scrollbar mb-4",
        theme === 'dark' ? "border-white/60" : "border-gray-300"
      )}>
        <table className={cn(
          "min-w-full border-collapse text-[13px] relative",
          theme === 'dark' ? "border-white/60" : "border-gray-300"
        )}>
          <thead className={cn(
            "sticky top-0 z-10 bg-[#004282] text-white"
          )}>
            <tr>
              <th className={cn("px-3 py-4 text-center font-bold border w-16", theme === 'dark' ? "border-white/60" : "border-gray-300")}>STT</th>
              <th className={cn("px-4 py-4 text-left font-bold border", theme === 'dark' ? "border-white/60" : "border-gray-300")}>Hạng mục</th>
              <th className={cn("px-3 py-4 text-center font-bold border w-16", theme === 'dark' ? "border-white/60" : "border-gray-300")}>ĐVT</th>
              <th className={cn("px-4 py-4 text-left font-bold border w-52", theme === 'dark' ? "border-white/60" : "border-gray-300")}>Chủng loại/ Quy cách</th>
              <th className={cn("px-3 py-4 text-right font-bold border w-24", theme === 'dark' ? "border-white/60" : "border-gray-300")}>Số lượng</th>
              <th className={cn("px-3 py-4 text-right font-bold border w-16", theme === 'dark' ? "border-white/60" : "border-gray-300")}>Hệ số</th>
              <th className={cn("px-3 py-4 text-right font-bold border w-28", theme === 'dark' ? "border-white/60" : "border-gray-300")}>Tổng SL</th>
              <th className={cn("px-4 py-4 text-right font-bold border w-36", theme === 'dark' ? "border-white/60" : "border-gray-300")}>Đơn giá</th>
              <th className={cn("px-4 py-4 text-right font-bold border w-40", theme === 'dark' ? "border-white/60" : "border-gray-300")}>Thành tiền</th>
              <th className={cn("px-4 py-4 text-left font-bold border w-64", theme === 'dark' ? "border-white/60" : "border-gray-300")}>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {displayedItems.map((item, index) => (
            <tr 
              key={item.id} 
              className={cn(
                "cursor-pointer transition-colors",
                item.isParent 
                  ? (theme === 'dark' ? "bg-slate-800/50 font-bold" : "bg-gray-100 font-bold") 
                  : (index % 2 === 0 
                      ? (theme === 'dark' ? "bg-slate-900" : "bg-white") 
                      : (theme === 'dark' ? "bg-slate-800/30" : "bg-gray-50")),
                selectedIds.includes(item.id) && (theme === 'dark' ? "bg-blue-900/40" : "bg-blue-100")
              )}
              onClick={(e) => toggleRowSelection(item.id, e)}
            >
                <td className={cn("px-3 py-3 border text-center", theme === 'dark' ? "border-white/60" : "border-gray-300")}>
                  <div className="flex items-center justify-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(item.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleRowSelection(item.id, {} as any, true);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-3 h-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-[11px]">{item.stt}</span>
                  </div>
                </td>
                <td className={cn("p-0 border", theme === 'dark' ? "border-white/60" : "border-gray-300")}>
                  {item.isParent ? (
                    <span className="px-4 py-3 block">{item.hang_muc}</span>
                  ) : (
                    <input 
                      type="text" 
                      value={item.hang_muc} 
                      onChange={(e) => handleItemChange(item.id, 'hang_muc', e.target.value)}
                      className="w-full h-full bg-transparent border-none focus:ring-1 focus:ring-blue-500 px-4 py-3 text-[13px]"
                    />
                  )}
                </td>
                <td className={cn("p-0 border text-center", theme === 'dark' ? "border-white/60" : "border-gray-300")}>
                  <input 
                    type="text" 
                    value={item.dvt} 
                    onChange={(e) => handleItemChange(item.id, 'dvt', e.target.value)}
                    className="w-full h-full bg-transparent border-none focus:ring-1 focus:ring-blue-500 px-3 py-3 text-[13px] text-center"
                  />
                </td>
                <td className={cn("p-0 border", theme === 'dark' ? "border-white/60" : "border-gray-300")}>
                  <input 
                    type="text" 
                    value={item.chung_loai} 
                    onChange={(e) => handleItemChange(item.id, 'chung_loai', e.target.value)}
                    className="w-full h-full bg-transparent border-none focus:ring-1 focus:ring-blue-500 px-4 py-3 text-[13px]"
                  />
                </td>
                <td className={cn("p-0 border text-right", theme === 'dark' ? "border-white/60" : "border-gray-300")}>
                  <input 
                    type="text" 
                    value={formatQuantity(item.so_luong)} 
                    onChange={(e) => handleItemChange(item.id, 'so_luong', parseFormattedNumber(e.target.value))}
                    className="w-full h-full bg-transparent border-none focus:ring-1 focus:ring-blue-500 px-3 py-3 text-[13px] text-right"
                  />
                </td>
                <td className={cn("p-0 border text-right", theme === 'dark' ? "border-white/60" : "border-gray-300")}>
                  <input 
                    type="number" 
                    value={item.he_so} 
                    onChange={(e) => handleItemChange(item.id, 'he_so', Number(e.target.value))}
                    className="w-full h-full bg-transparent border-none focus:ring-1 focus:ring-blue-500 px-3 py-3 text-[13px] text-right"
                  />
                </td>
                <td className={cn(
                  "px-3 py-3 border text-right",
                  item.isParent ? "font-bold" : "font-normal",
                  theme === 'dark' ? "border-white/60" : "border-gray-300"
                )}>
                  {formatQuantity(item.tong_so_luong)}
                </td>
                <td className={cn("p-0 border text-right", theme === 'dark' ? "border-white/60" : "border-gray-300")}>
                  {item.isParent ? (
                    <span className="px-4 py-3 block"></span>
                  ) : (
                    <input 
                      type="text" 
                      value={formatCurrency(item.don_gia)} 
                      onChange={(e) => handleItemChange(item.id, 'don_gia', parseFormattedNumber(e.target.value))}
                      className={cn(
                        "w-full h-full bg-transparent border-none focus:ring-1 focus:ring-blue-500 px-4 py-3 text-[13px] text-right",
                        item.isParent ? "font-bold" : "font-normal"
                      )}
                    />
                  )}
                </td>
                <td className={cn(
                  "px-4 py-3 border text-right",
                  item.isParent ? "font-bold" : "font-normal",
                  theme === 'dark' ? "border-white/60 text-white" : "border-gray-300 text-slate-900"
                )}>
                  {formatCurrency(item.thanh_tien)}
                </td>
                <td className={cn("p-0 border", theme === 'dark' ? "border-white/60" : "border-gray-300")}>
                  <input 
                    type="text" 
                    value={item.ghi_chu} 
                    onChange={(e) => handleItemChange(item.id, 'ghi_chu', e.target.value)}
                    className="w-full h-full bg-transparent border-none focus:ring-1 focus:ring-blue-500 px-4 py-3 text-[13px]"
                  />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className={cn(
            "sticky bottom-0 z-10 font-bold text-sm",
            theme === 'dark' ? "bg-slate-800" : "bg-gray-100"
          )}>
            <tr>
              <td className={cn("px-3 py-3 border text-right uppercase", theme === 'dark' ? "border-white/60" : "border-gray-300")} colSpan={8}>TỔNG CHI PHÍ XÂY DỰNG:</td>
              <td className={cn("px-3 py-3 border text-right text-red-600", theme === 'dark' ? "border-white/60" : "border-gray-300")}>{formatCurrency(totalEstimate)}</td>
              <td className={cn("px-3 py-3 border", theme === 'dark' ? "border-white/60" : "border-gray-300")}>VNĐ</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Fixed Footer Area */}
      <div className="shrink-0 space-y-3">
        <div className="flex w-full gap-1">
          <button 
            onClick={onCalculate}
            className="flex-1 bg-red-700 text-white py-2 rounded shadow-sm font-bold hover:bg-red-800 transition-colors text-[9px] uppercase whitespace-nowrap"
          >
            Tính toán
          </button>
          <button 
            onClick={() => setIsAnalysisOpen(true)}
            className="flex-1 bg-blue-600 text-white py-2 rounded shadow-sm font-bold hover:bg-blue-700 transition-colors text-[9px] uppercase whitespace-nowrap flex items-center justify-center gap-1"
          >
            <PieChart className="w-3 h-3" />
            Phân tích
          </button>
          <button 
            onClick={() => setIsPriceAdjustmentOpen(true)}
            className="flex-1 bg-blue-600 text-white py-2 rounded shadow-sm font-bold hover:bg-blue-700 transition-colors text-[9px] uppercase whitespace-nowrap flex items-center justify-center gap-1"
          >
            <TrendingUp className="w-3 h-3" />
            Tăng giảm giá
          </button>
          <button 
            onClick={handleInsertRow}
            className="flex-1 bg-blue-600 text-white py-2 rounded shadow-sm font-bold hover:bg-blue-700 transition-colors text-[9px] uppercase whitespace-nowrap"
          >
            Chèn
          </button>
          <button 
            onClick={handleDeleteRow}
            className="flex-1 bg-blue-600 text-white py-2 rounded shadow-sm font-bold hover:bg-blue-700 transition-colors text-[9px] uppercase whitespace-nowrap"
          >
            Xóa
          </button>
          <button 
            onClick={handleSaveProject}
            className="flex-1 bg-blue-600 text-white py-2 rounded shadow-sm font-bold hover:bg-blue-700 transition-colors text-[9px] uppercase whitespace-nowrap"
          >
            Lưu dự án
          </button>
          <button 
            onClick={handleExportExcel}
            className="flex-1 bg-orange-600 text-white py-2 rounded shadow-sm font-bold hover:bg-orange-700 transition-colors text-[9px] uppercase whitespace-nowrap"
          >
            Xuất Excel
          </button>
          <button 
            onClick={() => setIsQuotePreviewOpen(true)}
            className="flex-1 bg-blue-600 text-white py-2 rounded shadow-sm font-bold hover:bg-blue-700 transition-colors text-[9px] uppercase whitespace-nowrap"
          >
            Xuất Báo Giá
          </button>
          <button className="flex-1 bg-gray-700 text-white py-2 rounded shadow-sm font-bold hover:bg-gray-800 transition-colors text-[9px] uppercase whitespace-nowrap">Đóng</button>
        </div>

        <div className={cn(
          "flex justify-end items-center space-x-8 text-[13px] font-bold p-4 rounded-xl border transition-all duration-300",
          theme === 'light' 
            ? "bg-blue-50 border-blue-200 text-blue-900 shadow-sm" 
            : "bg-slate-800 border-slate-700 text-white shadow-inner"
        )}>
          <div className="flex items-baseline space-x-2">
            <span className={cn(
              "uppercase text-[10px] tracking-wider",
              theme === 'light' ? "text-blue-600/70" : "text-slate-400"
            )}>Dự toán:</span>
            <span className={cn(
              "text-lg",
              theme === 'light' ? "text-blue-900" : "text-white"
            )}>{formatCurrency(result?.totalPackageCost || 0)}</span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className={cn(
              "uppercase text-[10px] tracking-wider",
              theme === 'light' ? "text-blue-600/70" : "text-slate-400"
            )}>Chào giá:</span>
            <span className={cn(
              "text-lg",
              theme === 'light' ? "text-blue-700" : "text-blue-400"
            )}>{formatCurrency(totalEstimate)}</span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className={cn(
              "uppercase text-[10px] tracking-wider",
              theme === 'light' ? "text-blue-600/70" : "text-slate-400"
            )}>Lợi nhuận:</span>
            <span className={cn("text-lg", ((result?.totalPackageCost || 0) - totalEstimate) >= 0 ? (theme === 'light' ? "text-green-600" : "text-green-400") : (theme === 'light' ? "text-red-600" : "text-red-400"))}>
              {formatCurrency((result?.totalPackageCost || 0) - totalEstimate)}
              <span className="ml-1 text-xs opacity-80">
                ({totalEstimate > 0 ? ( (((result?.totalPackageCost || 0) - totalEstimate) / totalEstimate) * 100 ).toFixed(2) : '0.00'}%)
              </span>
            </span>
          </div>
        </div>
      </div>

      <AnalysisModal 
        isOpen={isAnalysisOpen} 
        onClose={() => setIsAnalysisOpen(false)} 
        state={state} 
        result={result} 
        theme={theme === 'dark' ? 'dark' : 'light'} 
      />

      <PriceAdjustmentModal
        isOpen={isPriceAdjustmentOpen}
        onClose={() => setIsPriceAdjustmentOpen(false)}
        onApply={handlePriceAdjustment}
        theme={theme === 'dark' ? 'dark' : 'light'}
      />

      <SaveProjectModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={confirmSaveProject}
        theme={theme === 'dark' ? 'dark' : 'light'}
        defaultName={`Dự án ${state.location} - ${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`}
      />

      <QuotePreviewModal
        isOpen={isQuotePreviewOpen}
        onClose={() => setIsQuotePreviewOpen(false)}
        state={state}
        result={result}
        theme={theme === 'dark' ? 'dark' : 'light'}
      />
    </div>
  );
}

