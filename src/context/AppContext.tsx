import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import {
  Goal,
  Milestone,
  Task,
  UserStats,
  XpLedgerEntry,
  FocusSession,
  PlannerEvent,
  DailyLog,
  UserPreferences,
  CoachMessage,
  CoachErrorType,
  CoachActionProposal,
} from '../types/index.ts';
import { INITIAL_GOALS, INITIAL_TASKS, INITIAL_USER_STATS, INITIAL_XP_LEDGER } from '../data/seed.ts';
import { awardTaskCompletionXp } from '../utils/progression.ts';
import { getLocalDateString } from '../utils/dateUtils.ts';
import { db } from '../lib/firebase.ts';
import { useAuth } from './AuthContext.tsx';

export const DEFAULT_PREFERENCES: UserPreferences = {
  appearance: {
    theme: 'dark',
    accentColor: 'violet',
    reducedMotion: false,
    waveAnimation: true,
    waveIntensity: 0.9,
    dockLabels: true,
  },
  desktop: {
    rememberWindowPositions: true,
    defaultWindowSize: 'normal',
  },
  planning: {
    startOfWeek: 'monday',
    defaultTaskDuration: 25,
    workingDays: [1, 2, 3, 4, 5],
    typicalAvailableHours: 5,
  },
  focus: {
    defaultDuration: 25,
    autoBreak: true,
    soundPreset: 'none',
    soundVolume: 50,
  },
  aiCoach: {
    responseStyle: 'balanced',
    coachingStyle: 'supportive',
  },
  profile: {
    priorities: ['Focus on high-leverage goals', 'Consistent daily habits'],
    skillsToDevelop: ['Python & TypeScript', 'Time management'],
    personalBio: 'Focused on making real progress every day.',
  },
};

