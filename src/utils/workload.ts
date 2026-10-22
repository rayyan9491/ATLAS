import type { RealityCheckResult, Task } from '../types/index.ts';

/**
 * Calculates workload metrics comparing available time with planned task duration.
 * Accurately measures remaining workload vs already completed work.
 */
export function calculateWorkload(
  tasks: Task[],
  availableMinutes: number,
  targetDate: string
): RealityCheckResult {
  const dayTasks = tasks.filter((t) => t.scheduledDate === targetDate);

  let plannedMinutes = 0;
  let completedMinutes = 0;
  let remainingMinutes = 0;

  for (const task of dayTasks) {
    const mins = Math.max(0, task.estimatedMinutes || 0);
    plannedMinutes += mins;

    if (task.status === 'completed') {
      completedMinutes += mins;
    } else {
      remainingMinutes += mins;
    }
  }

  // Workload available capacity vs remaining work
  const diffMinutes = availableMinutes - remainingMinutes;
  const overMinutes = diffMinutes < 0 ? Math.abs(diffMinutes) : 0;

  // Percentage utilized based on remaining work vs available time
  let percentUtilized = 0;
  if (availableMinutes > 0) {
    percentUtilized = Math.round((remainingMinutes / availableMinutes) * 100);
  } else if (remainingMinutes > 0) {
    percentUtilized = 100;
  }

  let status: 'under_capacity' | 'balanced' | 'over_capacity' = 'balanced';
  if (diffMinutes < 0) {
    status = 'over_capacity';
  } else if (diffMinutes >= 30) {
    status = 'under_capacity';
  } else {
    status = 'balanced';
  }

  return {
    availableMinutes,
    plannedMinutes,
    completedMinutes,
    remainingMinutes,
    diffMinutes,
    percentUtilized,
    status,
    overMinutes,
  };
}
