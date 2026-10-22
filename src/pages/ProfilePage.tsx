import React, { useState } from 'react';
import {
  User,
  Camera,
  LogOut,
  Check,
  RotateCcw,
  Shield,
  Key,
  Sliders,
  Bell,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useApp } from '../context/AppContext.tsx';

interface ProfilePageProps {
  onNavigate: (path: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { userProfile, updateDisplayName, switchProfile, updateUserProfile } = useAuth();
  const { userStats } = useApp();

  const [activeSection, setActiveSection] = useState<'account' | 'focus' | 'coach' | 'privacy'>('account');
  const [nameInput, setNameInput] = useState(userProfile?.displayName || userStats.displayName || '');
  const [emailInput, setEmailInput] = useState(userProfile?.email || '');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const navItems = [
    { id: 'account', label: 'Account' },
  ];

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    await updateDisplayName(nameInput.trim());
    setSaveStatus('Name updated successfully!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const initialLetter = (nameInput || 'A').charAt(0).toUpperCase();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div className="pb-3 border-b border-[#24354C]">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F0F5FF]">
          Profile & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-[#A7B6CA] mt-0.5">
          Manage your personal identity, student credentials, and session workspace.
        </p>
      </div>

      {/* Split layout matching Image 8 */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Sub-nav (Matches Image 8 sidebar tabs) - 3 cols */}
        <div className="md:col-span-3 rounded-2xl bg-[#101A2B] border border-[#24354C] p-3 space-y-1 shadow-sm">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as any)}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                activeSection === item.id
                  ? 'bg-[#192941] text-[#59C8FF] border border-[#294B75] font-semibold'
                  : 'text-[#A7B6CA] hover:text-[#F0F5FF] hover:bg-[#131F32]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Right Settings Panel (Matches Image 8) - 9 cols */}
        <div className="md:col-span-9 rounded-2xl bg-[#101A2B] border border-[#24354C] p-6 space-y-8 shadow-sm">
          {saveStatus && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{saveStatus}</span>
            </div>
          )}

          {/* Name Field (Matches Image 8) */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-bold text-[#F0F5FF]">Name</h3>
              <p className="text-xs text-[#A7B6CA]">
                Change how your name will be displayed in the application.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="flex-1 bg-[#0B1220] border border-[#24354C] rounded-xl px-4 py-2 text-xs sm:text-sm text-[#F0F5FF] focus:outline-none focus:border-[#3988FF]"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setNameInput(userProfile?.displayName || 'Student')}
                  className="px-4 py-2 rounded-xl text-xs text-[#A7B6CA] hover:text-[#F0F5FF] bg-[#0B1220] border border-[#24354C] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveName}
                  className="px-4 py-2 rounded-xl text-xs font-semibold btn-electric-primary cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-3 pt-4 border-t border-[#24354C]">
            <div>
              <h3 className="text-sm font-bold text-[#F0F5FF]">Email address</h3>
              <p className="text-xs text-[#A7B6CA]">
                Add your email if you'd like to use supported email-related features.
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  placeholder="Enter your email address"
                  className="flex-1 bg-[#0B1220] border border-[#24354C] rounded-xl px-4 py-2 text-xs sm:text-sm text-[#F0F5FF] focus:outline-none focus:border-[#3988FF] placeholder:text-[#7789A4]"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEmailInput(userProfile?.email || '');
                      setEmailError(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs text-[#A7B6CA] hover:text-[#F0F5FF] bg-[#0B1220] border border-[#24354C] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      const trimmed = emailInput.trim();
                      if (trimmed) {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(trimmed)) {
                          setEmailError('Please enter a valid email address.');
                          return;
                        }
                      }
                      await updateUserProfile({ email: trimmed });
                      setSaveStatus('Email address saved successfully.');
                      setTimeout(() => setSaveStatus(null), 3000);
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
            </div>
          </div>

          {/* Profile Photo (Matches Image 8 circular avatar with initial D) */}
          <div className="space-y-3 pt-4 border-t border-[#24354C]">
            <div>
              <h3 className="text-sm font-bold text-[#F0F5FF]">Profile Photo</h3>
              <p className="text-xs text-[#A7B6CA]">
                Change your profile photo displayed in the application.
              </p>
            </div>
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#2563EB] via-[#3988FF] to-[#59C8FF] text-white font-extrabold text-3xl flex items-center justify-center shadow-lg shadow-[#3988FF]/30 font-mono border-2 border-[#59C8FF]/40">
                {initialLetter}
              </div>
              <button
                onClick={() => {
                  setSaveStatus('Photo avatar updated to system default.');
                  setTimeout(() => setSaveStatus(null), 3000);
                }}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[#A7B6CA] hover:text-[#59C8FF] bg-[#131F32] border border-[#24354C] hover:border-[#294B75] transition-colors cursor-pointer"
              >
                Upload Photo
              </button>
            </div>
          </div>

          {/* Sign Out / Profile Switcher (Matches Image 8) */}
          <div className="space-y-3 pt-4 border-t border-[#24354C]">
            <div>
              <h3 className="text-sm font-bold text-[#F0F5FF]">Sign Out / Switch Profile</h3>
              <p className="text-xs text-[#A7B6CA]">
                Sign out of this workspace or switch to a new anonymous profile.
              </p>
            </div>
            <button
              onClick={async () => {
                await switchProfile();
                onNavigate('/welcome');
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Switch Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
