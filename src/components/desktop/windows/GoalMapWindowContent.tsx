import React from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, Lock, Code2, Folder } from 'lucide-react';
import { useApp } from '../../../context/AppContext.tsx';
import { useTheme } from '../../../context/ThemeContext.tsx';

interface GoalMapWindowContentProps {
  goalId?: string;
  onSelectMilestone?: (milestoneId: string) => void;
}

export const GoalMapWindowContent: React.FC<GoalMapWindowContentProps> = ({
  goalId,
  onSelectMilestone,
}) => {
  const { goals } = useApp();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const currentGoal = (goalId ? goals.find((g) => g.id === goalId) : goals[0]) || goals[0];

  if (!currentGoal) {
    return <div className="p-6 text-center text-[#939BB0]">No goal selected.</div>;
  }

  const milestones = currentGoal.milestones || [];
  const completedCount = milestones.filter((m) => m.status === 'completed').length;
  const pct = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 60;

  return (
    <div className="h-full flex flex-col p-4 overflow-y-auto text-xs">
      {/* Top Navigation */}
      <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-3">
        <div className="flex items-center gap-1.5 text-[#939BB0]">
          <button className="p-1 rounded hover:bg-white/5 cursor-pointer">
            <ChevronLeft size={14} />
          </button>
          <span className="font-semibold text-white/90">{currentGoal.title} Roadmap</span>
          <button className="p-1 rounded hover:bg-white/5 cursor-pointer">
            <ChevronRight size={14} />
          </button>
        </div>
        <span className="text-[11px] text-[#A78BFA] font-medium">
          {completedCount} of {milestones.length} milestones finished
        </span>
      </div>

      {/* Visual Milestone Graph */}
      <div className="relative py-3 flex flex-col items-center">
        {/* Root Goal Node */}
        <div className="relative z-10 px-4 py-2 rounded-2xl bg-[#151928] border border-violet-500/40 shadow-lg shadow-violet-500/10 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-400/20 text-[#67E8F9] flex items-center justify-center font-bold">
            <Code2 size={15} />
          </div>
          <div>
            <div className="font-bold text-xs text-white">{currentGoal.title}</div>
            <div className="text-[10px] text-[#67E8F9]">{pct}% complete</div>
          </div>
        </div>

        {/* Connecting Lines */}
        <div className="w-full max-w-[280px] h-6 relative my-1">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 w-0.5 h-3 bg-violet-500/40" />
          <div className="absolute left-[15%] right-[15%] top-3 h-0.5 bg-violet-500/30" />
          <div className="absolute left-[15%] top-3 w-0.5 h-3 bg-emerald-400/60" />
          <div className="absolute left-1/2 -translate-x-1/2 top-3 w-0.5 h-3 bg-violet-400/60" />
          <div className="absolute right-[15%] top-3 w-0.5 h-3 bg-white/20" />
        </div>

        {/* Milestone Steps */}
        <div className="w-full grid grid-cols-3 gap-2 pt-0.5 text-center">
          {/* Node 1 */}
          <div className="flex flex-col items-center group cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-1 transition-transform group-hover:scale-105">
              <CheckCircle2 size={15} />
            </div>
            <div className="font-bold text-[11px] text-white">1. Basics</div>
            <div className="text-[9px] text-emerald-400">Completed</div>
          </div>

          {/* Node 2 */}
          <div className="flex flex-col items-center group cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-violet-500/20 border-2 border-violet-400 text-violet-300 flex items-center justify-center shadow-lg shadow-violet-500/20 mb-1 transition-transform group-hover:scale-105">
              <Folder size={14} />
            </div>
            <div className="font-bold text-[11px] text-white">2. Build Project</div>
            <div className="text-[9px] text-[#A78BFA]">In progress</div>
          </div>

          {/* Node 3 */}
          <div className="flex flex-col items-center group cursor-pointer opacity-70">
            <div className="w-8 h-8 rounded-full bg-white/5 border-2 border-white/20 text-white/40 flex items-center justify-center mb-1">
              <Lock size={13} />
            </div>
            <div className="font-bold text-[11px] text-white/80">3. Advanced</div>
            <div className="text-[9px] text-white/40">Not started</div>
          </div>
        </div>
      </div>

      {/* Milestones List Section */}
      <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
        <div className="text-[10px] text-[#939BB0] font-semibold uppercase tracking-wider">
          Milestones
        </div>

        <div className="space-y-1.5">
          {milestones.map((m, idx) => {
            const isCompleted = m.status === 'completed';
            const isInProgress = m.status === 'in_progress';

            return (
              <div
                key={m.id}
                onClick={() => onSelectMilestone && onSelectMilestone(m.id)}
                className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  isLight
                    ? 'bg-white border-slate-200 hover:border-slate-300'
                    : 'bg-[#101420] border-white/5 hover:border-white/15'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                      isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : isInProgress
                        ? 'bg-violet-500/20 text-violet-300'
                        : 'bg-white/5 text-white/40'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-white/90">{m.title}</div>
                    <div className="text-[9px] text-[#939BB0]">
                      {isCompleted ? 'Completed' : isInProgress ? 'In progress · 2 tasks' : 'Not started · 5 tasks'}
                    </div>
                  </div>
                </div>

                <ChevronRight size={13} className="text-white/30" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
