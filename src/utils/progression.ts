import type { Task, XpLedgerEntry } from '../types/index.ts';

// Deterministic progression formula
// Level N requires base XP curve: Total XP for Level L = 200 * (L - 1)^1.4
export function calculateLevel(totalXp: number): number {
  if (totalXp <= 0) return 1;
  let level = 1;
  while (totalXp >= getXpForLevel(level + 1)) {
    level++;
  }
  return level;
}

export function getXpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.round(250 * Math.pow(level - 1, 1.45));
}

export function getProgressToNextLevel(totalXp: number): {
  currentLevel: number;
  currentLevelBaseXp: number;
  nextLevelXp: number;
  xpInCurrentLevel: number;
  xpNeededForNext: number;
  progressPercent: number;
} {
  const currentLevel = calculateLevel(totalXp);
  const currentLevelBaseXp = getXpForLevel(currentLevel);
  const nextLevelXp = getXpForLevel(currentLevel + 1);

  const xpInCurrentLevel = Math.max(0, totalXp - currentLevelBaseXp);
  const xpNeededForNext = Math.max(1, nextLevelXp - currentLevelBaseXp);
  const progressPercent = Math.min(100, Math.round((xpInCurrentLevel / xpNeededForNext) * 100));

  return {
    currentLevel,
    currentLevelBaseXp,
    nextLevelXp,
    xpInCurrentLevel,
    xpNeededForNext,
    progressPercent,
  };
}

export function getTitleForLevel(level: number): string {
  if (level >= 30) return 'Master of Reality';
  if (level >= 25) return 'Grand System Architect';
  if (level >= 20) return 'Prime Optimizer';
  if (level >= 15) return 'High-Velocity Operator';
  if (level >= 10) return 'System Tactician';
  if (level >= 6) return 'Focused Specialist';
  if (level >= 3) return 'Disciplined Builder';
  return 'Novice Operator';
}

/**
 * Checks if XP has already been awarded for this specific task ID to prevent duplicate clicks/reloads.
 */
export function hasXpBeenAwardedForTask(ledger: XpLedgerEntry[], taskId: string): boolean {
  return ledger.some((entry) => entry.taskId === taskId);
}

/**
 * Deterministically computes base XP reward for a task based on duration and priority.
 */
export function computeTaskXp(estimatedMinutes: number, priority: string): number {
  let base = Math.max(10, Math.round(estimatedMinutes * 0.75));
  if (priority === 'critical') base = Math.round(base * 1.5);
  else if (priority === 'high') base = Math.round(base * 1.25);
  else if (priority === 'low') base = Math.round(base * 0.85);
  return Math.max(15, base);
}

/**
 * Safely awards XP only if not previously granted.
 */
export function awardTaskCompletionXp(
  currentTotalXp: number,
  ledger: XpLedgerEntry[],
  task: Task
): {
  newTotalXp: number;
  newLevel: number;
  newTitle: string;
  xpAwarded: number;
  newLedgerEntry?: XpLedgerEntry;
  alreadyAwarded: boolean;
} {
  if (hasXpBeenAwardedForTask(ledger, task.id)) {
    const currentLevel = calculateLevel(currentTotalXp);
    return {
      newTotalXp: currentTotalXp,
      newLevel: currentLevel,
      newTitle: getTitleForLevel(currentLevel),
      xpAwarded: 0,
      alreadyAwarded: true,
    };
  }

  const xpReward = task.xpReward || computeTaskXp(task.estimatedMinutes, task.priority);
  const newTotalXp = currentTotalXp + xpReward;
  const newLevel = calculateLevel(newTotalXp);
  const newTitle = getTitleForLevel(newLevel);

  const newLedgerEntry: XpLedgerEntry = {
    id: `xp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    taskId: task.id,
    xpAwarded: xpReward,
    timestamp: new Date().toISOString(),
    reason: `Completed: ${task.title}`,
  };

  return {
    newTotalXp,
    newLevel,
    newTitle,
    xpAwarded: xpReward,
    newLedgerEntry,
    alreadyAwarded: false,
  };
}
