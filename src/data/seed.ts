import { Goal, Task, UserStats, XpLedgerEntry } from '../types/index.ts';

export const INITIAL_USER_STATS: UserStats = {
  displayName: '',
  avatarSeed: '',
  level: 1,
  xp: 0,
  title: 'Operator',
  gamificationEnabled: true,
  defaultAvailabilityMinutes: 300, // 5 hours
  dailyAvailability: {},
  autoReplanWithAi: true,
};

export const INITIAL_GOALS: Goal[] = [];

export const INITIAL_TASKS: Task[] = [];

export const INITIAL_XP_LEDGER: XpLedgerEntry[] = [];
