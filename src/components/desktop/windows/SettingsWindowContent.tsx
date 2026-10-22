import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Monitor,
  Shield,
  Download,
  Trash2,
  RotateCcw,
  Sliders,
  Bell,
  Clock,
  Sparkles,
  Layers,
  Info,
  Check,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext.tsx';
import { useApp } from '../../../context/AppContext.tsx';
import { useTheme } from '../../../context/ThemeContext.tsx';

interface SettingsWindowContentProps {
  onResetLayout?: () => void;
}

export const SettingsWindowContent: React.FC<SettingsWindowContentProps> = ({
  onResetLayout,
}) => {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';
  const {
    preferences,
    updatePreferences,
    exportUserData,
    clearAllUserData,
    clearCoachHistory,
    resetToDemoData,
  } = useApp();

  const [activeSection, setActiveSection] = useState<
    'appearance' | 'desktop' | 'planning' | 'focus' | 'coach' | 'privacy' | 'about'
  >('appearance');

  const [resetConfirm, setResetConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  return (
    <div className="h-full flex text-xs select-none overflow-hidden">
      {/* Sidebar Navigation */}
      <div className="w-36 p-3 space-y-1 border-r border-white/5 bg-black/20 shrink-0 overflow-y-auto">
        <button
          onClick={() => setActiveSection('appearance')}
          className={`w-full px-2.5 py-1.5 rounded-xl flex items-center gap-2 font-semibold transition-all cursor-pointer ${
            activeSection === 'appearance'
              ? 'bg-[#8B5CF6]/20 text-[#A78BFA] border border-violet-500/30'
              : 'text-[#939BB0] hover:text-white hover:bg-white/5'
          }`}
        >
          {isLight ? <Sun size={13} /> : <Moon size={13} />}
          <span>Appearance</span>
        </button>

        <button
          onClick={() => setActiveSection('desktop')}
          className={`w-full px-2.5 py-1.5 rounded-xl flex items-center gap-2 font-semibold transition-all cursor-pointer ${
            activeSection === 'desktop'
              ? 'bg-[#8B5CF6]/20 text-[#A78BFA] border border-violet-500/30'
              : 'text-[#939BB0] hover:text-white hover:bg-white/5'
          }`}
        >
          <Monitor size={13} />
          <span>Desktop</span>
        </button>

        <button
          onClick={() => setActiveSection('planning')}
          className={`w-full px-2.5 py-1.5 rounded-xl flex items-center gap-2 font-semibold transition-all cursor-pointer ${
            activeSection === 'planning'
              ? 'bg-[#8B5CF6]/20 text-[#A78BFA] border border-violet-500/30'
              : 'text-[#939BB0] hover:text-white hover:bg-white/5'
          }`}
        >
          <Sliders size={13} />
          <span>Planning</span>
        </button>

        <button
          onClick={() => setActiveSection('focus')}
          className={`w-full px-2.5 py-1.5 rounded-xl flex items-center gap-2 font-semibold transition-all cursor-pointer ${
            activeSection === 'focus'
              ? 'bg-[#8B5CF6]/20 text-[#A78BFA] border border-violet-500/30'
              : 'text-[#939BB0] hover:text-white hover:bg-white/5'
          }`}
        >
          <Clock size={13} />
          <span>Focus Room</span>
        </button>

        <button
          onClick={() => setActiveSection('coach')}
          className={`w-full px-2.5 py-1.5 rounded-xl flex items-center gap-2 font-semibold transition-all cursor-pointer ${
            activeSection === 'coach'
              ? 'bg-[#8B5CF6]/20 text-[#A78BFA] border border-violet-500/30'
              : 'text-[#939BB0] hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles size={13} />
          <span>AI Coach</span>
        </button>

        <button
          onClick={() => setActiveSection('privacy')}
          className={`w-full px-2.5 py-1.5 rounded-xl flex items-center gap-2 font-semibold transition-all cursor-pointer ${
            activeSection === 'privacy'
              ? 'bg-[#8B5CF6]/20 text-[#A78BFA] border border-violet-500/30'
              : 'text-[#939BB0] hover:text-white hover:bg-white/5'
          }`}
        >
          <Shield size={13} />
          <span>Privacy & Data</span>
        </button>

        <button
          onClick={() => setActiveSection('about')}
          className={`w-full px-2.5 py-1.5 rounded-xl flex items-center gap-2 font-semibold transition-all cursor-pointer ${
            activeSection === 'about'
              ? 'bg-[#8B5CF6]/20 text-[#A78BFA] border border-violet-500/30'
              : 'text-[#939BB0] hover:text-white hover:bg-white/5'
          }`}
        >
          <Info size={13} />
          <span>About ATLAS</span>
        </button>
      </div>

      {/* Detail Content */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
        {/* Appearance */}
        {activeSection === 'appearance' && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-white">Appearance</h3>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Theme</div>
                <div className="text-[11px] text-[#939BB0]">
                  Choose between dark and light appearance
                </div>
              </div>

              <button
                onClick={toggleTheme}
                className="px-3 py-1.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                {isLight ? <Moon size={12} /> : <Sun size={12} />}
                <span>{isLight ? 'Dark mode' : 'Light mode'}</span>
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="font-semibold text-white">Accent color</div>
              <div className="flex items-center gap-2 pt-1">
                {(['violet', 'cyan', 'emerald'] as const).map((color) => (
                  <button
                    key={color}
                    onClick={() =>
                      updatePreferences({
                        appearance: { ...preferences.appearance, accentColor: color },
                      })
                    }
                    className={`px-3 py-1.5 rounded-xl capitalize font-semibold cursor-pointer border ${
                      preferences.appearance.accentColor === color
                        ? 'border-white text-white bg-white/15'
                        : 'border-white/10 text-[#939BB0] hover:text-white'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Reduced motion</div>
                <div className="text-[11px] text-[#939BB0]">
                  Minimize window animations and transitions
                </div>
              </div>

              <input
                type="checkbox"
                checked={preferences.appearance.reducedMotion}
                onChange={(e) =>
                  updatePreferences({
                    appearance: {
                      ...preferences.appearance,
                      reducedMotion: e.target.checked,
                    },
                  })
                }
                className="rounded border-white/20 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Desktop & Windows */}
        {activeSection === 'desktop' && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-white">Desktop & Windows</h3>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Fit windows to screen</div>
                <div className="text-[11px] text-[#939BB0]">
                  Recalculate window sizes and scale cleanly to current viewport
                </div>
              </div>

              <button
                onClick={() => onResetLayout && onResetLayout()}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold cursor-pointer"
              >
                Fit layout
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Remember positions</div>
                <div className="text-[11px] text-[#939BB0]">
                  Keep window positions saved across your session
                </div>
              </div>

              <input
                type="checkbox"
                checked={preferences.desktop.rememberWindowPositions}
                onChange={(e) =>
                  updatePreferences({
                    desktop: {
                      ...preferences.desktop,
                      rememberWindowPositions: e.target.checked,
                    },
                  })
                }
                className="rounded border-white/20 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Planning */}
        {activeSection === 'planning' && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-white">Planning Preferences</h3>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Start of week</div>
                <div className="text-[11px] text-[#939BB0]">
                  Choose your starting calendar day
                </div>
              </div>

              <select
                value={preferences.planning.startOfWeek}
                onChange={(e) =>
                  updatePreferences({
                    planning: {
                      ...preferences.planning,
                      startOfWeek: e.target.value as 'monday' | 'sunday',
                    },
                  })
                }
                className="px-2.5 py-1 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none cursor-pointer"
              >
                <option value="monday">Monday</option>
                <option value="sunday">Sunday</option>
              </select>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Default task duration</div>
                <div className="text-[11px] text-[#939BB0]">
                  Estimated minutes for new tasks
                </div>
              </div>

              <select
                value={preferences.planning.defaultTaskDuration}
                onChange={(e) =>
                  updatePreferences({
                    planning: {
                      ...preferences.planning,
                      defaultTaskDuration: parseInt(e.target.value, 10),
                    },
                  })
                }
                className="px-2.5 py-1 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none cursor-pointer"
              >
                <option value={15}>15 minutes</option>
                <option value={25}>25 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>
          </div>
        )}

        {/* Focus Room */}
        {activeSection === 'focus' && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-white">Focus Room Preferences</h3>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Default duration</div>
                <div className="text-[11px] text-[#939BB0]">
                  Target minutes when opening Focus Room
                </div>
              </div>

              <select
                value={preferences.focus.defaultDuration}
                onChange={(e) =>
                  updatePreferences({
                    focus: {
                      ...preferences.focus,
                      defaultDuration: parseInt(e.target.value, 10),
                    },
                  })
                }
                className="px-2.5 py-1 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none cursor-pointer"
              >
                <option value={15}>15 minutes</option>
                <option value={25}>25 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Break suggestions</div>
                <div className="text-[11px] text-[#939BB0]">
                  Prompt for a break when a focus session concludes
                </div>
              </div>

              <input
                type="checkbox"
                checked={preferences.focus.autoBreak}
                onChange={(e) =>
                  updatePreferences({
                    focus: {
                      ...preferences.focus,
                      autoBreak: e.target.checked,
                    },
                  })
                }
                className="rounded border-white/20 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* AI Coach */}
        {activeSection === 'coach' && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-white">AI Coach Preferences</h3>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Response style</div>
                <div className="text-[11px] text-[#939BB0]">
                  Length and detail of Coach responses
                </div>
              </div>

              <select
                value={preferences.aiCoach.responseStyle}
                onChange={(e) =>
                  updatePreferences({
                    aiCoach: {
                      ...preferences.aiCoach,
                      responseStyle: e.target.value as 'concise' | 'balanced' | 'detailed',
                    },
                  })
                }
                className="px-2.5 py-1 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none cursor-pointer"
              >
                <option value="concise">Concise & direct</option>
                <option value="balanced">Balanced</option>
                <option value="detailed">In-depth & detailed</option>
              </select>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Coaching style</div>
                <div className="text-[11px] text-[#939BB0]">
                  Tone used when proposing next moves
                </div>
              </div>

              <select
                value={preferences.aiCoach.coachingStyle}
                onChange={(e) =>
                  updatePreferences({
                    aiCoach: {
                      ...preferences.aiCoach,
                      coachingStyle: e.target.value as 'supportive' | 'direct' | 'reflective',
                    },
                  })
                }
                className="px-2.5 py-1 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none cursor-pointer"
              >
                <option value="supportive">Supportive</option>
                <option value="direct">Direct & action-focused</option>
                <option value="reflective">Reflective</option>
              </select>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Conversation history</div>
                <div className="text-[11px] text-[#939BB0]">
                  Clear previous messages in the current conversation
                </div>
              </div>

              <button
                onClick={clearCoachHistory}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold cursor-pointer"
              >
                Clear history
              </button>
            </div>
          </div>
        )}

        {/* Privacy & Data */}
        {activeSection === 'privacy' && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-white">Privacy & Data</h3>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-[11px] text-[#939BB0] leading-relaxed">
              <div className="font-bold text-white text-xs">How your data works</div>
              <p>
                IRL.OS uses anonymous backend authentication. Each user profile gets an isolated internal identifier, so multiple people can use the same name without sharing records.
              </p>
              <p>
                Your display name is not a password or recovery key. Export your data regularly to keep a personal copy.
              </p>
            </div>

            {/* Export */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Export personal data</div>
                <div className="text-[11px] text-[#939BB0]">
                  Download a JSON file containing all goals, tasks, events, and focus records
                </div>
              </div>

              <button
                onClick={exportUserData}
                className="px-3.5 py-1.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Download size={12} />
                <span>Export</span>
              </button>
            </div>

            {/* Reset / Clear */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Reset starter data</div>
                <div className="text-[11px] text-[#939BB0]">
                  Restore clean starter sample goals and tasks
                </div>
              </div>

              {resetConfirm ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-rose-400">Confirm reset?</span>
                  <button
                    onClick={() => {
                      resetToDemoData();
                      setResetConfirm(false);
                    }}
                    className="px-2 py-1 rounded bg-rose-500 text-white font-bold text-[10px] cursor-pointer"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setResetConfirm(false)}
                    className="px-2 py-1 rounded bg-white/10 text-white text-[10px] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setResetConfirm(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        )}

        {/* About */}
        {activeSection === 'about' && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-white">About ATLAS</h3>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#8B5CF6] to-[#67E8F9] flex items-center justify-center font-bold text-black font-mono text-xs shadow-md">
                  ATL
                </div>
                <div>
                  <div className="font-bold text-sm text-white">ATLAS</div>
                  <div className="text-[10px] text-[#939BB0]">Version 1.0 · Desktop Edition</div>
                </div>
              </div>

              <p className="text-[11px] text-[#939BB0] leading-relaxed">
                ATLAS is a personal operating system designed to bridge the gap between human ambitions and daily reality. It provides a calm, focused workspace without corporate bloat or superficial AI gimmicks.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
