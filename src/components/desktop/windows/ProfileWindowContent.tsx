import React, { useState } from 'react';
import {
  User,
  Edit2,
  Check,
  Star,
  Flame,
  Award,
  Clock,
  Compass,
  Plus,
  Trash2,
  LogOut,
  Target,
  X,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext.tsx';
import { useApp } from '../../../context/AppContext.tsx';
import { useTheme } from '../../../context/ThemeContext.tsx';

interface ProfileWindowContentProps {
  onSwitchProfile?: () => void;
}

export const ProfileWindowContent: React.FC<ProfileWindowContentProps> = ({
  onSwitchProfile,
}) => {
  const { userProfile, updateDisplayName, switchProfile } = useAuth();
  const {
    userStats,
    tasks,
    goals,
    focusSessions,
    preferences,
    updatePreferences,
  } = useApp();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userProfile?.displayName || 'Alex Carter');
  const [isSavingName, setIsSavingName] = useState(false);

  // Personal direction state
  const [bioInput, setBioInput] = useState(
    preferences.profile?.personalBio || 'Focused on making real progress every day.'
  );
  const [newPriority, setNewPriority] = useState('');
  const [newSkill, setNewSkill] = useState('');

  const displayName = userProfile?.displayName || userStats.displayName || 'Alex Carter';
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    setIsSavingName(true);
    try {
      await updateDisplayName(nameInput.trim());
      setIsEditingName(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingName(false);
    }
  };

  const handleSaveBio = () => {
    updatePreferences({
      profile: {
        ...preferences.profile,
        personalBio: bioInput.trim(),
      },
    });
  };

  const handleAddPriority = () => {
    if (!newPriority.trim()) return;
    const currentPriorities = preferences.profile?.priorities || [];
    updatePreferences({
      profile: {
        ...preferences.profile,
        priorities: [...currentPriorities, newPriority.trim()],
      },
    });
    setNewPriority('');
  };

  const handleRemovePriority = (index: number) => {
    const currentPriorities = preferences.profile?.priorities || [];
    updatePreferences({
      profile: {
        ...preferences.profile,
        priorities: currentPriorities.filter((_, idx) => idx !== index),
      },
    });
  };

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    const currentSkills = preferences.profile?.skillsToDevelop || [];
    updatePreferences({
      profile: {
        ...preferences.profile,
        skillsToDevelop: [...currentSkills, newSkill.trim()],
      },
    });
    setNewSkill('');
  };

  const handleRemoveSkill = (index: number) => {
    const currentSkills = preferences.profile?.skillsToDevelop || [];
    updatePreferences({
      profile: {
        ...preferences.profile,
        skillsToDevelop: currentSkills.filter((_, idx) => idx !== index),
      },
    });
  };

  const handleSwitch = async () => {
    if (window.confirm('Start a new profile? Your current data stays safely saved.')) {
      if (onSwitchProfile) onSwitchProfile();
      else await switchProfile();
    }
  };

  const totalCompletedTasks = tasks.filter((t) => t.status === 'completed').length;
  const totalFocusHours = Math.round(
    focusSessions.reduce((acc, s) => acc + (s.actualMinutes || 0), 0) / 60
  );

  return (
    <div className="h-full flex flex-col p-4 sm:p-5 overflow-y-auto text-xs space-y-5 select-none">
      {/* Identity Card */}
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#8B5CF6] to-[#67E8F9] text-black font-extrabold flex items-center justify-center text-sm shadow-md shrink-0">
            {initials || 'AC'}
          </div>

          <div className="space-y-1 min-w-0">
            {isEditingName ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-black/40 border border-violet-500 text-white text-xs focus:outline-none"
                />
                <button
                  onClick={handleSaveName}
                  disabled={isSavingName}
                  className="p-1.5 rounded-lg bg-[#8B5CF6] text-white cursor-pointer"
                  title="Save name"
                >
                  <Check size={12} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-white truncate">
                  {displayName}
                </span>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="text-[#939BB0] hover:text-white cursor-pointer"
                  title="Edit display name"
                >
                  <Edit2 size={12} />
                </button>
              </div>
            )}
            <div className="text-[11px] text-[#939BB0]">
              Personal workspace · {userProfile?.uid ? `ID: ${userProfile.uid.slice(0, 8)}...` : 'Active session'}
            </div>
          </div>
        </div>

        <button
          onClick={handleSwitch}
          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-[#939BB0] hover:text-rose-400 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <LogOut size={12} />
          <span>Switch profile</span>
        </button>
      </div>

      {/* Bio / Direction */}
      <div className="space-y-1.5">
        <label className="text-[10px] text-[#939BB0] font-semibold uppercase tracking-wider flex items-center gap-1">
          <Compass size={11} />
          <span>Personal direction</span>
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={bioInput}
            onChange={(e) => setBioInput(e.target.value)}
            onBlur={handleSaveBio}
            placeholder="What is your focus right now?"
            className="flex-1 px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-white text-xs focus:outline-none focus:border-violet-500"
          />
          <button
            onClick={handleSaveBio}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold cursor-pointer"
          >
            Save
          </button>
        </div>
      </div>

      {/* Main Priorities */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] text-[#939BB0] font-semibold uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <Target size={11} />
            <span>Main priorities</span>
          </span>
        </div>

        <div className="space-y-1.5">
          {(preferences.profile?.priorities || []).map((p, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-2"
            >
              <span className="text-white font-medium">{p}</span>
              <button
                onClick={() => handleRemovePriority(idx)}
                className="text-[#939BB0] hover:text-rose-400 cursor-pointer"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}

          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              placeholder="Add a priority..."
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddPriority()}
              className="flex-1 px-2.5 py-1.5 rounded-xl bg-black/30 border border-white/10 text-white text-xs focus:outline-none focus:border-violet-500"
            />
            <button
              onClick={handleAddPriority}
              className="px-3 py-1.5 rounded-xl bg-[#8B5CF6] text-white font-bold cursor-pointer"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Skills to Develop */}
      <div className="space-y-2">
        <div className="text-[10px] text-[#939BB0] font-semibold uppercase tracking-wider flex items-center gap-1">
          <Star size={11} />
          <span>Skills to develop</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(preferences.profile?.skillsToDevelop || []).map((skill, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-300 flex items-center gap-1.5 text-xs font-medium"
            >
              <span>{skill}</span>
              <button
                onClick={() => handleRemoveSkill(idx)}
                className="hover:text-rose-400 cursor-pointer"
              >
                <X size={10} />
              </button>
            </span>
          ))}

          <div className="flex items-center gap-1.5">
            <input
              type="text"
              placeholder="New skill..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
              className="px-2.5 py-1 rounded-xl bg-black/30 border border-white/10 text-white text-xs focus:outline-none focus:border-violet-500 max-w-[120px]"
            />
            <button
              onClick={handleAddSkill}
              className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Personal Progress Stats */}
      <div className="pt-2 border-t border-white/5 space-y-2">
        <div className="text-[10px] text-[#939BB0] font-semibold uppercase tracking-wider">
          Personal progress summary
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
            <div className="text-base font-bold font-mono text-white">
              {totalCompletedTasks}
            </div>
            <div className="text-[10px] text-[#939BB0]">Tasks completed</div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
            <div className="text-base font-bold font-mono text-white">
              {totalFocusHours}h
            </div>
            <div className="text-[10px] text-[#939BB0]">Focus logged</div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
            <div className="text-base font-bold font-mono text-white">
              {goals.length}
            </div>
            <div className="text-[10px] text-[#939BB0]">Tracked goals</div>
          </div>
        </div>
      </div>
    </div>
  );
};
