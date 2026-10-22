import React from 'react';
import {
  Sparkles,
  Plus,
  Target,
  Calendar,
  Clock,
  CheckCircle2,
  ArrowRight,
  Play,
  Zap,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext.tsx';
import { useAuth } from '../../../context/AuthContext.tsx';
import { useTheme } from '../../../context/ThemeContext.tsx';
import { calculateWorkload } from '../../../utils/workload.ts';
import { getNextBestMove } from '../../../utils/recommendation.ts';

interface HomeWindowContentProps {
  onOpenToday: () => void;
  onOpenGoals: () => void;
  onOpenPlanner: () => void;
  onOpenFocus: (taskId?: string) => void;
  onOpenCoach: (initialPrompt?: string) => void;
  onOpenTaskModal: () => void;
  onOpenGoalModal: () => void;
}

export const HomeWindowContent: React.FC<HomeWindowContentProps> = ({
  onOpenToday,
  onOpenGoals,
  onOpenPlanner,
  onOpenFocus,
  onOpenCoach,
  onOpenTaskModal,
  onOpenGoalModal,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const { userProfile } = useAuth();
  const {
    tasks,
    goals,
    userStats,
    todayDate,
    focusSessions,
    toggleTaskComplete,
  } = useApp();

  const displayName = userProfile?.displayName || userStats.displayName || 'Alex';

  // Time-aware natural greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return `Morning, ${displayName}.`;
    if (hour < 18) return `Good afternoon, ${displayName}.`;
    return `Good evening, ${displayName}.`;
  };

  const availableMinutes =
    userStats.dailyAvailability[todayDate] !== undefined
      ? userStats.dailyAvailability[todayDate]
      : userStats.defaultAvailabilityMinutes || 300;

  const workload = calculateWorkload(tasks, availableMinutes, todayDate);
  const nextMove = getNextBestMove(tasks, goals, workload);

  const unfinishedTasks = tasks.filter((t) => t.status !== 'completed');
  const topTask = nextMove?.task || unfinishedTasks[0];
  const activeGoal = goals.find((g) => g.status === 'active') || goals[0];
  const recentCompletedTask = tasks.find((t) => t.status === 'completed');
  const recentSession = focusSessions[0];

  // Context-aware summary of today's direction
  const getDirectionText = () => {
    if (topTask) {
      return `Your main priority today is "${topTask.title}". You have ${Math.round(availableMinutes / 60)} hours available.`;
    }
    if (activeGoal) {
      return `All clear for today. You're on track with "${activeGoal.title}". Want to add a task?`;
    }
    return `Welcome to your personal workspace. Start by adding a goal or your first task for today.`;
  };

  return (
    <div className="h-full flex flex-col p-4 sm:p-5 overflow-y-auto space-y-5 text-xs">
      {/* Top Greeting & Direction */}
      <div className="space-y-1.5">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          {getGreeting()}
        </h2>
        <p className="text-xs sm:text-sm text-[#939BB0] leading-relaxed max-w-xl">
          {getDirectionText()}
        </p>
      </div>

      {/* Continue where you left off */}
      {topTask && (
        <div
          className={`p-4 rounded-2xl border transition-all ${
            isLight
              ? 'bg-violet-50 border-violet-200'
              : 'bg-[#151928] border-violet-500/30'
          }`}
        >
          <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-3">
            <span className="text-[10px] uppercase font-semibold text-[#A78BFA] tracking-wider">
              Continue where you left off
            </span>
            <button
              onClick={onOpenToday}
              className="text-[11px] text-[#67E8F9] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Today's plan</span>
              <ArrowRight size={11} />
            </button>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="font-bold text-sm text-white truncate">{topTask.title}</div>
              <div className="text-[11px] text-[#939BB0]">
                {topTask.estimatedMinutes} min · {topTask.priority} priority
                {topTask.goalId && goals.find((g) => g.id === topTask.goalId)
                  ? ` · ${goals.find((g) => g.id === topTask.goalId)?.title}`
                  : ''}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onOpenFocus(topTask.id)}
                className="px-3.5 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold text-xs shadow-md shadow-violet-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Play size={11} className="fill-current" />
                <span>Focus</span>
              </button>
              <button
                onClick={() => toggleTaskComplete(topTask.id)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors cursor-pointer"
                title="Mark complete"
              >
                <CheckCircle2 size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Access Grid */}
      <div className="space-y-2">
        <div className="text-[10px] uppercase text-[#939BB0] font-semibold tracking-wider">
          Quick actions
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <button
            onClick={onOpenTaskModal}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer text-center group ${
              isLight
                ? 'bg-white border-slate-200 hover:border-violet-300 shadow-sm'
                : 'bg-[#101420] border-white/5 hover:border-white/15'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-violet-500/20 text-[#A78BFA] flex items-center justify-center transition-transform group-hover:scale-105">
              <Plus size={15} />
            </div>
            <span className="font-semibold text-xs text-white">Add task</span>
          </button>

          <button
            onClick={onOpenGoalModal}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer text-center group ${
              isLight
                ? 'bg-white border-slate-200 hover:border-violet-300 shadow-sm'
                : 'bg-[#101420] border-white/5 hover:border-white/15'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-400/20 text-[#67E8F9] flex items-center justify-center transition-transform group-hover:scale-105">
              <Target size={15} />
            </div>
            <span className="font-semibold text-xs text-white">Create goal</span>
          </button>

          <button
            onClick={onOpenPlanner}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer text-center group ${
              isLight
                ? 'bg-white border-slate-200 hover:border-violet-300 shadow-sm'
                : 'bg-[#101420] border-white/5 hover:border-white/15'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-400/20 text-emerald-400 flex items-center justify-center transition-transform group-hover:scale-105">
              <Calendar size={15} />
            </div>
            <span className="font-semibold text-xs text-white">Open planner</span>
          </button>

          <button
            onClick={() => onOpenFocus()}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer text-center group ${
              isLight
                ? 'bg-white border-slate-200 hover:border-violet-300 shadow-sm'
                : 'bg-[#101420] border-white/5 hover:border-white/15'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center transition-transform group-hover:scale-105">
              <Clock size={15} />
            </div>
            <span className="font-semibold text-xs text-white">Start focus</span>
          </button>

          <button
            onClick={() => onOpenCoach('What should I focus on right now?')}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer text-center group ${
              isLight
                ? 'bg-white border-slate-200 hover:border-violet-300 shadow-sm'
                : 'bg-[#101420] border-white/5 hover:border-white/15'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-fuchsia-400/20 text-fuchsia-300 flex items-center justify-center transition-transform group-hover:scale-105">
              <Sparkles size={15} />
            </div>
            <span className="font-semibold text-xs text-white">Ask Coach</span>
          </button>
        </div>
      </div>

      {/* Recent Progress Summary */}
      <div className="space-y-2 pt-1 border-t border-white/5">
        <div className="text-[10px] uppercase text-[#939BB0] font-semibold tracking-wider">
          Recent progress
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {recentCompletedTask ? (
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 size={14} />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-[#939BB0]">Completed task</div>
                <div className="font-semibold text-xs text-white truncate">
                  {recentCompletedTask.title}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[#939BB0] text-[11px]">
              No tasks completed today yet.
            </div>
          )}

          {recentSession ? (
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-cyan-400/20 text-[#67E8F9] flex items-center justify-center shrink-0">
                <Zap size={14} />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-[#939BB0]">Focus logged</div>
                <div className="font-semibold text-xs text-white truncate">
                  {recentSession.plannedMinutes} min · {recentSession.taskTitle}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[#939BB0] text-[11px]">
              Start your first focus session today.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
