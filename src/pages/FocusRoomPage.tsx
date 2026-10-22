import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { playCompletionBeep } from '../utils/focusAudio.ts';

interface FocusRoomPageProps {
  onNavigate: (path: string) => void;
}

export const FocusRoomPage: React.FC<FocusRoomPageProps> = ({ onNavigate }) => {
  const {
    tasks,
    activeFocusTask,
    finishFocusSession,
    focusSessions,
  } = useApp();

  const [mode, setMode] = useState<'focus' | 'short_break' | 'long_break'>('focus');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [pomodoroCount, setPomodoroCount] = useState<number>(1);

  // Durations in minutes
  const modeDurations = {
    focus: 25,
    short_break: 5,
    long_break: 15,
  };

  const targetMinutes = modeDurations[mode];
  const [secondsRemaining, setSecondsRemaining] = useState<number>(targetMinutes * 60);

  // Sync timer when switching modes
  useEffect(() => {
    setIsRunning(false);
    setSecondsRemaining(modeDurations[mode] * 60);
  }, [mode]);

  // Timer tick & completion beep
  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            // Session completed naturally - trigger two-beep alarm
            setIsRunning(false);
            playCompletionBeep();

            if (mode === 'focus') {
              finishFocusSession(activeFocusTask?.id || 'general-focus', modeDurations.focus);
              setPomodoroCount((c) => (c % 4) + 1);
              setMode('short_break');
            } else {
              setMode('focus');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, mode, activeFocusTask, finishFocusSession]);

  const handleToggleTimer = () => {
    setIsRunning((prev) => !prev);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsRemaining(modeDurations[mode] * 60);
  };

  const handleSkip = () => {
    setIsRunning(false);
    if (mode === 'focus') {
      setMode('short_break');
    } else {
      setMode('focus');
    }
  };

  // Formatted strings
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const totalSeconds = modeDurations[mode] * 60;
  const progressPercent = Math.round(((totalSeconds - secondsRemaining) / totalSeconds) * 100);

  // SVG Progress Ring
  const radius = 170;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const todaySessionsCount = focusSessions.length;

  return (
    <div className="relative min-h-[calc(100vh-60px)] flex flex-col items-center justify-between p-6 sm:p-10 select-none overflow-hidden">
      {/* Top Segmented Mode Pills */}
      <div className="relative z-10 flex items-center rounded-2xl bg-[#101A2B] border border-[#24354C] p-1.5 shadow-xl">
        <button
          onClick={() => setMode('focus')}
          className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            mode === 'focus'
              ? 'bg-gradient-to-r from-[#2563EB] to-[#3988FF] text-white shadow-md shadow-[#3988FF]/30 border border-[#59C8FF]/40'
              : 'text-[#A7B6CA] hover:text-[#F0F5FF]'
          }`}
        >
          Focus
        </button>
        <button
          onClick={() => setMode('short_break')}
          className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            mode === 'short_break'
              ? 'bg-gradient-to-r from-[#2563EB] to-[#3988FF] text-white shadow-md shadow-[#3988FF]/30 border border-[#59C8FF]/40'
              : 'text-[#A7B6CA] hover:text-[#F0F5FF]'
          }`}
        >
          Short Break
        </button>
        <button
          onClick={() => setMode('long_break')}
          className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            mode === 'long_break'
              ? 'bg-gradient-to-r from-[#2563EB] to-[#3988FF] text-white shadow-md shadow-[#3988FF]/30 border border-[#59C8FF]/40'
              : 'text-[#A7B6CA] hover:text-[#F0F5FF]'
          }`}
        >
          Long Break
        </button>
      </div>

      {/* Large Centered Dial */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto">
        <div className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center">
          {/* Subtle Outer Glow & Canvas Circle */}
          <svg className="w-full h-full -rotate-90">
            {/* Background Ring */}
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke="#131F32"
              strokeWidth="7"
              fill="transparent"
            />
            {/* Progress Stroke */}
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke={mode === 'focus' ? '#59C8FF' : '#10B981'}
              strokeWidth="7"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-linear drop-shadow-[0_0_12px_rgba(89,200,255,0.4)]"
            />
          </svg>

          {/* Inner Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-1">
            <div className="text-[11px] sm:text-xs font-mono font-semibold tracking-widest text-[#59C8FF] uppercase">
              POMODORO {pomodoroCount}/4
            </div>
            <div className="text-6xl sm:text-7xl font-extrabold text-[#F0F5FF] tracking-tight font-mono">
              {timeDisplay}
            </div>
            <div className="text-xs text-[#7789A4] font-mono">
              {progressPercent}%
            </div>
          </div>
        </div>

        {/* Selected Task Indicator */}
        <div className="mt-4 flex items-center gap-2 max-w-md text-center">
          {activeFocusTask ? (
            <span className="text-xs text-[#A7B6CA] truncate">
              Working on:{' '}
              <span className="text-[#F0F5FF] font-semibold">{activeFocusTask.title}</span>
            </span>
          ) : (
            <span className="text-xs text-[#7789A4]">
              Choose a task to focus on, or start an independent session.
            </span>
          )}
        </div>

        {/* Action Controls Bar */}
        <div className="flex items-center gap-6 mt-8">
          {/* Reset button */}
          <button
            onClick={handleReset}
            className="w-10 h-10 rounded-full bg-[#101A2B] hover:bg-[#131F32] border border-[#24354C] hover:border-[#294B75] text-[#A7B6CA] hover:text-[#59C8FF] flex items-center justify-center transition-all cursor-pointer"
            title="Reset interval"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Big Primary Play/Pause Button */}
          <button
            onClick={handleToggleTimer}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#2563EB] via-[#3988FF] to-[#59C8FF] text-white flex items-center justify-center shadow-xl shadow-[#3988FF]/35 hover:shadow-[#59C8FF]/50 transition-transform active:scale-95 cursor-pointer border border-[#59C8FF]/40"
            title={isRunning ? 'Pause timer' : 'Start timer'}
          >
            {isRunning ? (
              <Pause className="w-7 h-7 fill-current stroke-[3]" />
            ) : (
              <Play className="w-7 h-7 fill-current ml-1 stroke-[3]" />
            )}
          </button>

          {/* Skip button */}
          <button
            onClick={handleSkip}
            className="w-10 h-10 rounded-full bg-[#101A2B] hover:bg-[#131F32] border border-[#24354C] hover:border-[#294B75] text-[#A7B6CA] hover:text-[#59C8FF] flex items-center justify-center transition-all cursor-pointer"
            title="Skip to next"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Counter Pill (Matches Image 5) */}
      <div className="relative z-10 flex items-center gap-2 px-4 py-2 rounded-full bg-[#101A2B] border border-[#24354C] text-xs text-[#A7B6CA]">
        <div className="w-3.5 h-3.5 rounded-full border border-[#59C8FF]/50 flex items-center justify-center" />
        <span>{todaySessionsCount} today</span>
      </div>
    </div>
  );
};
