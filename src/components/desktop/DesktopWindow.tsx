import React, { useRef, useState, useEffect } from 'react';
import { Minus, Square, X, RotateCcw } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.tsx';

export interface WindowConfig {
  id: string;
  title: string;
  icon?: React.ReactNode;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  prevGeometry?: { x: number; y: number; width: number; height: number };
}

interface DesktopWindowProps {
  config: WindowConfig;
  isActive: boolean;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onMove: (x: number, y: number) => void;
  children: React.ReactNode;
}

export const DesktopWindow: React.FC<DesktopWindowProps> = ({
  config,
  isActive,
  onFocus,
  onClose,
  onMinimize,
  onToggleMaximize,
  onMove,
  children,
}) => {
  const { theme } = useTheme();
  const windowRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number }>({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
  });

  // Handle Dragging
  const handleTitleBarMouseDown = (e: React.MouseEvent) => {
    // Prevent dragging when clicking buttons inside title bar
    if ((e.target as HTMLElement).closest('button')) return;
    if (config.isMaximized) return;

    onFocus();
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: config.x,
      startY: config.y,
    };

    e.preventDefault();
  };

  const handleTitleBarTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    if (config.isMaximized) return;

    onFocus();
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      setIsDragging(true);
      dragStartRef.current = {
        mouseX: touch.clientX,
        mouseY: touch.clientY,
        startX: config.x,
        startY: config.y,
      };
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartRef.current.mouseX;
      const deltaY = e.clientY - dragStartRef.current.mouseY;
      const newX = Math.max(0, dragStartRef.current.startX + deltaX);
      const newY = Math.max(0, dragStartRef.current.startY + deltaY);
      onMove(newX, newY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - dragStartRef.current.mouseX;
        const deltaY = touch.clientY - dragStartRef.current.mouseY;
        const newX = Math.max(0, dragStartRef.current.startX + deltaX);
        const newY = Math.max(0, dragStartRef.current.startY + deltaY);
        onMove(newX, newY);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, onMove]);

  if (!config.isOpen || config.isMinimized) {
    return null;
  }

  const isLight = theme === 'light';

  // Maximized style fills available workspace area
  const windowStyle: React.CSSProperties = config.isMaximized
    ? {
        position: 'absolute',
        left: 8,
        top: 8,
        width: 'calc(100% - 16px)',
        height: 'calc(100% - 80px)',
        zIndex: config.zIndex,
      }
    : {
        position: 'absolute',
        left: `${config.x}px`,
        top: `${config.y}px`,
        width: `${config.width}px`,
        height: `${config.height}px`,
        maxWidth: 'calc(100vw - 16px)',
        maxHeight: 'calc(100vh - 124px)',
        zIndex: config.zIndex,
      };

  return (
    <div
      ref={windowRef}
      onMouseDown={onFocus}
      style={windowStyle}
      className={`flex flex-col rounded-2xl overflow-hidden transition-shadow duration-200 select-none ${
        isLight
          ? 'bg-[#FFFFFF]/95 text-[#171923] border border-[#E1E6EF] shadow-xl shadow-slate-300/40'
          : 'bg-[#0D1018]/95 text-[#F4F5FA] border border-white/10 shadow-2xl shadow-black/80'
      } ${
        isActive
          ? isLight
            ? 'ring-1 ring-violet-500/40 shadow-2xl'
            : 'ring-1 ring-cyan-400/40 shadow-[0_12px_40px_rgba(0,0,0,0.85)]'
          : 'opacity-95'
      }`}
    >
      {/* Linux-Inspired Window Header */}
      <div
        onMouseDown={handleTitleBarMouseDown}
        onTouchStart={handleTitleBarTouchStart}
        className={`h-9 px-3 flex items-center justify-between cursor-move shrink-0 border-b ${
          isLight
            ? 'bg-[#F6F8FC]/90 border-[#E1E6EF]'
            : 'bg-[#121622]/90 border-white/5'
        }`}
      >
        {/* Left: 3 colored traffic light dots */}
        <div className="flex items-center gap-1.5 w-16">
          {/* Close - Red */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            title="Close window"
            className="w-3 h-3 rounded-full bg-[#FF5F56] hover:brightness-110 active:brightness-90 transition-all flex items-center justify-center group cursor-pointer"
          >
            <X size={8} className="text-black/80 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          {/* Minimize - Amber */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMinimize();
            }}
            title="Minimize window"
            className="w-3 h-3 rounded-full bg-[#FFBD2E] hover:brightness-110 active:brightness-90 transition-all flex items-center justify-center group cursor-pointer"
          >
            <Minus size={8} className="text-black/80 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          {/* Maximize / Restore - Green */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleMaximize();
            }}
            title={config.isMaximized ? 'Restore window' : 'Maximize window'}
            className="w-3 h-3 rounded-full bg-[#27C93F] hover:brightness-110 active:brightness-90 transition-all flex items-center justify-center group cursor-pointer"
          >
            <Square size={7} className="text-black/80 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>

        {/* Center: Title */}
        <div className="flex items-center gap-1.5 text-xs font-semibold truncate max-w-[200px] pointer-events-none">
          {config.icon && <span className="opacity-70 scale-90">{config.icon}</span>}
          <span className="truncate">{config.title}</span>
        </div>

        {/* Right: Quick action buttons */}
        <div className="flex items-center gap-1 w-16 justify-end">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMinimize();
            }}
            className={`p-1 rounded hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer ${
              isLight ? 'text-slate-500 hover:bg-slate-200' : ''
            }`}
            title="Minimize"
          >
            <Minus size={11} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleMaximize();
            }}
            className={`p-1 rounded hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer ${
              isLight ? 'text-slate-500 hover:bg-slate-200' : ''
            }`}
            title={config.isMaximized ? 'Restore' : 'Maximize'}
          >
            <Square size={10} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1 rounded hover:bg-rose-500/20 text-white/50 hover:text-rose-400 transition-colors cursor-pointer"
            title="Close"
          >
            <X size={11} />
          </button>
        </div>
      </div>

      {/* Window Content */}
      <div className="flex-1 overflow-auto select-text p-0">{children}</div>
    </div>
  );
};
