import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Lock,
  Plus,
  Target,
  Calendar,
  Layers,
  Sparkles,
  Zap,
  Clock,
  Check,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { Milestone, Task } from '../types/index.ts';

interface GoalDetailPageProps {
  goalId: string;
  onNavigate: (path: string) => void;
  onOpenTaskModal: (task?: Task | null) => void;
}

export const GoalDetailPage: React.FC<GoalDetailPageProps> = ({
  goalId,
  onNavigate,
  onOpenTaskModal,
}) => {
  const { goals, tasks, toggleMilestone, addMilestone, toggleTaskComplete } = useApp();
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneCriteria, setNewMilestoneCriteria] = useState('');
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);

  const goal = goals.find((g) => g.id === goalId);

  if (!goal) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
        <h2 className="text-xl font-bold text-[#F4F5FA]">Goal not found</h2>
        <p className="text-xs text-[#939BB0]">This goal may have been removed or deleted.</p>
        <button
          onClick={() => onNavigate('/app/goals')}
          className="px-4 py-2 rounded-xl bg-[#181D2B] text-xs font-semibold text-[#67E8F9]"
        >
          Return to Goals Overview
        </button>
      </div>
    );
  }

  const completedMilestones = goal.milestones.filter((m) => m.status === 'completed').length;
  const totalMilestones = Math.max(1, goal.milestones.length);
  const percent = Math.round((completedMilestones / totalMilestones) * 100);

  const activeMilestone =
    goal.milestones.find((m) => m.id === selectedMilestoneId) ||
    goal.milestones.find((m) => m.status === 'in_progress') ||
    goal.milestones[0];

  const linkedTasks = tasks.filter((t) => t.goalId === goal.id);

  const handleCreateMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim()) return;
    addMilestone(goal.id, newMilestoneTitle.trim(), newMilestoneCriteria.trim() || undefined);
    setNewMilestoneTitle('');
    setNewMilestoneCriteria('');
    setIsAddingMilestone(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top back navigation and goal header */}
      <div>
        <button
          onClick={() => onNavigate('/app/goals')}
          className="inline-flex items-center gap-1.5 text-xs text-[#939BB0] hover:text-[#F4F5FA] mb-3 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to All Goals</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#121622] border border-[#252B3B] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-32 bg-[#A78BFA]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold bg-[#A78BFA]/20 text-[#A78BFA] border border-[#A78BFA]/40">
                {goal.category}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase text-[#67E8F9] bg-[#181D2B]">
                {goal.priority} Priority
              </span>
              {goal.deadline && (
                <span className="text-[11px] font-mono text-[#939BB0] flex items-center gap-1">
                  <Calendar size={12} className="text-[#A78BFA]" />
                  <span>Target: {goal.deadline}</span>
                </span>
              )}
            </div>

            <h2 className="text-2xl font-extrabold text-[#F4F5FA] tracking-tight">{goal.title}</h2>
            <p className="text-xs text-[#939BB0] mt-1.5 leading-relaxed">{goal.description}</p>
          </div>

          <div className="relative z-10 flex flex-col items-end gap-2 shrink-0">
            <div className="text-right">
              <span className="text-2xl font-mono font-bold text-[#67E8F9]">{percent}%</span>
              <div className="text-[11px] text-[#939BB0] font-mono">
                {completedMilestones} / {totalMilestones} Milestones Completed
              </div>
            </div>
            <div className="w-48 bg-[#090A0F] h-2 rounded-full overflow-hidden border border-[#252B3B]">
              <div
                className="bg-gradient-to-r from-[#A78BFA] to-[#67E8F9] h-full rounded-full transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Visual Goal Roadmap Node Graph */}
      <div className="p-6 rounded-2xl bg-[#0D1018] border border-[#252B3B] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#252B3B]">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#A78BFA]" />
            <h3 className="text-sm font-bold text-[#F4F5FA] tracking-tight">
              Interactive Goal Map Roadmap
            </h3>
          </div>
          <button
            onClick={() => setIsAddingMilestone(!isAddingMilestone)}
            className="px-3 py-1.5 rounded-lg bg-[#181D2B] hover:bg-[#252B3B] text-xs font-medium text-[#67E8F9] border border-[#67E8F9]/30 transition-colors flex items-center gap-1"
          >
            <Plus size={13} />
            <span>Add Milestone Node</span>
          </button>
        </div>

        {/* Milestone Node Pipeline Display */}
        <div className="py-6 px-2 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[650px] relative">
            {/* Connecting line behind nodes */}
            <div className="absolute top-1/2 left-8 right-8 h-1 -translate-y-1/2 bg-[#181D2B] z-0" />

            {goal.milestones.map((m, index) => {
              const isCompleted = m.status === 'completed';
              const isInProgress = m.status === 'in_progress';
              const isSelected = activeMilestone?.id === m.id;

              return (
                <div key={m.id} className="relative z-10 flex flex-col items-center group">
                  {/* Glowing Node Button */}
                  <button
                    onClick={() => setSelectedMilestoneId(m.id)}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center font-mono font-bold text-sm transition-all duration-300 relative ${
                      isCompleted
                        ? 'bg-[#A78BFA] text-black shadow-lg shadow-violet-500/30 scale-105'
                        : isInProgress
                        ? 'bg-[#121622] text-[#67E8F9] border-2 border-[#67E8F9] shadow-lg shadow-cyan-500/30 ring-4 ring-cyan-500/10'
                        : 'bg-[#121622] text-[#939BB0] border border-[#252B3B] hover:border-[#939BB0]'
                    } ${isSelected ? 'ring-2 ring-white scale-110' : ''}`}
                    aria-label={`Milestone ${m.order}: ${m.title}`}
                  >
                    {isCompleted ? (
                      <Check size={22} strokeWidth={3} />
                    ) : isInProgress ? (
                      <span className="animate-pulse">#{m.order}</span>
                    ) : (
                      <span>#{m.order}</span>
                    )}
                  </button>

                  {/* Node label */}
                  <div className="mt-3 text-center max-w-[130px]">
                    <div
                      className={`text-xs font-semibold truncate ${
                        isSelected ? 'text-[#67E8F9]' : 'text-[#F4F5FA]'
                      }`}
                    >
                      {m.title}
                    </div>
                    <span
                      className={`text-[10px] font-mono uppercase block ${
                        isCompleted
                          ? 'text-[#4ADE80]'
                          : isInProgress
                          ? 'text-[#67E8F9]'
                          : 'text-[#939BB0]'
                      }`}
                    >
                      {m.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* New Milestone Form */}
        {isAddingMilestone && (
          <form
            onSubmit={handleCreateMilestone}
            className="p-4 rounded-xl bg-[#121622] border border-[#A78BFA]/40 space-y-3 animate-in fade-in"
          >
            <div className="font-bold text-xs text-[#A78BFA] uppercase font-mono">
              New Milestone Checkpoint
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                required
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                placeholder="Milestone title (e.g. Conduct pilot beta with 5 users)"
                className="px-3.5 py-2 rounded-xl bg-[#090A0F] border border-[#252B3B] text-xs text-[#F4F5FA] focus:border-[#A78BFA] outline-none"
              />
              <input
                type="text"
                value={newMilestoneCriteria}
                onChange={(e) => setNewMilestoneCriteria(e.target.value)}
                placeholder="Completion criteria (e.g. 5 documented feedback calls)"
                className="px-3.5 py-2 rounded-xl bg-[#090A0F] border border-[#252B3B] text-xs text-[#F4F5FA] focus:border-[#A78BFA] outline-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddingMilestone(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-[#939BB0] hover:text-[#F4F5FA]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-[#A78BFA] text-black font-semibold text-xs"
              >
                Save Milestone
              </button>
            </div>
          </form>
        )}

        {/* Selected Milestone Detail Inspector Card */}
        {activeMilestone && (
          <div className="p-5 rounded-xl bg-[#121622] border border-[#252B3B] space-y-3 mt-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#A78BFA] font-bold">
                  Milestone #{activeMilestone.order} Inspector
                </span>
                <h4 className="text-base font-bold text-[#F4F5FA] mt-0.5">
                  {activeMilestone.title}
                </h4>
                {activeMilestone.description && (
                  <p className="text-xs text-[#939BB0] mt-1">{activeMilestone.description}</p>
                )}
                {activeMilestone.criteria && (
                  <div className="mt-2 text-xs text-[#67E8F9] font-mono bg-[#090A0F] p-2 rounded-lg border border-[#252B3B]">
                    Criteria for completion: {activeMilestone.criteria}
                  </div>
                )}
              </div>

              {/* Toggle Milestone Complete Button */}
              <button
                onClick={() => toggleMilestone(goal.id, activeMilestone.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
                  activeMilestone.status === 'completed'
                    ? 'bg-[#181D2B] text-[#4ADE80] border border-[#4ADE80]/40'
                    : 'bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] text-black hover:opacity-95 shadow-md shadow-violet-500/20'
                }`}
              >
                <CheckCircle2 size={15} />
                <span>
                  {activeMilestone.status === 'completed'
                    ? 'Milestone Satisfied'
                    : 'Mark Milestone Complete'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Linked Tasks Section for this Goal */}
      <div className="p-6 rounded-2xl bg-[#0D1018] border border-[#252B3B] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#252B3B]">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-[#67E8F9]" />
            <h3 className="text-sm font-bold text-[#F4F5FA] tracking-tight">
              Actionable Tasks Supporting This Goal ({linkedTasks.length})
            </h3>
          </div>
          <button
            onClick={() => onOpenTaskModal(null)}
            className="px-3.5 py-1.5 rounded-lg bg-[#181D2B] hover:bg-[#252B3B] text-xs font-semibold text-[#A78BFA] border border-[#A78BFA]/30 flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>Add Task to Goal</span>
          </button>
        </div>

        {linkedTasks.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#939BB0] italic">
            No tasks directly linked to this goal yet. Add tasks to start making verifiable progress.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {linkedTasks.map((task) => {
              const isCompleted = task.status === 'completed';
              return (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                    isCompleted
                      ? 'bg-[#121622]/60 border-[#252B3B] opacity-75'
                      : 'bg-[#121622] border-[#252B3B]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => toggleTaskComplete(task.id)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                        isCompleted
                          ? 'bg-[#4ADE80] border-[#4ADE80] text-black font-bold'
                          : 'border-[#939BB0]/40'
                      }`}
                    >
                      {isCompleted && <Check size={12} strokeWidth={3} />}
                    </button>
                    <div className="min-w-0">
                      <div
                        className={`text-xs font-semibold truncate ${
                          isCompleted ? 'line-through text-[#939BB0]' : 'text-[#F4F5FA]'
                        }`}
                      >
                        {task.title}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-[#939BB0] mt-0.5">
                        <span>{task.estimatedMinutes}m</span>
                        <span className="uppercase text-[#A78BFA]">{task.priority}</span>
                        <span>Scheduled: {task.scheduledDate}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase ${
                      isCompleted ? 'text-[#4ADE80] bg-[#4ADE80]/10' : 'text-[#67E8F9] bg-[#181D2B]'
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
