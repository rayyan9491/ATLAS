import React, { useState } from 'react';
import { User, Sun, Moon, Sparkles, Shield, LogOut, Check, Edit2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext.tsx';
import { useTheme } from '../../../context/ThemeContext.tsx';

interface ProfileSettingsWindowContentProps {
  onSwitchProfile?: () => void;
}

export const ProfileSettingsWindowContent: React.FC<ProfileSettingsWindowContentProps> = ({
  onSwitchProfile,
}) => {
  const { userProfile, updateDisplayName, switchProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'ai' | 'privacy'>('profile');
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userProfile?.displayName || 'Alex Carter');
  const [isSaving, setIsSaving] = useState(false);

  const displayName = userProfile?.displayName || 'Alex Carter';
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    setIsSaving(true);
    try {
      await updateDisplayName(nameInput.trim());
      setIsEditingName(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSwitch = async () => {
    if (window.confirm('Start a new profile? Your current goals and tasks will remain saved.')) {
      if (onSwitchProfile) {
        onSwitchProfile();
      } else {
        await switchProfile();
      }
    }
  };

  return (
    <div className="h-full flex text-xs overflow-hidden">
      {/* Left Sidebar Navigation Tabs */}
      <div className="w-36 p-3 space-y-1 border-r border-white/5 bg-black/20 shrink-0">
        <button
          onClick={() => setActiveTab('profile')}
          className={`w-full px-2.5 py-1.5 rounded-xl flex items-center gap-2 font-semibold transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-[#8B5CF6]/20 text-[#A78BFA] border border-violet-500/30'
              : 'text-[#939BB0] hover:text-white hover:bg-white/5'
          }`}
        >
          <User size={13} />
          <span>Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('appearance')}
          className={`w-full px-2.5 py-1.5 rounded-xl flex items-center gap-2 font-semibold transition-all cursor-pointer ${
            activeTab === 'appearance'
              ? 'bg-[#8B5CF6]/20 text-[#A78BFA] border border-violet-500/30'
              : 'text-[#939BB0] hover:text-white hover:bg-white/5'
          }`}
        >
          {isLight ? <Sun size={13} /> : <Moon size={13} />}
          <span>Appearance</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`w-full px-2.5 py-1.5 rounded-xl flex items-center gap-2 font-semibold transition-all cursor-pointer ${
            activeTab === 'ai'
              ? 'bg-[#8B5CF6]/20 text-[#A78BFA] border border-violet-500/30'
              : 'text-[#939BB0] hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles size={13} />
          <span>AI Adviser</span>
        </button>

        <button
          onClick={() => setActiveTab('privacy')}
          className={`w-full px-2.5 py-1.5 rounded-xl flex items-center gap-2 font-semibold transition-all cursor-pointer ${
            activeTab === 'privacy'
              ? 'bg-[#8B5CF6]/20 text-[#A78BFA] border border-violet-500/30'
              : 'text-[#939BB0] hover:text-white hover:bg-white/5'
          }`}
        >
          <Shield size={13} />
          <span>Privacy</span>
        </button>
      </div>

      {/* Right Content */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {activeTab === 'profile' && (
          <>
            {/* User Profile Card */}
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#67E8F9] text-black font-extrabold flex items-center justify-center text-xs shadow-md">
                  {initials || 'AC'}
                </div>
                <div>
                  {isEditingName ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        className="px-2 py-0.5 rounded bg-black/40 border border-violet-500 text-white text-xs"
                      />
                      <button
                        onClick={handleSaveName}
                        disabled={isSaving}
                        className="p-1 rounded bg-[#8B5CF6] text-white cursor-pointer"
                        title="Save name"
                      >
                        <Check size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="font-bold text-sm text-white">{displayName}</div>
                  )}
                  <div className="text-[10px] text-[#939BB0]">
                    Personal workspace
                  </div>
                </div>
              </div>

              {!isEditingName && (
                <button
                  onClick={() => setIsEditingName(true)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 size={11} />
                  <span>Change name</span>
                </button>
              )}
            </div>

            {/* Account Details */}
            <div className="space-y-2 text-[11px]">
              <div className="text-[10px] uppercase text-[#939BB0] font-semibold tracking-wider">
                Workspace
              </div>
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="text-[#939BB0]">Display Name</span>
                <span className="text-white/90 font-medium">{displayName}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="text-[#939BB0]">Session</span>
                <span className="text-white/90 font-mono text-[10px]">
                  {userProfile?.uid ? `ID: ${userProfile.uid.slice(0, 10)}...` : 'Active'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={handleSwitch}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-[#939BB0] hover:text-rose-400 border border-white/10 text-[11px] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut size={12} />
                <span>Switch profile</span>
              </button>
            </div>
          </>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-3">
            <div className="font-bold text-sm">Theme</div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
              <div>
                <div className="font-semibold text-white">Visual theme</div>
                <div className="text-[10px] text-[#939BB0]">Choose between dark and light appearance</div>
              </div>
              <button
                onClick={toggleTheme}
                className="px-3 py-1.5 rounded-xl bg-[#8B5CF6] text-white flex items-center gap-1.5 font-bold cursor-pointer"
              >
                {isLight ? <Moon size={12} /> : <Sun size={12} />}
                <span>{isLight ? 'Dark mode' : 'Light mode'}</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-2">
            <div className="font-bold text-sm">AI Adviser</div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <div className="text-white font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Connected & Ready</span>
              </div>
              <div className="text-[11px] text-[#939BB0]">
                The AI adviser helps you plan your day, break down milestones, and keep your priorities on track.
              </div>
            </div>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-2">
            <div className="font-bold text-sm">Privacy & Data</div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-[#939BB0] leading-relaxed">
              Your goals, tasks, and progress belong exclusively to your workspace. Each profile remains isolated with its own unique data.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
