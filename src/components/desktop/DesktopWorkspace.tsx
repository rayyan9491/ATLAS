import React, { useState, useEffect, useCallback } from 'react';
import {
  Home,
  CalendarCheck,
  Target,
  Calendar,
  Clock,
  BarChart2,
  Sparkles,
  User,
  Settings,
  Sun,
  Moon,
  ChevronDown,
  LogOut,
  Edit2,
  Check,
  Maximize2,
} from 'lucide-react';
import { LiveWaveCanvas } from '../LiveWaveCanvas.tsx';
import { DesktopWindow, WindowConfig } from './DesktopWindow.tsx';
import { DesktopDock, DockItem } from './DesktopDock.tsx';
import { HomeWindowContent } from './windows/HomeWindowContent.tsx';
import { TodayWindowContent } from './windows/TodayWindowContent.tsx';
import { GoalsWindowContent } from './windows/GoalsWindowContent.tsx';
import { PlannerWindowContent } from './windows/PlannerWindowContent.tsx';
import { FocusWindowContent } from './windows/FocusWindowContent.tsx';
import { InsightsWindowContent } from './windows/InsightsWindowContent.tsx';
import { CoachWindowContent } from './windows/CoachWindowContent.tsx';
import { ProfileWindowContent } from './windows/ProfileWindowContent.tsx';
import { SettingsWindowContent } from './windows/SettingsWindowContent.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { useApp } from '../../context/AppContext.tsx';
import { useTheme } from '../../context/ThemeContext.tsx';

interface DesktopWorkspaceProps {
  onOpenTaskModal: () => void;
  onOpenGoalModal: () => void;
}

