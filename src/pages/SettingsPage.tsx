import React, { useState } from 'react';
import {
  RotateCcw,
  Sliders,
  Bell,
  Eye,
  Laptop,
  Check,
  Moon,
  Sun,
  Shield,
  Download,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useTheme } from '../context/ThemeContext.tsx';

interface SettingsPageProps {
  onNavigate: (path: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const { theme, toggleTheme } = useTheme();
  const { userProfile, updateUserProfile } = useAuth();
  const { userStats, updateUserStats, resetToDemoData } = useApp();

  const [settingsEmail, setSettingsEmail] = useState(userProfile?.email || '');
  const [emailSaved, setEmailSaved] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'appearance' | 'sidebar' | 'notifications' | 'focus' | 'system'>('focus');

  // Focus settings state matching Image 9
  const [warningPopup, setWarningPopup] = useState(true);
  const [clockWindow, setClockWindow] = useState(false);
  const [timeExceededNotifications, setTimeExceededNotifications] = useState(true);
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [autoEndSession, setAutoEndSession] = useState(true);
  const [autoStartBreaks, setAutoStartBreaks] = useState(false);
  const [autoStartNextSession, setAutoStartNextSession] = useState(false);

  // Appearance state
  const [waveIntensity, setWaveIntensity] = useState<'subtle' | 'high' | 'off'>('subtle');
  const [reducedMotion, setReducedMotion] = useState(false);

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: Eye },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'focus', label: 'Focus Mode', icon: Sliders },
  ];

  const handleResetToDefaults = () => {
    setWarningPopup(true);
    setClockWindow(false);
    setTimeExceededNotifications(true);
    setFocusDuration(25);
    setBreakDuration(5);
    setAutoEndSession(true);
    setAutoStartBreaks(false);
    setAutoStartNextSession(false);
  };

  const handleExportData = () => {
    const backup = {
      userStats,
      exportedAt: new Date().toISOString(),
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'IRL_OS_Backup.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Top Header (Matches Image 9) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#24354C]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F0F5FF]">
            Settings
          </h1>
          <p className="text-xs sm:text-sm text-[#A7B6CA] mt-0.5">
            Personalize IRL.OS to match your study habits and workflow.
          </p>
        </div>

        <button
          onClick={handleResetToDefaults}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold btn-electric-secondary transition-all cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#59C8FF]" />
          <span>Reset to Defaults</span>
        </button>
      </div>

      {/* Tabs Header (Matches Image 9) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#24354C] no-scrollbar">
        {tabs.map((tab) => {
          const isSelected = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-[#192941] text-[#59C8FF] border border-[#294B75] font-semibold shadow-sm'
                  : 'text-[#A7B6CA] hover:text-[#F0F5FF]'
              }`}
            >
              <Icon className="w-4 h-4 text-[#59C8FF]" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents: FOCUS MODE (Matches Image 9) */}
      {activeTab === 'focus' && (
        <div className="space-y-6">
          {/* Section 1: Focus Session Settings (Matches Image 9) */}
          <div className="rounded-2xl bg-[#101A2B] border border-[#24354C] p-6 space-y-5 shadow-sm">
            <div>
              <h2 className="text-base font-bold text-[#F0F5FF]">Focus Session Settings</h2>
              <p className="text-xs text-[#A7B6CA]">
                Control warnings and notifications during focus sessions
              </p>
            </div>

            <div className="space-y-4 pt-2">
              {/* Warning Pop-up */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-[#F0F5FF]">Warning Pop-up</div>
                  <div className="text-xs text-[#A7B6CA]">
                    Show warning pop-up when accessing blocked sites during focus
                  </div>
                </div>
                <button
                  onClick={() => setWarningPopup((p) => !p)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    warningPopup ? 'bg-gradient-to-r from-[#2563EB] to-[#3988FF]' : 'bg-[#131F32] border border-[#24354C]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      warningPopup ? 'left-6 shadow-sm shadow-[#59C8FF]/50' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Clock Window */}
              <div className="flex items-center justify-between pt-3 border-t border-[#24354C]">
                <div>
                  <div className="text-sm font-semibold text-[#F0F5FF]">Clock Window</div>
                  <div className="text-xs text-[#A7B6CA]">
                    Show floating clock window when starting focus sessions
                  </div>
                </div>
                <button
                  onClick={() => setClockWindow((p) => !p)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    clockWindow ? 'bg-gradient-to-r from-[#2563EB] to-[#3988FF]' : 'bg-[#131F32] border border-[#24354C]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      clockWindow ? 'left-6 shadow-sm shadow-[#59C8FF]/50' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Time Exceeded Notifications */}
              <div className="flex items-center justify-between pt-3 border-t border-[#24354C]">
                <div>
                  <div className="text-sm font-semibold text-[#F0F5FF]">Time Exceeded Notifications</div>
                  <div className="text-xs text-[#A7B6CA]">
                    Notify when focus session exceeds target duration
                  </div>
                </div>
                <button
                  onClick={() => setTimeExceededNotifications((p) => !p)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    timeExceededNotifications ? 'bg-gradient-to-r from-[#2563EB] to-[#3988FF]' : 'bg-[#131F32] border border-[#24354C]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      timeExceededNotifications ? 'left-6 shadow-sm shadow-[#59C8FF]/50' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Default Durations (Matches Image 9 with sliders) */}
          <div className="rounded-2xl bg-[#101A2B] border border-[#24354C] p-6 space-y-6 shadow-sm">
            <div>
              <h2 className="text-base font-bold text-[#F0F5FF]">Default Durations</h2>
              <p className="text-xs text-[#A7B6CA]">
                Set your preferred focus and break session lengths
              </p>
            </div>

            <div className="space-y-6 pt-2">
              {/* Focus Duration Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm font-medium">
                  <span className="text-[#F0F5FF]">Focus Duration</span>
                  <span className="font-mono text-[#59C8FF] font-bold">{focusDuration} minutes</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="60"
                  step="5"
                  value={focusDuration}
                  onChange={(e) => setFocusDuration(Number(e.target.value))}
                  className="w-full accent-[#59C8FF] cursor-pointer h-1.5 bg-[#131F32] rounded-lg appearance-none"
                />
              </div>

              {/* Break Duration Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm font-medium">
                  <span className="text-[#F0F5FF]">Break Duration</span>
                  <span className="font-mono text-[#59C8FF] font-bold">{breakDuration} minutes</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="20"
                  step="1"
                  value={breakDuration}
                  onChange={(e) => setBreakDuration(Number(e.target.value))}
                  className="w-full accent-[#59C8FF] cursor-pointer h-1.5 bg-[#131F32] rounded-lg appearance-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Session Behavior (Matches Image 9) */}
          <div className="rounded-2xl bg-[#101A2B] border border-[#24354C] p-6 space-y-5 shadow-sm">
            <div>
              <h2 className="text-base font-bold text-[#F0F5FF]">Session Behavior</h2>
              <p className="text-xs text-[#A7B6CA]">
                Automate your focus workflow
              </p>
            </div>

            <div className="space-y-4 pt-2">
              {/* Automatically End Session */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-[#F0F5FF]">Automatically End Session</div>
                  <div className="text-xs text-[#A7B6CA]">
                    Automatically end session when target duration is reached
                  </div>
                </div>
                <button
                  onClick={() => setAutoEndSession((p) => !p)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    autoEndSession ? 'bg-gradient-to-r from-[#2563EB] to-[#3988FF]' : 'bg-[#131F32] border border-[#24354C]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      autoEndSession ? 'left-6 shadow-sm shadow-[#59C8FF]/50' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Auto-Start Breaks */}
              <div className="flex items-center justify-between pt-3 border-t border-[#24354C]">
                <div>
                  <div className="text-sm font-semibold text-[#F0F5FF]">Auto-Start Breaks</div>
                  <div className="text-xs text-[#A7B6CA]">
                    Automatically start break timer after focus session
                  </div>
                </div>
                <button
                  onClick={() => setAutoStartBreaks((p) => !p)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    autoStartBreaks ? 'bg-gradient-to-r from-[#2563EB] to-[#3988FF]' : 'bg-[#131F32] border border-[#24354C]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      autoStartBreaks ? 'left-6 shadow-sm shadow-[#59C8FF]/50' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Auto-Start Next Session */}
              <div className="flex items-center justify-between pt-3 border-t border-[#24354C]">
                <div>
                  <div className="text-sm font-semibold text-[#F0F5FF]">Auto-Start Next Session</div>
                  <div className="text-xs text-[#A7B6CA]">
                    Automatically start next focus session after break
                  </div>
                </div>
                <button
                  onClick={() => setAutoStartNextSession((p) => !p)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    autoStartNextSession ? 'bg-gradient-to-r from-[#2563EB] to-[#3988FF]' : 'bg-[#131F32] border border-[#24354C]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      autoStartNextSession ? 'left-6 shadow-sm shadow-[#59C8FF]/50' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Contents: APPEARANCE */}
      {activeTab === 'appearance' && (
        <div className="rounded-2xl bg-[#101A2B] border border-[#24354C] p-6 space-y-6 shadow-sm">
          <div>
            <h2 className="text-base font-bold text-[#F0F5FF]">Appearance & Visuals</h2>
            <p className="text-xs text-[#A7B6CA]">
              Tune the interface theme.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-[#F0F5FF]">Color Mode</div>
                <div className="text-xs text-[#A7B6CA]">Toggle Dark or Light interface</div>
              </div>
              <button
                onClick={toggleTheme}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold btn-electric-secondary flex items-center gap-2 cursor-pointer"
              >
                {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-[#59C8FF]" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
                <span className="capitalize">{theme} Theme</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Contents: SYSTEM & DATA */}
      {(activeTab === 'system' || activeTab === 'notifications' || activeTab === 'sidebar') && (
        <div className="rounded-2xl bg-[#101A2B] border border-[#24354C] p-6 space-y-6 shadow-sm">
          {/* Email address setting */}
          <div className="space-y-3 pb-6 border-b border-[#24354C]">
            <div>
              <h2 className="text-base font-bold text-[#F0F5FF]">Email address</h2>
              <p className="text-xs text-[#A7B6CA]">
                Add your email if you'd like to use supported email-related features.
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input
                  type="email"
                  value={settingsEmail}
                  onChange={(e) => {
                    setSettingsEmail(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  placeholder="Enter your email address"
                  className="flex-1 bg-[#0B1220] border border-[#24354C] rounded-xl px-4 py-2 text-xs sm:text-sm text-[#F0F5FF] focus:outline-none focus:border-[#3988FF] placeholder:text-[#7789A4]"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSettingsEmail(userProfile?.email || '');
                      setEmailError(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs text-[#A7B6CA] hover:text-[#F0F5FF] bg-[#0B1220] border border-[#24354C] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      const trimmed = settingsEmail.trim();
                      if (trimmed) {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(trimmed)) {
                          setEmailError('Please enter a valid email address.');
                          return;
                        }
                      }
                      await updateUserProfile({ email: trimmed });
                      setEmailSaved(true);
                      setTimeout(() => setEmailSaved(false), 3000);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold btn-electric-primary cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>
              {emailError && (
                <p className="text-xs text-rose-400 pl-1">{emailError}</p>
              )}
              {emailSaved && (
                <p className="text-xs text-emerald-400 pl-1">Email address saved successfully.</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-base font-bold text-[#F0F5FF]">Workspace Data & Backup</h2>
            <p className="text-xs text-[#A7B6CA]">
              Export your academic tasks and goal roadmaps to a secure JSON backup.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportData}
              className="px-4 py-2 rounded-xl text-xs font-semibold btn-electric-secondary flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#59C8FF]" />
              <span>Export Workspace JSON</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
