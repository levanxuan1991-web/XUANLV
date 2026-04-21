import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Download } from 'lucide-react';
import { AppState } from '../types';
import { cn } from '../lib/utils';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  result: any;
  theme?: 'light' | 'dark';
}

export default function QuotePreviewModal({ isOpen, onClose, state, result, theme = 'light' }: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(Math.round(value));
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value);
  };

  const handleExportPDF = async () => {
    if (!printRef.current) return;
    
    try {
      const element = printRef.current;
      
      // Temporary style to ensure white background and proper dimensions for capture
      const originalStyle = element.getAttribute('style');
      element.setAttribute('style', originalStyle + '; background-color: white !important; color: black !important;');
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      });
      
      // Restore original style
      if (originalStyle) {
        element.setAttribute('style', originalStyle);
      } else {
        element.removeAttribute('style');
      }
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = imgWidth / pdfWidth;
      const imgPdfHeight = imgHeight / ratio;
      
      let heightLeft = imgPdfHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgPdfHeight);
      heightLeft -= pdfHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgPdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgPdfHeight);
        heightLeft -= pdfHeight;
      }
      
      pdf.save(`Bao_Gia_${state.location.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Có lỗi xảy ra khi xuất file PDF. Vui lòng thử lại.');
    }
  };

  const handleExportWord = async () => {
    if (!printRef.current) return;
    
    try {
      const content = printRef.current.innerHTML;
      
      // Basic CSS to preserve some styling in Word
      const styles = `
        <style>
          body { font-family: 'Arial', sans-serif; font-size: 11pt; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
          th, td { border: 1px solid #000; padding: 5px; }
          th { background-color: #1e40af; color: #ffffff; font-weight: bold; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .font-bold { font-weight: bold; }
          .uppercase { text-transform: uppercase; }
          .text-blue-800 { color: #1e40af; }
          .bg-gray-100 { background-color: #f3f4f6; }
          .border-b-2 { border-bottom: 2px solid #1e40af; }
          h1, h2, h3 { color: #1e40af; }
        </style>
      `;

      const header = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' 
              xmlns:w='urn:schemas-microsoft-com:office:word' 
              xmlns='http://www.w3.org/TR/REC-html40'>
          <head>
            <meta charset='utf-8'>
            <title>Báo giá xây dựng</title>
            ${styles}
          </head>
          <body>
      `;
      const footer = "</body></html>";
      const fullHtml = header + content + footer;
      
      const blob = new Blob(['\ufeff', fullHtml], {
        type: 'application/msword'
      });
      
      saveAs(blob, `Bao_Gia_${state.location.replace(/\s+/g, '_')}.doc`);
    } catch (error) {
      console.error('Error exporting Word:', error);
      alert('Có lỗi xảy ra khi xuất file Word. Vui lòng thử lại.');
    }
  };

  const roughMaterials = (state.materialList || []).filter(m => m.category === 'ROUGH');
  const finishingMaterials = (state.materialList || []).filter(m => m.category === 'FINISHING');
  const contractedWorks = (state.materialList || []).filter(m => m.category === 'CONTRACTED');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn(
              "relative w-full max-w-5xl h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden",
              theme === 'dark' ? "bg-slate-900 text-white" : "bg-white text-slate-900"
            )}
          >


            {/* Header */}
            <div className={cn(
              "flex items-center justify-between px-6 py-4 border-b shrink-0",
              theme === 'dark' ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-100 text-blue-900"
            )}>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold uppercase tracking-tight">Bản xem trước Báo giá</h2>
              </div>
              <button
                onClick={onClose}
                className={cn(
                  "p-2 rounded-full transition-colors",
                  theme === 'dark' ? "hover:bg-slate-700 text-slate-400" : "hover:bg-slate-100 text-slate-400"
                )}
              >
                <X className="w-5 h-5 stroke-[1.5px]" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-8 custom-scrollbar bg-gray-50">
              <div 
                ref={printRef}
                className="bg-white shadow-lg mx-auto p-12 min-h-[297mm] w-[210mm] text-slate-900"
                style={{ fontFamily: 'Arial, sans-serif' }}
              >
                {/* Company Header */}
                <div className="text-center mb-8">
                  <h1 className="text-xl font-bold uppercase text-gray-800">CÔNG TY TNHH XÂY DỰNG XUÂN LÊ</h1>
                  <p className="text-sm text-gray-600 mt-1">Địa chỉ: 139/27 Năm Châu, Phường Bảy Hiền, Tp. HCM</p>
                  <p className="text-sm text-gray-600">Hotline: 0971.536.467</p>
                  <div className="mt-6">
                    <h2 className="text-2xl font-bold text-blue-800 uppercase tracking-wider">BÁO GIÁ THI CÔNG XÂY DỰNG</h2>
                    <p className="text-sm text-gray-500 mt-1">Ngày: {new Date().toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>

                {/* Section A */}
                <div className="mb-8">
                  <h3 className="text-blue-800 font-bold border-b-2 border-blue-800 pb-1 mb-3 uppercase">A. THÔNG TIN DỰ ÁN</h3>
                  <div className="grid grid-cols-1 border border-gray-300 rounded overflow-hidden">
                    <div className="flex border-b border-gray-300">
                      <div className="w-1/3 bg-gray-100 px-4 py-2 font-bold border-r border-gray-300">Địa điểm xây dựng:</div>
                      <div className="w-2/3 px-4 py-2">{state.location}</div>
                    </div>
                    <div className="flex border-b border-gray-300">
                      <div className="w-1/3 bg-gray-100 px-4 py-2 font-bold border-r border-gray-300">Loại công trình:</div>
                      <div className="w-2/3 px-4 py-2">{state.buildingType} ({state.architectureType})</div>
                    </div>
                    <div className="flex">
                      <div className="w-1/3 bg-gray-100 px-4 py-2 font-bold border-r border-gray-300">Quy mô:</div>
                      <div className="w-2/3 px-4 py-2">
                        {state.floorsCount} tầng lầu, {state.mezzanines > 0 ? `${state.mezzanines} lửng, ` : ''}
                        {state.basementArea > 0 ? 'có hầm, ' : ''}
                        {state.tumArea > 0 ? 'có tum, ' : ''}
                        {[
                          state.roof1Area > 0 ? state.roof1Type : null,
                          state.roof2Area > 0 ? state.roof2Type : null,
                          state.roof3Area > 0 ? state.roof3Type : null,
                          state.roof4Area > 0 ? state.roof4Type : null
                        ].filter(Boolean).join(', ')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section B */}
                <div className="mb-8">
                  <h3 className="text-blue-800 font-bold border-b-2 border-blue-800 pb-1 mb-3 uppercase">B. DIỄN GIẢI CÁCH TÍNH DIỆN TÍCH XÂY DỰNG</h3>
                  <div className="bg-gray-50 p-4 rounded border border-gray-200">
                    <div className="space-y-1 text-sm">
                      {(result?.details || []).map((detail: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span>{idx + 1}. {detail.name}:</span>
                          <span className="font-mono">
                            {formatNumber(detail.area)} m² x {detail.percentage.toFixed(2)} = {formatNumber(detail.calculatedArea)} m²
                          </span>
                        </div>
                      ))}
                      <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between items-center font-bold text-base">
                        <span>TỔNG CỘNG:</span>
                        <span>= {formatNumber(result?.totalArea || 0)} m²</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section C */}
                <div className="mb-8">
                  <h3 className="text-blue-800 font-bold border-b-2 border-blue-800 pb-1 mb-3 uppercase">C. CÁC GÓI CHI PHÍ THI CÔNG ĐỂ LỰA CHỌN</h3>
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-blue-800 text-white">
                        <th className="border border-gray-300 px-4 py-2 text-left">Gói thi công</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Diện tích (m²)</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Đơn giá (vnđ/m²)</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Thành tiền (vnđ)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">1. Gói Nhân công xây dựng</td>
                        <td className="border border-gray-300 px-4 py-2 text-right">{formatNumber(result?.totalArea || 0)}</td>
                        <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(state.laborPrice)}</td>
                        <td className="border border-gray-300 px-4 py-2 text-right font-bold">{formatCurrency(result?.laborCost || 0)}</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">2. Gói Phần thô & Nhân công hoàn thiện</td>
                        <td className="border border-gray-300 px-4 py-2 text-right">{formatNumber(result?.totalArea || 0)}</td>
                        <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(state.roughPrice)}</td>
                        <td className="border border-gray-300 px-4 py-2 text-right font-bold">{formatCurrency(result?.roughCost || 0)}</td>
                      </tr>
                      <tr className="bg-blue-50">
                        <td className="border border-gray-300 px-4 py-2 font-bold italic">3. Gói Thi công trọn gói (Chìa khóa trao tay)</td>
                        <td className="border border-gray-300 px-4 py-2 text-right">{formatNumber(result?.totalArea || 0)}</td>
                        <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(state.packagePrice)}</td>
                        <td className="border border-gray-300 px-4 py-2 text-right font-bold text-blue-800">{formatCurrency(result?.packageCost || 0)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Section D */}
                <div className="mb-8">
                  <h3 className="text-blue-800 font-bold border-b-2 border-blue-800 pb-1 mb-3 uppercase">D. BẢNG TỔNG HỢP CHI PHÍ (GÓI TRỌN GÓI)</h3>
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-blue-800 text-white">
                        <th className="border border-gray-300 px-4 py-2 text-left">Hạng mục</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Chi phí (vnđ)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">- Chi phí xây dựng ngôi nhà</td>
                        <td className="border border-gray-300 px-4 py-2 text-right font-bold">{formatCurrency(result?.packageCost || 0)}</td>
                      </tr>
                      {result?.pilingCost > 0 && (
                        <tr>
                          <td className="border border-gray-300 px-4 py-2">- Chi phí ép cọc</td>
                          <td className="border border-gray-300 px-4 py-2 text-right font-bold">{formatCurrency(result.pilingCost)}</td>
                        </tr>
                      )}
                      {result?.elevatorCost > 0 && (
                        <tr>
                          <td className="border border-gray-300 px-4 py-2">- Chi phí thang máy</td>
                          <td className="border border-gray-300 px-4 py-2 text-right font-bold">{formatCurrency(result.elevatorCost)}</td>
                        </tr>
                      )}
                      {result?.poolCost > 0 && (
                        <tr>
                          <td className="border border-gray-300 px-4 py-2">- Chi phí hồ bơi</td>
                          <td className="border border-gray-300 px-4 py-2 text-right font-bold">{formatCurrency(result.poolCost)}</td>
                        </tr>
                      )}
                      <tr className="bg-gray-100 font-bold">
                        <td className="border border-gray-300 px-4 py-2 text-right uppercase">TỔNG CỘNG DỰ KIẾN:</td>
                        <td className="border border-gray-300 px-4 py-2 text-right text-red-700 text-lg">{formatCurrency(result?.totalPackageCost || 0)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Section E */}
                <div className="mb-8 break-before-page">
                  <h3 className="text-blue-800 font-bold border-b-2 border-blue-800 pb-1 mb-3 uppercase">E. DANH MỤC VẬT TƯ THÔ SỬ DỤNG</h3>
                  <table className="w-full border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-blue-800 text-white">
                        <th className="border border-gray-300 px-2 py-1 text-center w-12">STT</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Hạng mục / Vật tư</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Chủng loại / Quy cách / Thương hiệu</th>
                        <th className="border border-gray-300 px-2 py-1 text-center w-16">Đơn vị</th>
                        <th className="border border-gray-300 px-2 py-1 text-right w-24">Đơn giá (vnđ)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roughMaterials.map((m, idx) => (
                        <tr key={m.id}>
                          <td className="border border-gray-300 px-2 py-1 text-center">{m.stt}</td>
                          <td className="border border-gray-300 px-2 py-1">{m.name}</td>
                          <td className="border border-gray-300 px-2 py-1">{m.brand}</td>
                          <td className="border border-gray-300 px-2 py-1 text-center">{m.unit}</td>
                          <td className="border border-gray-300 px-2 py-1 text-right">{formatCurrency(m.price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Section F */}
                <div className="mb-8 break-before-page">
                  <h3 className="text-blue-800 font-bold border-b-2 border-blue-800 pb-1 mb-3 uppercase">F. DANH MỤC VẬT TƯ HOÀN THIỆN</h3>
                  <table className="w-full border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-blue-800 text-white">
                        <th className="border border-gray-300 px-2 py-1 text-center w-12">STT</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Hạng mục / Vật tư</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Chủng loại / Quy cách / Thương hiệu</th>
                        <th className="border border-gray-300 px-2 py-1 text-center w-16">Đơn vị</th>
                        <th className="border border-gray-300 px-2 py-1 text-right w-24">Đơn giá (vnđ)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {finishingMaterials.map((m, idx) => (
                        <tr key={m.id}>
                          <td className="border border-gray-300 px-2 py-1 text-center">{m.stt}</td>
                          <td className="border border-gray-300 px-2 py-1">{m.name}</td>
                          <td className="border border-gray-300 px-2 py-1">{m.brand}</td>
                          <td className="border border-gray-300 px-2 py-1 text-center">{m.unit}</td>
                          <td className="border border-gray-300 px-2 py-1 text-right">{formatCurrency(m.price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Section G */}
                <div className="mb-8 break-before-page">
                  <h3 className="text-blue-800 font-bold border-b-2 border-blue-800 pb-1 mb-3 uppercase">G. DANH MỤC CÔNG TÁC GIAO KHOÁN</h3>
                  <table className="w-full border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-blue-800 text-white">
                        <th className="border border-gray-300 px-2 py-1 text-center w-12">STT</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Hạng mục / Công tác</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Diễn giải chi tiết</th>
                        <th className="border border-gray-300 px-2 py-1 text-center w-16">Đơn vị</th>
                        <th className="border border-gray-300 px-2 py-1 text-right w-24">Đơn giá (vnđ)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contractedWorks.map((m, idx) => (
                        <tr key={m.id}>
                          <td className="border border-gray-300 px-2 py-1 text-center">{m.stt}</td>
                          <td className="border border-gray-300 px-2 py-1">{m.name}</td>
                          <td className="border border-gray-300 px-2 py-1">{m.brand}</td>
                          <td className="border border-gray-300 px-2 py-1 text-center">{m.unit}</td>
                          <td className="border border-gray-300 px-2 py-1 text-right">{formatCurrency(m.price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Signature Section */}
                <div className="mt-16 flex justify-between px-10 text-sm font-bold">
                  <div className="text-center">
                    <p>Khách hàng</p>
                    <p className="text-xs font-normal italic mt-1">(Ký và ghi rõ họ tên)</p>
                  </div>
                  <div className="text-center">
                    <p>Đại diện nhà thầu</p>
                    <p className="text-xs font-normal italic mt-1">(Ký và ghi rõ họ tên)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className={cn(
              "px-6 py-4 border-t flex justify-end gap-3 shrink-0",
              theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
            )}>
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-lg font-bold border border-gray-300 hover:bg-gray-100 transition-colors"
              >
                Đóng
              </button>
              <button
                onClick={handleExportWord}
                className="flex items-center gap-2 px-6 py-2 rounded-lg font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                XUẤT WORD
              </button>
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-6 py-2 rounded-lg font-bold bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                XUẤT PDF
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