interface AppContextType {
  userStats: UserStats;
  updateUserStats: (updater: Partial<UserStats>) => void;
  goals: Goal[];
  createGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'milestones'>, initialMilestones?: string[]) => Goal;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addMilestone: (goalId: string, title: string, criteria?: string) => void;
  toggleMilestone: (goalId: string, milestoneId: string) => void;
  deleteMilestone: (goalId: string, milestoneId: string) => void;
  tasks: Task[];
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'xpReward'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  rescheduleTask: (id: string, newDate: string, newSlot?: Task['slot']) => void;
  applyReplan: (keptIds: string[], deferred: { taskId: string; newDate: string }[]) => void;
  todayDate: string;
  setTodayDate: (d: string) => void;
  xpLedger: XpLedgerEntry[];
  activeFocusTask: Task | null;
  setActiveFocusTask: (task: Task | null) => void;
  focusTimer: {
    isRunning: boolean;
    secondsElapsed: number;
    targetMinutes: number;
    activeTaskId: string | null;
    startedAtTimestamp?: number;
  };
  setFocusTimer: React.Dispatch<
    React.SetStateAction<{
      isRunning: boolean;
      secondsElapsed: number;
      targetMinutes: number;
      activeTaskId: string | null;
      startedAtTimestamp?: number;
    }>
  >;
  finishFocusSession: (taskId: string, recordedMinutes: number) => void;
  focusSessions: FocusSession[];
  saveFocusSession: (session: Omit<FocusSession, 'id'>) => FocusSession;
  plannerEvents: PlannerEvent[];
  createPlannerEvent: (event: Omit<PlannerEvent, 'id'>) => PlannerEvent;
  updatePlannerEvent: (id: string, updates: Partial<PlannerEvent>) => void;
  deletePlannerEvent: (id: string) => void;
  dailyLogs: Record<string, DailyLog>;
  setDailyIntention: (date: string, intention: string) => void;
  setDailyReflection: (date: string, reflection: DailyLog['reflection']) => void;
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  coachMessages: CoachMessage[];
  isCoachLoading: boolean;
  sendCoachMessage: (text: string) => Promise<void>;
  retryCoachMessage: (errorMsgId: string) => Promise<void>;
  respondToCoachProposal: (proposalId: string, accept: boolean) => void;
  clearCoachHistory: () => void;
  exportUserData: () => void;
  clearAllUserData: () => Promise<void>;
  resetToDemoData: () => void;
  loadStarterTemplate: () => void;
  hasAiConfigured: boolean;
  isSyncing: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userProfile } = useAuth();

  const [todayDate, setTodayDate] = useState<string>(() => {
    return getLocalDateString();
  });
  const [hasAiConfigured, setHasAiConfigured] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // User-scoped private state
  const [userStats, setUserStats] = useState<UserStats>(INITIAL_USER_STATS);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [xpLedger, setXpLedger] = useState<XpLedgerEntry[]>([]);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [plannerEvents, setPlannerEvents] = useState<PlannerEvent[]>([]);
  const [dailyLogs, setDailyLogs] = useState<Record<string, DailyLog>>({});
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [coachMessages, setCoachMessages] = useState<CoachMessage[]>([]);
  const [isCoachLoading, setIsCoachLoading] = useState<boolean>(false);

  // Focus room timer state with drift-free timestamp support and persistence
  const [activeFocusTask, setActiveFocusTask] = useState<Task | null>(null);
  const [focusTimer, setFocusTimer] = useState<{
    isRunning: boolean;
    secondsElapsed: number;
    targetMinutes: number;
    activeTaskId: string | null;
    startedAtTimestamp?: number;
  }>(() => {
    try {
      const activeUid = user?.uid || userProfile?.uid || 'guest';
      const savedTimer = localStorage.getItem(`irl_focus_timer_${activeUid}`);
      if (savedTimer) {
        const parsed = JSON.parse(savedTimer);
        if (parsed.isRunning && parsed.startedAtTimestamp) {
          const elapsed = Math.floor((Date.now() - parsed.startedAtTimestamp) / 1000);
          const maxSeconds = (parsed.targetMinutes || 25) * 60;
          if (elapsed < maxSeconds) {
            return {
              isRunning: true,
              secondsElapsed: Math.max(0, elapsed),
              targetMinutes: parsed.targetMinutes || 25,
              activeTaskId: parsed.activeTaskId || null,
              startedAtTimestamp: parsed.startedAtTimestamp,
            };
          }
        }
      }
    } catch {}
    return {
      isRunning: false,
      secondsElapsed: 0,
      targetMinutes: 25,
      activeTaskId: null,
    };
  });

  const currentUidRef = useRef<string | null>(null);

  // Clean non-AI mode active

  // Sync user profile data to userStats whenever userProfile changes
  useEffect(() => {
    if (userProfile) {
      setUserStats((prev) => ({
        ...prev,
        displayName: userProfile.displayName || prev.displayName,
        title: userProfile.roleTitle || prev.title,
        defaultAvailabilityMinutes:
          userProfile.defaultAvailabilityMinutes || prev.defaultAvailabilityMinutes,
        dailyAvailability: userProfile.dailyAvailability || prev.dailyAvailability || {},
      }));
    }
  }, [userProfile]);

  // Load local backups per active user UID (immediate local restoration)
  useEffect(() => {
    const activeUid = user?.uid || userProfile?.uid || 'guest';

    try {
      // 1. Preferences
      const storedPrefs = localStorage.getItem(`irl_prefs_${activeUid}`);
      if (storedPrefs) setPreferences(JSON.parse(storedPrefs));

      // 2. Daily logs
      const storedLogs = localStorage.getItem(`irl_logs_${activeUid}`);
      if (storedLogs) setDailyLogs(JSON.parse(storedLogs));

      // 3. Planner events
      const storedEvents = localStorage.getItem(`irl_events_${activeUid}`);
      if (storedEvents) {
        const parsed = JSON.parse(storedEvents);
        const real = Array.isArray(parsed) ? parsed.filter((e: any) => e.id !== 'e1' && e.id !== 'e2') : [];
        setPlannerEvents(real);
      } else {
        setPlannerEvents([]);
      }

      // 4. Focus sessions
      const storedSessions = localStorage.getItem(`irl_sessions_${activeUid}`);
      if (storedSessions) {
        const parsed = JSON.parse(storedSessions);
        const real = Array.isArray(parsed) ? parsed.filter((s: any) => s.id !== 'fs1') : [];
        setFocusSessions(real);
      } else {
        setFocusSessions([]);
      }

      // 5. Coach messages
      const storedCoach = localStorage.getItem(`irl_coach_${activeUid}`);
      if (storedCoach) {
        const parsed = JSON.parse(storedCoach);
        const real = Array.isArray(parsed) ? parsed.filter((m: any) => m.id !== 'cm1') : [];
        setCoachMessages(real);
      } else {
        setCoachMessages([]);
      }

      // 6. Goals from local cache
      const storedGoals = localStorage.getItem(`irl_goals_${activeUid}`);
      if (storedGoals) {
        const parsedGoals = JSON.parse(storedGoals);
        if (Array.isArray(parsedGoals) && parsedGoals.length > 0) {
          setGoals(parsedGoals);
        }
      }

      // 7. Tasks from local cache
      const storedTasks = localStorage.getItem(`irl_tasks_${activeUid}`);
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks);
        if (Array.isArray(parsedTasks) && parsedTasks.length > 0) {
          setTasks(parsedTasks);
        }
      }

      // 8. XP ledger from local cache
      const storedXp = localStorage.getItem(`irl_xp_${activeUid}`);
      if (storedXp) {
        const parsedXp = JSON.parse(storedXp);
        if (Array.isArray(parsedXp) && parsedXp.length > 0) {
          setXpLedger(parsedXp);
          const totalXp = parsedXp.reduce((acc: number, entry: any) => acc + (entry.xpAwarded || 0), 0);
          const calcLevel = Math.max(1, Math.floor(totalXp / 300) + 1);
          setUserStats((prev) => ({ ...prev, xp: totalXp, level: calcLevel }));
        }
      }
    } catch (e) {
      console.warn('Local storage load notice:', e);
    }
  }, [user, userProfile?.uid]);

  // Firestore real-time subscriptions with instant local backup
  useEffect(() => {
    const activeUid = user?.uid || userProfile?.uid;

    if (!activeUid) {
      currentUidRef.current = null;
      return;
    }

    if (currentUidRef.current !== activeUid) {
      currentUidRef.current = activeUid;
    }

    // Only attach remote Firestore listeners if user is authenticated with Firebase
    if (!user) return;

    setIsSyncing(true);

    const DEMO_IDS = new Set([
      'task-1', 'task-2', 'task-3', 'task-4', 'task-5', 'task-6', 'task-7',
      'goal-1', 'goal-2', 'goal-3', 'goal-4',
      'xp-seed-1', 'xp-seed-2', 'xp-seed-3',
    ]);

    const goalsCol = collection(db, 'users', user.uid, 'goals');
    const unsubGoals = onSnapshot(
      goalsCol,
      (snapshot) => {
        const loadedGoals: Goal[] = [];
        snapshot.forEach((docSnap) => {
          if (!DEMO_IDS.has(docSnap.id)) {
            loadedGoals.push({ id: docSnap.id, ...(docSnap.data() as any) });
          }
        });
        loadedGoals.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        if (loadedGoals.length > 0) {
          setGoals(loadedGoals);
          try {
            localStorage.setItem(`irl_goals_${user.uid}`, JSON.stringify(loadedGoals));
          } catch {}
        }
        setIsSyncing(false);
      },
      (err) => {
        console.warn('Goals sync subscription notice:', err?.message);
        setIsSyncing(false);
      }
    );

    const tasksCol = collection(db, 'users', user.uid, 'tasks');
    const unsubTasks = onSnapshot(
      tasksCol,
      (snapshot) => {
        const loadedTasks: Task[] = [];
        snapshot.forEach((docSnap) => {
          if (!DEMO_IDS.has(docSnap.id)) {
            loadedTasks.push({ id: docSnap.id, ...(docSnap.data() as any) });
          }
        });
        loadedTasks.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        if (loadedTasks.length > 0) {
          setTasks(loadedTasks);
          try {
            localStorage.setItem(`irl_tasks_${user.uid}`, JSON.stringify(loadedTasks));
          } catch {}
        }

        setActiveFocusTask((current) => {
          if (current && loadedTasks.some((t) => t.id === current.id)) {
            return loadedTasks.find((t) => t.id === current.id) || current;
          }
          const focusNow = loadedTasks.find((t) => t.slot === 'focus_now' && t.status !== 'completed');
          return focusNow || loadedTasks.find((t) => t.status !== 'completed') || loadedTasks[0] || null;
        });
      },
      (err) => {
        console.warn('Tasks sync subscription notice:', err?.message);
      }
    );

    const xpCol = collection(db, 'users', user.uid, 'xp_ledger');
    const unsubXp = onSnapshot(
      xpCol,
      (snapshot) => {
        const loadedXp: XpLedgerEntry[] = [];
        snapshot.forEach((docSnap) => {
          if (!DEMO_IDS.has(docSnap.id)) {
            loadedXp.push({ id: docSnap.id, ...(docSnap.data() as any) });
          }
        });
        loadedXp.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        if (loadedXp.length > 0) {
          setXpLedger(loadedXp);
          try {
            localStorage.setItem(`irl_xp_${user.uid}`, JSON.stringify(loadedXp));
          } catch {}

          const totalXp = loadedXp.reduce((acc, entry) => acc + (entry.xpAwarded || 0), 0);
          const calcLevel = Math.max(1, Math.floor(totalXp / 300) + 1);
          setUserStats((prev) => ({
            ...prev,
            xp: totalXp,
            level: calcLevel,
          }));
        }
      },
      (err) => {
        console.warn('XP ledger sync subscription notice:', err?.message);
      }
    );

    return () => {
      unsubGoals();
      unsubTasks();
      unsubXp();
    };
  }, [user, userProfile?.uid]);

  // Drift-free Focus timer ticker & persistence
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    const activeUid = user?.uid || userProfile?.uid || 'guest';

    if (focusTimer.isRunning) {
      interval = setInterval(() => {
        setFocusTimer((prev) => {
          if (!prev.isRunning) return prev;
          const nextSecs = prev.secondsElapsed + 1;
          const updated = {
            ...prev,
            secondsElapsed: nextSecs,
          };
          try {
            localStorage.setItem(`irl_focus_timer_${activeUid}`, JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }, 1000);
    } else {
      try {
        localStorage.removeItem(`irl_focus_timer_${activeUid}`);
      } catch {}
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [focusTimer.isRunning, user?.uid, userProfile?.uid]);

  const updateUserStats = (updater: Partial<UserStats>) => {
    setUserStats((prev) => {
      const next = { ...prev, ...updater };
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        updateDoc(userDocRef, {
          ...(updater.defaultAvailabilityMinutes !== undefined && {
            defaultAvailabilityMinutes: next.defaultAvailabilityMinutes,
          }),
          ...(updater.dailyAvailability !== undefined && {
            dailyAvailability: next.dailyAvailability,
          }),
          ...(updater.displayName !== undefined && {
            displayName: next.displayName,
          }),
        }).catch((e) => console.warn('Could not sync user stats to Firestore:', e));
      }
      return next;
    });
  };

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...updates };
      const uid = user?.uid || 'guest';
      try {
        localStorage.setItem(`irl_prefs_${uid}`, JSON.stringify(next));
      } catch (e) {
        console.warn(e);
      }
      return next;
    });
  };

  const setDailyIntention = (date: string, intention: string) => {
    setDailyLogs((prev) => {
      const current = prev[date] || { date };
      const updated = { ...prev, [date]: { ...current, intention } };
      const uid = user?.uid || 'guest';
      try {
        localStorage.setItem(`irl_logs_${uid}`, JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });
  };

  const setDailyReflection = (date: string, reflection: DailyLog['reflection']) => {
    setDailyLogs((prev) => {
      const current = prev[date] || { date };
      const updated = { ...prev, [date]: { ...current, reflection } };
      const uid = user?.uid || 'guest';
      try {
        localStorage.setItem(`irl_logs_${uid}`, JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });
  };

  const createGoal = (
    goalData: Omit<Goal, 'id' | 'createdAt' | 'milestones'>,
    initialMilestones: string[] = []
  ): Goal => {
    const id = `g-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newMilestones: Milestone[] = initialMilestones.map((title, idx) => ({
      id: `m-${Date.now()}-${idx}`,
      goalId: id,
      title,
      order: idx,
      status: idx === 0 ? 'in_progress' : 'locked',
    }));

    const newGoal: Goal = {
      ...goalData,
      id,
      milestones: newMilestones,
      createdAt: new Date().toISOString(),
    };

    setGoals((prev) => [newGoal, ...prev]);

    if (user) {
      const goalDocRef = doc(db, 'users', user.uid, 'goals', id);
      setDoc(goalDocRef, { ...newGoal, userId: user.uid }).catch(console.warn);
    }

    return newGoal;
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const updated = { ...g, ...updates };
        if (user) {
          const goalDocRef = doc(db, 'users', user.uid, 'goals', id);
          updateDoc(goalDocRef, updates as any).catch(console.warn);
        }
        return updated;
      })
    );
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    if (user) {
      const goalDocRef = doc(db, 'users', user.uid, 'goals', id);
      deleteDoc(goalDocRef).catch(console.warn);
    }
  };

  const addMilestone = (goalId: string, title: string, criteria?: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        const newMilestone: Milestone = {
          id: `m-${Date.now()}`,
          goalId,
          title,
          criteria,
          order: g.milestones.length,
          status: g.milestones.length === 0 ? 'in_progress' : 'locked',
        };
        const updatedMilestones = [...g.milestones, newMilestone];
        if (user) {
          const goalDocRef = doc(db, 'users', user.uid, 'goals', goalId);
          updateDoc(goalDocRef, { milestones: updatedMilestones }).catch(console.warn);
        }
        return { ...g, milestones: updatedMilestones };
      })
    );
  };

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        const updatedMilestones = g.milestones.map((m) => {
          if (m.id !== milestoneId) return m;
          const nextStatus: 'in_progress' | 'completed' = m.status === 'completed' ? 'in_progress' : 'completed';
          return {
            ...m,
            status: nextStatus,
            completedAt: nextStatus === 'completed' ? new Date().toISOString() : undefined,
          };
        });

        if (user) {
          const goalDocRef = doc(db, 'users', user.uid, 'goals', goalId);
          updateDoc(goalDocRef, { milestones: updatedMilestones }).catch(console.warn);
        }

        return { ...g, milestones: updatedMilestones };
      })
    );
  };

  const deleteMilestone = (goalId: string, milestoneId: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        const updatedMilestones = g.milestones.filter((m) => m.id !== milestoneId);
        if (user) {
          const goalDocRef = doc(db, 'users', user.uid, 'goals', goalId);
          updateDoc(goalDocRef, { milestones: updatedMilestones }).catch(console.warn);
        }
        return { ...g, milestones: updatedMilestones };
      })
    );
  };

  const createTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'xpReward'>): Task => {
    const id = `t-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const xpReward =
      taskData.priority === 'critical' ? 120 : taskData.priority === 'high' ? 80 : 40;

    const newTask: Task = {
      ...taskData,
      id,
      xpReward,
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);

    if (user) {
      const taskDocRef = doc(db, 'users', user.uid, 'tasks', id);
      setDoc(taskDocRef, { ...newTask, userId: user.uid }).catch(console.warn);
    }

    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const updated = { ...t, ...updates };
        if (user) {
          const taskDocRef = doc(db, 'users', user.uid, 'tasks', id);
          updateDoc(taskDocRef, updates as any).catch(console.warn);
        }
        return updated;
      })
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (user) {
      const taskDocRef = doc(db, 'users', user.uid, 'tasks', id);
      deleteDoc(taskDocRef).catch(console.warn);
    }
  };

  const toggleTaskComplete = (id: string) => {
    setTasks((prev) => {
      const target = prev.find((t) => t.id === id);
      if (!target) return prev;
      const isCompleted = target.status === 'completed';

      return prev.map((t) => {
        if (t.id !== id) return t;
        if (!isCompleted) {
          const completedTask: Task = {
            ...t,
            status: 'completed',
            slot: 'completed',
            completedAt: new Date().toISOString(),
          };

          if (user) {
            const taskDocRef = doc(db, 'users', user.uid, 'tasks', id);
            updateDoc(taskDocRef, {
              status: 'completed',
              slot: 'completed',
              completedAt: completedTask.completedAt,
            }).catch(console.warn);
          }

          const res = awardTaskCompletionXp(userStats.xp, xpLedger, t);
          if (res.newLedgerEntry) {
            setXpLedger((ledger) => [res.newLedgerEntry!, ...ledger]);
            if (user) {
              const xpDocRef = doc(db, 'users', user.uid, 'xp_ledger', res.newLedgerEntry.id);
              setDoc(xpDocRef, { ...res.newLedgerEntry, userId: user.uid }).catch(console.warn);
            }
          }
          updateUserStats({ xp: res.newTotalXp, level: res.newLevel, title: res.newTitle });

          return completedTask;
        } else {
          const uncompletedTask: Task = {
            ...t,
            status: 'todo',
            slot: 'up_next',
            completedAt: undefined,
          };

          if (user) {
            const taskDocRef = doc(db, 'users', user.uid, 'tasks', id);
            updateDoc(taskDocRef, {
              status: 'todo',
              slot: 'up_next',
              completedAt: null as any,
            }).catch(console.warn);
          }

          return uncompletedTask;
        }
      });
    });
  };

  const rescheduleTask = (id: string, newDate: string, newSlot?: Task['slot']) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const updated: Task = {
          ...t,
          scheduledDate: newDate,
          slot: newSlot || t.slot,
          status: t.status === 'deferred' ? 'todo' : t.status,
        };

        if (user) {
          const taskDocRef = doc(db, 'users', user.uid, 'tasks', id);
          updateDoc(taskDocRef, {
            scheduledDate: newDate,
            slot: updated.slot,
            status: updated.status,
          }).catch(console.warn);
        }

        return updated;
      })
    );
  };

  const applyReplan = (keptIds: string[], deferred: { taskId: string; newDate: string }[]) => {
    const keptSet = new Set(keptIds);
    const deferredMap = new Map(deferred.map((d) => [d.taskId, d.newDate]));

    setTasks((prev) =>
      prev.map((t) => {
        if (deferredMap.has(t.id)) {
          const newDate = deferredMap.get(t.id)!;
          if (user) {
            const taskDocRef = doc(db, 'users', user.uid, 'tasks', t.id);
            updateDoc(taskDocRef, { scheduledDate: newDate, status: 'deferred' }).catch(console.warn);
          }
          return {
            ...t,
            scheduledDate: newDate,
            status: 'deferred',
          };
        }
        if (keptSet.has(t.id)) {
          if (user) {
            const taskDocRef = doc(db, 'users', user.uid, 'tasks', t.id);
            updateDoc(taskDocRef, { status: t.status === 'deferred' ? 'todo' : t.status }).catch(
              console.warn
            );
          }
          return {
            ...t,
            status: t.status === 'deferred' ? 'todo' : t.status,
          };
        }
        return t;
      })
    );
  };

  const saveFocusSession = (sessionData: Omit<FocusSession, 'id'>): FocusSession => {
    const id = `fs-${Date.now()}`;
    const newSession: FocusSession = { ...sessionData, id };

    setFocusSessions((prev) => {
      const updated = [newSession, ...prev];
      const uid = user?.uid || 'guest';
      try {
        localStorage.setItem(`irl_sessions_${uid}`, JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });

    // Update task's actual minutes
    if (sessionData.taskId) {
      finishFocusSession(sessionData.taskId, sessionData.actualMinutes);
    }

    return newSession;
  };

  const finishFocusSession = (taskId: string, recordedMinutes: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const updatedActual = (t.actualMinutes || 0) + recordedMinutes;

        if (user) {
          const taskDocRef = doc(db, 'users', user.uid, 'tasks', taskId);
          updateDoc(taskDocRef, { actualMinutes: updatedActual }).catch(console.warn);
        }

        return {
          ...t,
          actualMinutes: updatedActual,
        };
      })
    );

    setFocusTimer((prev) => ({
      ...prev,
      isRunning: false,
      secondsElapsed: 0,
    }));
  };

  const createPlannerEvent = (eventData: Omit<PlannerEvent, 'id'>): PlannerEvent => {
    const id = `pe-${Date.now()}`;
    const newEvent: PlannerEvent = { ...eventData, id };

    setPlannerEvents((prev) => {
      const updated = [...prev, newEvent];
      const uid = user?.uid || 'guest';
      try {
        localStorage.setItem(`irl_events_${uid}`, JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });

    return newEvent;
  };

  const updatePlannerEvent = (id: string, updates: Partial<PlannerEvent>) => {
    setPlannerEvents((prev) => {
      const updated = prev.map((e) => (e.id === id ? { ...e, ...updates } : e));
      const uid = user?.uid || 'guest';
      try {
        localStorage.setItem(`irl_events_${uid}`, JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });
  };

  const deletePlannerEvent = (id: string) => {
    setPlannerEvents((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      const uid = user?.uid || 'guest';
      try {
        localStorage.setItem(`irl_events_${uid}`, JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });
  };

  const sendCoachMessage = async (_text: string) => {};
  const retryCoachMessage = async (_errorMsgId: string) => {};
  const respondToCoachProposal = (_proposalId: string, _accept: boolean) => {};
  const clearCoachHistory = () => {
    setCoachMessages([]);
  };

  const exportUserData = () => {
    const exportBundle = {
      userStats,
      goals,
      tasks,
      plannerEvents,
      focusSessions,
      dailyLogs,
      preferences,
      exportedAt: new Date().toISOString(),
      irlOsVersion: '1.0',
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportBundle, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `irl_os_export_${todayDate}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const clearAllUserData = async () => {
    const uid = user?.uid || 'guest';
    setGoals([]);
    setTasks([]);
    setFocusSessions([]);
    setPlannerEvents([]);
    setDailyLogs({});
    localStorage.removeItem(`irl_prefs_${uid}`);
    localStorage.removeItem(`irl_logs_${uid}`);
    localStorage.removeItem(`irl_events_${uid}`);
    localStorage.removeItem(`irl_sessions_${uid}`);
    localStorage.removeItem(`irl_coach_${uid}`);
  };

  const resetToDemoData = () => {
    setUserStats(INITIAL_USER_STATS);
    setGoals(INITIAL_GOALS);
    setTasks(INITIAL_TASKS);
    setXpLedger(INITIAL_XP_LEDGER);
    setTodayDate(new Date().toISOString().split('T')[0]);
  };

  const loadStarterTemplate = () => {
    if (!user) return;
    INITIAL_GOALS.forEach((goal) => {
      const gRef = doc(db, 'users', user.uid, 'goals', goal.id);
      setDoc(gRef, { ...goal, userId: user.uid }).catch(console.warn);
    });
    INITIAL_TASKS.forEach((task) => {
      const tRef = doc(db, 'users', user.uid, 'tasks', task.id);
      setDoc(tRef, { ...task, userId: user.uid }).catch(console.warn);
    });
  };

  return (
    <AppContext.Provider
      value={{
        userStats,
        updateUserStats,
        goals,
        createGoal,
        updateGoal,
        deleteGoal,
        addMilestone,
        toggleMilestone,
        deleteMilestone,
        tasks,
        createTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        rescheduleTask,
        applyReplan,
        todayDate,
        setTodayDate,
        xpLedger,
        activeFocusTask,
        setActiveFocusTask,
        focusTimer,
        setFocusTimer,
        finishFocusSession,
        focusSessions,
        saveFocusSession,
        plannerEvents,
        createPlannerEvent,
        updatePlannerEvent,
        deletePlannerEvent,
        dailyLogs,
        setDailyIntention,
        setDailyReflection,
        preferences,
        updatePreferences,
        coachMessages,
        isCoachLoading,
        sendCoachMessage,
        retryCoachMessage,
        respondToCoachProposal,
        clearCoachHistory,
        exportUserData,
        clearAllUserData,
        resetToDemoData,
        loadStarterTemplate,
        hasAiConfigured,
        isSyncing,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
