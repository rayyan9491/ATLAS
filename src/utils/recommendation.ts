import type { Goal, NextMoveRecommendation, Task } from '../types/index.ts';

/**
 * Transparent, deterministic ranking of tasks for the "Next Best Move".
 * Evaluates priority, deadline proximity, remaining available time, and goal importance.
 */
export function getDeterministicNextBestMove(
  tasks: Task[],
  availableMinutes: number,
  targetDate: string,
  goals: Goal[]
): NextMoveRecommendation | null {
  // Only look at pending tasks for the target date
  const candidateTasks = tasks.filter(
    (t) => t.scheduledDate === targetDate && t.status !== 'completed' && t.status !== 'deferred'
  );

  if (candidateTasks.length === 0) {
    return null;
  }

  // Calculate remaining minutes from already completed tasks today
  const completedTodayMinutes = tasks
    .filter((t) => t.scheduledDate === targetDate && t.status === 'completed')
    .reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0);

  const remainingAvailable = Math.max(0, availableMinutes - completedTodayMinutes);

  const goalMap = new Map<string, Goal>();
  goals.forEach((g) => goalMap.set(g.id, g));

  interface ScoredTask {
    task: Task;
    score: number;
    reason: string;
  }

  const scored: ScoredTask[] = candidateTasks.map((task) => {
    let score = 0;
    const reasons: string[] = [];

    // 1. Priority scoring
    if (task.priority === 'critical') {
      score += 50;
      reasons.push('marked as Critical priority');
    } else if (task.priority === 'high') {
      score += 35;
      reasons.push('High priority task');
    } else if (task.priority === 'medium') {
      score += 20;
    } else {
      score += 10;
    }

    // 2. Day slot bias (Focus Now comes first)
    if (task.slot === 'focus_now') {
      score += 30;
      reasons.push('designated for Focus Now');
    } else if (task.slot === 'up_next') {
      score += 15;
    }

    // 3. Deadline scoring
    if (task.deadline) {
      if (task.deadline <= targetDate) {
        score += 45;
        reasons.push('due today or urgent');
      } else {
        const daysAway = Math.round(
          (new Date(task.deadline).getTime() - new Date(targetDate).getTime()) / (1000 * 3600 * 24)
        );
        if (daysAway <= 2) {
          score += 25;
          reasons.push(`due in ${daysAway} day${daysAway === 1 ? '' : 's'}`);
        }
      }
    }

    // 4. Time fit
    const duration = task.estimatedMinutes || 30;
    if (duration <= remainingAvailable) {
      score += 20;
      reasons.push(`fits within your available window (${duration}m of ${remainingAvailable}m free)`);
    } else if (remainingAvailable > 0 && duration <= remainingAvailable + 15) {
      score += 5;
    } else {
      score -= 10;
      reasons.push(`exceeds remaining available window by ${duration - remainingAvailable}m`);
    }

    // 5. Goal importance
    if (task.goalId && goalMap.has(task.goalId)) {
      const parentGoal = goalMap.get(task.goalId)!;
      if (parentGoal.priority === 'critical' || parentGoal.priority === 'high') {
        score += 15;
        reasons.push(`directly advances priority goal "${parentGoal.title}"`);
      }
    }

    return {
      task,
      score,
      reason: reasons.length > 0 ? reasons.join('; ') : 'Optimal next scheduled step in your pipeline.',
    };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  const best = scored[0];
  const alternative = scored.length > 1 ? scored[1].task : undefined;

  return {
    taskId: best.task.id,
    task: best.task,
    reason: `Selected because it is ${best.reason}.`,
    alternativeTask: alternative,
    confidence: best.score >= 70 ? 'High' : 'Recommended',
  };
}

export function getNextBestMove(
  tasks: Task[],
  goals: Goal[],
  workload: { availableMinutes: number },
  targetDate: string = '2026-10-20'
): NextMoveRecommendation | null {
  return getDeterministicNextBestMove(tasks, workload.availableMinutes, targetDate, goals);
}
