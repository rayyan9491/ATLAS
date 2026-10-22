import React, { useState } from 'react';
import { X, Zap, Sparkles, CheckCircle, ArrowRight, AlertCircle, Clock, Calendar } from 'lucide-react';
import { Goal, Task } from '../types/index.ts';
import { generateDeterministicReplan, ReplanProposal } from '../utils/scheduler.ts';

interface ReplanModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  goals: Goal[];
  currentDate: string;
  availableMinutes: number;
  hasAiConfigured: boolean;
  onApplyReplan: (keptIds: string[], deferred: { taskId: string; newDate: string }[]) => void;
}

export const ReplanModal: React.FC<ReplanModalProps> = ({
  isOpen,
  onClose,
  tasks,
  goals,
  currentDate,
  availableMinutes,
  hasAiConfigured,
  onApplyReplan,
}) => {
  const [targetMinutes, setTargetMinutes] = useState(availableMinutes);
  const [replanProposal, setReplanProposal] = useState<ReplanProposal>(() =>
    generateDeterministicReplan(tasks, currentDate, availableMinutes)
  );

  if (!isOpen) return null;

  const handleRunReplan = (mins: number) => {
    setTargetMinutes(mins);
    const proposal = generateDeterministicReplan(tasks, currentDate, mins);
    setReplanProposal(proposal);
  };

  const handleConfirm = () => {
    const keptIds = replanProposal.keptTasks.map((t) => t.id);
    const deferred = replanProposal.deferredTasks.map((d) => ({
      taskId: d.task.id,
      newDate: d.newDate,
    }));
    onApplyReplan(keptIds, deferred);
    onClose();
  };

  const totalKeptDuration = replanProposal.keptTasks.reduce(
    (acc, t) => acc + (t.estimatedMinutes || 0),
    0
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#101A2B] border border-[#294B75] rounded-2xl shadow-2xl shadow-[#3988FF]/15 overflow-hidden animate-in fade-in duration-200">
        <div className="px-6 py-4 border-b border-[#24354C] flex items-center justify-between bg-[#131F32]">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-[#59C8FF]" />
            <h2 className="text-base font-bold text-[#F0F5FF]">
              Adaptive Workload Re-Planner
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#A7B6CA] hover:text-[#F0F5FF] hover:bg-[#192941] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[85vh] overflow-y-auto">
          {/* Target time controls */}
          <div className="p-4 rounded-xl bg-[#0B1220] border border-[#24354C]">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="font-mono uppercase text-[#A7B6CA] flex items-center gap-1.5 font-semibold">
                <Clock size={13} className="text-[#59C8FF]" />
                <span>Adjust Target Available Time for Today</span>
              </span>
              <span className="font-mono font-bold text-[#59C8FF] text-sm">
                {targetMinutes} minutes
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="20"
                max="300"
                step="10"
                value={targetMinutes}
                onChange={(e) => handleRunReplan(Number(e.target.value))}
                className="w-full accent-[#59C8FF] bg-[#131F32] cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between mt-3 gap-2">
              <div className="flex gap-1.5 flex-wrap">
                {[30, 60, 90, 120, 180, 240].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleRunReplan(m)}
                    className={`px-2 py-1 rounded-md text-[11px] font-mono transition-colors ${
                      targetMinutes === m
                        ? 'bg-[#3988FF] text-white font-bold'
                        : 'bg-[#131F32] text-[#A7B6CA] hover:text-[#F0F5FF] border border-[#24354C]'
                    }`}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Rationale explanation */}
          <div className="p-3.5 rounded-xl bg-[#131F32] border border-[#294B75] text-xs">
            <span className="font-mono text-[#59C8FF] font-bold block mb-1">
              PROPOSED RE-PLAN RATIONALE:
            </span>
            <p className="text-[#F0F5FF] leading-relaxed">{replanProposal.rationale}</p>
          </div>

          {/* Side by Side Plan Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Kept Tasks */}
            <div className="p-4 rounded-xl bg-[#0B1220] border border-[#24354C]">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#24354C]">
                <div className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-[#4ADE80]" />
                  <span className="text-xs font-bold text-[#F0F5FF]">
                    Keep for Today ({replanProposal.keptTasks.length})
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#59C8FF] font-semibold">
                  {totalKeptDuration}m / {targetMinutes}m
                </span>
              </div>

              {replanProposal.keptTasks.length === 0 ? (
                <p className="text-xs text-[#7789A4] italic py-2">No tasks fit in this window.</p>
              ) : (
                <div className="space-y-2">
                  {replanProposal.keptTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-2.5 rounded-lg bg-[#131F32] border border-[#24354C] text-xs flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-medium text-[#F0F5FF] truncate">{t.title}</div>
                        <span className="text-[10px] font-mono text-[#59C8FF] uppercase">
                          {t.priority}
                        </span>
                      </div>
                      <span className="font-mono text-[#7789A4] text-[11px] shrink-0">
                        {t.estimatedMinutes}m
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Deferred Tasks */}
            <div className="p-4 rounded-xl bg-[#0B1220] border border-[#24354C]">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#24354C]">
                <div className="flex items-center gap-1.5">
                  <ArrowRight size={14} className="text-[#FB7185]" />
                  <span className="text-xs font-bold text-[#F0F5FF]">
                    Postpone to Preserve Focus ({replanProposal.deferredTasks.length})
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#7789A4]">Safe defer</span>
              </div>

              {replanProposal.deferredTasks.length === 0 ? (
                <p className="text-xs text-[#4ADE80] py-2">Zero tasks need to be postponed.</p>
              ) : (
                <div className="space-y-2">
                  {replanProposal.deferredTasks.map((d) => (
                    <div
                      key={d.task.id}
                      className="p-2.5 rounded-lg bg-[#131F32] border border-[#24354C] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-[#F0F5FF] truncate">{d.task.title}</span>
                        <span className="text-[10px] font-mono text-[#FB7185] px-1 rounded bg-[#FB7185]/10">
                          {d.task.estimatedMinutes}m
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-[#59C8FF] font-mono">
                        <Calendar size={10} />
                        <span>Reschedule: {d.newDate}</span>
                      </div>
                      <p className="text-[10px] text-[#A7B6CA] leading-tight">{d.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#131F32] border border-[#24354C] text-[11px] text-[#A7B6CA] flex items-center gap-2">
            <AlertCircle size={14} className="text-[#59C8FF] shrink-0" />
            <span>
              Work is never deleted. Deferred items are safely moved to the next day with existing deadlines intact.
            </span>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-[#24354C] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#A7B6CA] hover:text-[#F0F5FF] hover:bg-[#131F32] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2 rounded-xl btn-electric-primary font-semibold text-xs cursor-pointer"
            >
              Apply Adjusted Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
