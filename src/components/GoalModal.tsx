import React, { useState } from 'react';
import { X, Target, Plus, Trash2 } from 'lucide-react';
import { GoalCategory, Priority } from '../types/index.ts';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goalData: any, milestones: string[]) => void;
}

export const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GoalCategory>('career');
  const [priority, setPriority] = useState<Priority>('high');
  const [deadline, setDeadline] = useState('');
  const [milestones, setMilestones] = useState<string[]>([]);
  const [newMilestoneText, setNewMilestoneText] = useState('');

  if (!isOpen) return null;

  const handleAddMilestone = () => {
    if (newMilestoneText.trim()) {
      setMilestones([...milestones, newMilestoneText.trim()]);
      setNewMilestoneText('');
    }
  };

  const handleRemoveMilestone = (idx: number) => {
    setMilestones(milestones.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave(
      {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        deadline: deadline || undefined,
        status: 'active',
      },
      milestones
    );
    onClose();
  };

  const categories: GoalCategory[] = ['career', 'learning', 'fitness', 'creative', 'finance', 'lifestyle'];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#101A2B] border border-[#294B75] rounded-2xl shadow-2xl shadow-[#3988FF]/15 overflow-hidden animate-in fade-in duration-200">
        <div className="px-6 py-4 border-b border-[#24354C] flex items-center justify-between bg-[#131F32]">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-[#59C8FF]" />
            <h2 className="text-base font-bold text-[#F0F5FF]">Create Goal</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#A7B6CA] hover:text-[#F0F5FF] hover:bg-[#192941] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Helper note */}
          <p className="text-xs text-[#A7B6CA]">
            Goals can be academic, personal, or related to a skill you want to develop.
          </p>

          {/* Title */}
          <div>
            <label className="block text-xs font-mono uppercase text-[#A7B6CA] mb-1.5">
              Goal Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What are you working toward?"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B1220] border border-[#24354C] text-[#F0F5FF] text-sm focus:border-[#3988FF] outline-none transition-colors placeholder:text-[#7789A4]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-mono uppercase text-[#A7B6CA] mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what success looks like for you."
              className="w-full px-3.5 py-2 rounded-xl bg-[#0B1220] border border-[#24354C] text-[#F0F5FF] text-xs focus:border-[#3988FF] outline-none transition-colors placeholder:text-[#7789A4]"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-mono uppercase text-[#A7B6CA] mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-mono capitalize border transition-all ${
                    category === cat
                      ? 'bg-[#3988FF]/20 border-[#3988FF] text-[#59C8FF] font-bold'
                      : 'bg-[#0B1220] border-[#24354C] text-[#A7B6CA] hover:text-[#F0F5FF]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Priority & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase text-[#A7B6CA] mb-1.5">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 rounded-xl bg-[#0B1220] border border-[#24354C] text-[#F0F5FF] text-xs focus:border-[#3988FF] outline-none"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#A7B6CA] mb-1.5">
                Target Date
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="Choose a target date"
                className="w-full px-3 py-2 rounded-xl bg-[#0B1220] border border-[#24354C] text-[#F0F5FF] text-xs focus:border-[#3988FF] outline-none"
              />
            </div>
          </div>

          {/* Roadmap Milestones */}
          <div>
            <label className="block text-xs font-mono uppercase text-[#A7B6CA] mb-1.5">
              Roadmap Milestones (Optional)
            </label>
            {milestones.length > 0 ? (
              <div className="space-y-2 mb-2">
                {milestones.map((m, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#0B1220] border border-[#24354C] text-xs text-[#F0F5FF]"
                  >
                    <span className="font-mono text-[#59C8FF] shrink-0">#{idx + 1}</span>
                    <span className="flex-1 truncate">{m}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMilestone(idx)}
                      className="text-[#7789A4] hover:text-rose-400 p-1 cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-[#7789A4] italic mb-2">
                No milestones added yet. Add checkpoints below if you want to break this goal into steps.
              </p>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={newMilestoneText}
                onChange={(e) => setNewMilestoneText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddMilestone();
                  }
                }}
                placeholder="Add milestone checkpoint..."
                className="flex-1 px-3 py-1.5 rounded-lg bg-[#0B1220] border border-[#24354C] text-xs text-[#F0F5FF] focus:border-[#3988FF] outline-none placeholder:text-[#7789A4]"
              />
              <button
                type="button"
                onClick={handleAddMilestone}
                className="px-3 py-1.5 rounded-lg bg-[#131F32] hover:bg-[#192941] text-xs font-medium text-[#59C8FF] border border-[#24354C] flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Actions */}
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
              Create Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