export const DesktopWorkspace: React.FC<DesktopWorkspaceProps> = ({
  onOpenTaskModal,
  onOpenGoalModal,
}) => {
  const { userProfile, updateDisplayName, switchProfile } = useAuth();
  const { userStats, setFocusTimer } = useApp();
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  // Live formatted clock
  const [currentTime, setCurrentTime] = useState<string>('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      };
      setCurrentTime(now.toLocaleString('en-US', options));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Viewport tracking for responsive scaling
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1440,
    height: typeof window !== 'undefined' ? window.innerHeight - 44 : 860,
  });

  // Calculate scaled window geometries that fit cleanly on the screen
  const calculateScaledWindows = useCallback(
    (w: number, h: number): Record<string, WindowConfig> => {
      const availH = Math.max(500, h - 74); // Reserve bottom space for the dock
      const availW = Math.max(900, w);

      // Top row heights & bottom row heights
      const topRowH = Math.round(availH * 0.52);
      const bottomRowH = Math.max(220, availH - topRowH - 16);

      // Width columns
      const leftW = Math.round(availW * 0.44);
      const rightW = Math.max(380, availW - leftW - 28);

      const bottomCol1W = Math.round(availW * 0.40);
      const bottomCol2W = Math.round(availW * 0.35);
      const bottomCol3W = Math.max(240, availW - bottomCol1W - bottomCol2W - 36);

      return {
        home: {
          id: 'home',
          title: 'Home',
          isOpen: true,
          isMinimized: false,
          isMaximized: false,
          zIndex: 15,
          x: 14,
          y: 8,
          width: leftW,
          height: topRowH,
        },
        today: {
          id: 'today',
          title: 'Today',
          isOpen: true,
          isMinimized: false,
          isMaximized: false,
          zIndex: 16,
          x: leftW + 22,
          y: 8,
          width: rightW,
          height: topRowH,
        },
        goals: {
          id: 'goals',
          title: 'Goals',
          isOpen: true,
          isMinimized: false,
          isMaximized: false,
          zIndex: 14,
          x: 14,
          y: topRowH + 16,
          width: bottomCol1W,
          height: bottomRowH,
        },
        planner: {
          id: 'planner',
          title: 'Planner',
          isOpen: true,
          isMinimized: false,
          isMaximized: false,
          zIndex: 13,
          x: bottomCol1W + 22,
          y: topRowH + 16,
          width: bottomCol2W,
          height: bottomRowH,
        },
        focus: {
          id: 'focus',
          title: 'Focus Room',
          isOpen: true,
          isMinimized: false,
          isMaximized: false,
          zIndex: 17,
          x: bottomCol1W + bottomCol2W + 30,
          y: topRowH + 16,
          width: bottomCol3W,
          height: bottomRowH,
        },
        insights: {
          id: 'insights',
          title: 'Progress Insights',
          isOpen: false, // Opened via dock
          isMinimized: false,
          isMaximized: false,
          zIndex: 12,
          x: Math.max(20, Math.round((availW - 540) / 2)),
          y: Math.max(20, Math.round((availH - 460) / 2)),
          width: 540,
          height: 460,
        },
        coach: {
          id: 'coach',
          title: 'AI Coach',
          isOpen: false, // Opened via dock or quick actions
          isMinimized: false,
          isMaximized: false,
          zIndex: 22,
          x: Math.max(20, availW - 380),
          y: 30,
          width: 360,
          height: 440,
        },
        profile: {
          id: 'profile',
          title: 'Profile',
          isOpen: false, // Opened via top avatar or dock
          isMinimized: false,
          isMaximized: false,
          zIndex: 23,
          x: Math.max(20, Math.round((availW - 500) / 2)),
          y: Math.max(20, Math.round((availH - 440) / 2)),
          width: 500,
          height: 440,
        },
        settings: {
          id: 'settings',
          title: 'Settings',
          isOpen: false, // Opened via dock
          isMinimized: false,
          isMaximized: false,
          zIndex: 24,
          x: Math.max(20, Math.round((availW - 580) / 2)),
          y: Math.max(20, Math.round((availH - 440) / 2)),
          width: 580,
          height: 440,
        },
      };
    },
    []
  );

  const [windows, setWindows] = useState<Record<string, WindowConfig>>(() =>
    calculateScaledWindows(
      typeof window !== 'undefined' ? window.innerWidth : 1440,
      typeof window !== 'undefined' ? window.innerHeight - 44 : 860
    )
  );

  // Resize listener to recalculate bounds
  useEffect(() => {
    const handleResize = () => {
      const newW = window.innerWidth;
      const newH = window.innerHeight - 44;
      setViewport({ width: newW, height: newH });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fit to screen handler
  const handleFitToScreen = () => {
    setWindows(calculateScaledWindows(viewport.width, viewport.height));
  };

  const [maxZ, setMaxZ] = useState<number>(30);
  const [activeWindowId, setActiveWindowId] = useState<string>('home');

  // Top bar user profile menu toggle
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isEditingNameInMenu, setIsEditingNameInMenu] = useState(false);
  const [menuNameInput, setMenuNameInput] = useState(userProfile?.displayName || 'Alex Carter');

  const displayName = userProfile?.displayName || userStats.displayName || 'Alex Carter';
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const bringToFront = (id: string) => {
    setMaxZ((prev) => {
      const nextZ = prev + 1;
      setWindows((prevWindows) => {
        const target = prevWindows[id];
        if (!target) return prevWindows;
        return {
          ...prevWindows,
          [id]: {
            ...target,
            isOpen: true,
            isMinimized: false,
            zIndex: nextZ,
          },
        };
      });
      return nextZ;
    });
    setActiveWindowId(id);
  };

  const handleClose = (id: string) => {
    setWindows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        isOpen: false,
      },
    }));
  };

  const handleMinimize = (id: string) => {
    setWindows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        isMinimized: true,
      },
    }));
  };

  const handleToggleMaximize = (id: string) => {
    setWindows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        isMaximized: !prev[id].isMaximized,
      },
    }));
  };

  const handleMove = (id: string, x: number, y: number) => {
    const maxX = Math.max(0, viewport.width - 60);
    const maxY = Math.max(0, viewport.height - 80);
    const clampedX = Math.min(Math.max(0, x), maxX);
    const clampedY = Math.min(Math.max(0, y), maxY);

    setWindows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        x: clampedX,
        y: clampedY,
      },
    }));
  };

  // Dock items (Exact 9 items in exact mandated order):
  // 1. Home, 2. Today, 3. Goals, 4. Planner, 5. Focus, 6. Insights, 7. Coach, 8. Profile, 9. Settings
  const dockItems: DockItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home size={18} />,
      isOpen: windows.home?.isOpen,
      isMinimized: windows.home?.isMinimized,
      isActive: activeWindowId === 'home',
    },
    {
      id: 'today',
      label: 'Today',
      icon: <CalendarCheck size={18} />,
      isOpen: windows.today?.isOpen,
      isMinimized: windows.today?.isMinimized,
      isActive: activeWindowId === 'today',
    },
    {
      id: 'goals',
      label: 'Goals',
      icon: <Target size={18} />,
      isOpen: windows.goals?.isOpen,
      isMinimized: windows.goals?.isMinimized,
      isActive: activeWindowId === 'goals',
    },
    {
      id: 'planner',
      label: 'Planner',
      icon: <Calendar size={18} />,
      isOpen: windows.planner?.isOpen,
      isMinimized: windows.planner?.isMinimized,
      isActive: activeWindowId === 'planner',
    },
    {
      id: 'focus',
      label: 'Focus',
      icon: <Clock size={18} />,
      isOpen: windows.focus?.isOpen,
      isMinimized: windows.focus?.isMinimized,
      isActive: activeWindowId === 'focus',
    },
    {
      id: 'insights',
      label: 'Insights',
      icon: <BarChart2 size={18} />,
      isOpen: windows.insights?.isOpen,
      isMinimized: windows.insights?.isMinimized,
      isActive: activeWindowId === 'insights',
    },
    {
      id: 'coach',
      label: 'Coach',
      icon: <Sparkles size={18} />,
      isOpen: windows.coach?.isOpen,
      isMinimized: windows.coach?.isMinimized,
      isActive: activeWindowId === 'coach',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <User size={18} />,
      isOpen: windows.profile?.isOpen,
      isMinimized: windows.profile?.isMinimized,
      isActive: activeWindowId === 'profile',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings size={18} />,
      isOpen: windows.settings?.isOpen,
      isMinimized: windows.settings?.isMinimized,
      isActive: activeWindowId === 'settings',
    },
  ];

  const handleDockItemClick = (id: string) => {
    const win = windows[id];
    if (!win) return;

    if (!win.isOpen || win.isMinimized) {
      bringToFront(id);
    } else if (activeWindowId === id) {
      handleMinimize(id);
    } else {
      bringToFront(id);
    }
  };

  const handleStartFocusFromOtherWindow = (taskId?: string) => {
    if (taskId) {
      setFocusTimer((prev) => ({
        ...prev,
        activeTaskId: taskId,
      }));
    }
    bringToFront('focus');
  };

  return (
    <div
      className={`relative w-screen h-screen overflow-hidden select-none transition-colors duration-200 ${
        isLight ? 'bg-[#F6F8FC] text-[#171923]' : 'bg-[#07080C] text-[#F4F5FA]'
      }`}
    >
      {/* Background Flowing Blue Waves */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <LiveWaveCanvas intensity={0.85} showParticles={false} />
      </div>

      {/* Top Bar */}
      <header
        className={`relative z-40 h-11 px-4 flex items-center justify-between border-b backdrop-blur-xl ${
          isLight
            ? 'bg-white/80 border-[#E1E6EF] text-[#171923]'
            : 'bg-[#0A0D14]/80 border-white/5 text-[#F4F5FA]'
        }`}
      >
        {/* Left: ATLAS Identity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#8B5CF6] to-[#67E8F9] flex items-center justify-center font-bold text-black font-mono text-[10px] shadow-sm">
              ATL
            </div>
            <span className="font-extrabold text-sm tracking-tight">ATLAS</span>
          </div>
          <span className="hidden sm:inline-block text-xs text-[#939BB0] pl-2 border-l border-white/10 font-normal">
            Your life. Your system. Your next move.
          </span>
        </div>

        {/* Right: Fit to Screen, Clock, Theme Toggle, Profile Menu */}
        <div className="flex items-center gap-2.5 sm:gap-3 text-xs">
          {/* Fit to Screen Button */}
          <button
            onClick={handleFitToScreen}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/10'
            }`}
            title="Reset and fit windows cleanly to screen"
          >
            <Maximize2 size={12} />
            <span>Fit layout</span>
          </button>

          {/* Clock */}
          <span className="hidden md:inline-block text-xs text-[#939BB0]">
            {currentTime || 'Tue, Apr 29, 10:24 AM'}
          </span>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/10'
            }`}
            title={`Switch to ${isLight ? 'Dark' : 'Light'} appearance`}
          >
            {isLight ? <Moon size={14} /> : <Sun size={14} />}
          </button>

          {/* User Profile Pill */}
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className={`flex items-center gap-2 px-2.5 py-1 rounded-xl border transition-all cursor-pointer ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#67E8F9] text-black font-extrabold flex items-center justify-center text-[9px]">
                {initials || 'AC'}
              </div>
              <span className="font-semibold text-xs truncate max-w-[100px]">
                {displayName}
              </span>
              <ChevronDown size={12} className="opacity-60" />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileMenuOpen && (
              <div
                className={`absolute right-0 top-full mt-2 w-56 rounded-2xl p-2.5 shadow-2xl border backdrop-blur-2xl z-50 ${
                  isLight
                    ? 'bg-white/95 border-slate-300 text-slate-800'
                    : 'bg-[#101420]/95 border-white/10 text-white'
                }`}
              >
                <div className="px-2 py-1.5 border-b border-white/5 mb-1.5">
                  <div className="text-[10px] uppercase text-[#939BB0] font-semibold tracking-wider">
                    Your profile
                  </div>
                  {isEditingNameInMenu ? (
                    <div className="flex items-center gap-1 mt-1">
                      <input
                        type="text"
                        value={menuNameInput}
                        onChange={(e) => setMenuNameInput(e.target.value)}
                        className="flex-1 px-2 py-0.5 rounded bg-black/30 border border-violet-500 text-xs text-white"
                      />
                      <button
                        onClick={async () => {
                          if (menuNameInput.trim()) {
                            await updateDisplayName(menuNameInput.trim());
                            setIsEditingNameInMenu(false);
                          }
                        }}
                        className="p-1 rounded bg-[#8B5CF6] text-white cursor-pointer"
                      >
                        <Check size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="font-bold text-xs">{displayName}</span>
                      <button
                        onClick={() => setIsEditingNameInMenu(true)}
                        className="text-[10px] text-[#A78BFA] hover:underline cursor-pointer"
                      >
                        <Edit2 size={11} />
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    bringToFront('profile');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-xl hover:bg-white/5 flex items-center gap-2 text-xs font-semibold text-left cursor-pointer"
                >
                  <User size={13} />
                  <span>View profile</span>
                </button>

                <button
                  onClick={() => {
                    bringToFront('settings');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-xl hover:bg-white/5 flex items-center gap-2 text-xs font-semibold text-left cursor-pointer"
                >
                  <Settings size={13} />
                  <span>Settings</span>
                </button>

                <button
                  onClick={async () => {
                    setIsProfileMenuOpen(false);
                    if (
                      window.confirm(
                        'Start a new profile? Your current data stays saved.'
                      )
                    ) {
                      await switchProfile();
                    }
                  }}
                  className="w-full px-2.5 py-1.5 rounded-xl hover:bg-rose-500/20 text-[#FB7185] flex items-center gap-2 text-xs font-semibold text-left cursor-pointer transition-colors"
                >
                  <LogOut size={13} />
                  <span>Switch profile</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Desktop Canvas Area: 100% viewport, no outer scrollbars */}
      <div className="relative w-full h-[calc(100vh-44px)] overflow-hidden">
        {/* 1. HOME WINDOW */}
        {windows.home && (
          <DesktopWindow
            config={windows.home}
            isActive={activeWindowId === 'home'}
            onFocus={() => bringToFront('home')}
            onClose={() => handleClose('home')}
            onMinimize={() => handleMinimize('home')}
            onToggleMaximize={() => handleToggleMaximize('home')}
            onMove={(x, y) => handleMove('home', x, y)}
          >
            <HomeWindowContent
              onOpenToday={() => bringToFront('today')}
              onOpenGoals={() => bringToFront('goals')}
              onOpenPlanner={() => bringToFront('planner')}
              onOpenFocus={handleStartFocusFromOtherWindow}
              onOpenCoach={(prompt) => {
                bringToFront('coach');
              }}
              onOpenTaskModal={onOpenTaskModal}
              onOpenGoalModal={onOpenGoalModal}
            />
          </DesktopWindow>
        )}

        {/* 2. TODAY WINDOW */}
        {windows.today && (
          <DesktopWindow
            config={windows.today}
            isActive={activeWindowId === 'today'}
            onFocus={() => bringToFront('today')}
            onClose={() => handleClose('today')}
            onMinimize={() => handleMinimize('today')}
            onToggleMaximize={() => handleToggleMaximize('today')}
            onMove={(x, y) => handleMove('today', x, y)}
          >
            <TodayWindowContent
              onOpenFocus={handleStartFocusFromOtherWindow}
              onOpenGoals={() => bringToFront('goals')}
              onOpenTaskModal={onOpenTaskModal}
              onOpenPlanner={() => bringToFront('planner')}
            />
          </DesktopWindow>
        )}

        {/* 3. GOALS WINDOW */}
        {windows.goals && (
          <DesktopWindow
            config={windows.goals}
            isActive={activeWindowId === 'goals'}
            onFocus={() => bringToFront('goals')}
            onClose={() => handleClose('goals')}
            onMinimize={() => handleMinimize('goals')}
            onToggleMaximize={() => handleToggleMaximize('goals')}
            onMove={(x, y) => handleMove('goals', x, y)}
          >
            <GoalsWindowContent
              onOpenNewGoalModal={onOpenGoalModal}
              onOpenTaskModal={onOpenTaskModal}
              onOpenFocus={handleStartFocusFromOtherWindow}
            />
          </DesktopWindow>
        )}

        {/* 4. PLANNER WINDOW */}
        {windows.planner && (
          <DesktopWindow
            config={windows.planner}
            isActive={activeWindowId === 'planner'}
            onFocus={() => bringToFront('planner')}
            onClose={() => handleClose('planner')}
            onMinimize={() => handleMinimize('planner')}
            onToggleMaximize={() => handleToggleMaximize('planner')}
            onMove={(x, y) => handleMove('planner', x, y)}
          >
            <PlannerWindowContent />
          </DesktopWindow>
        )}

        {/* 5. FOCUS WINDOW */}
        {windows.focus && (
          <DesktopWindow
            config={windows.focus}
            isActive={activeWindowId === 'focus'}
            onFocus={() => bringToFront('focus')}
            onClose={() => handleClose('focus')}
            onMinimize={() => handleMinimize('focus')}
            onToggleMaximize={() => handleToggleMaximize('focus')}
            onMove={(x, y) => handleMove('focus', x, y)}
          >
            <FocusWindowContent />
          </DesktopWindow>
        )}

        {/* 6. INSIGHTS WINDOW */}
        {windows.insights && (
          <DesktopWindow
            config={windows.insights}
            isActive={activeWindowId === 'insights'}
            onFocus={() => bringToFront('insights')}
            onClose={() => handleClose('insights')}
            onMinimize={() => handleMinimize('insights')}
            onToggleMaximize={() => handleToggleMaximize('insights')}
            onMove={(x, y) => handleMove('insights', x, y)}
          >
            <InsightsWindowContent />
          </DesktopWindow>
        )}

        {/* 7. COACH WINDOW */}
        {windows.coach && (
          <DesktopWindow
            config={windows.coach}
            isActive={activeWindowId === 'coach'}
            onFocus={() => bringToFront('coach')}
            onClose={() => handleClose('coach')}
            onMinimize={() => handleMinimize('coach')}
            onToggleMaximize={() => handleToggleMaximize('coach')}
            onMove={(x, y) => handleMove('coach', x, y)}
          >
            <CoachWindowContent />
          </DesktopWindow>
        )}

        {/* 8. PROFILE WINDOW */}
        {windows.profile && (
          <DesktopWindow
            config={windows.profile}
            isActive={activeWindowId === 'profile'}
            onFocus={() => bringToFront('profile')}
            onClose={() => handleClose('profile')}
            onMinimize={() => handleMinimize('profile')}
            onToggleMaximize={() => handleToggleMaximize('profile')}
            onMove={(x, y) => handleMove('profile', x, y)}
          >
            <ProfileWindowContent onSwitchProfile={switchProfile} />
          </DesktopWindow>
        )}

        {/* 9. SETTINGS WINDOW */}
        {windows.settings && (
          <DesktopWindow
            config={windows.settings}
            isActive={activeWindowId === 'settings'}
            onFocus={() => bringToFront('settings')}
            onClose={() => handleClose('settings')}
            onMinimize={() => handleMinimize('settings')}
            onToggleMaximize={() => handleToggleMaximize('settings')}
            onMove={(x, y) => handleMove('settings', x, y)}
          >
            <SettingsWindowContent onResetLayout={handleFitToScreen} />
          </DesktopWindow>
        )}
      </div>

      {/* Floating Bottom Dock (Exact 9 items in exact order) */}
      <DesktopDock items={dockItems} onItemClick={handleDockItemClick} />
    </div>
  );
};
