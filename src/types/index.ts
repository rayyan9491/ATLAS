export type GoalCategory = 'career' | 'learning' | 'fitness' | 'creative' | 'finance' | 'lifestyle';

export type Priority = 'critical' | 'high' | 'medium' | 'low';

export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'deferred';

export type DaySlot = 'focus_now' | 'up_next' | 'later' | 'completed' | 'morning' | 'afternoon' | 'evening';

export interface Task {
  id: string;
  title: string;
  description?: string;
  goalId?: string;
  milestoneId?: string;
  scheduledDate: string; // YYYY-MM-DD
  slot: DaySlot;
  estimatedMinutes: number;
  actualMinutes?: number;
  priority: Priority;
  status: TaskStatus;
  deadline?: string;
  xpReward: number;
  completedAt?: string;
  createdAt: string;
  notes?: string;
  subtasks?: { id: string; title: string; completed: boolean }[];
}

export interface Milestone {
  id: string;
  goalId: string;
  title: string;
  description?: string;
  order: number;
  status: 'locked' | 'in_progress' | 'completed';
  completedAt?: string;
  criteria?: string;
  dueDate?: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  priority: Priority;
  deadline?: string;
  targetDate?: string;
  status: 'active' | 'paused' | 'completed' | 'archived';
  milestones: Milestone[];
  streak?: number;
  createdAt: string;
  completedAt?: string;
  whyItMatters?: string;
  targetOutcome?: string;
  weeklyTimeCommitmentMinutes?: number;
}

export interface UserStats {
  displayName: string;
  avatarSeed: string;
  level: number;
  xp: number;
  title: string;
  gamificationEnabled: boolean;
  defaultAvailabilityMinutes: number;
  dailyAvailability: Record<string, number>; // date YYYY-MM-DD -> minutes
  autoReplanWithAi: boolean;
}

export interface FocusSession {
  id: string;
  taskId?: string;
  goalId?: string;
  taskTitle: string;
  startTime?: string; // ISO
  endTime?: string; // ISO
  timestamp?: string; // ISO
  plannedMinutes: number;
  actualMinutes: number;
  completed: boolean;
  reflection?: string;
  notes?: string;
}

export interface PlannerEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  description?: string;
  location?: string;
  category?: 'work' | 'study' | 'exercise' | 'personal' | 'routine';
  isRecurring?: boolean;
  isFixed?: boolean;
  isFixedCommitment?: boolean;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  intention?: string;
  reflection?: {
    wentWell?: string;
    completed?: string;
    moveTomorrow?: string;
    needsImprovement?: string;
  };
}

export interface UserPreferences {
  appearance: {
    theme: 'dark' | 'light';
    accentColor: 'violet' | 'cyan' | 'emerald' | 'rose';
    reducedMotion: boolean;
    waveAnimation: boolean;
    waveIntensity: number; // 0.1 to 1.5
    dockLabels: boolean;
  };
  desktop: {
    rememberWindowPositions: boolean;
    defaultWindowSize: 'compact' | 'normal' | 'spacious';
  };
  planning: {
    startOfWeek: 'monday' | 'sunday';
    defaultTaskDuration: number; // mins
    workingDays: number[]; // 1-7
    typicalAvailableHours: number;
  };
  focus: {
    defaultDuration: number; // mins
    autoBreak: boolean;
    soundPreset: 'none' | 'rain' | 'waves' | 'whitenoise';
    soundVolume: number; // 0 to 100
  };
  aiCoach: {
    responseStyle: 'concise' | 'balanced' | 'detailed';
    coachingStyle: 'supportive' | 'direct' | 'reflective';
  };
  profile: {
    priorities: string[];
    skillsToDevelop: string[];
    personalBio: string;
  };
}

export interface CoachActionProposal {
  id: string;
  type: 'create_task' | 'create_tasks' | 'schedule_task' | 'schedule_event' | 'break_down_goal';
  previewText?: string;
  description?: string;
  data: any;
  status: 'pending' | 'accepted' | 'rejected';
}

export type CoachErrorType = 'network' | 'quota' | 'model' | 'timeout' | 'auth';

export interface CoachMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string;
  actionProposal?: CoachActionProposal;
  proposal?: CoachActionProposal;
  isError?: boolean;
  errorType?: CoachErrorType;
  errorCode?: string;
  failedPrompt?: string;
  canRetry?: boolean;
}

export interface XpLedgerEntry {
  id: string;
  taskId?: string;
  milestoneId?: string;
  xpAwarded: number;
  timestamp: string;
  reason: string;
}

export interface RealityCheckResult {
  availableMinutes: number;
  plannedMinutes: number;
  completedMinutes: number;
  remainingMinutes: number;
  diffMinutes: number;
  percentUtilized: number;
  status: 'under_capacity' | 'balanced' | 'over_capacity';
  overMinutes: number;
}

export interface NextMoveRecommendation {
  taskId: string;
  task: Task;
  reason: string;
  alternativeTask?: Task;
  confidence: 'High' | 'Direct Match' | 'Recommended';
}

export interface WeeklyReportData {
  plannedCount: number;
  completedCount: number;
  completionRate: number;
  totalPlannedMinutes: number;
  totalCompletedMinutes: number;
  postponedCount: number;
  topGoals: { id: string; title: string; completedTasks: number; totalTasks: number }[];
  milestonesReached: { id: string; title: string; goalTitle: string }[];
  observations: string[];
  recommendations: string[];
}
