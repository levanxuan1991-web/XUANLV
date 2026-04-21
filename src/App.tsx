import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppState, initialState, EstimateItem } from './types';
import { 
  CheckCircle2, 
  Circle, 
  Moon, 
  Sun, 
  Sparkles, 
  Zap, 
  Flame, 
  Palette, 
  Gift,
  ChevronRight,
  ChevronLeft,
  LayoutDashboard,
  Calculator,
  ClipboardList,
  Package,
  FileText,
  LogOut
} from 'lucide-react';
import { cn } from './lib/utils';
import Step1 from './components/Step1';
import Step2 from './components/Step2';
import Step3 from './components/Step3';
import Step4 from './components/Step4';
import Step5 from './components/Step5';
import Step7 from './components/Step7';
import StepMaterialList from './components/StepMaterialList';
import Login from './components/Login';
import { calculateEstimate } from './lib/calculator';
import { TEMPLATE_DU_TOAN } from './dataDuToan';
import { User } from './auth';

const steps = [
  { id: 1, title: 'Thông tin chung' },
  { id: 2, title: 'Quy mô & Diện tích' },
  { id: 3, title: 'Hạng mục khác' },
  { id: 4, title: 'Danh mục vật tư' },
  { id: 5, title: 'Kết quả' },
  { id: 6, title: 'Dự toán chi tiết' },
  { id: 7, title: 'Dự án đã lưu' },
];

