"use client";

import { useBackgroundTasks } from "./BackgroundTasksProvider";
import { X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function GlobalProgressUI() {
  const { tasks, removeTask } = useBackgroundTasks();
  if (tasks.length === 0) return null;

  const MAX_VISIBLE = 2;
  const visibleTasks = tasks.slice(-MAX_VISIBLE);
  const hiddenCount = Math.max(0, tasks.length - MAX_VISIBLE);

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:bottom-6 sm:right-6 flex flex-col gap-3 z-100 sm:max-w-sm w-auto sm:w-full pointer-events-none">
      {hiddenCount > 0 && (
        <div className="bg-[#1c1c1e]/90 backdrop-blur-md border border-white/10 shadow-2xl rounded-xl p-2.5 flex justify-center items-center pointer-events-auto animate-in fade-in slide-in-from-bottom-2">
          <p className="text-[11px] font-bold text-white/50 tracking-wide uppercase">+ {hiddenCount} more task{hiddenCount > 1 ? 's' : ''} in background</p>
        </div>
      )}
      {visibleTasks.map((task) => (
        <div key={task.id} className="bg-[#1c1c1e] border border-white/10 shadow-2xl rounded-xl p-4 flex flex-col gap-2 animate-in slide-in-from-bottom-5 pointer-events-auto">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{task.title}</p>
              <p className="text-xs text-[#86868b] truncate">{task.statusText}</p>
            </div>

            {task.isComplete ? (
              <button onClick={() => removeTask(task.id)} className="text-[#86868b] hover:text-white shrink-0 transition-colors">
                <X size={16} />
              </button>
            ) : (
              <Loader2 size={16} className="text-primary animate-spin shrink-0" />
            )}
          </div>

          {!task.isComplete && task.progress > 0 && task.progress < 100 && (
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${task.progress}%` }}
              ></div>
            </div>
          )}

          {task.isComplete && !task.isError && (
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs mt-1">
              <CheckCircle2 size={14} /> Completed
            </div>
          )}

          {task.isError && (
            <div className="flex items-center gap-1.5 text-red-400 text-xs mt-1">
              <AlertCircle size={14} /> Failed
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
