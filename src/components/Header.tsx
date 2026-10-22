import React, { useState, useEffect } from 'react';
import { Menu, Plus, Clock, Target, Sun, Moon } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useTheme } from '../context/ThemeContext.tsx';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  onOpenAddTask: () => void;
  onNavigate: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileMenu,
  onOpenAddTask,
  onNavigate,
}) => {
  const { todayDate, activeFocusTask } = useApp();
  const { userProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Current live clock in 12-hour AM/PM format
  const [timeString, setTimeString] = useState<string>('');

  useEffect(() => {
    const clockFormatter = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const updateTime = () => {
      const now = new Date();
      setTimeString(clockFormatter.format(now));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-14 px-4 sm:px-6 bg-[#060A14]/90 backdrop-blur-md border-b border-[#151F33] flex items-center justify-between sticky top-0 z-30 shrink-0">
      {/* Left: Mobile hamburger menu & branding indicator */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-xl bg-[#0D1424] text-[#94A3B8] hover:text-white border border-[#1A263D] cursor-pointer"
          title="Toggle Navigation"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* Center/Right: Live Clock, Focus Shortcut, Quick Add */}
      <div className="flex items-center gap-3">
        {/* Live Clock Pill */}
        <div className="text-xs font-mono text-cyan-300 font-semibold px-3 py-1 rounded-full bg-[#0D1424] border border-[#1E2D4A] shadow-[0_0_10px_rgba(56,189,248,0.1)]">
          {timeString}
        </div>

        {/* Quick Focus Button */}
        <button
          onClick={() => onNavigate('/focus')}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#0D1424] hover:bg-[#111A2E] text-[#94A3B8] hover:text-cyan-300 border border-[#1A263D] hover:border-[#1E2D4A] transition-all cursor-pointer shadow-sm"
          title="Focus Room"
        >
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Focus</span>
        </button>

        {/* Quick Add Task with Electric Blue Gradient */}
        <button
          onClick={onOpenAddTask}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold btn-electric-primary transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Task</span>
        </button>
      </div>
    </header>
  );
};
