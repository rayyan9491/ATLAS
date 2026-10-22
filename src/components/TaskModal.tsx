import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, Flag, Target, Layers } from 'lucide-react';
import { Goal, Priority, Task, DaySlot } from '../types/index.ts';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: any) => void;
  taskToEdit?: Task | null;
  goals: Goal[];
  initialDate: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  taskToEdit,
  goals,
  initialDate,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goalId, setGoalId] = useState('');
  const [milestoneId, setMilestoneId] = useState('');
  const [scheduledDate, setScheduledDate] = useState(initialDate);
  const [slot, setSlot] = useState<DaySlot>('up_next');
  const [estimatedMinutes, setEstimatedMinutes] = useState(45);
  const [priority, setPriority] = useState<Priority>('medium');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setGoalId(taskToEdit.goalId || '');
      setMilestoneId(taskToEdit.milestoneId || '');
      setScheduledDate(taskToEdit.scheduledDate);
      setSlot(taskToEdit.slot);
      setEstimatedMinutes(taskToEdit.estimatedMinutes || 45);
      setPriority(taskToEdit.priority);
      setDeadline(taskToEdit.deadline || '');
    } else {
      setTitle('');
      setDescription('');
      setGoalId(goals[0]?.id || '');
      setMilestoneId('');
      setScheduledDate(initialDate);
      setSlot('up_next');
      setEstimatedMinutes(45);
      setPriority('medium');
      setDeadline('');
    }
  }, [taskToEdit, initialDate, isOpen, goals]);

  if (!isOpen) return null;

  const selectedGoal = goals.find((g) => g.id === goalId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: taskToEdit?.id,
      title: title.trim(),
      description: description.trim() || undefined,
      goalId: goalId || undefined,
      milestoneId: milestoneId || undefined,
      scheduledDate,
      slot,
      estimatedMinutes: Number(estimatedMinutes),
      priority,
      deadline: deadline || undefined,
      status: taskToEdit ? taskToEdit.status : 'todo',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#101A2B] border border-[#294B75] rounded-2xl shadow-2xl shadow-[#3988FF]/15 overflow-hidden animate-in fade-in duration-200">
        <div className="px-6 py-4 border-b border-[#24354C] flex items-center justify-between bg-[#131F32]">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-[#59C8FF]" />
            <h2 className="text-base font-bold text-[#F0F5FF]">
              {taskToEdit ? 'Edit Task' : 'Create New Task'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#A7B6CA] hover:text-[#F0F5FF] hover:bg-[#192941] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-mono uppercase text-[#A7B6CA] mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you need to get done?"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B1220] border border-[#24354C] text-[#F0F5FF] text-sm focus:border-[#3988FF] outline-none transition-colors placeholder:text-[#7789A4]"
            />
            <p className="text-[11px] text-[#7789A4] mt-1">
              Add an assignment, revision session, personal task, or anything else you need to finish.
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-mono uppercase text-[#A7B6CA] mb-1.5">
              Details (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details or break the task into smaller steps."
              className="w-full px-3.5 py-2 rounded-xl bg-[#0B1220] border border-[#24354C] text-[#F0F5FF] text-xs focus:border-[#3988FF] outline-none transition-colors placeholder:text-[#7789A4]"
            />
          </div>

          {/* Goal & Milestone link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase text-[#A7B6CA] mb-1.5 flex items-center gap-1">
                <Target size={12} className="text-[#59C8FF]" />
                <span>Linked Goal</span>
              </label>
              <select
                value={goalId}
                onChange={(e) => {
                  setGoalId(e.target.value);
                  setMilestoneId('');
                }}
                className="w-full px-3 py-2 rounded-xl bg-[#0B1220] border border-[#24354C] text-[#F0F5FF] text-xs focus:border-[#3988FF] outline-none"
              >
                <option value="">(No Goal / Standalone)</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#A7B6CA] mb-1.5">
                Milestone
              </label>
              <select
                value={milestoneId}
                onChange={(e) => setMilestoneId(e.target.value)}
                disabled={!selectedGoal || selectedGoal.milestones.length === 0}
                className="w-full px-3 py-2 rounded-xl bg-[#0B1220] border border-[#24354C] text-[#F0F5FF] text-xs focus:border-[#3988FF] outline-none disabled:opacity-40"
              >
                <option value="">(None)</option>
                {selectedGoal?.milestones.map((m) => (
                  <option key={m.id} value={m.id}>
                    #{m.order}: {m.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Duration slider */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-mono uppercase text-[#A7B6CA] flex items-center gap-1">
                <Clock size={12} className="text-[#59C8FF]" />
                <span>Estimated Duration</span>
              </span>
              <span className="font-mono font-bold text-[#59C8FF]">{estimatedMinutes} mins</span>
            </div>
            <input
              type="range"
              min="10"
              max="240"
              step="5"
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
              className="w-full accent-[#59C8FF] bg-[#131F32] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#7789A4] mt-0.5">
              <span>10m</span>
              <span>45m</span>
              <span>90m</span>
              <span>180m</span>
              <span>240m</span>
            </div>
          </div>

          {/* Priority & Slot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase text-[#A7B6CA] mb-1.5 flex items-center gap-1">
                <Flag size={12} className="text-[#59C8FF]" />
                <span>Priority</span>
              </label>
              <div className="grid grid-cols-4 gap-1">
                {(['low', 'medium', 'high', 'critical'] as Priority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-1.5 text-[11px] font-mono uppercase rounded-lg border transition-all ${
                      priority === p
                        ? p === 'critical'
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold'
                          : p === 'high'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                          : 'bg-[#3988FF]/20 border-[#3988FF] text-[#59C8FF] font-bold'
                        : 'bg-[#0B1220] border-[#24354C] text-[#A7B6CA] hover:text-[#F0F5FF]'
                    }`}
                  >
                    {p.slice(0, 4)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#A7B6CA] mb-1.5">
                Day Slot
              </label>
              <select
                value={slot}
                onChange={(e) => setSlot(e.target.value as DaySlot)}
                className="w-full px-3 py-2 rounded-xl bg-[#0B1220] border border-[#24354C] text-[#F0F5FF] text-xs focus:border-[#3988FF] outline-none"
              >
                <option value="focus_now">Focus Now (Top Priority)</option>
                <option value="up_next">Up Next</option>
                <option value="later">Later Today</option>
              </select>
            </div>
          </div>

          {/* Date & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase text-[#A7B6CA] mb-1.5 flex items-center gap-1">
                <Calendar size={12} className="text-[#59C8FF]" />
                <span>Scheduled Date</span>
              </label>
              <input
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0B1220] border border-[#24354C] text-[#F0F5FF] text-xs focus:border-[#3988FF] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#A7B6CA] mb-1.5">
                Hard Deadline (Optional)
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0B1220] border border-[#24354C] text-[#F0F5FF] text-xs focus:border-[#3988FF] outline-none"
              />
            </div>
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-[#24354C] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#A7B6CA] hover:text-[#F0F5FF] hover:bg-[#131F32] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl btn-electric-primary font-semibold text-xs"
            >
              {taskToEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
