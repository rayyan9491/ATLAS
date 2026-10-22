import React from 'react';
import { useTheme } from '../../context/ThemeContext.tsx';

export interface DockItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  isOpen: boolean;
  isMinimized: boolean;
  isActive: boolean;
}

interface DesktopDockProps {
  items: DockItem[];
  onItemClick: (id: string) => void;
}

export const DesktopDock: React.FC<DesktopDockProps> = ({ items, onItemClick }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <nav
      aria-label="Application dock"
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 pointer-events-auto select-none"
    >
      <div
        className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-2xl backdrop-blur-2xl transition-all shadow-2xl border ${
          isLight
            ? 'bg-white/85 border-slate-300/80 shadow-[0_10px_35px_rgba(0,0,0,0.12)]'
            : 'bg-[#0D1018]/90 border-white/10 shadow-[0_12px_45px_rgba(0,0,0,0.85)]'
        }`}
      >
        {items.map((item) => {
          const isCurrentActive = item.isOpen && !item.isMinimized && item.isActive;
          const isOpenNotActive = item.isOpen && !item.isMinimized && !item.isActive;

          return (
            <button
              key={item.id}
              onClick={() => onItemClick(item.id)}
              aria-label={item.label}
              className={`relative flex flex-col items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl transition-all duration-200 ease-out group cursor-pointer focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:outline-none hover:-translate-y-1.5 active:scale-95 active:translate-y-0 ${
                isCurrentActive
                  ? isLight
                    ? 'bg-violet-100 text-violet-700 shadow-md shadow-violet-500/20'
                    : 'bg-white/15 text-white shadow-lg shadow-violet-500/25 ring-1 ring-violet-500/30'
                  : isOpenNotActive
                  ? isLight
                    ? 'bg-slate-100 text-slate-800 hover:bg-violet-50 hover:text-violet-700'
                    : 'bg-white/5 text-white/90 hover:bg-white/10 hover:text-white'
                  : isLight
                  ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/80'
                  : 'text-[#939BB0] hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="transition-transform duration-200 group-hover:scale-110 flex items-center justify-center">
                {item.icon}
              </div>

              {/* Tooltip on Hover */}
              <span
                role="tooltip"
                className="absolute -top-9 px-2 py-0.5 rounded-md text-[10px] font-medium tracking-wide bg-[#0B0D14]/95 text-white opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-all duration-150 pointer-events-none whitespace-nowrap border border-white/15 shadow-xl -translate-y-0.5 group-hover:-translate-y-1"
              >
                {item.label}
              </span>

              {/* Persistent Active/Open Indicator Dot */}
              {item.isOpen && (
                <div
                  className={`absolute bottom-1 rounded-full transition-all duration-200 ${
                    !item.isMinimized
                      ? isLight
                        ? 'bg-violet-600 w-2.5 h-1 shadow-[0_0_6px_rgba(139,92,246,0.6)]'
                        : 'bg-[#67E8F9] w-2.5 h-1 shadow-[0_0_8px_#67E8F9]'
                      : 'bg-white/40 w-1 h-1'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
