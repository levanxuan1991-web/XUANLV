import React, { useState } from 'react';
import { AppState } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import PriceAdjustmentModalStep4 from './PriceAdjustmentModalStep4';
import CoefficientAdjustmentModalStep4 from './CoefficientAdjustmentModalStep4';

interface Props {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
  result: any;
  theme?: string;
}

export default function Step4({ state, updateState, result, theme }: Props) {
  const [showDetails, setShowDetails] = useState(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [isCoefficientModalOpen, setIsCoefficientModalOpen] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(Math.round(value)) + ' VNĐ';
  };

  return (
    <div className="flex flex-col h-[75vh] relative">
      <div className="flex flex-col flex-1 overflow-hidden space-y-6 pb-4">
        <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-2 shrink-0 transition-colors duration-300", theme === 'dark' ? "border-slate-700" : "border-gray-200")}>
          <h3 className={cn("text-xl font-bold uppercase transition-colors duration-300", theme === 'dark' ? "text-blue-400" : "text-blue-700")}>KẾT QUẢ TÍNH TOÁN</h3>
          <div className="flex flex-wrap gap-2">
            <button className="bg-red-600 text-white px-3 py-1.5 rounded shadow-sm font-bold hover:bg-red-700 transition-colors text-[10px] uppercase whitespace-nowrap force-white-text">
              Tính toán chi phí
            </button>
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className="bg-blue-600 text-white px-3 py-1.5 rounded shadow-sm font-bold hover:bg-blue-700 transition-colors text-[10px] uppercase whitespace-nowrap flex items-center justify-center gap-1 force-white-text"
            >
              {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              Xem chi tiết
            </button>
            <button 
              onClick={() => setIsPriceModalOpen(true)}
              className="bg-blue-600 text-white px-3 py-1.5 rounded shadow-sm font-bold hover:bg-blue-700 transition-colors text-[10px] uppercase whitespace-nowrap"
            >
              Điều chỉnh đơn giá
            </button>
            <button 
              onClick={() => setIsCoefficientModalOpen(true)}
              className="bg-blue-600 text-white px-3 py-1.5 rounded shadow-sm font-bold hover:bg-blue-700 transition-colors text-[10px] uppercase whitespace-nowrap"
            >
              Điều chỉnh hệ số
            </button>
          </div>
        </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 shrink-0">
        <div className="md:col-span-1">
          <label className={cn("block text-xs font-bold uppercase tracking-wider mb-2 transition-colors duration-300", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>Tổng diện tích xây dựng</label>
          <div className={cn("rounded-xl p-4 text-2xl font-black border transition-all duration-300", 
            theme === 'dark' ? "bg-slate-800 border-slate-700 text-white" : "bg-gray-100 border-gray-200 text-gray-800")}>
            {result.totalArea.toFixed(2)} <span className={cn("text-sm font-medium transition-colors duration-300", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>m²</span>
          </div>
        </div>

        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={cn("rounded-xl p-4 shadow-sm border transition-all duration-300", 
            theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-blue-50 border-blue-100")}>
            <label className={cn("block text-xs font-bold uppercase tracking-widest mb-1 transition-colors duration-300", theme === 'dark' ? "text-blue-400" : "!text-blue-600")}>GÓI NHÂN CÔNG XÂY DỰNG</label>
            <div className={cn("text-xl font-black transition-colors duration-300", theme === 'dark' ? "text-white" : "!text-blue-900")}>{formatCurrency(result.laborCost)}</div>
          </div>
          <div className={cn("rounded-xl p-4 shadow-sm border transition-all duration-300", 
            theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-blue-50 border-blue-100")}>
            <label className={cn("block text-xs font-bold uppercase tracking-widest mb-1 transition-colors duration-300", theme === 'dark' ? "text-blue-400" : "!text-blue-600")}>GÓI PHẦN THÔ & NHÂN CÔNG HOÀN THIỆN</label>
            <div className={cn("text-xl font-black transition-colors duration-300", theme === 'dark' ? "text-white" : "!text-blue-900")}>{formatCurrency(result.roughCost)}</div>
          </div>
          <div className={cn("rounded-xl p-4 shadow-md border transition-all duration-300 force-white-text", 
            theme === 'dark' ? "bg-blue-900 border-blue-800" : "bg-blue-600 border-blue-700")}>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1">GÓI THI CÔNG TRỌN GÓI (CHÌA KHÓA TRAO TAY)</label>
            <div className="text-xl font-black">{formatCurrency(result.totalPackageCost)}</div>
          </div>
        </div>
      </div>

      <div className={cn("flex flex-col flex-1 rounded-2xl border shadow-sm overflow-hidden transition-all duration-300", 
        theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200")}>
        <div className={cn("px-6 py-4 border-b flex items-center gap-2 transition-all duration-300 shrink-0", 
          theme === 'dark' ? "bg-slate-800/50 border-slate-700" : "bg-gray-50 border-gray-200")}>
          <Info className={cn("w-5 h-5 transition-colors duration-300", theme === 'dark' ? "text-blue-400" : "text-blue-600")} />
          <div className={cn("text-sm font-bold uppercase tracking-wide transition-colors duration-300", theme === 'dark' ? "text-slate-300" : "text-gray-700")}>CHI TIẾT GÓI THI CÔNG TRỌN GÓI (CHÌA KHÓA TRAO TAY)</div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          <table className={cn("min-w-full border-collapse border transition-colors duration-300", theme === 'dark' ? "border-slate-700" : "border-gray-300")}>
            <thead className="bg-[#004282] text-white force-white-text">
              <tr>
                <th className={cn("px-6 py-3 text-left text-[11px] font-bold uppercase tracking-widest border transition-colors duration-300 force-white-text", theme === 'dark' ? "border-slate-700" : "border-gray-300")}>Hạng mục chi phí</th>
                <th className={cn("px-6 py-3 text-right text-[11px] font-bold uppercase tracking-widest border transition-colors duration-300 force-white-text", theme === 'dark' ? "border-slate-700" : "border-gray-300")}>Chi phí ước tính</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: '1. Chi phí xây dựng ngôi nhà', value: result.packageCost },
                { label: '2. Chi phí ép cọc (nếu có)', value: result.pilingCost },
                { label: '3. Chi phí cừ chống đổ nhà hàng xóm (nếu có)', value: result.shoringCost },
                { label: '4. Chi phí thang máy (nếu có)', value: result.elevatorCost },
                { label: '5. Chi phí thi công hồ bơi (nếu có)', value: result.poolCost },
                { label: '6. Chi phí bản vẽ xin phép xây dựng (nếu có)', value: result.permitCost },
                { label: '7. Chi phí thiết kế, không bao gồm tk nội thất (2D) (nếu có)', value: result.designCost },
              ].map((item, idx) => (
                <tr key={idx} className={cn(
                  "transition-colors duration-300",
                  idx % 2 === 0 
                    ? (theme === 'dark' ? "bg-slate-800" : "bg-white") 
                    : (theme === 'dark' ? "bg-slate-800/50" : "bg-gray-50")
                )}>
                  <td className={cn("px-6 py-4 whitespace-nowrap text-sm font-medium border transition-colors duration-300", 
                    theme === 'dark' ? "border-slate-700 text-slate-300" : "border-gray-300 text-gray-900")}>{item.label}</td>
                  <td className={cn("px-6 py-4 whitespace-nowrap text-sm font-bold text-right tabular-nums border transition-colors duration-300", 
                    theme === 'dark' ? "border-slate-700 text-white" : "border-gray-300 text-gray-900")}>{formatCurrency(item.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <AnimatePresence>
            {showDetails && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className={cn("m-4 p-6 border rounded-xl shadow-sm space-y-4 text-sm leading-relaxed transition-all duration-300", 
                  theme === 'dark' ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-white border-gray-200 text-gray-700")}>
                  <div className={cn("font-bold uppercase mb-4 transition-colors duration-300", theme === 'dark' ? "text-blue-400" : "text-blue-700")}>PHẠM VI CÔNG VIỆC</div>
                  
                  <section>
                    <p>
                      <span className={cn("font-bold transition-colors duration-300", theme === 'dark' ? "text-white" : "text-gray-900")}>1. GÓI NHÂN CÔNG XÂY DỰNG:</span> Tiền công cho thợ xây, thợ điện, thợ nước để thực hiện các công việc xây dựng cơ bản, bao gồm:
                    </p>
                    <div className="mt-1 space-y-0.5">
                      <p>Tổ chức công trường, lán trại cho công nhân, kho bãi</p>
                      {[
                        "Dọn dẹp, vệ sinh, phát quang mặt bằng, định vị mặt bằng, cốt cao độ",
                        "Đào đất, lấp đất móng, dầm móng, đà kiềng, hầm phốt, hố ga",
                        "Đổ đất dư, đổ xà bần trong quá trình xây nhà",
                        "Thi công móng (Bao gồm cả đập đầu cọc, cắt đầu cọc)",
                        "Thi công hầm phốt, hố ga, bể đựng bồn nước ngầm",
                        "Thi công BTCT đầm, sàn, vách tầng hầm (nếu có)",
                        "Thi công BTCT móng, cột, dầm, đà kiềng",
                        "Thi công BTCT cột, BTCT dầm sàn các tầng, đà lanh tô, mái BTCT (nếu có)",
                        "Đổ BTCT cầu thang, xây bậc bằng gạch",
                        "Xây tường bao, tường ngăn, vách theo bản vẽ thiết kế",
                        "Thi công hệ xà gồ thép để lợp mái, lợp tôn (nếu có)",
                        "Lắp đặt hệ thống đường dây âm tường (điện, cáp TV, cáp ADSL, cáp điện thoại)",
                        "Lắp đặt ống cấp, thoát nước lạnh uPVC",
                        "Lắp đặt ống cấp, thoát nước lạnh uPVC",
                        "Cán nền các tầng lầu, sân thượng, mái, ban công, nhà vệ sinh",
                        "Ốp lát gạch, gạch len chân tường, nhà vệ sinh",
                        "Ốp gạch trang trí mặt tiền theo bản thiết kế (khối lượng ốp lát không lớn quá 10%)",
                        "Sơn nước toàn bộ nhà, không bao gồm sơn hiệu ứng, sơn dầu, sơn gai (Bả matit 2 lớp, sơn 1 lót 2 phủ)",
                        "Chống thấm sân thượng, mái, ban công, nhà vệ sinh",
                        "Lắp đặt thiết bị vệ sinh, bồn nước, máy bơm nước",
                        "Lắp đặt thiết bị điện, đèn chiếu sáng",
                        "Thi công cọc tiếp địa, dây te",
                        "Dọn dẹp vệ sinh cơ bản trước khi bàn giao (Không bao gồm vệ sinh công nghiệp - Chênh lệch 350.000/m2 sàn)"
                      ].map((item, i) => (
                        <p key={i}>- {item}</p>
                      ))}
                      <p>
                        - Không bao gồm: Công tác ép cọc, ép cừ vây, khoan nhồi, khoan tạo lỗ; Đường ống máy lạnh, đường ống cấp khí tươi, thoát mùi, thoát khí, mạng LAN nội bộ cho văn phòng; Công tác PCCC, bể nước PCCC; Xây dựng thang máy, giếng thang máy, phòng kỹ thuật thang máy, hố PIT; Hệ thống chống sét: cột thu lôi, cọc tiếp địa, cáp đồng chống sét; Các công tác giao khoán như cửa, vách, trần thạch cao, ốp đá granite, công tác cơ khí như lan can tay vịn, khung lam mái, lam, nội thất, thiết bị, sơn hiệu ứng, đắp phào chỉ phù điêu, hòn non bộ, tiểu cảnh,...)
                      </p>
                    </div>
                  </section>

                  <section>
                    <p>
                      <span className={cn("font-bold transition-colors duration-300", theme === 'dark' ? "text-white" : "text-gray-900")}>2. GÓI PHẦN THÔ & NHÂN CÔNG HOÀN THIỆN:</span> Bao gồm chi phí nhân công ở mục 1 và vật liệu thô, trong đó vật liệu thô bao gồm:
                    </p>
                    <div className="mt-1 space-y-0.5">
                      {[
                        "Thép xây dựng", "Xi măng", "Đá 1x2", "Đá 4x6", 
                        "Cát vàng bê tông hạt lớn", "Cát xây tô hạt mịn", "Cát nền", "Gạch xây",
                        "Dung dịch chống thấm", "Ống thoát nước PVC các loại", 
                        "Ống cấp nước lạnh (Không bao gồm ống cấp nước nóng PPR - chênh lệch 350.000/m2 sàn)", 
                        "Dây điện", "Ruột gà", 
                        "Ống cứng luồn dây điện âm sàn (không bao gồm ống cứng luồn dây điện âm tường - chênh lệch 350.000/m2 sàn)", 
                        "Cáp điện thoại, truyền hình, internet", "Tôn lợp, ngói", "Cục kê bê tông đúc sẵn", 
                        "Không bao gồm vật tư cọc tiếp địa, dây te - chênh lệch 350.000/m2 sàn", 
                        "Phụ kiện nước", "Hộp nối", "Bể tự hoại", "Ống đồng máy lạnh", "Ống nước ngưng cách nhiệt 10mm"
                      ].map((item, i) => (
                        <p key={i}>- {item}</p>
                      ))}
                    </div>
                  </section>

                  <section>
                    <p>
                      <span className={cn("font-bold transition-colors duration-300", theme === 'dark' ? "text-white" : "text-gray-900")}>3. GÓI THI CÔNG TRỌN GÓI (CHÌA KHÓA TRAO TAY):</span> Bao gồm nhân công, phần thô và vật liệu hoàn thiện (gạch ốp lát, sơn nước, thiết bị vệ sinh, thiết bị điện, cổng cửa vách, trần, cầu thang, đá granite, cơ khí,...hoàn thiện theo yêu cầu thiết kế). Không bao gồm chi phí điện nước phục vụ thi công, chi phí thuê mướn vỉa hè lòng đường phục vụ thi công, chi phí san lấp, tháo dỡ công trình cũ, công trình ngầm, chi phí trắc đạt xác định tim mốc. Phần thiết bị, nội thất, thang máy, hồ bơi, hòn non bộ, ép cọc, khung vây được tính bổ sung khi chủ nhà có yêu cầu
                    </p>
                  </section>

                  <section>
                    <p>
                      <span className={cn("font-bold transition-colors duration-300", theme === 'dark' ? "text-white" : "text-gray-900")}>4. Chi phí ép cọc:</span> Chi phí thuê máy và vật liệu để ép cọc bê tông, đảm bảo nền móng vững chắc (nếu chủ đầu tư yêu cầu).
                    </p>
                  </section>

                  <section>
                    <p>
                      <span className={cn("font-bold transition-colors duration-300", theme === 'dark' ? "text-white" : "text-gray-900")}>5. Chi phí cừ chống đổ:</span> Chi phí gia cố, đóng cừ để bảo vệ nhà hàng xóm trong quá trình thi công (tùy công trình).
                    </p>
                  </section>

                  <section>
                    <p>
                      <span className={cn("font-bold transition-colors duration-300", theme === 'dark' ? "text-white" : "text-gray-900")}>6. Chi phí thang máy:</span> Chi phí cung cấp và lắp đặt thang máy, vận hành thử (Nếu có).
                    </p>
                  </section>

                  <section>
                    <p>
                      <span className={cn("font-bold transition-colors duration-300", theme === 'dark' ? "text-white" : "text-gray-900")}>7. Chi phí hồ bơi:</span> Chi phí xây dựng hồ bơi, bao gồm kết cấu, chống thấm, hệ thống lọc nước (Nếu có).
                    </p>
                  </section>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <PriceAdjustmentModalStep4
        isOpen={isPriceModalOpen}
        onClose={() => setIsPriceModalOpen(false)}
        state={state}
        updateState={updateState}
        theme={theme === 'dark' ? 'dark' : 'light'}
      />
      
      <CoefficientAdjustmentModalStep4
        isOpen={isCoefficientModalOpen}
        onClose={() => setIsCoefficientModalOpen(false)}
        state={state}
        updateState={updateState}
        theme={theme === 'dark' ? 'dark' : 'light'}
      />
    </div>
    </div>
  );
}
