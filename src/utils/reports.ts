import type { Goal, Task, WeeklyReportData } from '../types/index.ts';

export function generateWeeklyRealityReport(
  tasks: Task[],
  goals: Goal[],
  weekDates: string[]
): WeeklyReportData {
  const weekSet = new Set(weekDates);
  const weekTasks = tasks.filter((t) => weekSet.has(t.scheduledDate));

  const plannedCount = weekTasks.length;
  const completedTasks = weekTasks.filter((t) => t.status === 'completed');
  const completedCount = completedTasks.length;
  const postponedTasks = weekTasks.filter((t) => t.status === 'deferred');
  const postponedCount = postponedTasks.length;

  const totalPlannedMinutes = weekTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0);
  const totalCompletedMinutes = completedTasks.reduce(
    (acc, t) => acc + (t.actualMinutes || t.estimatedMinutes || 0),
    0
  );

  const completionRate = plannedCount > 0 ? Math.round((completedCount / plannedCount) * 100) : 0;

  // Breakdown by goal
  const goalStats = new Map<string, { total: number; completed: number }>();
  for (const t of weekTasks) {
    if (t.goalId) {
      const curr = goalStats.get(t.goalId) || { total: 0, completed: 0 };
      curr.total++;
      if (t.status === 'completed') curr.completed++;
      goalStats.set(t.goalId, curr);
    }
  }

  const topGoals = goals.map((g) => {
    const stats = goalStats.get(g.id) || { total: 0, completed: 0 };
    return {
      id: g.id,
      title: g.title,
      completedTasks: stats.completed,
      totalTasks: stats.total,
    };
  });

  // Milestones reached during the week
  const milestonesReached: { id: string; title: string; goalTitle: string }[] = [];
  for (const g of goals) {
    for (const m of g.milestones) {
      if (m.status === 'completed' && m.completedAt) {
        const completedDate = m.completedAt.split('T')[0];
        if (weekSet.has(completedDate)) {
          milestonesReached.push({
            id: m.id,
            title: m.title,
            goalTitle: g.title,
          });
        }
      }
    }
  }

  // Generate deterministic observations based purely on stored records
  const observations: string[] = [];
  if (plannedCount === 0) {
    observations.push('No tasks were scheduled for this 7-day period.');
  } else {
    observations.push(
      `You completed ${completedCount} of ${plannedCount} scheduled tasks (${completionRate}% execution velocity).`
    );
    observations.push(
      `Recorded ${totalCompletedMinutes} minutes of actual execution out of ${totalPlannedMinutes} minutes originally estimated.`
    );
    if (postponedCount > 0) {
      observations.push(
        `${postponedCount} task(s) were deferred or rescheduled, indicating possible initial capacity overestimation.`
      );
    }

    const neglectedGoals = topGoals.filter((g) => g.totalTasks === 0);
    if (neglectedGoals.length > 0) {
      observations.push(
        `${neglectedGoals.length} active goal(s) ("${neglectedGoals[0].title}") had zero tasks scheduled this week.`
      );
    }
  }

  // Realistic adjustments
  const recommendations: string[] = [];
  if (completionRate < 60 && plannedCount > 0) {
    recommendations.push(
      'Cap daily scheduled work at 75% of your estimated available time to provide buffer against unexpected interruptions.'
    );
  } else if (completionRate >= 80) {
    recommendations.push(
      'Execution consistency is high. Consider promoting next-milestone tasks for your primary goal.'
    );
  }
  if (postponedCount >= 3) {
    recommendations.push(
      'Batch shorter tasks into a single 30-minute sprint block to reduce scheduling friction.'
    );
  }

  return {
    plannedCount,
    completedCount,
    completionRate,
    totalPlannedMinutes,
    totalCompletedMinutes,
    postponedCount,
    topGoals,
    milestonesReached,
    observations,
    recommendations,
  };
}
