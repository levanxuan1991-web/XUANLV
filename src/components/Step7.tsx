import React from 'react';
import { AppState, SavedProject } from '../types';
import { cn } from '../lib/utils';
import { Trash2, Edit3, Calendar, Home, Ruler } from 'lucide-react';

interface Props {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
  setCurrentStep: (step: number) => void;
  theme?: string;
}

export default function Step7({ state, updateState, setCurrentStep, theme }: Props) {
  const handleLoadProject = (project: SavedProject) => {
    // Load all data from the saved project into the current state
    updateState({
      ...project.data,
      // Keep the existing savedProjects list
      savedProjects: state.savedProjects
    });
    // Go back to Step 1 or Step 6? User said "edit để load lại đầy đủ thông tin"
    // Usually editing starts from Step 1 to review everything
    setCurrentStep(1);
  };

  const handleDeleteProject = (id: string) => {
    const updatedProjects = state.savedProjects.filter(p => p.id !== id);
    updateState({ savedProjects: updatedProjects });
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex justify-between items-center border-b pb-2 mb-4 shrink-0">
        <h3 className={cn(
          "text-xl font-bold uppercase",
          theme === 'dark' ? "text-blue-400" : "text-blue-700"
        )}>DỰ ÁN ĐÃ LƯU</h3>
        <div className={cn(
          "px-3 py-1 rounded-full text-xs font-bold",
          theme === 'dark' ? "bg-blue-900/30 text-blue-400" : "bg-blue-50 text-blue-600"
        )}>
          {state.savedProjects.length} Dự án
        </div>
      </div>

      {state.savedProjects.length === 0 ? (
        <div className={cn(
          "flex-1 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center space-y-4",
          theme === 'dark' ? "border-slate-800 bg-slate-900/50" : "border-slate-200 bg-slate-50"
        )}>
          <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center">
            <Calendar className="w-8 h-8 text-slate-400" />
          </div>
          <div className="space-y-1">
            <h3 className={cn("font-bold", theme === 'dark' ? "text-white" : "text-slate-900")}>Chưa có dự án nào được lưu</h3>
            <p className="text-sm text-slate-500 max-w-xs">
              Các dự án bạn lưu từ bước "Dự toán chi tiết" sẽ xuất hiện tại đây để quản lý.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pr-2 custom-scrollbar">
          {state.savedProjects.map((project) => (
            <div 
              key={project.id}
              className={cn(
                "group relative rounded-2xl border p-5 transition-all hover:shadow-xl hover:-translate-y-1",
                theme === 'dark' ? "bg-slate-800 border-slate-700 hover:border-blue-500" : "bg-white border-slate-200 hover:border-blue-500"
              )}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <h3 className={cn("font-black text-lg leading-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <Calendar className="w-3 h-3" />
                    {project.date}
                  </div>
                </div>
                <button 
                  onClick={() => handleDeleteProject(project.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className={cn(
                  "p-3 rounded-xl space-y-1",
                  theme === 'dark' ? "bg-slate-900/50" : "bg-slate-50"
                )}>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase">
                    <Home className="w-3 h-3" />
                    Loại hình
                  </div>
                  <div className={cn("text-xs font-bold truncate", theme === 'dark' ? "text-slate-300" : "text-slate-700")}>
                    {project.data.buildingType}
                  </div>
                </div>
                <div className={cn(
                  "p-3 rounded-xl space-y-1",
                  theme === 'dark' ? "bg-slate-900/50" : "bg-slate-50"
                )}>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase">
                    <Ruler className="w-3 h-3" />
                    Số tầng
                  </div>
                  <div className={cn("text-xs font-bold", theme === 'dark' ? "text-slate-300" : "text-slate-700")}>
                    {project.data.floorsCount} Tầng
                  </div>
                </div>
              </div>

              <button 
                onClick={() => handleLoadProject(project)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
              >
                <Edit3 className="w-4 h-4" />
                Chỉnh sửa dự án
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
