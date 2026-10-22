import React from 'react';
import {
  Sparkles,
  Plus,
  BookOpen,
  CheckCircle2,
  Clock,
  TrendingUp,
  Award,
  Calendar,
  ArrowRight,
  Target,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { Goal } from '../types/index.ts';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onOpenTaskModal: () => void;
  onOpenGoalModal: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenTaskModal,
  onOpenGoalModal,
}) => {
  const { userProfile } = useAuth();
  const { tasks, goals, toggleTaskComplete } = useApp();

  const displayName = userProfile?.displayName || 'Student';

  // Metrics derived honestly from real persisted user data
  const totalAssignments = tasks.length;
  const completedAssignments = tasks.filter((t) => t.status === 'completed').length;
  const inProgressAssignments = tasks.filter((t) => t.status !== 'completed').length;

  const averageGrade =
    totalAssignments > 0
      ? Math.round((completedAssignments / totalAssignments) * 100 * 10) / 10
      : 0;

  // Active (in-progress) assignments
  const activeAssignments = tasks.filter((t) => t.status !== 'completed');

  // Completed achievements
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  // Study goals
  const activeGoals = goals.filter((g) => g.status === 'active');

  const getSubjectColor = (subject: string) => {
    const s = subject.toLowerCase();
    if (s.includes('math')) return 'text-cyan-300 bg-cyan-500/10 border-cyan-500/30';
    if (s.includes('english') || s.includes('essay')) return 'text-amber-300 bg-amber-500/10 border-amber-500/30';
    if (s.includes('science') || s.includes('physics')) return 'text-blue-300 bg-blue-500/10 border-blue-500/30';
    if (s.includes('code') || s.includes('cs')) return 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30';
    return 'text-sky-300 bg-sky-500/10 border-sky-500/30';
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'critical':
      case 'high':
        return 'text-rose-400';
      case 'medium':
        return 'text-amber-400';
      default:
        return 'text-cyan-400';
    }
  };

  const computeGoalProgress = (g: Goal) => {
    if (g.milestones && g.milestones.length > 0) {
      const done = g.milestones.filter((m) => m.status === 'completed').length;
      return Math.round((done / g.milestones.length) * 100);
    }
    return 0;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner: Dashboard Title & Quick Analytics Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#2563EB] via-[#3988FF] to-[#59C8FF] flex items-center justify-center shadow-lg shadow-[#3988FF]/20 border border-[#59C8FF]/30">
            <span className="font-mono text-black font-extrabold text-sm tracking-wider">
              ATL
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F0F5FF]">
                Welcome back, {displayName}
              </h1>
              <span className="w-2 h-2 rounded-full bg-[#59C8FF] shadow-[0_0_8px_#59C8FF]" />
            </div>
            <p className="text-xs sm:text-sm text-[#A7B6CA]">
              Your life. Your system. Your next move.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => onNavigate('/insights')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium btn-electric-secondary cursor-pointer shadow-sm"
          >
            <TrendingUp className="w-4 h-4 text-[#59C8FF]" />
            <span>Insights</span>
          </button>
          <button
            onClick={onOpenTaskModal}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold btn-electric-primary cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Metric Cards (Organized Rectangular Panels with Subtle Blue Edge) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Assignments */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#101A2B] border border-[#24354C] hover:border-[#294B75] finova-card-hover shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-xs text-[#A7B6CA] font-medium uppercase tracking-wider">Total Tasks</div>
            <div className="w-8 h-8 rounded-lg bg-[#3988FF]/15 border border-[#3988FF]/30 flex items-center justify-center text-[#59C8FF]">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#F0F5FF] mt-2 font-mono">
            {totalAssignments}
          </div>
          <div className="text-[11px] text-[#7789A4] mt-1 font-mono">
            {totalAssignments === 0 ? 'Ready for your plan' : `${inProgressAssignments} remaining`}
          </div>
        </div>

        {/* Completed */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#101A2B] border border-[#24354C] hover:border-emerald-500/40 finova-card-hover shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-xs text-[#A7B6CA] font-medium uppercase tracking-wider">Completed</div>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-2 font-mono">
            {completedAssignments}
          </div>
          <div className="text-[11px] text-[#7789A4] mt-1 font-mono">
            {totalAssignments > 0 ? `${Math.round((completedAssignments / totalAssignments) * 100)}% execution rate` : 'No tasks finished yet'}
          </div>
        </div>

        {/* In Progress */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#101A2B] border border-[#24354C] hover:border-amber-500/40 finova-card-hover shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-xs text-[#A7B6CA] font-medium uppercase tracking-wider">In Progress</div>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 mt-2 font-mono">
            {inProgressAssignments}
          </div>
          <div className="text-[11px] text-[#7789A4] mt-1 font-mono">
            Active today
          </div>
        </div>

        {/* Execution Score */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#101A2B] border border-[#294B75] shadow-[0_0_15px_-3px_rgba(57,136,255,0.15)] finova-card-hover">
          <div className="flex items-center justify-between">
            <div className="text-xs text-[#A7B6CA] font-medium uppercase tracking-wider">Productivity Rate</div>
            <div className="w-8 h-8 rounded-lg bg-[#3988FF]/15 border border-[#3988FF]/30 flex items-center justify-center text-[#59C8FF]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#59C8FF] mt-2 font-mono">
            {totalAssignments > 0 ? `${averageGrade}%` : '—'}
          </div>
          <div className="text-[11px] text-[#7789A4] mt-1 font-mono">
            Calculated from history
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column (Active Tasks & Achievements) + Right Column (Study Goals) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Tasks Panel */}
          <div className="rounded-2xl bg-[#101A2B] border border-[#24354C] p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#F0F5FF] font-semibold text-base">
                <Calendar className="w-4 h-4 text-[#59C8FF]" />
                <span>Active Assignments</span>
              </div>
              <button
                onClick={onOpenTaskModal}
                className="w-8 h-8 rounded-lg bg-[#131F32] hover:bg-[#192941] text-[#A7B6CA] hover:text-[#59C8FF] border border-[#24354C] hover:border-[#3988FF] flex items-center justify-center transition-all cursor-pointer"
                title="Add new assignment"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {activeAssignments.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-[#24354C] rounded-xl text-[#A7B6CA] text-xs space-y-3">
                <p>No active assignments yet.</p>
                <p className="text-[11px] text-[#7789A4]">
                  Add an assignment, revision session, or task to start tracking your progress.
                </p>
                <button
                  onClick={onOpenTaskModal}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold btn-electric-primary inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Task</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {activeAssignments.map((task) => {
                  const subject = task.title.toLowerCase().includes('math')
                    ? 'Math'
                    : task.title.toLowerCase().includes('essay')
                    ? 'English'
                    : task.title.toLowerCase().includes('code')
                    ? 'CS'
                    : 'Study';
                  const priority = task.priority || 'medium';

                  return (
                    <div
                      key={task.id}
                      className="group p-3.5 rounded-xl bg-[#0B1220] border border-[#24354C] hover:border-[#3988FF] hover:bg-[#131F32] transition-all flex items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-md border font-semibold ${getSubjectColor(
                              subject
                            )}`}
                          >
                            {subject}
                          </span>
                          <span
                            className={`text-[11px] font-medium capitalize ${getPriorityColor(
                              priority
                            )}`}
                          >
                            {priority}
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold text-[#F0F5FF] group-hover:text-[#59C8FF] transition-colors truncate">
                          {task.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onNavigate(`/focus?task=${task.id}`)}
                          className="w-8 h-8 rounded-lg bg-[#101A2B] hover:bg-[#192941] text-[#A7B6CA] hover:text-[#59C8FF] border border-[#24354C] hover:border-[#294B75] flex items-center justify-center transition-all cursor-pointer"
                          title="Start focus on this assignment"
                        >
                          <Clock className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => toggleTaskComplete(task.id)}
                          className="w-8 h-8 rounded-lg bg-[#101A2B] hover:bg-emerald-500/20 text-[#A7B6CA] hover:text-emerald-300 border border-[#24354C] hover:border-emerald-500/40 flex items-center justify-center transition-all cursor-pointer"
                          title="Mark complete"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Achievements Card */}
          <div className="rounded-2xl bg-[#101A2B] border border-[#24354C] p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-[#F0F5FF] font-semibold text-base">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Recent Achievements</span>
            </div>

            <div className="space-y-2.5">
              {completedTasks.length > 0 ? (
                completedTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-xl bg-[#0B1220] border border-[#24354C] flex items-center gap-3.5"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
                      <Award className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[#F0F5FF] truncate">
                        Completed "{task.title}"
                      </div>
                      <div className="text-xs text-[#7789A4]">
                        Verified accomplishment
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center border border-dashed border-[#24354C] rounded-xl text-[#A7B6CA] text-xs space-y-1">
                  <p>No completed assignments yet.</p>
                  <p className="text-[11px] text-[#7789A4]">
                    When you complete tasks, your verified achievements will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Study Goals */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-[#101A2B] border border-[#294B75] shadow-[0_0_16px_-2px_rgba(57,136,255,0.15)] p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#F0F5FF] font-semibold text-base">
                <Target className="w-4 h-4 text-[#59C8FF]" />
                <span>Active Goals</span>
              </div>
              <button
                onClick={onOpenGoalModal}
                className="text-xs text-[#59C8FF] hover:text-[#3988FF] transition-colors font-medium cursor-pointer"
              >
                + New Goal
              </button>
            </div>

            <div className="space-y-3">
              {activeGoals.length > 0 ? (
                activeGoals.map((goal) => {
                  const progressVal = computeGoalProgress(goal);
                  return (
                    <div
                      key={goal.id}
                      onClick={() => onNavigate('/goals')}
                      className="p-4 rounded-xl bg-[#0B1220] border border-[#24354C] hover:border-[#3988FF] hover:bg-[#131F32] transition-all cursor-pointer group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-[#3988FF]/15 border border-[#3988FF]/30 flex items-center justify-center text-[#59C8FF] shrink-0 mt-0.5">
                          <Target className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-[#F0F5FF] group-hover:text-[#59C8FF] transition-colors truncate">
                            {goal.title}
                          </h4>
                          <span className="text-[11px] text-[#7789A4] capitalize">
                            {goal.category || 'Target Goal'}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-[#7789A4]">Progress</span>
                          <span className="text-[#59C8FF] font-semibold">{progressVal}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[#131F32] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#2563EB] via-[#3988FF] to-[#59C8FF] transition-all duration-500 shadow-[0_0_8px_rgba(89,200,255,0.4)]"
                            style={{ width: `${Math.min(100, progressVal)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center border border-dashed border-[#24354C] rounded-xl text-[#A7B6CA] text-xs space-y-3">
                  <p>No goals created yet.</p>
                  <p className="text-[11px] text-[#7789A4]">
                    Set your first academic or personal goal to track milestones and progress.
                  </p>
                  <button
                    onClick={onOpenGoalModal}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold btn-electric-primary inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Goal</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
