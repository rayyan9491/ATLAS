import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Sparkles,
  CheckCircle2,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { PlannerEvent, Task } from '../types/index.ts';
import { getLocalDateString } from '../utils/dateUtils.ts';

interface PlannerPageProps {
  onNavigate: (path: string) => void;
  onOpenTaskModal: () => void;
  onOpenReplanModal: () => void;
}

export const PlannerPage: React.FC<PlannerPageProps> = ({
  onNavigate,
  onOpenTaskModal,
  onOpenReplanModal,
}) => {
  const { plannerEvents, createPlannerEvent, deletePlannerEvent, tasks, todayDate } = useApp();

  const [dateOffsetDays, setDateOffsetDays] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'week' | '5days' | 'day'>('5days');

  // Time grid configuration (07:00 to 22:00) matching Image 4
  const startHour = 7;
  const endHour = 22;
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

  // Live indicator for current time
  const [currentTimeMinutes, setCurrentTimeMinutes] = useState<number>(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });

  const [currentTimeFormatted, setCurrentTimeFormatted] = useState<string>(() => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTimeMinutes(now.getHours() * 60 + now.getMinutes());
      setCurrentTimeFormatted(
        `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      );
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Compute days for the current view in local time
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + dateOffsetDays);

  // Monday-based week calculation
  const dayOfWeek = baseDate.getDay();
  const diffToMonday = (dayOfWeek + 6) % 7;
  const monday = new Date(baseDate);
  monday.setDate(baseDate.getDate() - diffToMonday);

  const numDays = viewMode === '5days' ? 5 : viewMode === 'day' ? 1 : 7;
  const days = Array.from({ length: numDays }, (_, i) => {
    const d = new Date(monday);
    if (viewMode === 'day') {
      d.setDate(baseDate.getDate());
    } else {
      d.setDate(monday.getDate() + i);
    }
    const localDateStr = getLocalDateString(d);
    return {
      dateObj: d,
      dateString: localDateStr,
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
      isToday: localDateStr === todayDate,
    };
  });

  const monthYearLabel = (viewMode === 'day' ? baseDate : monday).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const handleNavPrev = () => {
    const delta = viewMode === 'day' ? 1 : 7;
    setDateOffsetDays((prev) => prev - delta);
  };

  const handleNavNext = () => {
    const delta = viewMode === 'day' ? 1 : 7;
    setDateOffsetDays((prev) => prev + delta);
  };

  const handleNavToday = () => {
    setDateOffsetDays(0);
  };

  // Helper to convert time "HH:MM" to row offset in px
  const timeToPx = (timeStr: string) => {
    try {
      const [h, m] = timeStr.split(':').map(Number);
      const minsFromStart = (h - startHour) * 60 + (m || 0);
      return Math.max(0, (minsFromStart / 60) * 64); // 64px per hour
    } catch {
      return 0;
    }
  };

  const currentRedLineY = ((currentTimeMinutes - startHour * 60) / 60) * 64;
  const isRedLineVisible =
    currentTimeMinutes >= startHour * 60 && currentTimeMinutes <= (endHour + 1) * 60;

  // State for adding a calendar event
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState(todayDate || getLocalDateString());
  const [eventStart, setEventStart] = useState('10:00');
  const [eventEnd, setEventEnd] = useState('11:00');
  const [eventCategory, setEventCategory] = useState<'study' | 'work' | 'personal' | 'routine'>('study');

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;
    createPlannerEvent({
      title: eventTitle.trim(),
      date: eventDate,
      startTime: eventStart,
      endTime: eventEnd,
      category: eventCategory,
    });
    setEventTitle('');
    setIsAddEventOpen(false);
  };

  const visibleScheduledTasksCount = tasks.filter((t) =>
    days.some((d) => d.dateString === t.scheduledDate)
  ).length;

  const visibleEventsCount = plannerEvents.filter((ev) =>
    days.some((d) => d.dateString === ev.date)
  ).length;

  const hasAnyScheduleThisWeek = visibleScheduledTasksCount > 0 || visibleEventsCount > 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5">
      {/* Top Header Controls (Matches Image 4) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#F0F5FF]">
            {monthYearLabel}
          </h1>

          {/* Navigation arrows */}
          <div className="flex items-center rounded-xl bg-[#101A2B] border border-[#24354C] p-1">
            <button
              onClick={handleNavPrev}
              className="p-1 rounded-lg text-[#A7B6CA] hover:text-[#F0F5FF] hover:bg-[#131F32] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNavToday}
              className="px-2.5 py-0.5 text-xs font-semibold text-[#A7B6CA] hover:text-[#59C8FF] transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={handleNavNext}
              className="p-1 rounded-lg text-[#A7B6CA] hover:text-[#F0F5FF] hover:bg-[#131F32] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View mode switcher & Action buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center rounded-xl bg-[#101A2B] border border-[#24354C] p-1">
            <button
              onClick={() => setViewMode('5days')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                viewMode === '5days'
                  ? 'bg-[#192941] text-[#59C8FF] border border-[#294B75] shadow-sm'
                  : 'text-[#A7B6CA] hover:text-[#F0F5FF]'
              }`}
            >
              5 days
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                viewMode === 'week'
                  ? 'bg-[#192941] text-[#59C8FF] border border-[#294B75] shadow-sm'
                  : 'text-[#A7B6CA] hover:text-[#F0F5FF]'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                viewMode === 'day'
                  ? 'bg-[#192941] text-[#59C8FF] border border-[#294B75] shadow-sm'
                  : 'text-[#A7B6CA] hover:text-[#F0F5FF]'
              }`}
            >
              Day
            </button>
          </div>

          <button
            onClick={() => setIsAddEventOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold btn-electric-primary cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Event</span>
          </button>

          <button
            onClick={onOpenReplanModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 border border-violet-500/30 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Planner</span>
          </button>
        </div>
      </div>

      {/* Empty State Banner if nothing scheduled */}
      {!hasAnyScheduleThisWeek && (
        <div className="p-5 rounded-2xl bg-[#101A2B] border border-dashed border-[#24354C] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#3988FF]/15 border border-[#3988FF]/30 text-[#59C8FF] flex items-center justify-center shrink-0">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#F0F5FF]">Nothing scheduled yet.</h3>
              <p className="text-xs text-[#A7B6CA] mt-0.5">
                Add a study session, assignment deadline, exam, or another commitment to start planning your time.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddEventOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold btn-electric-primary cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Event</span>
            </button>
            <button
              onClick={onOpenTaskModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold btn-electric-secondary cursor-pointer"
            >
              <span>Add Task</span>
            </button>
          </div>
        </div>
      )}

      {/* Calendar Grid Container (Matches Image 4) */}
      <div className="rounded-2xl bg-[#101A2B] border border-[#24354C] overflow-hidden flex flex-col shadow-sm">
        {/* Day Column Headers */}
        <div className="grid grid-cols-[60px_repeat(auto-fit,minmax(120px,1fr))] border-b border-[#24354C] bg-[#131F32] sticky top-0 z-20">
          <div className="p-3 text-[11px] font-mono text-[#7789A4] text-center border-r border-[#24354C]">
            Time
          </div>
          {days.map((day) => (
            <div
              key={day.dateString}
              className={`p-3 text-center border-r border-[#24354C] last:border-r-0 ${
                day.isToday ? 'bg-[#3988FF]/10' : ''
              }`}
            >
              <div className="text-xs text-[#A7B6CA] font-medium">{day.dayName}</div>
              <div
                className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold mt-0.5 ${
                  day.isToday
                    ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30'
                    : 'text-[#F0F5FF]'
                }`}
              >
                {day.dayNumber}
              </div>
            </div>
          ))}
        </div>

        {/* All-Day Row (Shows user tasks scheduled for that date) */}
        <div className="grid grid-cols-[60px_repeat(auto-fit,minmax(120px,1fr))] border-b border-[#24354C] bg-[#0B1220] text-xs">
          <div className="p-2 text-[10px] font-mono text-[#7789A4] text-center border-r border-[#24354C] flex items-center justify-center">
            all-day
          </div>
          {days.map((day) => {
            const dayTasks = tasks.filter((t) => t.scheduledDate === day.dateString);
            return (
              <div
                key={`allday-${day.dateString}`}
                className="p-1.5 border-r border-[#24354C] last:border-r-0 min-h-[40px] space-y-1"
              >
                {dayTasks.map((task) => (
                  <div
                    key={task.id}
                    className="px-2 py-1 rounded-md bg-[#3988FF]/15 border border-[#294B75] text-[#59C8FF] text-[10px] font-medium truncate"
                    title={task.title}
                  >
                    {task.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Scrollable Time Grid */}
        <div className="relative overflow-y-auto max-h-[600px] select-none bg-[#080D18]/50">
          {/* Real-time Red Line Marker */}
          {isRedLineVisible && (
            <div
              className="absolute left-0 right-0 z-30 pointer-events-none flex items-center"
              style={{ top: `${currentRedLineY}px` }}
            >
              <div className="w-[60px] text-right pr-2 text-[10px] font-mono font-bold text-rose-500">
                {currentTimeFormatted}
              </div>
              <div className="flex-1 h-[2px] bg-rose-500 relative">
                <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#F43F5E]" />
              </div>
            </div>
          )}

          {/* Time Hour Rows */}
          {hours.map((hour) => (
            <div
              key={hour}
              className="grid grid-cols-[60px_repeat(auto-fit,minmax(120px,1fr))] border-b border-[#24354C]/60 min-h-[64px]"
            >
              <div className="p-2 text-[11px] font-mono text-[#7789A4] text-center border-r border-[#24354C]/60">
                {hour.toString().padStart(2, '0')}:00
              </div>
              {days.map((day) => (
                <div
                  key={`${hour}-${day.dateString}`}
                  className="border-r border-[#24354C]/60 last:border-r-0 relative hover:bg-[#131F32]/50 transition-colors"
                />
              ))}
            </div>
          ))}

          {/* Overlay User Events */}
          {days.map((day, colIdx) => {
            const dayEvents = plannerEvents.filter((ev) => ev.date === day.dateString);
            const colLeftOffset = `calc(60px + ${colIdx} * ((100% - 60px) / ${days.length}))`;
            const colWidth = `calc((100% - 60px) / ${days.length} - 8px)`;

            return (
              <React.Fragment key={`events-${day.dateString}`}>
                {dayEvents.map((event) => {
                  const topPx = timeToPx(event.startTime);
                  const endPx = timeToPx(event.endTime);
                  const heightPx = Math.max(28, endPx - topPx);

                  let colorClass =
                    'bg-[#131F32] border-[#294B75] text-[#F0F5FF] hover:border-[#3988FF] shadow-sm';
                  if (event.category === 'study') {
                    colorClass =
                      'bg-[#101A2B] border-[#294B75] text-[#59C8FF] shadow-[0_0_12px_rgba(57,136,255,0.15)]';
                  } else if (event.category === 'work') {
                    colorClass =
                      'bg-[#101A2B] border-purple-500/40 text-purple-200 shadow-sm shadow-purple-500/10';
                  }

                  return (
                    <div
                      key={event.id}
                      className={`absolute rounded-xl border p-2 text-xs transition-all cursor-pointer overflow-hidden group ${colorClass}`}
                      style={{
                        top: `${topPx}px`,
                        height: `${heightPx}px`,
                        left: colLeftOffset,
                        width: colWidth,
                        marginLeft: '4px',
                      }}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono opacity-80 mb-0.5">
                        <span>
                          {event.startTime} → {event.endTime}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePlannerEvent(event.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-0.5 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="font-semibold truncate text-[11px] sm:text-xs">
                        {event.title}
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Add Event Modal */}
      {isAddEventOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#101A2B] border border-[#294B75] rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#24354C] pb-3">
              <h3 className="text-base font-bold text-[#F0F5FF]">Add Schedule Event</h3>
              <button
                onClick={() => setIsAddEventOpen(false)}
                className="text-[#A7B6CA] hover:text-[#F0F5FF] text-xs px-2 py-1 rounded"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#A7B6CA] mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. Biology Study Group, Lab Session"
                  required
                  autoFocus
                  className="w-full px-3 py-2 rounded-xl bg-[#0B1220] border border-[#24354C] text-sm text-[#F0F5FF] placeholder-[#7789A4] focus:outline-none focus:border-[#3988FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A7B6CA] mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B1220] border border-[#24354C] text-sm text-[#F0F5FF] focus:outline-none focus:border-[#3988FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#A7B6CA] mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={eventStart}
                    onChange={(e) => setEventStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B1220] border border-[#24354C] text-sm text-[#F0F5FF] focus:outline-none focus:border-[#3988FF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#A7B6CA] mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={eventEnd}
                    onChange={(e) => setEventEnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B1220] border border-[#24354C] text-sm text-[#F0F5FF] focus:outline-none focus:border-[#3988FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A7B6CA] mb-1">
                  Category
                </label>
                <select
                  value={eventCategory}
                  onChange={(e) => setEventCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B1220] border border-[#24354C] text-sm text-[#F0F5FF] focus:outline-none focus:border-[#3988FF]"
                >
                  <option value="study">Study</option>
                  <option value="work">Work / Assignment</option>
                  <option value="personal">Personal / Habit</option>
                  <option value="routine">Routine</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#24354C]">
                <button
                  type="button"
                  onClick={() => setIsAddEventOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#A7B6CA] hover:text-[#F0F5FF]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold btn-electric-primary"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