const Snowfall = () => {
  const snowflakes = useMemo(() => {
    return Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animationDuration: `${Math.random() * 15 + 15}s`,
      animationDelay: `${Math.random() * 10}s`,
      opacity: Math.random() * 0.3 + 0.1,
      fontSize: `${Math.random() * 8 + 4}px`,
      drift: `${Math.random() * 40 - 20}px`,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden snowfall-container">
      {snowflakes.map((s) => (
        <div
          key={s.id}
          className="absolute text-white select-none"
          style={{
            left: s.left,
            top: '-20px',
            opacity: s.opacity,
            fontSize: s.fontSize,
            animation: `snowfall ${s.animationDuration} linear ${s.animationDelay} infinite`,
            '--drift': s.drift,
          } as any}
        >
          •
        </div>
      ))}
    </div>
  );
};

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [formData, setFormData] = useState<AppState>(() => {
    const saved = localStorage.getItem('dutoan_savedProjects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...initialState, savedProjects: parsed };
      } catch (e) {
        console.error('Failed to parse saved projects', e);
      }
    }
    return initialState;
  });
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    localStorage.setItem('dutoan_savedProjects', JSON.stringify(formData.savedProjects));
  }, [formData.savedProjects]);

  const calculationResult = useMemo(() => {
    return calculateEstimate(formData);
  }, [formData]);

  const lastAreaRef = useRef(0);

  const handleRecalculateFromTemplate = () => {
    const currentArea = calculationResult.totalArea;
    const currentCoefficient = calculationResult.coefficient || 1;
    if (currentArea <= 0) return;
    
    // 1. First pass: Calculate all items except those that depend on direct cost
    const baseItems = TEMPLATE_DU_TOAN.map(template => {
      let so_luong = template.isParent ? 0 : currentArea * template.dinh_muc_m2;
      let don_gia = template.don_gia_tham_khao;
      let dinh_muc_m2 = template.dinh_muc_m2;
      let dvt = template.dvt;
      let chung_loai = template.chung_loai;

      // Check if this item exists in materialList to override price, brand, and norm
      const materialOverride = formData.materialList.find(m => m.stt === template.stt);
      if (materialOverride) {
        don_gia = materialOverride.price;
        chung_loai = materialOverride.brand;
        dinh_muc_m2 = materialOverride.dinh_muc_m2;
        if (!template.isParent) {
          so_luong = currentArea * dinh_muc_m2;
        }
      }

      // Override logic for "Hạng mục khác" based on Step 3 state
      if (template.stt === '4.7.5') { // Cừ chống đổ
        so_luong = formData.shoring ? 1 : 0;
        don_gia = formData.shoringPrice;
        dvt = 'trọn gói';
      }
      else if (template.stt === '4.7.4') { // Ép cọc
        so_luong = formData.piling ? formData.pilingLength : 0;
        don_gia = formData.pilingPrice;
      }
      else if (template.stt === '4.7.1') { // Hồ bơi
        so_luong = formData.pool ? formData.poolArea : 0;
        don_gia = formData.poolPrice;
      }
      else if (template.stt === '4.7.8') { // Thiết kế 2D
        so_luong = formData.design2D ? currentArea : 0;
        don_gia = formData.designPrice;
        dvt = 'm2';
      }
      else if (template.stt === '4.7.6') { // Bản vẽ xin phép
        so_luong = formData.permit ? currentArea : 0;
        don_gia = formData.permitDrawingPrice;
        dvt = 'm2';
      }
      else if (template.stt === '4.7.7') { // Dịch vụ xin phép
        so_luong = formData.permit ? currentArea : 0;
        don_gia = formData.permitServicePrice;
        dvt = 'm2';
      }
      else if (template.stt === '4.6.3') { // Thang máy
        so_luong = formData.elevator ? 1 : 0;
        don_gia = formData.elevatorPrice;
        dvt = 'hệ';
      }
      else if (template.stt === '4.6.4') { // Điểm dừng thang máy
        so_luong = formData.elevator ? formData.elevatorStops : 0;
        don_gia = formData.elevatorStopPrice;
        dvt = 'điểm dừng';
      }
      
      // Apply coefficient to the total cost of each item
      const thanh_tien = so_luong * don_gia * currentCoefficient;
      
      return {
        id: Math.random().toString(36).substr(2, 9),
        stt: template.stt,
        hang_muc: template.hang_muc,
        dvt: dvt,
        chung_loai: chung_loai,
        dinh_muc_m2: dinh_muc_m2,
        so_luong: Number(so_luong.toFixed(3)),
        he_so: 1,
        tong_so_luong: Number(so_luong.toFixed(3)),
        don_gia: don_gia,
        thanh_tien: Math.round(thanh_tien),
        ghi_chu: '',
        isParent: template.isParent,
      };
    });

    // 2. Special calculation for items 1.1.2, 1.2.1, 1.2.2, 1.2.3
    // These items have "Đơn giá" = Total Direct Cost
    // Total Direct Cost = Sum of (Section 2 + Section 3 + Section 4 + Item 1.1.1)
    const directCostItems = baseItems.filter(item => 
      !item.isParent && (
        item.stt.startsWith('2.') || 
        item.stt.startsWith('3.') || 
        item.stt.startsWith('4.') || 
        item.stt === '1.1.1'
      )
    );
    const totalDirectCost = directCostItems.reduce((sum, item) => sum + item.thanh_tien, 0);

    let itemsWithSpecial = baseItems.map(item => {
      if (['1.1.2', '1.2.1', '1.2.2', '1.2.3'].includes(item.stt)) {
        const updatedDonGia = totalDirectCost;
        // For these items, "Số lượng" is the percentage (dinh_muc_m2)
        const updatedSoLuong = item.dinh_muc_m2;
        const updatedThanhTien = Math.round(updatedSoLuong * updatedDonGia);
        return {
          ...item,
          so_luong: updatedSoLuong,
          tong_so_luong: updatedSoLuong,
          don_gia: updatedDonGia,
          thanh_tien: updatedThanhTien
        };
      }
      return item;
    });

    // 3. Calculate parent totals iteratively from deepest level up
    const maxDepth = Math.max(...itemsWithSpecial.map(item => item.stt.split('.').length));
    
    const calculateParents = (items: EstimateItem[]) => {
      let updatedItems = [...items];
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

    itemsWithSpecial = calculateParents(itemsWithSpecial);

    setFormData(prev => ({ ...prev, duToanChiTiet: itemsWithSpecial }));
    lastAreaRef.current = currentArea;
  };


  useEffect(() => {
    handleRecalculateFromTemplate();
  }, [
    calculationResult.totalArea,
    formData.shoring, formData.shoringPrice,
    formData.piling, formData.pilingLength, formData.pilingPrice,
    formData.elevator, formData.elevatorStops, formData.elevatorPrice, formData.elevatorStopPrice,
    formData.pool, formData.poolArea, formData.poolPrice,
    formData.permit, formData.permitDrawingPrice, formData.permitServicePrice,
    formData.design2D, formData.designPrice,
    formData.materialList
  ]);

  useEffect(() => {
    console.log('Form Data Updated:', formData);
    console.log('Calculation Result:', calculationResult);
  }, [formData, calculationResult]);

  const updateState = (updates: Partial<AppState>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const themeColors = {
    light: { 
      primary: 'text-blue-600', 
      bg: 'bg-slate-100', 
      border: 'border-slate-200', 
      sidebar: 'text-slate-600', 
      active: 'bg-blue-50 text-blue-600', 
      dot: 'bg-blue-600', 
      check: 'text-blue-600', 
      icon: <Sun size={16} />, 
      hasSnow: false, 
      isColored: false 
    },
    dark: { 
      primary: 'text-white', 
      bg: 'bg-slate-900', 
      border: 'border-slate-800', 
      sidebar: 'text-slate-100', 
      active: 'bg-slate-800 text-white', 
      dot: 'bg-white', 
      check: 'text-white', 
      icon: <Moon size={16} />, 
      hasSnow: false, 
      isColored: false 
    },
  };

  const currentTheme = themeColors[theme];

  if (!user) {
    return <Login onLogin={setUser} theme={theme} />;
  }

  return (
    <div className={cn(
      "flex h-screen font-sans transition-all duration-500 relative overflow-hidden",
      currentTheme.bg,
      theme === 'light' ? "theme-light-content text-slate-900" : "dark-mode-content text-white"
    )}>
      {currentTheme.hasSnow && <Snowfall />}
      
      {/* Sidebar */}
      <div className={cn(
        "w-64 border-r flex flex-col transition-all duration-500 relative z-20 backdrop-blur-md",
        theme === 'light' ? "bg-slate-100 border-slate-200" : "bg-black/40 border-white/10"
      )}>
        <div className={cn(
          "h-16 flex items-center px-6 border-b transition-all duration-500",
          theme === 'light' ? "bg-slate-100 border-slate-200" : "bg-slate-900 border-slate-800"
        )}>
          <h1 className={cn(
            "text-xl font-bold leading-tight",
            theme === 'light' ? "text-slate-900" : "text-white"
          )}>Dự toán Nhà dân</h1>
        </div>
        <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
          <nav className="space-y-1 px-4">
            {steps.map((step) => {
              const isActive = currentStep === step.id;
              const isPast = currentStep > step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={cn(
                    "w-full flex items-center px-3 py-3 text-sm font-medium rounded-md transition-all",
                    isActive
                      ? (theme === 'light' ? "bg-white text-blue-600 shadow-md border border-slate-200" : theme === 'dark' ? "bg-slate-800 text-white shadow-lg" : "bg-white/20 text-white shadow-lg")
                      : (theme === 'light' ? "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900" : theme === 'dark' ? "text-slate-400 hover:bg-slate-800 hover:text-white" : "text-white/70 hover:bg-white/10 hover:text-white")
                  )}
                >
                  <div className="flex-shrink-0 mr-3">
                    {isPast ? (
                      <CheckCircle2 className={cn("w-5 h-5", currentTheme.check)} />
                    ) : isActive ? (
                      <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", theme === 'light' ? "border-blue-600" : "border-white")}>
                        <div className={cn("w-2.5 h-2.5 rounded-full", currentTheme.dot)} />
                      </div>
                    ) : (
                      <div className={cn("w-5 h-5 rounded-full border-2", theme === 'light' ? "border-slate-300" : "border-white/30")} />
                    )}
                  </div>
                  <span className="truncate">{step.id}. {step.title}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className={cn(
          "p-5 border-t space-y-5",
          theme === 'light' ? "border-slate-200 bg-slate-100" : "border-white/10 bg-white/5"
        )}>
          {/* Theme Selector with Labels */}
          <div className="space-y-2">
            <p className={cn(
              "text-[10px] uppercase tracking-wider font-bold text-center",
              theme === 'light' ? "text-slate-400" : "text-white/40"
            )}>Giao diện</p>
            <div className="flex items-center justify-center">
              <div className={cn(
                "flex items-center p-1 rounded-full border shadow-inner transition-all duration-500",
                theme === 'light' ? "bg-slate-200/50 border-slate-300" : "bg-slate-800/50 border-slate-700"
              )}>
                {[
                  { id: 'light', icon: <Sun size={14} />, label: 'Sáng', color: 'text-blue-600' },
                  { id: 'dark', icon: <Moon size={14} />, label: 'Tối', color: 'text-yellow-400' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id as any)}
                    title={t.label}
                    className={cn(
                      "p-2 rounded-full transition-all duration-300 relative group",
                      theme === t.id 
                        ? (theme === 'light' ? "bg-white shadow-sm" : "bg-slate-700 shadow-md") 
                        : "hover:opacity-70"
                    )}
                  >
                    <span className={cn("relative z-10", theme === t.id ? t.color : "text-slate-400")}>
                      {t.icon}
                    </span>
                    {/* Tooltip-like label on hover could be added here if needed, but keeping it simple for now */}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Copyright Info - More Scientific Look */}
          <div className={cn(
            "pt-2 border-t border-dashed",
            theme === 'light' ? "border-slate-200" : "border-white/10"
          )}>
            <div className={cn(
              "text-[11px] font-semibold space-y-1 text-center",
              theme === 'dark' ? "text-slate-400" : "text-slate-600"
            )}>
              <div className="flex items-center justify-center space-x-1 opacity-80">
                <span className="w-1 h-1 rounded-full bg-current"></span>
                <p className="tracking-tight uppercase text-[9px]">Bản quyền thiết kế</p>
                <span className="w-1 h-1 rounded-full bg-current"></span>
              </div>
              <p className="text-[11px] font-bold tracking-wide uppercase">CÔNG TY TNHH XÂY DỰNG XUÂN LÊ</p>
              <p className="text-[10px] opacity-80">139/27 Năm Châu, P. Bảy Hiền, Tp. HCM</p>
              <p className="font-mono opacity-80 text-[11px]">Hotline: 0971.536.467</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-20">
        <header className={cn(
          "h-16 flex items-center justify-between px-8 border-b transition-all duration-500 backdrop-blur-md",
          theme === 'light' ? "bg-slate-100 border-slate-200" : "bg-slate-900 border-slate-800"
        )}>
          <h2 className={cn(
            "text-lg font-semibold",
            theme === 'light' ? "text-slate-900" : "text-white"
          )}>
            {steps.find(s => s.id === currentStep)?.title}
          </h2>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4 mr-4 border-r pr-4 border-slate-200 dark:border-slate-700">
              <span className={cn(
                "text-sm font-medium",
                theme === 'light' ? "text-slate-600" : "text-slate-300"
              )}>
                Xin chào, <span className="font-bold">{user.username}</span>
              </span>
              <button
                onClick={() => setUser(null)}
                title="Đăng xuất"
                className={cn(
                  "p-2 rounded-full transition-colors",
                  theme === 'light' ? "text-slate-500 hover:bg-slate-100 hover:text-red-500" : "text-slate-400 hover:bg-slate-800 hover:text-red-400"
                )}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
            <div className="flex space-x-3">
               <button 
                  onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                  disabled={currentStep === 1}
                  className={cn(
                    "px-4 py-2 border rounded-md text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-sm",
                    theme === 'light' 
                      ? "text-slate-700 bg-white border-slate-200 hover:bg-slate-50" 
                      : theme === 'dark' 
                        ? "text-slate-300 bg-slate-800 border-slate-700 hover:bg-slate-700" 
                        : "text-white bg-white/10 border-white/20 hover:bg-white/20"
                  )}
                >
                  Quay lại
                </button>
                <button
                  onClick={() => setCurrentStep(prev => Math.min(7, prev + 1))}
                  disabled={currentStep === 7}
                  className={cn(
                    "px-4 py-2 border border-transparent rounded-md shadow-lg text-sm font-medium text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed",
                    theme === 'dark' ? "bg-blue-600 hover:bg-blue-500" : "bg-blue-500 hover:bg-blue-400"
                  )}
                >
                  Tiếp tục
                </button>
            </div>
          </div>
        </header>
        
        <main className={cn(
          "flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar transition-all duration-500",
          theme === 'light' ? "bg-slate-100" : "bg-slate-900"
        )}>
          <div className={cn(
            "w-full max-w-[98%] mx-auto rounded-2xl shadow-2xl border p-4 md:p-8 transition-all duration-500 backdrop-blur-md",
            theme === 'light' ? "bg-slate-100 border-slate-200 text-slate-900" : "dark-mode-card"
          )}>
            <div className={theme === 'light' ? "theme-light-content" : "dark-mode-content"}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  {currentStep === 1 && <Step1 state={formData} updateState={updateState} />}
                  {currentStep === 2 && <Step2 state={formData} updateState={updateState} />}
                  {currentStep === 3 && <Step3 state={formData} updateState={updateState} />}
                  {currentStep === 4 && (
                    <StepMaterialList 
                      state={formData} 
                      updateState={updateState} 
                      onCalculate={handleRecalculateFromTemplate}
                      theme={theme}
                    />
                  )}
                  {currentStep === 5 && <Step4 state={formData} updateState={updateState} result={calculationResult} theme={theme} />}
                  {currentStep === 6 && (
                    <Step5 
                      state={formData} 
                      updateState={updateState} 
                      result={calculationResult} 
                      onCalculate={handleRecalculateFromTemplate}
                      theme={theme}
                    />
                  )}
                  {currentStep === 7 && (
                    <Step7 
                      state={formData} 
                      updateState={updateState} 
                      setCurrentStep={setCurrentStep}
                      theme={theme}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
