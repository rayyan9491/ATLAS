import React, { useState } from 'react';
import {
  Plus,
  Code2,
  Heart,
  Briefcase,
  ChevronRight,
  Target,
  CheckCircle2,
  Clock,
  Sparkles,
  Trash2,
  Calendar,
  Layers,
  ArrowLeft,
  PauseCircle,
  PlayCircle,
  Check,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext.tsx';
import { useTheme } from '../../../context/ThemeContext.tsx';
import { Goal, Milestone, Task } from '../../../types/index.ts';

interface GoalsWindowContentProps {
  onSelectGoal?: (goalId: string) => void;
  onOpenNewGoalModal: () => void;
  selectedGoalId?: string;
  onOpenTaskModal?: () => void;
  onOpenFocus?: (taskId?: string) => void;
}

export const GoalsWindowContent: React.FC<GoalsWindowContentProps> = ({
  onOpenNewGoalModal,
  selectedGoalId: externalSelectedGoalId,
  onOpenTaskModal,
  onOpenFocus,
}) => {
  const {
    goals,
    tasks,
    updateGoal,
    deleteGoal,
    addMilestone,
    toggleMilestone,
    deleteMilestone,
  } = useApp();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Local filter for goal status: active, completed, paused, all
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'paused'>('active');

  // Currently viewed goal details
  const [activeGoalId, setActiveGoalId] = useState<string | null>(
    externalSelectedGoalId || (goals.length > 0 ? goals[0].id : null)
  );

  // New milestone form state
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);

  const filteredGoals = goals.filter((g) => {
    if (statusFilter === 'all') return true;
    return g.status === statusFilter;
  });

  const selectedGoal = goals.find((g) => g.id === activeGoalId) || filteredGoals[0] || goals[0];

  const getGoalIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'education':
      case 'learning':
      case 'coding':
        return <Code2 size={16} className="text-[#67E8F9]" />;
      case 'health':
      case 'fitness':
        return <Heart size={16} className="text-[#FB7185]" />;
      case 'career':
      case 'business':
        return <Briefcase size={16} className="text-[#A78BFA]" />;
      default:
        return <Target size={16} className="text-[#67E8F9]" />;
    }
  };

  const handleAddMilestone = (goalId: string) => {
    if (!newMilestoneTitle.trim()) return;
    addMilestone(goalId, newMilestoneTitle.trim());
    setNewMilestoneTitle('');
  };

  // Honest next step recommendation for this goal
  const getGoalNextStep = (goal: Goal) => {
    const nextMilestone = goal.milestones.find((m) => m.status !== 'completed');
    if (nextMilestone) {
      return `Next milestone: "${nextMilestone.title}"`;
    }
    const unfinishedTask = tasks.find((t) => t.goalId === goal.id && t.status !== 'completed');
    if (unfinishedTask) {
      return `Next task: "${unfinishedTask.title}"`;
    }
    return 'All current milestones are complete. Add a new milestone or mark the goal finished.';
  };

  // Honest goal health observation
  const getGoalHealth = (goal: Goal) => {
    const completedCount = goal.milestones.filter((m) => m.status === 'completed').length;
    const totalCount = goal.milestones.length;
    if (goal.status === 'completed') return 'Goal achieved!';
    if (goal.status === 'paused') return 'Goal is currently paused.';
    if (totalCount === 0) return 'This goal has no milestones yet.';
    if (completedCount === totalCount) return 'All milestones completed!';
    if (completedCount > 0) return 'You are making steady progress.';
    return 'Ready to start the first milestone.';
  };

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden text-xs select-none">
      {/* Left List of Goals */}
      <div className="w-full md:w-64 lg:w-72 border-r border-white/5 flex flex-col p-3.5 space-y-3 shrink-0 overflow-y-auto">
        {/* Top Header & New Goal Button */}
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-white">Your goals</h3>
          <button
            onClick={onOpenNewGoalModal}
            className="px-2.5 py-1 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-[11px] font-bold shadow-sm transition-all flex items-center gap-1 cursor-pointer"
          >
            <Plus size={12} />
            <span>New goal</span>
          </button>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1 p-1 bg-black/30 rounded-xl border border-white/5">
          {(['active', 'completed', 'paused', 'all'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`flex-1 py-1 rounded-lg text-[10px] font-semibold capitalize transition-all cursor-pointer ${
                statusFilter === filter
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-[#939BB0] hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Goal Cards */}
        <div className="space-y-2 flex-1 overflow-y-auto pr-0.5">
          {filteredGoals.length > 0 ? (
            filteredGoals.map((goal: Goal) => {
              const completedMilestones = goal.milestones.filter(
                (m) => m.status === 'completed'
              ).length;
              const totalMilestones = goal.milestones.length;
              const pct =
                totalMilestones > 0
                  ? Math.round((completedMilestones / totalMilestones) * 100)
                  : 0;
              const isSelected = selectedGoal?.id === goal.id;

              return (
                <div
                  key={goal.id}
                  onClick={() => setActiveGoalId(goal.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                    isLight
                      ? isSelected
                        ? 'bg-violet-50 border-violet-400 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                      : isSelected
                      ? 'bg-[#151928] border-[#8B5CF6]/60 shadow-lg shadow-violet-500/10'
                      : 'bg-[#101420] border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        {getGoalIcon(goal.category)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs truncate text-white">
                          {goal.title}
                        </div>
                        <div className="text-[10px] text-[#939BB0] capitalize">
                          {goal.category}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold font-mono text-[#67E8F9]">
                      {pct}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6 text-[#939BB0] text-[11px]">
              No {statusFilter} goals found.
            </div>
          )}
        </div>
      </div>

      {/* Right Goal Workspace Details */}
      {selectedGoal ? (
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Header of Selected Goal */}
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/5">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A78BFA] bg-violet-500/10 px-2 py-0.5 rounded-md border border-violet-500/20">
                  {selectedGoal.category}
                </span>
                <span className="text-[10px] text-[#939BB0] capitalize">
                  Status: {selectedGoal.status}
                </span>
                {selectedGoal.targetDate && (
                  <span className="text-[10px] text-[#939BB0] flex items-center gap-1">
                    <Calendar size={10} />
                    <span>Target: {selectedGoal.targetDate}</span>
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {selectedGoal.title}
              </h2>
              {selectedGoal.description && (
                <p className="text-xs text-[#939BB0] leading-relaxed max-w-xl">
                  {selectedGoal.description}
                </p>
              )}
            </div>

            {/* Goal Status Controls */}
            <div className="flex items-center gap-2 shrink-0">
              {selectedGoal.status === 'active' ? (
                <button
                  onClick={() => updateGoal(selectedGoal.id, { status: 'paused' })}
                  className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#939BB0] hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Pause goal"
                >
                  <PauseCircle size={13} />
                  <span className="hidden sm:inline">Pause</span>
                </button>
              ) : (
                <button
                  onClick={() => updateGoal(selectedGoal.id, { status: 'active' })}
                  className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-400 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Resume goal"
                >
                  <PlayCircle size={13} />
                  <span className="hidden sm:inline">Resume</span>
                </button>
              )}

              {selectedGoal.status !== 'completed' && (
                <button
                  onClick={() => updateGoal(selectedGoal.id, { status: 'completed' })}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Check size={12} />
                  <span>Mark finished</span>
                </button>
              )}

              {goalToDelete === selectedGoal.id ? (
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-rose-400">Delete?</span>
                  <button
                    onClick={() => {
                      deleteGoal(selectedGoal.id);
                      setGoalToDelete(null);
                    }}
                    className="px-2 py-0.5 rounded bg-rose-500 text-white font-bold text-[10px] cursor-pointer"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setGoalToDelete(null)}
                    className="px-2 py-0.5 rounded bg-white/10 text-white text-[10px] cursor-pointer"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setGoalToDelete(selectedGoal.id)}
                  className="p-1.5 rounded-lg hover:bg-rose-500/20 text-[#939BB0] hover:text-rose-400 transition-colors cursor-pointer"
                  title="Delete goal"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Goal Health & Next Action Callout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#A78BFA] flex items-center gap-1">
                <Sparkles size={11} />
                <span>Goal health</span>
              </div>
              <div className="font-semibold text-xs text-white">
                {getGoalHealth(selectedGoal)}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#67E8F9] flex items-center gap-1">
                <Target size={11} />
                <span>Next actionable step</span>
              </div>
              <div className="font-semibold text-xs text-white truncate">
                {getGoalNextStep(selectedGoal)}
              </div>
            </div>
          </div>

          {/* Milestones Breakdown */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Layers size={14} className="text-[#A78BFA]" />
                <span>Milestones</span>
              </h3>
              <span className="text-[11px] text-[#939BB0]">
                {selectedGoal.milestones.filter((m) => m.status === 'completed').length} of{' '}
                {selectedGoal.milestones.length} completed
              </span>
            </div>

            {/* Milestones List */}
            <div className="space-y-2">
              {selectedGoal.milestones.map((m: Milestone, idx: number) => {
                const isDone = m.status === 'completed';

                return (
                  <div
                    key={m.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                      isLight
                        ? isDone
                          ? 'bg-slate-50 border-slate-200 opacity-60'
                          : 'bg-white border-slate-200'
                        : isDone
                        ? 'bg-white/[0.02] border-white/5 opacity-60'
                        : 'bg-[#101420] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => toggleMilestone(selectedGoal.id, m.id)}
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                          isDone
                            ? 'bg-emerald-400 border-emerald-400 text-black'
                            : 'border-white/30 hover:border-white/60'
                        }`}
                      >
                        {isDone && <CheckCircle2 size={13} className="stroke-[3]" />}
                      </button>

                      <div className="min-w-0">
                        <div
                          className={`font-semibold text-xs ${
                            isDone ? 'line-through text-[#939BB0]' : 'text-white'
                          }`}
                        >
                          {idx + 1}. {m.title}
                        </div>
                        {m.criteria && (
                          <div className="text-[10px] text-[#939BB0] truncate mt-0.5">
                            {m.criteria}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => deleteMilestone(selectedGoal.id, m.id)}
                      className="p-1 rounded hover:bg-rose-500/20 text-[#939BB0] hover:text-rose-400 transition-colors cursor-pointer"
                      title="Remove milestone"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Add Milestone Inline */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Add milestone for this goal..."
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddMilestone(selectedGoal.id)}
                className="flex-1 px-3 py-1.5 rounded-xl bg-black/30 border border-white/10 text-white text-xs focus:outline-none focus:border-violet-500"
              />
              <button
                onClick={() => handleAddMilestone(selectedGoal.id)}
                className="px-3 py-1.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold cursor-pointer transition-all"
              >
                Add milestone
              </button>
            </div>
          </div>

          {/* Related Tasks for this Goal */}
          <div className="space-y-3 pt-3 border-t border-white/5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">Related tasks</h3>
              {onOpenTaskModal && (
                <button
                  onClick={onOpenTaskModal}
                  className="text-[11px] text-[#67E8F9] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Plus size={11} />
                  <span>Add task</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              {tasks.filter((t) => t.goalId === selectedGoal.id).length > 0 ? (
                tasks
                  .filter((t) => t.goalId === selectedGoal.id)
                  .map((task) => (
                    <div
                      key={task.id}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <div
                          className={`font-semibold truncate ${
                            task.status === 'completed'
                              ? 'line-through text-[#939BB0]'
                              : 'text-white'
                          }`}
                        >
                          {task.title}
                        </div>
                        <div className="text-[10px] text-[#939BB0]">
                          {task.estimatedMinutes} min · {task.priority} priority
                        </div>
                      </div>

                      {task.status !== 'completed' && onOpenFocus && (
                        <button
                          onClick={() => onOpenFocus(task.id)}
                          className="px-2.5 py-1 rounded-lg bg-violet-600/30 hover:bg-violet-600 text-white font-semibold text-[11px] transition-colors cursor-pointer"
                        >
                          Focus
                        </button>
                      )}
                    </div>
                  ))
              ) : (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center text-[#939BB0] text-[11px]">
                  No tasks attached to this goal yet.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 p-8 text-center text-[#939BB0] flex flex-col items-center justify-center">
          <Target size={32} className="opacity-40 mb-2" />
          <p>Select a goal or create a new one to begin.</p>
        </div>
      )}
    </div>
  );
};
