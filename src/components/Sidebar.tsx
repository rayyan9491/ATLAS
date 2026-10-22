import React from 'react';
import {
  Home,
  CheckCircle2,
  Target,
  Calendar,
  Clock,
  BarChart2,
  User,
  Settings,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useApp } from '../context/AppContext.tsx';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const { userProfile } = useAuth();
  const { userStats } = useApp();

  const displayName = userProfile?.displayName || userStats.displayName || 'Alex Morgan';
  const initialLetter = displayName.charAt(0).toUpperCase();

  const navItems = [
    { path: '/home', label: 'Home', icon: Home },
    { path: '/today', label: 'Today', icon: CheckCircle2 },
    { path: '/goals', label: 'Goals', icon: Target },
    { path: '/planner', label: 'Planner', icon: Calendar },
    { path: '/focus', label: 'Focus', icon: Clock },
    { path: '/insights', label: 'Insights', icon: BarChart2 },
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleItemClick = (path: string) => {
    onNavigate(path);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container - Deep Navy with subtle electric finish */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-[#070B16] border-r border-[#151F33] flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-[#151F33] flex items-center justify-between">
          <button
            onClick={() => handleItemClick('/')}
            className="flex items-center gap-3 text-left group transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform">
              <span className="font-mono text-black font-extrabold text-xs tracking-wider">
                ATL
              </span>
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>ATLAS</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#38BDF8]" />
              </div>
            </div>
          </button>

          {/* Mobile close button */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#0D1424]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Profile Card */}
        <div className="p-3 mx-3 my-3 rounded-xl bg-[#0C1220] border border-[#1A263D] flex items-center gap-3 shadow-inner">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 text-black font-bold text-sm flex items-center justify-center font-mono shrink-0 shadow-md shadow-cyan-500/20">
            {initialLetter}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-white truncate">{displayName}</div>
          </div>
        </div>

        {/* Navigation Items (All 8 Routes) */}
        <nav className="flex-1 px-3 py-1 space-y-1 overflow-y-auto">
          <div className="px-3 py-1 text-[10px] font-mono tracking-wider uppercase text-[#64748B] font-semibold">
            WORKSPACE
          </div>

          {navItems.map((item) => {
            const isActive =
              item.path === '/home'
                ? currentPath === '/home' || currentPath === '/app'
                : currentPath === item.path || currentPath.startsWith(item.path + '/');
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                onClick={() => handleItemClick(item.path)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white border border-blue-400/50 shadow-[0_0_15px_rgba(37,99,235,0.4)] font-semibold'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#0D1424] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-white' : 'text-[#94A3B8]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-3 border-t border-[#151F33] text-center">
          <p className="text-[10px] font-mono text-[#64748B]">
            ATLAS • Your Life. Your System.
          </p>
        </div>
      </aside>
    </>
  );
};
