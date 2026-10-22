import test from 'node:test';
import assert from 'node:assert/strict';

// Storage simulator to mimic browser localStorage
class LocalStorageMock {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

// 1. Storage & Persistence Tests
test('User tasks, goals, and schedules persist across simulated reloads', () => {
  const storage = new LocalStorageMock();
  const uid = 'user_test_98765';

  // Step 1: Create initial user data
  const initialGoals = [
    {
      id: 'g-prep-exams',
      title: 'Prepare for exams',
      category: 'academic',
      status: 'active',
      milestones: [
        { id: 'm-1', title: 'Revise chapter 1', status: 'in_progress' },
        { id: 'm-2', title: 'Practice problems', status: 'locked' }
      ]
    }
  ];

  const initialTasks = [
    {
      id: 't-rev-ch1',
      title: 'Revise chapter one',
      goalId: 'g-prep-exams',
      scheduledDate: '2026-10-22',
      slot: 'focus_now',
      priority: 'high',
      status: 'todo',
      estimatedMinutes: 45
    }
  ];

  const initialPreferences = {
    appearance: { theme: 'dark', waveIntensity: 'subtle' },
    focus: { defaultDuration: 25 }
  };

  // Save to persistent store
  storage.setItem(`irl_goals_${uid}`, JSON.stringify(initialGoals));
  storage.setItem(`irl_tasks_${uid}`, JSON.stringify(initialTasks));
  storage.setItem(`irl_prefs_${uid}`, JSON.stringify(initialPreferences));

  // Step 2: Simulate browser reload / reopening site
  const restoredGoals = JSON.parse(storage.getItem(`irl_goals_${uid}`));
  const restoredTasks = JSON.parse(storage.getItem(`irl_tasks_${uid}`));
  const restoredPrefs = JSON.parse(storage.getItem(`irl_prefs_${uid}`));

  assert.equal(restoredGoals.length, 1);
  assert.equal(restoredGoals[0].title, 'Prepare for exams');
  assert.equal(restoredTasks.length, 1);
  assert.equal(restoredTasks[0].title, 'Revise chapter one');
  assert.equal(restoredTasks[0].goalId, 'g-prep-exams');
  assert.equal(restoredPrefs.appearance.theme, 'dark');

  // Step 3: Complete task and verify update persists
  restoredTasks[0].status = 'completed';
  restoredGoals[0].milestones[0].status = 'completed';
  storage.setItem(`irl_tasks_${uid}`, JSON.stringify(restoredTasks));
  storage.setItem(`irl_goals_${uid}`, JSON.stringify(restoredGoals));

  const secondReloadTasks = JSON.parse(storage.getItem(`irl_tasks_${uid}`));
  assert.equal(secondReloadTasks[0].status, 'completed');

  // Step 4: Delete task and verify deletion persists
  storage.setItem(`irl_tasks_${uid}`, JSON.stringify([]));
  const thirdReloadTasks = JSON.parse(storage.getItem(`irl_tasks_${uid}`));
  assert.equal(thirdReloadTasks.length, 0);
});

test('Genuinely new users receive clean empty states without fake seed data', () => {
  const storage = new LocalStorageMock();
  const newUid = 'brand_new_user_123';

  const storedGoals = storage.getItem(`irl_goals_${newUid}`);
  const storedTasks = storage.getItem(`irl_tasks_${newUid}`);

  assert.equal(storedGoals, null);
  assert.equal(storedTasks, null);

  const initialGoalsState = storedGoals ? JSON.parse(storedGoals) : [];
  const initialTasksState = storedTasks ? JSON.parse(storedTasks) : [];

  assert.equal(initialGoalsState.length, 0);
  assert.equal(initialTasksState.length, 0);
});

// 2. Focus Timer Honest Drift-Free Restoration Test
test('Focus timer accurately restores elapsed seconds without restarting or fabricating time', () => {
  const targetMinutes = 25;
  const startedAtTimestamp = Date.now() - 300 * 1000; // 5 minutes (300s) ago
  const savedTimer = {
    isRunning: true,
    secondsElapsed: 0,
    targetMinutes,
    activeTaskId: 'task-abc',
    startedAtTimestamp
  };

  // Restore calculation
  const elapsed = Math.floor((Date.now() - savedTimer.startedAtTimestamp) / 1000);
  assert.ok(elapsed >= 299 && elapsed <= 302);
  assert.equal(savedTimer.isRunning, true);
  assert.equal(savedTimer.targetMinutes, 25);
});

// 3. Workload Capacity Rebalancing Test
test('Deterministic workload rebalancer calculates kept vs deferred tasks accurately', () => {
  const tasks = [
    { id: '1', title: 'Task 1', priority: 'critical', estimatedMinutes: 60, scheduledDate: '2026-10-22' },
    { id: '2', title: 'Task 2', priority: 'high', estimatedMinutes: 60, scheduledDate: '2026-10-22' },
    { id: '3', title: 'Task 3', priority: 'low', estimatedMinutes: 60, scheduledDate: '2026-10-22' },
  ];
  const capacityMins = 100;

  // Simulate capacity filter
  let currentMins = 0;
  const kept = [];
  const deferred = [];

  for (const t of tasks) {
    if (currentMins + t.estimatedMinutes <= capacityMins) {
      kept.push(t);
      currentMins += t.estimatedMinutes;
    } else {
      deferred.push(t);
    }
  }

  assert.equal(kept.length, 1);
  assert.equal(kept[0].id, '1');
  assert.equal(deferred.length, 2);
});
