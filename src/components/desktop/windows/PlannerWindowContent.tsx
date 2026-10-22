import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Trash2,
  AlertTriangle,
  X,
  Check,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext.tsx';
import { useTheme } from '../../../context/ThemeContext.tsx';
import { PlannerEvent } from '../../../types/index.ts';
import { getLocalDateString } from '../../../utils/dateUtils.ts';

export const PlannerWindowContent: React.FC = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const {
    plannerEvents,
    createPlannerEvent,
    deletePlannerEvent,
    tasks,
    todayDate,
    preferences,
  } = useApp();

  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState<string>(todayDate);

  // New Event Modal State
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState(todayDate);
  const [eventStart, setEventStart] = useState('09:00');
  const [eventEnd, setEventEnd] = useState('10:00');
  const [eventCategory, setEventCategory] = useState<PlannerEvent['category']>('work');
  const [eventLocation, setEventLocation] = useState('');
  const [isFixed, setIsFixed] = useState(true);

  // Calculate week days around selectedDate
  const getWeekDays = (baseDateStr: string) => {
    const base = new Date(baseDateStr);
    const dayOfWeek = base.getDay(); // 0 is Sunday
    const distanceToMonday = (dayOfWeek + 6) % 7; // Monday as start
    const monday = new Date(base);
    monday.setDate(base.getDate() - distanceToMonday);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = getLocalDateString(d);
      days.push({
        dateStr: iso,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: d.getDate(),
        isToday: iso === todayDate,
        isSelected: iso === selectedDate,
      });
    }
    return days;
  };

  const weekDays = getWeekDays(selectedDate);

  // Time grid slots
  const hours = [
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
  ];

  // Conflict detection helper
  const hasConflict = (ev1: PlannerEvent, ev2: PlannerEvent) => {
    if (ev1.date !== ev2.date || ev1.id === ev2.id) return false;
    return ev1.startTime < ev2.endTime && ev2.startTime < ev1.endTime;
  };

  const handleCreateEvent = () => {
    if (!eventTitle.trim()) return;

    createPlannerEvent({
      title: eventTitle.trim(),
      date: eventDate,
      startTime: eventStart,
      endTime: eventEnd,
      category: eventCategory,
      location: eventLocation.trim() || undefined,
      isFixedCommitment: isFixed,
    });

    setShowEventModal(false);
    setEventTitle('');
    setEventLocation('');
  };

  const navigateDays = (delta: number) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const cur = new Date(y, m - 1, d);
    cur.setDate(cur.getDate() + (viewMode === 'week' ? delta * 7 : delta));
    setSelectedDate(getLocalDateString(cur));
  };

  return (
    <div className="h-full flex flex-col p-4 overflow-hidden text-xs select-none">
      {/* Top Controls: Date range, Views, Add Event */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5 mb-3">
        {/* Left: Navigation and Range */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedDate(todayDate)}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium border border-white/10 text-[11px] cursor-pointer"
          >
            Today
          </button>
          <div className="flex items-center gap-0.5 text-[#939BB0]">
            <button
              onClick={() => navigateDays(-1)}
              className="p-1 rounded hover:bg-white/5 cursor-pointer"
              title="Previous"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={() => navigateDays(1)}
              className="p-1 rounded hover:bg-white/5 cursor-pointer"
              title="Next"
            >
              <ChevronRight size={15} />
            </button>
          </div>
          <span className="font-bold text-xs text-white">
            {new Date(selectedDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>

        {/* Right: View Toggle & Create Event */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-black/40 rounded-xl p-0.5 border border-white/10">
            {(['day', 'week', 'month'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`px-3 py-1 rounded-lg text-[10px] font-semibold capitalize transition-all cursor-pointer ${
                  viewMode === m
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-[#939BB0] hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowEventModal(true)}
            className="px-3 py-1.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold text-[11px] shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Plus size={12} />
            <span>Add event</span>
          </button>
        </div>
      </div>

      {/* Week View */}
      {viewMode === 'week' && (
        <div className="flex-1 overflow-auto flex flex-col min-w-[650px]">
          {/* Header row with Days */}
          <div className="grid grid-cols-8 gap-2 pb-2 border-b border-white/5 text-center font-mono text-[10px]">
            <div className="text-[#939BB0] py-1">Time</div>
            {weekDays.map((d) => (
              <div
                key={d.dateStr}
                onClick={() => setSelectedDate(d.dateStr)}
                className={`py-1.5 px-1 rounded-xl cursor-pointer transition-colors ${
                  d.isToday
                    ? 'bg-violet-500/20 text-[#67E8F9] font-bold border border-violet-500/40'
                    : d.isSelected
                    ? 'bg-white/10 text-white'
                    : 'text-[#939BB0] hover:text-white'
                }`}
              >
                <div className="uppercase font-semibold">{d.dayName}</div>
                <div className="text-xs font-bold text-white">{d.dayNumber}</div>
              </div>
            ))}
          </div>

          {/* Time Rows */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pt-2">
            {hours.map((hour) => {
              return (
                <div key={hour} className="grid grid-cols-8 gap-2 min-h-[46px] items-stretch">
                  <div className="text-[#939BB0] font-mono text-[10px] flex items-center justify-center border-r border-white/5">
                    {hour}
                  </div>

                  {weekDays.map((d) => {
                    const cellEvents = plannerEvents.filter(
                      (e) => e.date === d.dateStr && e.startTime.startsWith(hour.slice(0, 2))
                    );

                    return (
                      <div
                        key={d.dateStr}
                        className="rounded-xl p-1 bg-white/[0.01] hover:bg-white/[0.04] transition-colors relative flex flex-col gap-1 border border-transparent hover:border-white/5 min-h-[42px]"
                      >
                        {cellEvents.map((ev) => {
                          const categoryColor =
                            ev.category === 'exercise'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : ev.category === 'study'
                              ? 'bg-cyan-500/20 text-[#67E8F9] border-cyan-500/40'
                              : 'bg-violet-600/30 text-violet-200 border-violet-500/40';

                          return (
                            <div
                              key={ev.id}
                              className={`p-1.5 rounded-lg border text-[10px] font-semibold flex flex-col justify-between group relative ${categoryColor}`}
                            >
                              <div className="truncate font-bold">{ev.title}</div>
                              <div className="text-[9px] opacity-75 font-mono">
                                {ev.startTime} - {ev.endTime}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deletePlannerEvent(ev.id);
                                }}
                                className="absolute top-1 right-1 p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-black/40 text-white transition-opacity cursor-pointer"
                                title="Remove event"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Day View */}
      {viewMode === 'day' && (
        <div className="flex-1 overflow-y-auto space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <h4 className="font-bold text-sm text-white">
              Schedule for{' '}
              {new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </h4>
          </div>

          <div className="space-y-2">
            {plannerEvents.filter((e) => e.date === selectedDate).length > 0 ? (
              plannerEvents
                .filter((e) => e.date === selectedDate)
                .map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-violet-500/20 text-[#A78BFA]">
                        <Clock size={14} />
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{ev.title}</div>
                        <div className="text-[11px] text-[#939BB0] flex items-center gap-2 mt-0.5">
                          <span>
                            {ev.startTime} - {ev.endTime}
                          </span>
                          {ev.location && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <MapPin size={10} />
                                {ev.location}
                              </span>
                            </>
                          )}
                          <span>•</span>
                          <span className="capitalize">{ev.category || 'Commitment'}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => deletePlannerEvent(ev.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/20 text-[#939BB0] hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
            ) : (
              <div className="text-center py-8 text-[#939BB0]">
                No events scheduled for this day. Click "Add event" above to schedule one.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Month View Simple Overview */}
      {viewMode === 'month' && (
        <div className="flex-1 overflow-y-auto p-2 text-center text-[#939BB0] flex flex-col items-center justify-center">
          <CalendarIcon size={32} className="opacity-40 mb-2" />
          <p className="text-sm font-semibold text-white">Month overview</p>
          <p className="text-xs text-[#939BB0] max-w-sm mt-1">
            Displaying events across 4 weeks. Switch to Week view for detailed slot scheduling.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 justify-center max-w-lg">
            {plannerEvents.slice(0, 6).map((ev) => (
              <div
                key={ev.id}
                className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs flex items-center gap-2"
              >
                <span className="text-[#67E8F9] font-mono text-[10px]">{ev.date}</span>
                <span className="font-semibold">{ev.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md p-5 rounded-2xl border shadow-2xl space-y-4 ${
              isLight
                ? 'bg-white border-slate-300 text-slate-800'
                : 'bg-[#121626] border-white/15 text-white'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="font-bold text-base flex items-center gap-2">
                <CalendarIcon size={16} className="text-[#A78BFA]" />
                <span>Create schedule event</span>
              </h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="p-1 rounded hover:bg-white/10 text-[#939BB0] cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#939BB0] font-semibold mb-1">
                  Event title
                </label>
                <input
                  type="text"
                  placeholder="e.g., Team Sync, Gym Workout, Study Session"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none focus:border-violet-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[#939BB0] font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[#939BB0] font-semibold mb-1">Start</label>
                  <input
                    type="time"
                    value={eventStart}
                    onChange={(e) => setEventStart(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[#939BB0] font-semibold mb-1">End</label>
                  <input
                    type="time"
                    value={eventEnd}
                    onChange={(e) => setEventEnd(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#939BB0] font-semibold mb-1">
                    Category
                  </label>
                  <select
                    value={eventCategory}
                    onChange={(e) =>
                      setEventCategory(e.target.value as PlannerEvent['category'])
                    }
                    className="w-full px-2.5 py-1.5 rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none text-xs"
                  >
                    <option value="work">Work & Projects</option>
                    <option value="study">Study & Learning</option>
                    <option value="exercise">Health & Fitness</option>
                    <option value="personal">Personal Routine</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#939BB0] font-semibold mb-1">
                    Location (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Home desk, Office, Gym"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setShowEventModal(false)}
                className="px-3 py-1.5 rounded-xl hover:bg-white/10 text-[#939BB0] text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateEvent}
                className="px-4 py-1.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold shadow-md shadow-violet-500/20 cursor-pointer"
              >
                Save event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
