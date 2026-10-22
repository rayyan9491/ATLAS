import React, { useState } from 'react';
import {
  BarChart2,
  TrendingUp,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  Award,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext.tsx';
import { useTheme } from '../../../context/ThemeContext.tsx';

export const InsightsWindowContent: React.FC = () => {
  const { tasks, goals, focusSessions, userStats } = useApp();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [dateRange, setDateRange] = useState<'7d' | '30d'>('7d');

  // Real calculations
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  const totalFocusMinutes = focusSessions.reduce(
    (acc, s) => acc + (s.actualMinutes || 0),
    0
  );

  // Daily task completion counts for the last 7 days
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const iso = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'narrow' });
    const tasksDone = tasks.filter(
      (t) => t.status === 'completed' && t.scheduledDate === iso
    ).length;
    const focusMins = focusSessions
      .filter((s) => s.timestamp && s.timestamp.startsWith(iso))
      .reduce((acc, s) => acc + (s.actualMinutes || 0), 0);

    return {
      date: iso,
      dayLabel,
      tasksDone,
      focusMins,
    };
  });

  const maxDailyTasks = Math.max(1, ...last7Days.map((d) => d.tasksDone));

  // Goal breakdown
  const goalBreakdowns = goals.map((g) => {
    const compMilestones = g.milestones.filter((m) => m.status === 'completed').length;
    const totalMilestones = g.milestones.length;
    const pct =
      totalMilestones > 0 ? Math.round((compMilestones / totalMilestones) * 100) : 0;
    const goalTasks = tasks.filter((t) => t.goalId === g.id);
    const compGoalTasks = goalTasks.filter((t) => t.status === 'completed').length;

    return {
      id: g.id,
      title: g.title,
      category: g.category,
      pct,
      tasksDone: compGoalTasks,
      totalTasks: goalTasks.length,
    };
  });

  // Plain-English observations
  const getObservations = () => {
    const observations = [];
    if (completedTasks.length > 0) {
      observations.push(
        `You have completed ${completedTasks.length} of ${totalTasks} planned tasks.`
      );
    }
    if (totalFocusMinutes > 0) {
      observations.push(
        `You have logged ${totalFocusMinutes} minutes of focused work across ${focusSessions.length} sessions.`
      );
    }
    const mostProgressedGoal = [...goalBreakdowns].sort((a, b) => b.pct - a.pct)[0];
    if (mostProgressedGoal && mostProgressedGoal.pct > 0) {
      observations.push(
        `"${mostProgressedGoal.title}" is your most progressed goal at ${mostProgressedGoal.pct}%.`
      );
    }
    if (observations.length === 0) {
      observations.push(
        'Complete tasks and focus sessions to build your progress trends.'
      );
    }
    return observations;
  };

  return (
    <div className="h-full flex flex-col p-4 sm:p-5 overflow-y-auto text-xs space-y-4 select-none">
      {/* Top Header & Range Filter */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div>
          <h3 className="font-bold text-base text-white">Your Progress</h3>
          <p className="text-[11px] text-[#939BB0]">
            Calculated from your actual tasks and focus records.
          </p>
        </div>

        <div className="flex items-center bg-black/40 rounded-xl p-0.5 border border-white/10">
          {(['7d', '30d'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setDateRange(r)}
              className={`px-3 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                dateRange === r
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-[#939BB0] hover:text-white'
              }`}
            >
              {r === '7d' ? 'Last 7 days' : 'Last 30 days'}
            </button>
          ))}
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
          <div className="text-[10px] text-[#939BB0] font-semibold uppercase flex items-center gap-1">
            <CheckCircle2 size={11} className="text-[#67E8F9]" />
            <span>Tasks finished</span>
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {completedTasks.length}{' '}
            <span className="text-xs font-normal text-[#939BB0]">
              / {totalTasks}
            </span>
          </div>
          <div className="text-[10px] text-[#67E8F9]">
            {completionRate}% completion rate
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
          <div className="text-[10px] text-[#939BB0] font-semibold uppercase flex items-center gap-1">
            <Clock size={11} className="text-[#A78BFA]" />
            <span>Focus time</span>
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {Math.round(totalFocusMinutes / 60)}h{' '}
            <span className="text-xs font-normal text-[#939BB0]">
              {totalFocusMinutes % 60}m
            </span>
          </div>
          <div className="text-[10px] text-[#A78BFA]">
            {focusSessions.length} total sessions
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
          <div className="text-[10px] text-[#939BB0] font-semibold uppercase flex items-center gap-1">
            <Award size={11} className="text-emerald-400" />
            <span>Active goals</span>
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {goals.filter((g) => g.status === 'active').length}
          </div>
          <div className="text-[10px] text-emerald-400">
            {goals.filter((g) => g.status === 'completed').length} completed
          </div>
        </div>
      </div>

      {/* Chart: Daily Tasks Completed (7 Days) */}
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-white">
          <span>Daily task completions</span>
          <span className="text-[10px] font-mono text-[#939BB0]">This week</span>
        </div>

        <div className="h-28 flex items-end justify-between gap-2 pt-2 px-1">
          {last7Days.map((d) => {
            const heightPct = Math.round((d.tasksDone / maxDailyTasks) * 80) + 12;

            return (
              <div
                key={d.date}
                className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group"
              >
                <div className="text-[9px] font-mono opacity-0 group-hover:opacity-100 transition-opacity text-white">
                  {d.tasksDone}
                </div>
                <div
                  className="w-full max-w-[28px] rounded-t-lg bg-gradient-to-t from-violet-600 to-cyan-400 group-hover:from-violet-500 group-hover:to-cyan-300 transition-all duration-300 shadow-sm"
                  style={{ height: `${d.tasksDone > 0 ? heightPct : 6}%` }}
                />
                <div className="text-[10px] font-mono text-[#939BB0] uppercase">
                  {d.dayLabel}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Goal Progress Breakdown */}
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
        <div className="font-bold text-xs text-white">Progress by goal</div>

        <div className="space-y-2.5">
          {goalBreakdowns.map((g) => (
            <div key={g.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-white truncate">{g.title}</span>
                <span className="text-[#67E8F9] font-mono">{g.pct}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full"
                  style={{ width: `${g.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Plain-English Observations */}
      <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 space-y-2">
        <div className="text-[10px] uppercase font-bold text-[#67E8F9] flex items-center gap-1.5">
          <Sparkles size={12} />
          <span>Patterns & observations</span>
        </div>

        <ul className="space-y-1 text-xs text-white/90">
          {getObservations().map((obs, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#67E8F9]" />
              <span>{obs}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
