import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Plus,
  Flame,
  Clock,
  X,
  Check,
  Coffee,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext.tsx';
import { useTheme } from '../../../context/ThemeContext.tsx';
import { playCompletionBeep } from '../../../utils/focusAudio.ts';
import { Task } from '../../../types/index.ts';

export const FocusWindowContent: React.FC = () => {
  const {
    focusTimer,
    setFocusTimer,
    tasks,
    goals,
    createTask,
    saveFocusSession,
    focusSessions,
    toggleTaskComplete,
  } = useApp();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Completion check-in modal state
  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);
  const [completionProgress, setCompletionProgress] = useState<'yes' | 'some' | 'no'>('yes');
  const [markTaskFinished, setMarkTaskFinished] = useState<boolean>(false);
  const [reflectionNote, setReflectionNote] = useState<string>('');

  // Quick task creation inside Focus Room
  const [showQuickTaskInput, setShowQuickTaskInput] = useState<boolean>(false);
  const [quickTaskTitle, setQuickTaskTitle] = useState<string>('');

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (focusTimer.isRunning) {
      interval = setInterval(() => {
        setFocusTimer((prev) => {
          if (!prev.isRunning) return prev;
          const targetSecs = (prev.targetMinutes || 25) * 60;
          const nextSecs = prev.secondsElapsed + 1;

          if (nextSecs >= targetSecs) {
            // Timer finished - play two-beep completion alarm
            playCompletionBeep();
            setShowCompletionModal(true);
            return {
              ...prev,
              isRunning: false,
              secondsElapsed: targetSecs,
            };
          }

          return {
            ...prev,
            secondsElapsed: nextSecs,
          };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [focusTimer.isRunning, setFocusTimer]);

  const activeTask = tasks.find((t) => t.id === focusTimer.activeTaskId);

  const targetSeconds = (focusTimer.targetMinutes || 25) * 60;
  const remainingSeconds = Math.max(0, targetSeconds - (focusTimer.secondsElapsed || 0));

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent =
    targetSeconds > 0
      ? ((targetSeconds - remainingSeconds) / targetSeconds) * 100
      : 0;

  const handleTogglePlay = () => {
    setFocusTimer((prev) => ({
      ...prev,
      isRunning: !prev.isRunning,
      startedAtTimestamp: !prev.isRunning ? Date.now() : prev.startedAtTimestamp,
    }));
  };

  const handleReset = () => {
    setFocusTimer((prev) => ({
      ...prev,
      isRunning: false,
      secondsElapsed: 0,
    }));
  };

  const handleFinishEarly = () => {
    setFocusTimer((prev) => ({ ...prev, isRunning: false }));
    setShowCompletionModal(true);
  };

  const handleSelectPresetDuration = (mins: number) => {
    setFocusTimer((prev) => ({
      ...prev,
      isRunning: false,
      secondsElapsed: 0,
      targetMinutes: mins,
    }));
  };

  const handleCreateQuickTask = () => {
    if (!quickTaskTitle.trim()) return;
    const newTask = createTask({
      title: quickTaskTitle.trim(),
      priority: 'high',
      status: 'in_progress',
      estimatedMinutes: focusTimer.targetMinutes || 25,
      scheduledDate: new Date().toISOString().split('T')[0],
      slot: 'morning',
    });
    setFocusTimer((prev) => ({
      ...prev,
      activeTaskId: newTask.id,
    }));
    setQuickTaskTitle('');
    setShowQuickTaskInput(false);
  };

  const handleSaveCompletion = () => {
    const actualMins = Math.round((focusTimer.secondsElapsed || 60) / 60);

    saveFocusSession({
      taskId: activeTask?.id,
      taskTitle: activeTask?.title || 'Open Focus Session',
      goalId: activeTask?.goalId,
      plannedMinutes: focusTimer.targetMinutes || 25,
      actualMinutes: actualMins > 0 ? actualMins : 1,
      completed: completionProgress === 'yes',
      timestamp: new Date().toISOString(),
      notes: reflectionNote || undefined,
    });

    if (markTaskFinished && activeTask) {
      toggleTaskComplete(activeTask.id);
    }

    setShowCompletionModal(false);
    handleReset();
  };

  // Focus stats calculation
  const totalMinutesToday = focusSessions.reduce((acc, s) => acc + (s.actualMinutes || 0), 0);

  return (
    <div className="h-full flex flex-col justify-between p-4 text-xs select-none overflow-y-auto">
      {/* Top Task Strip & Selection */}
      <div className="space-y-2 pb-3 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-violet-500/20 text-[#A78BFA] flex items-center justify-center">
              <Flame size={15} />
            </div>
            <div>
              <div className="font-bold text-xs text-white truncate max-w-[200px]">
                {activeTask ? activeTask.title : 'Open Focus Session'}
              </div>
              <div className="text-[10px] text-[#939BB0]">
                {activeTask
                  ? `${activeTask.estimatedMinutes} min • ${activeTask.priority} priority`
                  : 'No specific task linked'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <select
              value={focusTimer.activeTaskId || ''}
              onChange={(e) =>
                setFocusTimer((prev) => ({
                  ...prev,
                  activeTaskId: e.target.value || null,
                }))
              }
              className="px-2 py-1 rounded-lg bg-black/40 border border-white/10 text-[10px] text-white focus:outline-none max-w-[140px] truncate cursor-pointer"
            >
              <option value="">Open Session (No task)</option>
              {tasks
                .filter((t) => t.status !== 'completed')
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
            </select>

            <button
              onClick={() => setShowQuickTaskInput(!showQuickTaskInput)}
              className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-white cursor-pointer"
              title="Add quick task"
            >
              <Plus size={13} />
            </button>
          </div>
        </div>

        {/* Quick Task Inline Input */}
        {showQuickTaskInput && (
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              placeholder="Quick task title..."
              value={quickTaskTitle}
              onChange={(e) => setQuickTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateQuickTask()}
              className="flex-1 px-2.5 py-1 rounded-lg bg-black/30 border border-white/10 text-white text-xs focus:outline-none focus:border-violet-500"
            />
            <button
              onClick={handleCreateQuickTask}
              className="px-3 py-1 rounded-lg bg-[#8B5CF6] text-white text-xs font-bold cursor-pointer"
            >
              Set
            </button>
          </div>
        )}
      </div>

      {/* Preset Duration Selector */}
      <div className="flex items-center justify-center gap-2 pt-2">
        {[15, 25, 45, 60].map((mins) => (
          <button
            key={mins}
            onClick={() => handleSelectPresetDuration(mins)}
            disabled={focusTimer.isRunning}
            className={`px-3 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
              focusTimer.targetMinutes === mins
                ? 'bg-violet-600 text-white shadow-sm'
                : 'bg-white/5 hover:bg-white/10 text-[#939BB0] hover:text-white'
            } disabled:opacity-50`}
          >
            {mins}m
          </button>
        ))}
      </div>

      {/* Circular Timer Display */}
      <div className="my-auto py-2 flex flex-col items-center justify-center">
        <div className="relative w-48 h-48 flex items-center justify-center">
          {/* SVG Circular Ring */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke={isLight ? '#E2E8F0' : '#141824'}
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="#67E8F9"
              strokeWidth="7"
              strokeDasharray={440}
              strokeDashoffset={440 - (440 * (progressPercent || 0)) / 100}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-300 ease-out drop-shadow-[0_0_10px_rgba(103,232,249,0.5)]"
            />
          </svg>

          {/* Time digits */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-extrabold tracking-tight font-mono text-white">
              {formatTime(remainingSeconds)}
            </div>
            <div className="text-[10px] font-mono text-[#67E8F9] tracking-wider mt-1 font-bold">
              {focusTimer.isRunning ? 'FOCUSING' : 'READY'}
            </div>
          </div>
        </div>

        {/* Timer Control Buttons */}
        <div className="flex items-center gap-2.5 mt-4">
          <button
            onClick={handleTogglePlay}
            className="px-6 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold text-xs shadow-lg shadow-violet-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {focusTimer.isRunning ? (
              <>
                <Pause size={13} className="fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play size={13} className="fill-current" />
                <span>Start</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors cursor-pointer"
            title="Reset timer"
          >
            <RotateCcw size={13} />
          </button>

          {focusTimer.secondsElapsed > 30 && (
            <button
              onClick={handleFinishEarly}
              className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-semibold text-xs transition-colors cursor-pointer"
              title="Finish session and record progress"
            >
              Finish
            </button>
          )}
        </div>
      </div>

      {/* Session Completion Check-in Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-sm p-5 rounded-2xl border shadow-2xl space-y-4 ${
              isLight
                ? 'bg-white border-slate-300 text-slate-800'
                : 'bg-[#121626] border-white/15 text-white'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>Session completed</span>
              </h3>
              <button
                onClick={() => setShowCompletionModal(false)}
                className="p-1 rounded hover:bg-white/10 text-[#939BB0] cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#939BB0] font-semibold mb-1">
                  Did you make solid progress?
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['yes', 'some', 'no'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setCompletionProgress(opt)}
                      className={`py-1.5 rounded-xl capitalize font-semibold cursor-pointer transition-colors ${
                        completionProgress === opt
                          ? 'bg-violet-600 text-white'
                          : 'bg-white/5 text-[#939BB0] hover:text-white'
                      }`}
                    >
                      {opt === 'yes'
                        ? 'Yes!'
                        : opt === 'some'
                        ? 'A little'
                        : 'Got stuck'}
                    </button>
                  ))}
                </div>
              </div>

              {activeTask && (
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5">
                  <input
                    type="checkbox"
                    id="markFin"
                    checked={markTaskFinished}
                    onChange={(e) => setMarkTaskFinished(e.target.checked)}
                    className="rounded border-white/20 cursor-pointer"
                  />
                  <label
                    htmlFor="markFin"
                    className="font-medium text-white cursor-pointer"
                  >
                    Mark "{activeTask.title}" as complete
                  </label>
                </div>
              )}

              <div>
                <label className="block text-[#939BB0] font-semibold mb-1">
                  Optional note or reflection
                </label>
                <input
                  type="text"
                  placeholder="What was the breakthrough or next step?"
                  value={reflectionNote}
                  onChange={(e) => setReflectionNote(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none focus:border-violet-500 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={handleSaveCompletion}
                className="w-full py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold text-xs shadow-md shadow-violet-500/20 cursor-pointer"
              >
                Save session & return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
