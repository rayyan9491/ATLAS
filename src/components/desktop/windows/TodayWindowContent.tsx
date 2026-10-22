import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  CheckCircle2,
  ChevronRight,
  Play,
  Star,
  Clock,
  Calendar,
  Trash2,
  Edit2,
  Check,
  X,
  ChevronDown,
  ListTodo,
  FileText,
  AlertCircle,
  ArrowRight,
  Sunrise,
  Sun,
  Sunset,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext.tsx';
import { useAuth } from '../../../context/AuthContext.tsx';
import { useTheme } from '../../../context/ThemeContext.tsx';
import { calculateWorkload } from '../../../utils/workload.ts';
import { getNextBestMove } from '../../../utils/recommendation.ts';
import { Task } from '../../../types/index.ts';

interface TodayWindowContentProps {
  onOpenFocus: (taskId?: string) => void;
  onOpenGoals: () => void;
  onOpenTaskModal: () => void;
  onOpenPlanner?: () => void;
}

export const TodayWindowContent: React.FC<TodayWindowContentProps> = ({
  onOpenFocus,
  onOpenGoals,
  onOpenTaskModal,
  onOpenPlanner,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const { userProfile } = useAuth();
  const {
    tasks,
    goals,
    userStats,
    todayDate,
    toggleTaskComplete,
    updateTask,
    deleteTask,
    setFocusTimer,
    dailyLogs,
    setDailyIntention,
    setDailyReflection,
    updateUserStats,
  } = useApp();

  const displayName = userProfile?.displayName || userStats.displayName || 'Alex';

  // State for daily intention
  const currentDailyLog = dailyLogs[todayDate] || { intention: '' };
  const [intentionInput, setIntentionInput] = useState(currentDailyLog.intention || '');
  const [isEditingIntention, setIsEditingIntention] = useState(!currentDailyLog.intention);

  // State for task details expansion & quick editing
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  // State for end-of-day reflection modal
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [reflectionWentWell, setReflectionWentWell] = useState('');
  const [reflectionCompletedNote, setReflectionCompletedNote] = useState('');
  const [reflectionTomorrowPlan, setReflectionTomorrowPlan] = useState('');

  // Available time & workload calculation
  const availableMinutes =
    userStats.dailyAvailability[todayDate] !== undefined
      ? userStats.dailyAvailability[todayDate]
      : userStats.defaultAvailabilityMinutes || 300;

  const workload = calculateWorkload(tasks, availableMinutes, todayDate);
  const nextMove = getNextBestMove(tasks, goals, workload);

  const todayTasks = tasks.filter((t) => t.scheduledDate === todayDate);
  const completedTodayTasks = todayTasks.filter((t) => t.status === 'completed');
  const pendingTodayTasks = todayTasks.filter((t) => t.status !== 'completed');

  // Quick recommend a task fitting free time
  const remainingFreeMins = Math.max(0, workload.remainingMinutes);
  const fittingTask = pendingTodayTasks.find(
    (t) => t.estimatedMinutes <= (remainingFreeMins > 0 ? remainingFreeMins : 30)
  );

  const handleStartTask = (taskId: string, mins: number) => {
    setFocusTimer({
      isRunning: true,
      secondsElapsed: 0,
      targetMinutes: mins || 25,
      activeTaskId: taskId,
      startedAtTimestamp: Date.now(),
    });
    onOpenFocus(taskId);
  };

  const handleSaveIntention = () => {
    if (intentionInput.trim()) {
      setDailyIntention(todayDate, intentionInput.trim());
      setIsEditingIntention(false);
    }
  };

  const handleSetAvailableHours = (hours: number) => {
    const mins = hours * 60;
    updateUserStats({
      dailyAvailability: {
        ...userStats.dailyAvailability,
        [todayDate]: mins,
      },
    });
  };

  const handleAddSubtask = (taskId: string) => {
    if (!newSubtaskTitle.trim()) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const existingSubtasks = task.subtasks || [];
    const updatedSubtasks = [
      ...existingSubtasks,
      {
        id: `st-${Date.now()}`,
        title: newSubtaskTitle.trim(),
        completed: false,
      },
    ];
    updateTask(taskId, { subtasks: updatedSubtasks });
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || !task.subtasks) return;

    const updated = task.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    updateTask(taskId, { subtasks: updated });
  };

  const handleSaveReflection = () => {
    setDailyReflection(todayDate, {
      wentWell: reflectionWentWell || 'Made solid progress today.',
      completed:
        reflectionCompletedNote ||
        `${completedTodayTasks.length} tasks completed today.`,
      needsImprovement: reflectionTomorrowPlan || 'Carry forward open items.',
    });
    setShowReflectionModal(false);
  };

  const formatHoursMins = (mins: number) => {
    const h = Math.floor(Math.abs(mins) / 60);
    const m = Math.abs(mins) % 60;
    return `${h > 0 ? `${h}h ` : ''}${m}m`;
  };

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden text-xs select-none">
      {/* Left/Main Column: Intention, Priorities, Task List */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 border-r border-white/5">
        {/* Daily Intention Banner */}
        <div
          className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
            isLight
              ? 'bg-gradient-to-r from-violet-50 to-indigo-50 border-violet-200 shadow-sm'
              : 'bg-[#121626] border-violet-500/25 shadow-lg shadow-violet-500/5'
          }`}
        >
          <div className="text-[10px] uppercase font-bold text-[#A78BFA] tracking-wider mb-1 flex items-center justify-between">
            <span>Daily intention</span>
            {!isEditingIntention && currentDailyLog.intention && (
              <button
                onClick={() => setIsEditingIntention(true)}
                className="text-[#67E8F9] hover:underline cursor-pointer flex items-center gap-1 font-normal"
              >
                <Edit2 size={10} />
                <span>Change</span>
              </button>
            )}
          </div>

          {isEditingIntention ? (
            <div className="space-y-2 mt-1">
              <label className="block text-xs font-semibold text-white/90">
                What's the one thing you'd be glad you finished today?
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={intentionInput}
                  onChange={(e) => setIntentionInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveIntention()}
                  placeholder="e.g., Complete project proposal and go for a run"
                  className={`flex-1 px-3 py-1.5 rounded-xl border text-xs focus:outline-none ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-800 focus:border-violet-500'
                      : 'bg-black/40 border-white/10 text-white focus:border-violet-400'
                  }`}
                />
                <button
                  onClick={handleSaveIntention}
                  className="px-3 py-1.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold text-xs cursor-pointer shadow-sm transition-all"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="text-sm font-semibold text-white mt-0.5">
              "{currentDailyLog.intention}"
            </div>
          )}
        </div>

        {/* Next Task Suggestion */}
        {nextMove && nextMove.task && (
          <div
            className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
              isLight
                ? 'bg-white border-slate-200 shadow-sm'
                : 'bg-[#151928] border-violet-500/30'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-violet-500/20 text-[#A78BFA] flex items-center justify-center shrink-0">
                <Sparkles size={16} />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-[#A78BFA] font-bold uppercase tracking-wider">
                  Recommended next move
                </div>
                <div className="font-bold text-sm text-white truncate">
                  {nextMove.task.title}
                </div>
                <div className="text-[11px] text-[#939BB0]">
                  {nextMove.task.estimatedMinutes} min · {nextMove.task.priority} priority
                </div>
              </div>
            </div>

            <button
              onClick={() =>
                handleStartTask(nextMove.task.id, nextMove.task.estimatedMinutes)
              }
              className="px-3.5 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold shadow-md shadow-violet-500/20 flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              <Play size={11} className="fill-current" />
              <span>Start</span>
            </button>
          </div>
        )}

        {/* Task List Header & Add Button */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm">Today's priorities</h3>
            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-[#939BB0]">
              {completedTodayTasks.length}/{todayTasks.length} done
            </span>
          </div>

          <button
            onClick={onOpenTaskModal}
            className="px-3 py-1.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={13} />
            <span>Add task</span>
          </button>
        </div>

        {/* Tasks List */}
        <div className="space-y-2">
          {todayTasks.length > 0 ? (
            todayTasks.map((task: Task) => {
              const isCompleted = task.status === 'completed';
              const isExpanded = expandedTaskId === task.id;
              const goal = goals.find((g) => g.id === task.goalId);
              const subtasks = task.subtasks || [];
              const completedSubtasks = subtasks.filter((s) => s.completed).length;

              const priorityBadge =
                task.priority === 'critical' || task.priority === 'high'
                  ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                  : task.priority === 'medium'
                  ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                  : 'text-slate-400 bg-slate-500/10 border-slate-500/20';

              return (
                <div
                  key={task.id}
                  className={`rounded-2xl border transition-all ${
                    isLight
                      ? isCompleted
                        ? 'bg-slate-50 border-slate-200 opacity-60'
                        : 'bg-white border-slate-200 shadow-sm'
                      : isCompleted
                      ? 'bg-white/[0.02] border-white/5 opacity-60'
                      : 'bg-[#101420] border-white/10 hover:border-violet-500/30'
                  }`}
                >
                  {/* Main Task Row */}
                  <div className="p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleTaskComplete(task.id)}
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                          isCompleted
                            ? 'bg-[#67E8F9] border-[#67E8F9] text-black'
                            : 'border-white/30 hover:border-white/60 text-transparent'
                        }`}
                        title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
                      >
                        <CheckCircle2 size={13} className="stroke-[3]" />
                      </button>

                      {/* Title & Metadata */}
                      <div
                        onClick={() =>
                          setExpandedTaskId(isExpanded ? null : task.id)
                        }
                        className="min-w-0 flex-1 cursor-pointer"
                      >
                        <div
                          className={`font-semibold text-xs truncate ${
                            isCompleted ? 'line-through text-[#939BB0]' : 'text-white'
                          }`}
                        >
                          {task.title}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-[#939BB0] mt-0.5">
                          <span>{task.estimatedMinutes} min</span>
                          {goal && (
                            <>
                              <span>•</span>
                              <span className="text-[#A78BFA] truncate max-w-[120px]">
                                {goal.title}
                              </span>
                            </>
                          )}
                          {subtasks.length > 0 && (
                            <>
                              <span>•</span>
                              <span>
                                {completedSubtasks}/{subtasks.length} subtasks
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-mono border ${priorityBadge}`}
                      >
                        {task.priority}
                      </span>

                      {!isCompleted && (
                        <button
                          onClick={() =>
                            handleStartTask(task.id, task.estimatedMinutes)
                          }
                          className="p-1.5 rounded-lg bg-violet-600/30 hover:bg-violet-600 text-white transition-colors cursor-pointer"
                          title="Start focus on this task"
                        >
                          <Play size={11} className="fill-current" />
                        </button>
                      )}

                      <button
                        onClick={() =>
                          setExpandedTaskId(isExpanded ? null : task.id)
                        }
                        className="p-1.5 rounded-lg hover:bg-white/5 text-[#939BB0] cursor-pointer"
                        title="Show task details"
                      >
                        <ChevronDown
                          size={13}
                          className={`transition-transform duration-200 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Task Details (Subtasks, Notes, Actions) */}
                  {isExpanded && (
                    <div className="px-3 pb-3 pt-1 border-t border-white/5 space-y-3 bg-black/15 rounded-b-2xl">
                      {/* Task Note */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-[#939BB0] font-semibold uppercase flex items-center gap-1">
                          <FileText size={10} />
                          <span>Note</span>
                        </label>
                        <input
                          type="text"
                          defaultValue={task.notes || ''}
                          placeholder="Add a note or link..."
                          onBlur={(e) =>
                            updateTask(task.id, { notes: e.target.value })
                          }
                          className="w-full px-2.5 py-1 rounded-lg bg-black/30 border border-white/10 text-white text-xs focus:outline-none focus:border-violet-500"
                        />
                      </div>

                      {/* Subtasks Section */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-[#939BB0] font-semibold uppercase flex items-center gap-1">
                          <ListTodo size={10} />
                          <span>Subtasks</span>
                        </label>

                        {subtasks.map((st) => (
                          <div
                            key={st.id}
                            className="flex items-center gap-2 py-0.5 text-xs"
                          >
                            <input
                              type="checkbox"
                              checked={st.completed}
                              onChange={() =>
                                handleToggleSubtask(task.id, st.id)
                              }
                              className="rounded border-white/20 cursor-pointer"
                            />
                            <span
                              className={
                                st.completed
                                  ? 'line-through text-[#939BB0]'
                                  : 'text-white'
                              }
                            >
                              {st.title}
                            </span>
                          </div>
                        ))}

                        {/* Add Subtask Row */}
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            placeholder="Add subtask..."
                            value={newSubtaskTitle}
                            onChange={(e) => setNewSubtaskTitle(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === 'Enter' && handleAddSubtask(task.id)
                            }
                            className="flex-1 px-2.5 py-1 rounded-lg bg-black/30 border border-white/10 text-white text-xs focus:outline-none focus:border-violet-500"
                          />
                          <button
                            onClick={() => handleAddSubtask(task.id)}
                            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer"
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      {/* Task Actions: Reschedule, Priority, Delete */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const tomorrow = new Date();
                              tomorrow.setDate(tomorrow.getDate() + 1);
                              const tomorrowStr = tomorrow
                                .toISOString()
                                .split('T')[0];
                              updateTask(task.id, { scheduledDate: tomorrowStr });
                            }}
                            className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#939BB0] hover:text-white text-[10px] font-medium transition-colors cursor-pointer"
                          >
                            Move to tomorrow
                          </button>

                          <select
                            value={task.priority}
                            onChange={(e) =>
                              updateTask(task.id, {
                                priority: e.target.value as Task['priority'],
                              })
                            }
                            className="px-2 py-1 rounded-lg bg-black/40 border border-white/10 text-[10px] text-white focus:outline-none cursor-pointer"
                          >
                            <option value="low">Low priority</option>
                            <option value="medium">Medium priority</option>
                            <option value="high">High priority</option>
                            <option value="critical">Critical</option>
                          </select>
                        </div>

                        {taskToDelete === task.id ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-rose-400">
                              Delete task?
                            </span>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="px-2 py-0.5 rounded bg-rose-500 text-white font-bold text-[10px] cursor-pointer"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setTaskToDelete(null)}
                              className="px-2 py-0.5 rounded bg-white/10 text-white text-[10px] cursor-pointer"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setTaskToDelete(task.id)}
                            className="p-1 rounded hover:bg-rose-500/20 text-[#939BB0] hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete task"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 border border-dashed border-white/10 rounded-2xl p-4 text-[#939BB0]">
              <p>No tasks planned for today.</p>
              <button
                onClick={onOpenTaskModal}
                className="mt-2 text-[#67E8F9] hover:underline font-semibold cursor-pointer"
              >
                + Add your first task
              </button>
            </div>
          )}
        </div>

        {/* End of Day Reflection Banner */}
        <div className="pt-2">
          <button
            onClick={() => setShowReflectionModal(true)}
            className="w-full py-2.5 px-3 rounded-xl border border-white/10 hover:border-violet-500/40 bg-white/5 hover:bg-white/10 text-white font-semibold flex items-center justify-between text-xs transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Sunset size={14} className="text-[#A78BFA]" />
              <span>Complete end-of-day reflection</span>
            </div>
            <ArrowRight size={12} className="text-[#939BB0]" />
          </button>
        </div>
      </div>

      {/* Right Column: Time Availability, Timeline, Reflection */}
      <div className="w-full md:w-60 lg:w-64 p-4 sm:p-5 space-y-5 shrink-0 bg-black/10 overflow-y-auto">
        {/* Available Time Dial & Presets */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#939BB0]">
            <span>Available time today</span>
          </div>

          <div className="flex items-baseline gap-1.5 font-bold">
            <span className="text-xl text-white">
              {formatHoursMins(workload.remainingMinutes)}
            </span>
            <span className="text-xs text-[#939BB0]">
              free of {formatHoursMins(availableMinutes)}
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                workload.diffMinutes < 0 ? 'bg-rose-500' : 'bg-[#67E8F9]'
              }`}
              style={{
                width: `${Math.min(100, workload.percentUtilized || 65)}%`,
              }}
            />
          </div>

          {/* Quick Availability Adjusters */}
          <div className="flex items-center justify-between gap-1 pt-1">
            <span className="text-[10px] text-[#939BB0]">Set hours:</span>
            {[2, 4, 6, 8].map((hrs) => (
              <button
                key={hrs}
                onClick={() => handleSetAvailableHours(hrs)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-colors ${
                  Math.round(availableMinutes / 60) === hrs
                    ? 'bg-violet-600 text-white font-bold'
                    : 'bg-white/5 hover:bg-white/10 text-[#939BB0]'
                }`}
              >
                {hrs}h
              </button>
            ))}
          </div>
        </div>

        {/* Task Recommendation Fitting Free Time */}
        {fittingTask && remainingFreeMins > 0 && (
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 space-y-1.5">
            <div className="text-[10px] font-bold uppercase text-[#67E8F9] flex items-center gap-1">
              <Clock size={11} />
              <span>Fits your available time</span>
            </div>
            <div className="font-semibold text-xs text-white truncate">
              {fittingTask.title}
            </div>
            <div className="text-[10px] text-[#939BB0]">
              Takes {fittingTask.estimatedMinutes} min
            </div>
            <button
              onClick={() =>
                handleStartTask(fittingTask.id, fittingTask.estimatedMinutes)
              }
              className="mt-1 px-3 py-1 rounded-lg bg-[#67E8F9] hover:bg-[#38BDF8] text-black font-bold text-[11px] cursor-pointer transition-colors flex items-center gap-1"
            >
              <Play size={10} className="fill-current" />
              <span>Focus now</span>
            </button>
          </div>
        )}

        {/* Daily Schedule Timeline */}
        <div className="space-y-2 pt-2 border-t border-white/5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#939BB0]">
            <span>Schedule timeline</span>
            {onOpenPlanner && (
              <button
                onClick={onOpenPlanner}
                className="text-[10px] text-[#A78BFA] hover:underline cursor-pointer"
              >
                Planner
              </button>
            )}
          </div>

          <div className="space-y-2 text-xs">
            {/* Morning */}
            <div className="flex items-start gap-2.5">
              <div className="p-1 rounded bg-amber-500/20 text-amber-400 mt-0.5">
                <Sunrise size={11} />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-[#939BB0] font-mono">
                  Morning (8am - 12pm)
                </div>
                <div className="font-medium text-white truncate">
                  Deep work & planning
                </div>
              </div>
            </div>

            {/* Afternoon */}
            <div className="flex items-start gap-2.5">
              <div className="p-1 rounded bg-cyan-400/20 text-[#67E8F9] mt-0.5">
                <Sun size={11} />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-[#939BB0] font-mono">
                  Afternoon (12pm - 5pm)
                </div>
                <div className="font-medium text-white truncate">
                  Execution & active tasks
                </div>
              </div>
            </div>

            {/* Evening */}
            <div className="flex items-start gap-2.5">
              <div className="p-1 rounded bg-violet-400/20 text-[#A78BFA] mt-0.5">
                <Sunset size={11} />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-[#939BB0] font-mono">
                  Evening (5pm - 9pm)
                </div>
                <div className="font-medium text-white truncate">
                  Review & personal routines
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Goals Quick Link */}
        <div className="pt-2 border-t border-white/5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#939BB0] mb-2">
            <span>Active goals</span>
            <button
              onClick={onOpenGoals}
              className="text-[10px] text-[#A78BFA] hover:underline cursor-pointer"
            >
              All goals
            </button>
          </div>

          <div className="space-y-2">
            {goals.slice(0, 2).map((goal) => {
              const comp = goal.milestones.filter(
                (m) => m.status === 'completed'
              ).length;
              const pct =
                goal.milestones.length > 0
                  ? Math.round((comp / goal.milestones.length) * 100)
                  : 50;

              return (
                <div key={goal.id} className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-medium">
                    <span className="truncate">{goal.title}</span>
                    <span className="text-[#67E8F9] font-mono">{pct}%</span>
                  </div>
                  <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* End-of-Day Reflection Modal */}
      {showReflectionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md p-5 rounded-2xl border shadow-2xl space-y-4 ${
              isLight
                ? 'bg-white border-slate-300 text-slate-800'
                : 'bg-[#121626] border-white/15 text-white'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Sunset size={18} className="text-[#A78BFA]" />
                <span>End-of-day check-in</span>
              </h3>
              <button
                onClick={() => setShowReflectionModal(false)}
                className="p-1 rounded hover:bg-white/10 text-[#939BB0] cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#939BB0] font-semibold mb-1">
                  What went well today?
                </label>
                <textarea
                  rows={2}
                  value={reflectionWentWell}
                  onChange={(e) => setReflectionWentWell(e.target.value)}
                  placeholder="e.g., Kept great focus on the main priority and finished on time."
                  className="w-full p-2.5 rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none focus:border-violet-500 resize-none text-xs"
                />
              </div>

              <div>
                <label className="block text-[#939BB0] font-semibold mb-1">
                  What did you complete?
                </label>
                <input
                  type="text"
                  value={reflectionCompletedNote}
                  onChange={(e) => setReflectionCompletedNote(e.target.value)}
                  placeholder={`${completedTodayTasks.length} tasks completed today`}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none focus:border-violet-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-[#939BB0] font-semibold mb-1">
                  What needs to move to tomorrow?
                </label>
                <textarea
                  rows={2}
                  value={reflectionTomorrowPlan}
                  onChange={(e) => setReflectionTomorrowPlan(e.target.value)}
                  placeholder="e.g., Pick up the remaining subtasks first thing in the morning."
                  className="w-full p-2.5 rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none focus:border-violet-500 resize-none text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setShowReflectionModal(false)}
                className="px-3.5 py-1.5 rounded-xl hover:bg-white/10 text-[#939BB0] text-xs font-semibold cursor-pointer"
              >
                Skip
              </button>
              <button
                onClick={handleSaveReflection}
                className="px-4 py-1.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold shadow-md shadow-violet-500/20 cursor-pointer"
              >
                Save reflection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
