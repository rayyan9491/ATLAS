import React from 'react';
import { Play, Sparkles, Clock, ArrowRight, ShieldCheck, CornerDownRight, CheckCircle2 } from 'lucide-react';
import { NextMoveRecommendation, Goal } from '../types/index.ts';

interface NextBestMoveCardProps {
  recommendation: NextMoveRecommendation | null;
  goals: Goal[];
  onStartFocus: (task: any) => void;
  onCompleteTask: (taskId: string) => void;
  onDeferTask: (taskId: string) => void;
  onSelectAlternative?: (task: any) => void;
}

export const NextBestMoveCard: React.FC<NextBestMoveCardProps> = ({
  recommendation,
  goals,
  onStartFocus,
  onCompleteTask,
  onDeferTask,
  onSelectAlternative,
}) => {
  if (!recommendation) {
    return (
      <div className="p-5 rounded-2xl bg-[#121622] border border-[#252B3B] flex items-center justify-between">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-[#A78BFA] font-semibold">
            Next Best Move
          </span>
          <h4 className="text-sm font-semibold text-[#F4F5FA] mt-1">All scheduled work completed!</h4>
          <p className="text-xs text-[#939BB0] mt-0.5">
            You have zero pending tasks remaining today. Relax or schedule tomorrow's priorities in the Planner.
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#181D2B] border border-[#252B3B] flex items-center justify-center text-[#4ADE80]">
          <CheckCircle2 size={22} />
        </div>
      </div>
    );
  }

  const { task, reason, alternativeTask, confidence } = recommendation;
  const parentGoal = task.goalId ? goals.find((g) => g.id === task.goalId) : null;

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-[#121622] via-[#151A29] to-[#181D2B] border border-[#A78BFA]/40 shadow-lg shadow-violet-500/5 relative overflow-hidden">
      {/* Decorative ambient glow */}
      <div className="absolute top-0 right-0 w-48 h-32 bg-[#A78BFA]/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#A78BFA]/20 border border-[#A78BFA]/40 flex items-center justify-center text-[#A78BFA]">
            <Sparkles size={13} />
          </div>
          <span className="text-xs font-mono uppercase tracking-wider text-[#A78BFA] font-bold">
            Next Best Move Recommendation
          </span>
        </div>
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#181D2B] border border-[#252B3B] text-[#67E8F9] flex items-center gap-1">
          <ShieldCheck size={11} />
          <span>{confidence} Match</span>
        </span>
      </div>

      {/* Main Task Title & Context */}
      <div className="relative z-10 mb-3">
        <h3 className="text-lg font-bold text-[#F4F5FA] tracking-tight group-hover:text-[#A78BFA] transition-colors">
          {task.title}
        </h3>
        {task.description && (
          <p className="text-xs text-[#939BB0] mt-1 line-clamp-2">{task.description}</p>
        )}
      </div>

      {/* Metadata Badges */}
      <div className="flex flex-wrap items-center gap-2.5 text-xs mb-4 relative z-10">
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#181D2B] border border-[#252B3B] font-mono text-[#F4F5FA]">
          <Clock size={12} className="text-[#67E8F9]" />
          <span>{task.estimatedMinutes} mins</span>
        </span>

        <span
          className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-medium border ${
            task.priority === 'critical'
              ? 'bg-[#FB7185]/20 text-[#FB7185] border-[#FB7185]/40'
              : task.priority === 'high'
              ? 'bg-[#FBBF24]/20 text-[#FBBF24] border-[#FBBF24]/40'
              : 'bg-[#181D2B] text-[#939BB0] border-[#252B3B]'
          }`}
        >
          {task.priority.toUpperCase()}
        </span>

        {parentGoal && (
          <span className="px-2 py-0.5 rounded-md bg-[#181D2B] border border-[#252B3B] text-[#A78BFA] text-xs font-medium">
            Goal: {parentGoal.title}
          </span>
        )}

        {task.deadline && (
          <span className="px-2 py-0.5 rounded-md bg-[#181D2B] border border-[#252B3B] text-[#939BB0] text-[11px] font-mono">
            Due: {task.deadline}
          </span>
        )}
      </div>

      {/* Transparent Reason rationale */}
      <div className="p-3 rounded-xl bg-[#090A0F]/70 border border-[#252B3B] text-xs mb-4 relative z-10">
        <div className="flex items-start gap-2">
          <CornerDownRight size={14} className="text-[#67E8F9] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[#67E8F9]">Reasoning: </span>
            <span className="text-[#939BB0]">{reason}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onStartFocus(task)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] text-black font-semibold text-xs flex items-center gap-2 hover:opacity-95 shadow-md shadow-violet-500/20 active:scale-95 transition-all"
          >
            <Play size={14} fill="currentColor" />
            <span>Enter Focus Room</span>
          </button>

          <button
            onClick={() => onCompleteTask(task.id)}
            className="px-3 py-2 rounded-xl bg-[#181D2B] hover:bg-[#252B3B] text-[#4ADE80] border border-[#4ADE80]/30 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <CheckCircle2 size={14} />
            <span>Mark Complete (+{task.xpReward} XP)</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onDeferTask(task.id)}
            className="px-3 py-2 rounded-xl bg-[#181D2B] hover:bg-[#252B3B] text-[#939BB0] hover:text-[#F4F5FA] border border-[#252B3B] text-xs font-medium transition-colors"
          >
            Defer to Tomorrow
          </button>
        </div>
      </div>

      {/* Alternative suggestion if available */}
      {alternativeTask && onSelectAlternative && (
        <div className="mt-3 pt-3 border-t border-[#252B3B]/60 flex items-center justify-between text-xs text-[#939BB0]">
          <span className="truncate">
            <span className="text-[#A78BFA] font-medium">Alternative: </span>
            {alternativeTask.title} ({alternativeTask.estimatedMinutes}m)
          </span>
          <button
            onClick={() => onSelectAlternative(alternativeTask)}
            className="text-[#67E8F9] hover:underline flex items-center gap-1 shrink-0 ml-2"
          >
            <span>Switch</span>
            <ArrowRight size={12} />
          </button>
        </div>
      )}
    </div>
  );
};
