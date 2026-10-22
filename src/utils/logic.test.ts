import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateWorkload } from './workload.ts';
import {
  calculateLevel,
  hasXpBeenAwardedForTask,
  awardTaskCompletionXp,
  getProgressToNextLevel,
  getTitleForLevel,
} from './progression.ts';
import { getDeterministicNextBestMove } from './recommendation.ts';
import { generateDeterministicReplan } from './scheduler.ts';
import type { Task, Goal, XpLedgerEntry } from '../types/index.ts';

const mockTasks: Task[] = [
  {
    id: 't-1',
    title: 'Ship Core Database Schema',
    scheduledDate: '2026-10-20',
    slot: 'focus_now',
    estimatedMinutes: 60,
    priority: 'critical',
    status: 'todo',
    deadline: '2026-10-20',
    xpReward: 100,
    createdAt: '2026-10-19T10:00:00Z',
  },
  {
    id: 't-2',
    title: 'Write API Documentation',
    scheduledDate: '2026-10-20',
    slot: 'up_next',
    estimatedMinutes: 45,
    priority: 'medium',
    status: 'todo',
    xpReward: 40,
    createdAt: '2026-10-19T11:00:00Z',
  },
  {
    id: 't-3',
    title: 'Morning Code Review',
    scheduledDate: '2026-10-20',
    slot: 'completed',
    estimatedMinutes: 30,
    actualMinutes: 25,
    priority: 'high',
    status: 'completed',
    xpReward: 50,
    completedAt: '2026-10-20T08:30:00Z',
    createdAt: '2026-10-19T09:00:00Z',
  },
];

const mockGoals: Goal[] = [
  {
    id: 'g-1',
    title: 'Launch SaaS Alpha',
    description: 'Build and deploy the operational MVP',
    category: 'career',
    priority: 'critical',
    status: 'active',
    milestones: [],
    createdAt: '2026-10-01T00:00:00Z',
  },
];

test('Workload calculation correctly identifies capacity and remaining work', () => {
  // Available: 120 mins. Pending tasks: t-1 (60m) + t-2 (45m) = 105 mins. Completed: t-3 (30m).
  const result = calculateWorkload(mockTasks, 120, '2026-10-20');
  assert.equal(result.availableMinutes, 120);
  assert.equal(result.plannedMinutes, 135);
  assert.equal(result.completedMinutes, 30);
  assert.equal(result.remainingMinutes, 105);
  assert.equal(result.diffMinutes, 15); // 120 - 105 = 15 mins buffer
  assert.equal(result.status, 'balanced');
  assert.equal(result.overMinutes, 0);

  // Under capacity test: 200m available, 105m remaining -> 95m buffer
  const underResult = calculateWorkload(mockTasks, 200, '2026-10-20');
  assert.equal(underResult.status, 'under_capacity');

  // Over capacity test: Available only 60m, remaining 105m -> over by 45m
  const overResult = calculateWorkload(mockTasks, 60, '2026-10-20');
  assert.equal(overResult.diffMinutes, -45);
  assert.equal(overResult.overMinutes, 45);
  assert.equal(overResult.status, 'over_capacity');
});

test('Progression engine scales levels and prevents duplicate XP rewards', () => {
  const level1 = calculateLevel(0);
  assert.equal(level1, 1);
  assert.equal(getTitleForLevel(1), 'Novice Operator');

  const level5 = calculateLevel(1500);
  assert.ok(level5 > 1);

  const emptyLedger: XpLedgerEntry[] = [];
  const awardResult = awardTaskCompletionXp(500, emptyLedger, mockTasks[0]);
  assert.equal(awardResult.xpAwarded, 100);
  assert.equal(awardResult.newTotalXp, 600);
  assert.equal(awardResult.alreadyAwarded, false);
  assert.ok(awardResult.newLedgerEntry);

  // Test duplicate prevention
  const updatedLedger: XpLedgerEntry[] = [awardResult.newLedgerEntry!];
  assert.equal(hasXpBeenAwardedForTask(updatedLedger, 't-1'), true);

  const duplicateAttempt = awardTaskCompletionXp(600, updatedLedger, mockTasks[0]);
  assert.equal(duplicateAttempt.xpAwarded, 0);
  assert.equal(duplicateAttempt.newTotalXp, 600);
  assert.equal(duplicateAttempt.alreadyAwarded, true);
});

test('Deterministic Next Best Move picks the highest-priority, due-today task', () => {
  const recommendation = getDeterministicNextBestMove(mockTasks, 120, '2026-10-20', mockGoals);
  assert.ok(recommendation !== null);
  // t-1 is critical priority, due today, and marked focus_now
  assert.equal(recommendation.taskId, 't-1');
  assert.ok(recommendation.reason.includes('Critical'));
});

test('Adaptive schedule replan keeps critical items and defers lower priority when constrained', () => {
  // Only 60 mins available. t-1 takes 60m (critical). t-2 takes 45m (medium).
  const replan = generateDeterministicReplan(mockTasks, '2026-10-20', 60);
  assert.equal(replan.keptTasks.length, 1);
  assert.equal(replan.keptTasks[0].id, 't-1');
  assert.equal(replan.deferredTasks.length, 1);
  assert.equal(replan.deferredTasks[0].task.id, 't-2');
  assert.ok(replan.rationale.length > 0);
});
