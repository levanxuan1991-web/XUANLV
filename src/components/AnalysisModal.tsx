import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  TrendingUp, 
  DollarSign, 
  PieChart as PieChartIcon, 
  BarChart as BarChartIcon, 
  Layers, 
  Activity,
  Info
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  LabelList
} from 'recharts';
import { AppState, EstimateItem } from '../types';
import { cn } from '../lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  result: any;
  theme: 'light' | 'dark';
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('vi-VN').format(value);
};

const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

export default function AnalysisModal({ isOpen, onClose, state, result, theme }: Props) {
  const duToan = state.duToanChiTiet;
  const totalEstimate = (state.duToanChiTiet || [])
    .filter(item => item.isParent && item.stt && item.stt.split('.').length === 1)
    .reduce((sum, item) => sum + (item.thanh_tien || 0), 0);
  const totalPackageCost = result.totalPackageCost;
  
  // Align with Step 6 logic:
  // Dự toán = result.totalPackageCost (Turnkey price from Step 5)
  // Chào giá = totalEstimate (Sum of detailed table)
  // Lợi nhuận = Dự toán - Chào giá
  
  const giaChao = totalEstimate;
  const chiPhiDuToan = totalPackageCost;
  const loiNhuan = chiPhiDuToan - giaChao;
  const loiNhuanPercent = giaChao > 0 ? (loiNhuan / giaChao) * 100 : 0;

  // 1. Data for Donut Chart: Tỷ trọng chi phí Hạng mục chính
  const mainCategoriesData = useMemo(() => {
    const categories = [
      { name: 'Tổ chức sản xuất', total: 0, color: '#FF6384' },
      { name: 'Vật liệu thô', total: 0, color: '#36A2EB' },
      { name: 'Vật liệu hoàn thiện', total: 0, color: '#FFCE56' },
      { name: 'Giao khoán', total: 0, color: '#4BC0C0' },
    ];

    duToan.forEach(item => {
      if (item.isParent) return;
      if (item.stt.startsWith('1.')) categories[0].total += item.thanh_tien;
      else if (item.stt.startsWith('2.')) categories[1].total += item.thanh_tien;
      else if (item.stt.startsWith('3.')) categories[2].total += item.thanh_tien;
      else if (item.stt.startsWith('4.')) categories[3].total += item.thanh_tien;
    });

    return categories.filter(c => c.total > 0);
  }, [duToan]);

  // 2. Data for Bar Chart: Chi tiết chi phí Vật liệu thô
  const roughMaterialsData = useMemo(() => {
    return duToan
      .filter(item => !item.isParent && item.stt.startsWith('2.'))
      .sort((a, b) => b.thanh_tien - a.thanh_tien)
      .slice(0, 8)
      .map(item => ({
        name: item.hang_muc,
        value: Math.round(item.thanh_tien / 1000000), // In Millions
      }));
  }, [duToan]);

  // 3. Data for Bar Chart: Chi tiết chi phí VL hoàn thiện
  const finishingMaterialsData = useMemo(() => {
    return duToan
      .filter(item => !item.isParent && item.stt.startsWith('3.'))
      .sort((a, b) => b.thanh_tien - a.thanh_tien)
      .slice(0, 8)
      .map(item => ({
        name: item.hang_muc,
        value: Math.round(item.thanh_tien / 1000000), // In Millions
      }));
  }, [duToan]);

  // 4. Data for Bar Chart: Chi tiết chi phí Giao khoán
  const contractedWorkData = useMemo(() => {
    return duToan
      .filter(item => !item.isParent && item.stt.startsWith('4.'))
      .sort((a, b) => b.thanh_tien - a.thanh_tien)
      .slice(0, 8)
      .map(item => ({
        name: item.hang_muc,
        value: Math.round(item.thanh_tien / 1000000), // In Millions
      }));
  }, [duToan]);

  // 5. Data for Stacked Bar Chart: Phân bổ chi phí theo tầng
  const floorDistributionData = useMemo(() => {
    const layers = [
      { id: 'foundation', name: 'Móng & Hầm', area: state.foundationArea + state.basementArea },
      { id: 'ground', name: 'Tầng 1', area: state.groundFloorArea },
      { id: 'mezzanine', name: 'Tầng lửng', area: state.mezzanineArea },
      ...state.floorAreas.map((area, i) => ({
        id: `floor${i + 2}`,
        name: `Tầng ${i + 2}`,
        area: area,
      })),
      { id: 'top', name: 'Sân thượng & Tum/Mái', area: state.terraceArea + state.tumArea + (state.roof1Area + state.roof2Area + state.roof3Area + state.roof4Area) },
    ].filter(l => l.area > 0);

    const totalArea = layers.reduce((sum, l) => sum + l.area, 0);
    
    // Heuristic distribution based on area
    return layers.map(layer => {
      const ratio = layer.area / totalArea;
      return {
        name: layer.name,
        'Nhân công': Math.round((mainCategoriesData.find(c => c.name === 'Tổ chức sản xuất')?.total || 0) * ratio / 1000000),
        'Vật liệu thô': Math.round((mainCategoriesData.find(c => c.name === 'Vật liệu thô')?.total || 0) * ratio / 1000000),
        'Vật liệu hoàn thiện': Math.round((mainCategoriesData.find(c => c.name === 'Vật liệu hoàn thiện')?.total || 0) * ratio / 1000000),
        'Giao khoán': Math.round((mainCategoriesData.find(c => c.name === 'Giao khoán')?.total || 0) * ratio / 1000000),
      };
    });
  }, [state, mainCategoriesData]);

  // 6. Data for Material Usage Table
  const materialUsage = [
    { name: 'Thép xây dựng', unit: 'kg/m²', value: 38.00, ref: 40.00 },
    { name: 'Xi măng', unit: 'kg/m²', value: 120.00, ref: 110.00 },
    { name: 'Gạch xây', unit: 'viên/m²', value: 145.00, ref: 150.00 },
    { name: 'Đá 1x2', unit: 'm³/m²', value: 0.23, ref: 0.25 },
    { name: 'Cát vàng bê tông', unit: 'm³/m²', value: 0.16, ref: 0.15 },
    { name: 'Cát xây tô', unit: 'm³/m²', value: 0.19, ref: 0.20 },
  ];

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
                <Activity className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold uppercase tracking-tight">Phân tích dự án</h2>
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
                className="bg-white shadow-lg mx-auto p-12 min-h-[297mm] w-[210mm] text-slate-900"
                style={{ fontFamily: 'Arial, sans-serif' }}
              >
                {/* KPIs */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-tight text-slate-700">Các chỉ số chính (KPIs)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                      { label: 'Giá chào', value: giaChao, icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
                      { label: 'Dự toán', value: chiPhiDuToan, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
                      { label: 'Lợi nhuận', value: loiNhuan, icon: PieChartIcon, color: 'text-green-600', bg: 'bg-green-50', sub: `${loiNhuanPercent.toFixed(2)}%` },
                      { label: 'Tổng Diện tích', value: result?.totalArea || 0, icon: Layers, color: 'text-purple-600', bg: 'bg-purple-50', unit: ' m²' },
                      { label: 'Chi phí / m²', value: giaChao / (result?.totalArea || 1), icon: Info, color: 'text-cyan-600', bg: 'bg-cyan-50' },
                    ].map((kpi, i) => (
                      <div key={i} className={cn(
                        "p-4 rounded-xl border flex flex-col items-center text-center space-y-1 transition-all",
                        kpi.bg, "border-transparent"
                      )}>
                        <kpi.icon className={cn("w-5 h-5 mb-1", kpi.color)} />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{kpi.label}</span>
                        <span className="text-sm font-black text-slate-900">
                          {typeof kpi.value === 'number' && kpi.label !== 'Tổng Diện tích' ? formatCurrency(kpi.value).replace('₫', '').trim() : kpi.value}
                          {kpi.unit}
                        </span>
                        {kpi.sub && <span className="text-[10px] font-bold text-green-600">{kpi.sub}</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                  {/* Donut Chart */}
                  <div className="p-6 rounded-2xl border bg-slate-50 border-slate-100">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-6 text-center text-slate-500">Biểu đồ: Tỷ trọng chi phí Hạng mục chính</h3>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={mainCategoriesData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="total"
                            label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
                          >
                            {mainCategoriesData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number) => formatCurrency(value)}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          />
                          <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Rough Materials Bar Chart */}
                  <div className="p-6 rounded-2xl border bg-slate-50 border-slate-100">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-6 text-center text-slate-500">Biểu đồ: Chi tiết chi phí Vật liệu thô</h3>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={roughMaterialsData} layout="vertical" margin={{ left: 40 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10 }} stroke="#64748b" />
                          <Tooltip 
                            formatter={(value: number) => `${value} Tr`}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          />
                          <Bar dataKey="value" fill="#36A2EB" radius={[0, 4, 4, 0]} barSize={20}>
                            <LabelList dataKey="value" position="right" style={{ fontSize: '10px', fontWeight: 'bold', fill: '#000' }} formatter={(val: number) => `${val} Tr`} />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-[10px] text-center mt-2 opacity-50 italic">Chi phí (triệu đồng)</p>
                  </div>
                </div>

                {/* Charts Row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                  {/* Finishing Materials Bar Chart */}
                  <div className="p-6 rounded-2xl border bg-slate-50 border-slate-100">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-6 text-center text-slate-500">Biểu đồ: Chi tiết chi phí VL hoàn thiện</h3>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={finishingMaterialsData} layout="vertical" margin={{ left: 40 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10 }} stroke="#64748b" />
                          <Tooltip 
                            formatter={(value: number) => `${value} Tr`}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          />
                          <Bar dataKey="value" fill="#FF9F40" radius={[0, 4, 4, 0]} barSize={20}>
                            <LabelList dataKey="value" position="right" style={{ fontSize: '10px', fontWeight: 'bold', fill: '#000' }} formatter={(val: number) => `${val} Tr`} />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-[10px] text-center mt-2 opacity-50 italic">Chi phí (triệu đồng)</p>
                  </div>

                  {/* Contracted Work Bar Chart */}
                  <div className="p-6 rounded-2xl border bg-slate-50 border-slate-100">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-6 text-center text-slate-500">Biểu đồ: Chi tiết chi phí Giao khoán</h3>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={contractedWorkData} layout="vertical" margin={{ left: 40 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10 }} stroke="#64748b" />
                          <Tooltip 
                            formatter={(value: number) => `${value} Tr`}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          />
                          <Bar dataKey="value" fill="#FF6384" radius={[0, 4, 4, 0]} barSize={20}>
                            <LabelList dataKey="value" position="right" style={{ fontSize: '10px', fontWeight: 'bold', fill: '#000' }} formatter={(val: number) => `${val} Tr`} />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-[10px] text-center mt-2 opacity-50 italic">Chi phí (triệu đồng)</p>
                  </div>
                </div>

                {/* Floor Distribution Stacked Bar Chart */}
                <div className="p-6 rounded-2xl border bg-slate-50 border-slate-100 mt-8">
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-6 text-center text-slate-500">Biểu đồ: Phân bổ chi phí theo tầng</h3>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={floorDistributionData} layout="vertical" margin={{ left: 60, right: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                        <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10 }} />
                        <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10 }} stroke="#64748b" />
                        <Tooltip 
                          formatter={(value: number) => `${value} Tr`}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend verticalAlign="top" height={36}/>
                        <Bar dataKey="Nhân công" stackId="a" fill="#FF6384" barSize={30} />
                        <Bar dataKey="Vật liệu thô" stackId="a" fill="#36A2EB" />
                        <Bar dataKey="Vật liệu hoàn thiện" stackId="a" fill="#FFCE56" />
                        <Bar dataKey="Giao khoán" stackId="a" fill="#9966FF" radius={[0, 4, 4, 0]}>
                          <LabelList 
                            dataKey="Giao khoán" 
                            position="right" 
                            style={{ fontSize: '11px', fontWeight: '900', fill: '#000' }} 
                            content={(props: any) => {
                              const { x, y, width, height, value, index } = props;
                              const data = floorDistributionData[index];
                              const total = data['Nhân công'] + data['Vật liệu thô'] + data['Vật liệu hoàn thiện'] + data['Giao khoán'];
                              return (
                                <text x={x + width + 5} y={y + height / 2 + 5} fill="#000" fontSize="11" fontWeight="900">
                                  {total} Tr
                                </text>
                              );
                            }}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-[10px] text-center mt-2 opacity-50 italic">Chi phí ước tính cho mỗi tầng (triệu đồng)</p>
                </div>

                {/* Material Usage Table */}
                <div className="space-y-4 mt-8">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-center text-slate-500">Bảng: Phân tích Định mức Sử dụng Vật tư (trên 1m² sàn)</h3>
                  <div className="rounded-xl border overflow-hidden border-slate-200">
                    <table className="w-full text-xs">
                      <thead className="font-bold uppercase tracking-wider bg-slate-50 text-slate-500">
                        <tr>
                          <th className="px-4 py-3 text-left">Vật tư</th>
                          <th className="px-4 py-3 text-center">Đơn vị</th>
                          <th className="px-4 py-3 text-right">Định mức Dự án</th>
                          <th className="px-4 py-3 text-right">Định mức Tham khảo</th>
                          <th className="px-4 py-3 text-right">Chênh lệch</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {materialUsage.map((m, i) => {
                          const diff = ((m.value - m.ref) / m.ref) * 100;
                          return (
                            <tr key={i} className="text-slate-700">
                              <td className="px-4 py-3 font-medium">{m.name}</td>
                              <td className="px-4 py-3 text-center">{m.unit}</td>
                              <td className="px-4 py-3 text-right font-bold">{m.value.toFixed(2)}</td>
                              <td className="px-4 py-3 text-right">{m.ref.toFixed(2)}</td>
                              <td className={cn(
                                "px-4 py-3 text-right font-bold",
                                diff > 0 ? "text-red-500" : "text-green-500"
                              )}>
                                {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
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
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
