import React, { useState } from 'react';
import {
  Plus,
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Zap,
  Trash2,
  Edit2,
  AlertCircle,
  Paperclip,
  Check,
  Flame,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { Task, DaySlot } from '../types/index.ts';
import { getLocalDateString } from '../utils/dateUtils.ts';

interface TodayDashboardProps {
  onNavigate: (path: string) => void;
  onOpenTaskModal: (task?: Task | null) => void;
  onOpenReplanModal: () => void;
}

export const TodayDashboard: React.FC<TodayDashboardProps> = ({
  onNavigate,
  onOpenTaskModal,
  onOpenReplanModal,
}) => {
  const {
    tasks,
    goals,
    todayDate,
    setTodayDate,
    toggleTaskComplete,
    deleteTask,
    createTask,
    userStats,
  } = useApp();

  // Category column definitions matching Image 2
  const [selectedListFilter, setSelectedListFilter] = useState<string>('all');
  const [collapsedCompleted, setCollapsedCompleted] = useState<Record<string, boolean>>({});
  const [quickAddColumn, setQuickAddColumn] = useState<string | null>(null);
  const [quickAddTitle, setQuickAddTitle] = useState<string>('');

  // Human date formatting
  const parseCurrentDate = () => {
    try {
      const [y, m, d] = todayDate.split('-').map(Number);
      return new Date(y, m - 1, d);
    } catch {
      return new Date();
    }
  };

  const currentDateObj = parseCurrentDate();
  const formattedDay = currentDateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const isToday = todayDate === getLocalDateString();

  const handlePrevDay = () => {
    const d = new Date(currentDateObj);
    d.setDate(d.getDate() - 1);
    setTodayDate(getLocalDateString(d));
  };

  const handleNextDay = () => {
    const d = new Date(currentDateObj);
    d.setDate(d.getDate() + 1);
    setTodayDate(getLocalDateString(d));
  };

  const handleTodayClick = () => {
    setTodayDate(getLocalDateString());
  };

  // Group columns
  const columns = [
    { id: 'tasks', name: 'My Tasks', color: 'bg-rose-500', dot: '#F43F5E' },
    { id: 'work', name: 'Study & Projects', color: 'bg-violet-500', dot: '#A855F7' },
    { id: 'personal', name: 'Personal & Habits', color: 'bg-amber-500', dot: '#F59E0B' },
    { id: 'home', name: 'Home & Errands', color: 'bg-emerald-500', dot: '#10B981' },
  ];

  // Helper to place tasks into columns
  const getTaskColumnId = (task: Task) => {
    const title = task.title.toLowerCase();
    const notes = (task.notes || '').toLowerCase();
    if (title.includes('assignment') || title.includes('essay') || title.includes('math') || title.includes('code') || title.includes('exam') || title.includes('study')) {
      return 'work';
    }
    if (title.includes('workout') || title.includes('stretch') || title.includes('call') || title.includes('book') || title.includes('meditation') || title.includes('run')) {
      return 'personal';
    }
    if (title.includes('grocery') || title.includes('repair') || title.includes('clean') || title.includes('water') || title.includes('shopping')) {
      return 'home';
    }
    return 'tasks';
  };

  // Metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const remainingTasks = tasks.filter((t) => t.status !== 'completed');

  const availableHours = Math.round(
    ((userStats.dailyAvailability[todayDate] || userStats.defaultAvailabilityMinutes || 300) / 60) * 10
  ) / 10;

  const handleQuickAdd = (columnId: string) => {
    if (!quickAddTitle.trim()) return;

    let slot: DaySlot = 'afternoon';
    if (columnId === 'work') slot = 'focus_now';
    if (columnId === 'personal') slot = 'morning';
    if (columnId === 'home') slot = 'evening';

    createTask({
      title: quickAddTitle.trim(),
      priority: 'medium',
      status: 'todo',
      scheduledDate: todayDate,
      estimatedMinutes: 30,
      slot,
    });

    setQuickAddTitle('');
    setQuickAddColumn(null);
  };

  const toggleColumnCompletedCollapse = (colId: string) => {
    setCollapsedCompleted((prev) => ({
      ...prev,
      [colId]: !prev[colId],
    }));
  };

  const getDueDateLabel = (dateStr?: string) => {
    if (!dateStr) return { text: 'Today', style: 'text-blue-400 bg-blue-500/10 border-blue-500/25' };
    const today = new Date().toISOString().split('T')[0];
    if (dateStr === today) return { text: 'Today', style: 'text-blue-400 bg-blue-500/10 border-blue-500/25' };
    if (dateStr < today) return { text: 'Overdue', style: 'text-rose-400 bg-rose-500/10 border-rose-500/25' };
    return { text: 'Upcoming', style: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/25' };
  };

  const filteredColumns =
    selectedListFilter === 'all'
      ? columns
      : columns.filter((c) => c.id === selectedListFilter);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header (Section A & Image 2) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#24354C]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F0F5FF]">
              Your day
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#3988FF]/15 text-[#59C8FF] border border-[#294B75]">
              {remainingTasks.length} left
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#A7B6CA] mt-1">
            {formattedDay} • {completedTasks.length} completed, {remainingTasks.length} remaining ({availableHours}h available)
          </p>
        </div>

        {/* Date Navigator & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center rounded-xl bg-[#101A2B] border border-[#24354C] p-1">
            <button
              onClick={handlePrevDay}
              className="p-1.5 rounded-lg text-[#A7B6CA] hover:text-[#F0F5FF] hover:bg-[#131F32] transition-colors cursor-pointer"
              title="Previous day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleTodayClick}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                isToday
                  ? 'bg-[#3988FF]/20 text-[#59C8FF] border border-[#294B75]'
                  : 'text-[#A7B6CA] hover:text-[#F0F5FF]'
              }`}
            >
              Today
            </button>
            <button
              onClick={handleNextDay}
              className="p-1.5 rounded-lg text-[#A7B6CA] hover:text-[#F0F5FF] hover:bg-[#131F32] transition-colors cursor-pointer"
              title="Next day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => onOpenTaskModal(null)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold btn-electric-primary cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Daily Progress & Context Bar (Section B) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#101A2B] border border-[#24354C] flex items-center justify-between">
          <div>
            <div className="text-xs text-[#A7B6CA] font-medium uppercase tracking-wider">Daily Completion</div>
            <div className="text-xl font-bold text-[#F0F5FF] mt-0.5 font-mono">
              {totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0}%
            </div>
          </div>
          <div className="w-24 h-2 rounded-full bg-[#131F32] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#2563EB] via-[#3988FF] to-[#59C8FF] rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(89,200,255,0.4)]"
              style={{
                width: `${totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#101A2B] border border-[#24354C] flex items-center justify-between">
          <div>
            <div className="text-xs text-[#A7B6CA] font-medium uppercase tracking-wider">Focus Session</div>
            <div className="text-sm font-semibold text-[#59C8FF] mt-0.5">
              Ready to execute
            </div>
          </div>
          <button
            onClick={() => onNavigate('/focus')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#3988FF]/15 hover:bg-[#3988FF]/25 text-[#59C8FF] border border-[#294B75] transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Launch Timer</span>
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-[#101A2B] border border-[#24354C] flex items-center justify-between">
          <div>
            <div className="text-xs text-[#A7B6CA] font-medium uppercase tracking-wider">AI Schedule Helper</div>
            <div className="text-sm font-semibold text-violet-300 mt-0.5">
              Need to re-prioritize?
            </div>
          </div>
          <button
            onClick={() => onNavigate('/coach')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 border border-violet-500/30 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask Coach</span>
          </button>
        </div>
      </div>

      {totalTasks === 0 && (
        <div className="p-6 rounded-2xl bg-[#101A2B] border border-dashed border-[#24354C] text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#3988FF]/15 border border-[#3988FF]/30 text-[#59C8FF] mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#F0F5FF]">No tasks scheduled for this day</h3>
            <p className="text-xs text-[#A7B6CA] mt-1 max-w-md mx-auto">
              Add an assignment, revision session, personal task, or anything else you need to finish.
            </p>
          </div>
          <button
            onClick={() => onOpenTaskModal(null)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold btn-electric-primary transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create your first task</span>
          </button>
        </div>
      )}

      {/* Multi-Column Task Board (Matches Image 2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {filteredColumns.map((col) => {
          const colTasks = tasks.filter((t) => getTaskColumnId(t) === col.id);
          const activeTasks = colTasks.filter((t) => t.status !== 'completed');
          const doneTasks = colTasks.filter((t) => t.status === 'completed');
          const isDoneCollapsed = collapsedCompleted[col.id] ?? false;

          return (
            <div
              key={col.id}
              className="rounded-2xl bg-[#101A2B] border border-[#24354C] hover:border-[#294B75] p-4 flex flex-col space-y-3 transition-colors shadow-sm"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#24354C]">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: col.dot }}
                  />
                  <h3 className="text-sm font-bold text-[#F0F5FF] tracking-wide">
                    {col.name}
                  </h3>
                </div>
                <span className="text-xs font-mono text-[#A7B6CA] px-2 py-0.5 rounded bg-[#131F32] border border-[#24354C]">
                  {activeTasks.length}
                </span>
              </div>

              {/* Add a task inline button (Matches Image 2) */}
              {quickAddColumn === col.id ? (
                <div className="p-2.5 rounded-xl bg-[#0B1220] border border-[#3988FF] space-y-2">
                  <input
                    type="text"
                    value={quickAddTitle}
                    onChange={(e) => setQuickAddTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleQuickAdd(col.id);
                      if (e.key === 'Escape') setQuickAddColumn(null);
                    }}
                    placeholder="What do you need to get done?"
                    autoFocus
                    className="w-full bg-transparent text-xs text-[#F0F5FF] placeholder-[#7789A4] focus:outline-none"
                  />
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#24354C]">
                    <button
                      onClick={() => setQuickAddColumn(null)}
                      className="px-2 py-0.5 rounded text-[11px] text-[#A7B6CA] hover:text-[#F0F5FF] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleQuickAdd(col.id)}
                      className="px-2.5 py-1 rounded text-[11px] font-semibold btn-electric-primary cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setQuickAddColumn(col.id);
                    setQuickAddTitle('');
                  }}
                  className="flex items-center gap-2 text-xs font-medium text-[#59C8FF] hover:text-[#3988FF] py-1 transition-colors cursor-pointer group"
                >
                  <Plus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  <span>Add a task</span>
                </button>
              )}

              {/* Active Tasks List */}
              <div className="space-y-2 min-h-[80px]">
                {activeTasks.length === 0 ? (
                  <div className="py-6 text-center text-xs text-[#7789A4] italic">
                    No active tasks
                  </div>
                ) : (
                  activeTasks.map((task) => {
                    const dueBadge = getDueDateLabel(task.scheduledDate);

                    return (
                      <div
                        key={task.id}
                        className="group p-3 rounded-xl bg-[#0B1220] hover:bg-[#131F32] border border-[#24354C] hover:border-[#3988FF] transition-all flex flex-col gap-2 relative shadow-sm"
                      >
                        <div className="flex items-start gap-2.5">
                          {/* Circular Checkbox (Matches Image 2) */}
                          <button
                            onClick={() => toggleTaskComplete(task.id)}
                            className="w-4 h-4 rounded-full border border-[#7789A4] hover:border-[#59C8FF] flex items-center justify-center shrink-0 mt-0.5 transition-colors cursor-pointer"
                          >
                            <Circle className="w-3 h-3 text-transparent group-hover:text-[#59C8FF]/30" />
                          </button>

                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-[#F0F5FF] group-hover:text-[#59C8FF] transition-colors leading-snug">
                              {task.title}
                            </h4>
                            {task.notes && (
                              <p className="text-[11px] text-[#A7B6CA] line-clamp-1 mt-0.5">
                                {task.notes}
                              </p>
                            )}
                          </div>

                          {/* Quick actions on hover */}
                          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                            <button
                              onClick={() => onNavigate(`/focus?task=${task.id}`)}
                              className="p-1 rounded text-[#A7B6CA] hover:text-[#59C8FF] hover:bg-[#192941]"
                              title="Focus"
                            >
                              <Zap className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => onOpenTaskModal(task)}
                              className="p-1 rounded text-[#A7B6CA] hover:text-[#F0F5FF] hover:bg-[#192941]"
                              title="Edit"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="p-1 rounded text-[#A7B6CA] hover:text-rose-400 hover:bg-[#192941]"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Badges footer (Matches Image 2) */}
                        <div className="flex items-center gap-2 pl-6 pt-0.5">
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded border font-medium ${dueBadge.style}`}
                          >
                            {dueBadge.text}
                          </span>
                          {task.subtasks && task.subtasks.length > 0 && (
                            <span className="flex items-center gap-1 text-[10px] font-mono text-[#7789A4]">
                              <Paperclip className="w-3 h-3" />
                              <span>{task.subtasks.length}</span>
                            </span>
                          )}
                          {task.priority === 'high' || task.priority === 'critical' ? (
                            <span className="text-[10px] text-rose-400 font-medium">High</span>
                          ) : null}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Collapsible Completed Section (Matches Image 2) */}
              {doneTasks.length > 0 && (
                <div className="pt-2 border-t border-[#24354C]">
                  <button
                    onClick={() => toggleColumnCompletedCollapse(col.id)}
                    className="w-full flex items-center justify-between text-xs text-[#A7B6CA] hover:text-[#F0F5FF] py-1 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${
                          isDoneCollapsed ? '-rotate-90' : 'rotate-0'
                        }`}
                      />
                      <span>Completed ({doneTasks.length})</span>
                    </div>
                  </button>

                  {!isDoneCollapsed && (
                    <div className="space-y-1.5 mt-2">
                      {doneTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center gap-2.5 p-2 rounded-lg bg-[#0B1220]/70 border border-[#24354C] text-xs text-[#7789A4]"
                        >
                          <button
                            onClick={() => toggleTaskComplete(task.id)}
                            className="w-4 h-4 rounded-full bg-[#3988FF]/20 text-[#59C8FF] border border-[#294B75] flex items-center justify-center shrink-0 cursor-pointer"
                          >
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </button>
                          <span className="line-through truncate flex-1">{task.title}</span>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="text-[#7789A4] hover:text-rose-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
