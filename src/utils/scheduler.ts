import type { Task } from '../types/index.ts';

export interface ReplanProposal {
  targetDate: string;
  availableMinutes: number;
  initialTotalMinutes: number;
  keptTasks: Task[];
  deferredTasks: { task: Task; newDate: string; reason: string }[];
  rationale: string;
}

/**
 * Deterministic schedule adjuster when user changes available time or is over capacity.
 * Retains high/critical priority and urgent deadline tasks, while rescheduling lowest priority tasks
 * to tomorrow or next available day without silently deleting anything.
 */
export function generateDeterministicReplan(
  tasks: Task[],
  targetDate: string,
  newAvailableMinutes: number
): ReplanProposal {
  const dayTasks = tasks.filter(
    (t) => t.scheduledDate === targetDate && t.status !== 'completed' && t.status !== 'deferred'
  );

  const initialTotalMinutes = dayTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0);

  // If already fits, keep everything
  if (initialTotalMinutes <= newAvailableMinutes) {
    return {
      targetDate,
      availableMinutes: newAvailableMinutes,
      initialTotalMinutes,
      keptTasks: dayTasks,
      deferredTasks: [],
      rationale: `All ${dayTasks.length} pending tasks (${initialTotalMinutes} mins) comfortably fit within your available ${newAvailableMinutes} minutes window.`,
    };
  }

  // Next day string helper
  const targetDateObj = new Date(targetDate);
  const nextDateObj = new Date(targetDateObj.getTime() + 24 * 60 * 60 * 1000);
  const nextDateStr = nextDateObj.toISOString().split('T')[0];

  // Sort tasks by priority descending (Critical > High > Medium > Low), then by deadline
  const priorityWeights: Record<string, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  const sortedTasks = [...dayTasks].sort((a, b) => {
    const pDiff = (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0);
    if (pDiff !== 0) return pDiff;
    if (a.deadline && b.deadline) return a.deadline.localeCompare(b.deadline);
    if (a.deadline) return -1;
    if (b.deadline) return 1;
    return (a.estimatedMinutes || 0) - (b.estimatedMinutes || 0);
  });

  let currentAccumulated = 0;
  const keptTasks: Task[] = [];
  const deferredTasks: { task: Task; newDate: string; reason: string }[] = [];

  for (const task of sortedTasks) {
    const mins = task.estimatedMinutes || 30;
    // Always keep critical priority or tasks due today if under or within slight threshold
    const isMustKeep = task.priority === 'critical' || task.deadline === targetDate;

    if (currentAccumulated + mins <= newAvailableMinutes || (isMustKeep && keptTasks.length === 0)) {
      keptTasks.push(task);
      currentAccumulated += mins;
    } else {
      deferredTasks.push({
        task,
        newDate: nextDateStr,
        reason: `Exceeds available time capacity (${newAvailableMinutes}m). Postponed to preserve focus on ${keptTasks.length} higher-priority item(s).`,
      });
    }
  }

  return {
    targetDate,
    availableMinutes: newAvailableMinutes,
    initialTotalMinutes,
    keptTasks,
    deferredTasks,
    rationale: `Optimized plan to fit ${newAvailableMinutes} mins: Kept ${keptTasks.length} essential tasks (${currentAccumulated}m total) and proposed moving ${deferredTasks.length} lower-priority task(s) to ${nextDateStr}.`,
  };
}
