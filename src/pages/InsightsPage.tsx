import React from 'react';
import {
  BarChart2,
  Play,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  Calendar,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';

interface InsightsPageProps {
  onNavigate: (path: string) => void;
}

export const InsightsPage: React.FC<InsightsPageProps> = ({ onNavigate }) => {
  const { tasks, focusSessions, goals } = useApp();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const pendingTasks = tasks.filter((t) => t.status !== 'completed').length;

  // Real focus session minutes calculation
  const totalFocusMinutes = focusSessions.reduce(
    (acc, s) => acc + (s.actualMinutes || s.plannedMinutes || 0),
    0
  );
  const totalFocusHours = Math.round((totalFocusMinutes / 60) * 10) / 10;
  const focusHoursInt = Math.floor(totalFocusMinutes / 60);
  const focusMinsRem = Math.round(totalFocusMinutes % 60);

  const hasActivity = totalTasks > 0 || focusSessions.length > 0;

  // Real Weekly distribution (Mon - Sun)
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Compute honest task counts per weekday
  const weeklyTaskCounts = [0, 0, 0, 0, 0, 0, 0];
  tasks.forEach((t) => {
    if (t.status === 'completed' && t.scheduledDate) {
      const d = new Date(t.scheduledDate);
      const dayIdx = (d.getDay() + 6) % 7; // 0 for Mon
      if (dayIdx >= 0 && dayIdx < 7) {
        weeklyTaskCounts[dayIdx] += 1;
      }
    }
  });

  // Focus hours by day
  const focusDailyHours = [0, 0, 0, 0, 0, 0, 0];
  focusSessions.forEach((s) => {
    const dateStr = s.startTime || s.timestamp;
    if (dateStr) {
      const d = new Date(dateStr);
      const dayIdx = (d.getDay() + 6) % 7;
      if (dayIdx >= 0 && dayIdx < 7) {
        focusDailyHours[dayIdx] += (s.actualMinutes || s.plannedMinutes || 0) / 60;
      }
    }
  });

  // AI Speech banner text (Honest, data-grounded, actionable)
  const getAiSpeech = () => {
    if (totalTasks === 0 && focusSessions.length === 0) {
      return 'You are starting fresh. Complete tasks and record focus sessions to start building a picture of your progress.';
    }
    if (completedTasks === 0) {
      return 'You have scheduled tasks in progress. Completing your first high-priority task today will establish your momentum.';
    }
    if (completedTasks >= totalTasks && totalTasks > 0) {
      return 'Outstanding rhythm! You have cleared all planned assignments for today. Consider reviewing upcoming goals or taking a restorative break.';
    }
    return `Solid execution across your workspace. You have cleared ${completedTasks} of ${totalTasks} tasks with ${totalFocusHours} focus hours logged. Maintain this focused cadence.`;
  };

  const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Semicircular segmented gauge bars (total 24 segments)
  const TOTAL_BARS = 24;
  const activeBars = Math.round((completionPercent / 100) * TOTAL_BARS);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Start Focus Session Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F0F5FF]">
              Productivity Insights
            </h1>
            <span className="w-2 h-2 rounded-full bg-[#59C8FF] shadow-[0_0_8px_#59C8FF]" />
          </div>
          <p className="text-xs sm:text-sm text-[#A7B6CA] mt-0.5">
            Real performance analytics derived from your workspace activity.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/focus')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold btn-electric-primary transition-all cursor-pointer self-start sm:self-auto"
        >
          <Play className="w-3.5 h-3.5 fill-current stroke-[3]" />
          <span>Launch Focus Room</span>
        </button>
      </div>

      {/* AI Speech / OS Status Banner */}
      <div className="p-4 rounded-2xl bg-[#101A2B] border border-[#294B75] shadow-[0_0_15px_-3px_rgba(57,136,255,0.15)] flex items-start gap-3">
        <div className="w-7 h-7 rounded-lg bg-[#3988FF]/15 border border-[#3988FF]/30 flex items-center justify-center text-[#59C8FF] shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="text-xs">
          <span className="font-mono font-bold text-[#59C8FF] uppercase tracking-wider mr-2">
            ATLAS Advisor:
          </span>
          <span className="text-[#F0F5FF] leading-relaxed">
            {getAiSpeech()}
          </span>
        </div>
      </div>

      {!hasActivity ? (
        <div className="py-16 px-6 text-center rounded-2xl bg-[#101A2B] border border-dashed border-[#24354C] space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#3988FF]/15 border border-[#3988FF]/30 text-[#59C8FF] mx-auto flex items-center justify-center">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#F0F5FF]">Your progress will show up here.</h3>
            <p className="text-xs text-[#A7B6CA] mt-1 max-w-md mx-auto">
              Complete tasks and record focus sessions to start building a picture of your progress.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('/today')}
              className="px-4 py-2 rounded-xl text-xs font-semibold btn-electric-secondary transition-colors cursor-pointer"
            >
              Add Tasks
            </button>
            <button
              onClick={() => onNavigate('/focus')}
              className="px-4 py-2 rounded-xl text-xs font-semibold btn-electric-primary transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current stroke-[3]" />
              <span>Start Focus Session</span>
            </button>
          </div>
        </div>
      ) : (
        /* 4 Organized Rectangular Analytics Panels (Matching Reference Visual Design) */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* Card 1: Task Completion Semicircular Segmented Gauge (Reference Style) */}
          <div className="rounded-2xl bg-[#101A2B] border border-[#24354C] hover:border-[#294B75] finova-card-hover p-5 sm:p-6 flex flex-col justify-between items-center text-center space-y-4 shadow-sm">
            <div className="w-full text-left flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#F0F5FF] tracking-wide">
                Task Completion
              </h3>
              <span className="text-xs font-mono text-[#59C8FF] font-semibold">
                {completionPercent}%
              </span>
            </div>

            {/* Semicircular Segmented Dial */}
            <div className="relative w-56 h-32 flex flex-col items-center justify-end overflow-hidden pt-4">
              <svg className="w-56 h-28" viewBox="0 0 200 110">
                {Array.from({ length: TOTAL_BARS }).map((_, i) => {
                  const angle = (Math.PI / (TOTAL_BARS - 1)) * i;
                  const x1 = 100 - 75 * Math.cos(angle);
                  const y1 = 95 - 75 * Math.sin(angle);
                  const x2 = 100 - 60 * Math.cos(angle);
                  const y2 = 95 - 60 * Math.sin(angle);
                  const isLit = i < activeBars;
                  return (
                    <line
                      key={i}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={isLit ? '#59C8FF' : '#131F32'}
                      strokeWidth="5"
                      strokeLinecap="round"
                      className="transition-all duration-500 drop-shadow-[0_0_4px_rgba(89,200,255,0.3)]"
                    />
                  );
                })}
              </svg>

              <div className="absolute bottom-2 flex flex-col items-center">
                <span className="text-3xl font-extrabold text-[#F0F5FF] font-mono tracking-tight">
                  {completionPercent}%
                </span>
              </div>
            </div>

            <div className="w-full flex items-center justify-between text-xs font-mono pt-2 border-t border-[#24354C] text-[#A7B6CA]">
              <span className="text-emerald-400 font-semibold">
                {completedTasks} Completed
              </span>
              <span className="text-amber-400 font-semibold">
                {pendingTasks} Pending
              </span>
            </div>
          </div>

          {/* Card 2: Weekly Output Bar Chart */}
          <div className="rounded-2xl bg-[#101A2B] border border-[#24354C] hover:border-[#294B75] finova-card-hover p-5 sm:p-6 flex flex-col justify-between space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#F0F5FF] tracking-wide">
                Weekly Activity
              </h3>
              <span className="text-xs font-mono text-[#A7B6CA]">Completed per day</span>
            </div>

            <div className="flex items-end justify-between gap-2 h-40 pt-4 px-2">
              {weeklyTaskCounts.map((val, idx) => {
                const maxVal = Math.max(1, ...weeklyTaskCounts);
                const heightPercent = val > 0 ? Math.min(100, (val / maxVal) * 100) : 6;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div className="w-full max-w-[38px] bg-[#0B1220] rounded-t-lg overflow-hidden flex flex-col justify-end h-full border border-[#24354C]">
                      <div
                        className="w-full bg-gradient-to-t from-[#2563EB] via-[#3988FF] to-[#59C8FF] rounded-t-lg transition-all duration-700 ease-out shadow-[0_0_10px_rgba(89,200,255,0.4)]"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-[#7789A4]">
                      {weekdays[idx]}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="text-xs text-[#7789A4] font-mono pt-2 border-t border-[#24354C] flex justify-between">
              <span>Weekly distribution</span>
              <span className="text-[#59C8FF] font-medium">Actual logs</span>
            </div>
          </div>

          {/* Card 3: Focus Duration Recorded */}
          <div className="rounded-2xl bg-[#101A2B] border border-[#24354C] hover:border-[#294B75] finova-card-hover p-5 sm:p-6 flex flex-col justify-between space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#F0F5FF] tracking-wide">
                Focus Time
              </h3>
              <span className="text-xs font-mono text-[#59C8FF] font-semibold">
                {focusHoursInt}h {focusMinsRem}m logged
              </span>
            </div>

            <div className="flex items-end justify-between gap-2 h-40 pt-4 px-2">
              {focusDailyHours.map((hours, idx) => {
                const maxHours = Math.max(1, ...focusDailyHours);
                const heightPercent = hours > 0 ? Math.min(100, (hours / maxHours) * 100) : 6;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div className="w-full max-w-[38px] bg-[#0B1220] rounded-t-lg overflow-hidden flex flex-col justify-end h-full border border-[#24354C]">
                      <div
                        className="w-full bg-gradient-to-t from-indigo-600 via-[#3988FF] to-[#59C8FF] rounded-t-lg transition-all duration-700 ease-out shadow-[0_0_10px_rgba(57,136,255,0.4)]"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-[#7789A4]">
                      {weekdays[idx]}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="text-xs text-[#7789A4] font-mono pt-2 border-t border-[#24354C] flex justify-between">
              <span>Deep work timer history</span>
              <span className="text-[#59C8FF] font-medium">{focusSessions.length} sessions</span>
            </div>
          </div>

          {/* Card 4: Focus Streak & Execution Pace */}
          <div className="rounded-2xl bg-[#101A2B] border border-[#24354C] hover:border-[#294B75] finova-card-hover p-5 sm:p-6 flex flex-col justify-between space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#F0F5FF] tracking-wide">
                Focus Streak & Cadence
              </h3>
              <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400">
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Active</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0B1220] border border-[#24354C] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#A7B6CA]">Recorded Focus Hours</span>
                <span className="text-lg font-bold text-[#F0F5FF] font-mono">{totalFocusHours}h</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#A7B6CA]">Completed Task Ledger</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">{completedTasks}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#A7B6CA]">Linked Goals in Progress</span>
                <span className="text-lg font-bold text-[#59C8FF] font-mono">{goals.filter(g => g.status === 'active').length}</span>
              </div>
            </div>

            <div className="text-xs text-[#7789A4] font-mono pt-2 border-t border-[#24354C] flex justify-between">
              <span>Continuous progress metric</span>
              <span className="text-emerald-400 font-medium">On track</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
