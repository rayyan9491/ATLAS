import React, { useState, useMemo } from 'react';
import {
  Target,
  Plus,
  Search,
  Grid,
  List,
  Eye,
  TrendingUp,
  Activity,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Trash2,
  ChevronDown,
  Sparkles,
  Flame,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { Goal, Priority } from '../types/index.ts';

interface GoalsPageProps {
  onNavigate: (path: string) => void;
  onOpenGoalModal: () => void;
}

export const GoalsPage: React.FC<GoalsPageProps> = ({ onNavigate, onOpenGoalModal }) => {
  const { goals, deleteGoal, tasks, updateGoal } = useApp();

  const [activeTab, setActiveTab] = useState<'active' | 'achieved'>('active');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'deadline' | 'progress' | 'title'>('deadline');
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);

  const categories = ['All', 'Fitness', 'Academic'];

  // Calculate days remaining
  const getDaysRemaining = (targetDate?: string) => {
    if (!targetDate) return null;
    const target = new Date(targetDate).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  // Compute goal progress honestly from milestones or linked tasks
  const getGoalProgress = (goal: Goal, idx: number = 0) => {
    if (goal.milestones && goal.milestones.length > 0) {
      const completed = goal.milestones.filter((m) => m.status === 'completed').length;
      return Math.round((completed / goal.milestones.length) * 100);
    }
    const linked = tasks.filter((t) => t.goalId === goal.id);
    if (linked.length > 0) {
      const completedLinked = linked.filter((t) => t.status === 'completed').length;
      return Math.round((completedLinked / linked.length) * 100);
    }
    return 0;
  };

  // Determine velocity status honestly from linked task activity
  const getVelocityStatus = (goal: Goal) => {
    const linked = tasks.filter((t) => t.goalId === goal.id);
    const completedLinked = linked.filter((t) => t.status === 'completed');

    if (linked.length > 0 && completedLinked.length === linked.length) {
      return { label: 'Accelerating', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25', icon: TrendingUp };
    }
    if (completedLinked.length > 0) {
      return { label: 'Coasting', color: 'text-amber-400 bg-amber-500/10 border-amber-500/25', icon: Activity };
    }
    if (linked.length > 0 && completedLinked.length === 0) {
      return { label: 'Stalling', color: 'text-rose-400 bg-rose-500/10 border-rose-500/25', icon: AlertCircle };
    }
    return { label: 'Coasting', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/25', icon: Activity };
  };

  // Filtered & sorted goals
  const filteredGoals = useMemo(() => {
    return goals
      .filter((g) => {
        if (activeTab === 'active' && g.status === 'completed') return false;
        if (activeTab === 'achieved' && g.status !== 'completed') return false;

        if (selectedCategory !== 'All') {
          const cat = (g.category || '').toLowerCase();
          if (!cat.includes(selectedCategory.toLowerCase())) return false;
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          if (!g.title.toLowerCase().includes(q) && !(g.description || '').toLowerCase().includes(q)) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'deadline') {
          return (getDaysRemaining(a.targetDate) ?? 9999) - (getDaysRemaining(b.targetDate) ?? 9999);
        }
        if (sortBy === 'progress') {
          return getGoalProgress(b) - getGoalProgress(a);
        }
        return a.title.localeCompare(b.title);
      });
  }, [goals, activeTab, selectedCategory, searchQuery, sortBy]);

  // Color scheme based on goal category/theme
  const getGoalTheme = (category?: string, index: number = 0) => {
    const c = (category || '').toLowerCase();
    if (c.includes('personal') || index % 5 === 0) {
      return {
        ringColor: '#FBBF24', // amber
        barGradient: 'from-amber-400 to-amber-500',
        badge: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
      };
    }
    if (c.includes('career') || index % 5 === 1) {
      return {
        ringColor: '#A855F7', // purple
        barGradient: 'from-purple-500 to-indigo-500',
        badge: 'text-purple-400 bg-purple-500/15 border-purple-500/30',
      };
    }
    if (c.includes('learning') || index % 5 === 2) {
      return {
        ringColor: '#22D3EE', // cyan
        barGradient: 'from-cyan-400 to-blue-500',
        badge: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30',
      };
    }
    if (c.includes('side') || index % 5 === 3) {
      return {
        ringColor: '#F43F5E', // rose
        barGradient: 'from-rose-500 to-pink-500',
        badge: 'text-rose-400 bg-rose-500/15 border-rose-500/30',
      };
    }
    return {
      ringColor: '#10B981', // emerald
      barGradient: 'from-emerald-400 to-teal-500',
      badge: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
    };
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header Bar (Matches Image 3) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F0F5FF]">
            Goals
          </h1>

          {/* Active / Achieved Toggle */}
          <div className="flex items-center rounded-xl bg-[#101A2B] border border-[#24354C] p-1">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'active'
                  ? 'bg-[#192941] text-[#59C8FF] border border-[#294B75] shadow-sm'
                  : 'text-[#A7B6CA] hover:text-[#F0F5FF]'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setActiveTab('achieved')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'achieved'
                  ? 'bg-[#192941] text-[#59C8FF] border border-[#294B75] shadow-sm'
                  : 'text-[#A7B6CA] hover:text-[#F0F5FF]'
              }`}
            >
              Achieved
            </button>
          </div>
        </div>

        {/* Controls: Search, View Switcher, Sort Dropdown, + New Goal */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#A7B6CA] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search goals..."
              className="pl-8 pr-3 py-1.5 rounded-xl bg-[#101A2B] border border-[#24354C] text-xs text-[#F0F5FF] placeholder-[#7789A4] focus:outline-none focus:border-[#3988FF] w-40 sm:w-48"
            />
          </div>

          {/* View switcher */}
          <div className="hidden sm:flex items-center rounded-xl bg-[#101A2B] border border-[#24354C] p-1">
            <button
              onClick={() => setViewLayout('list')}
              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                viewLayout === 'list' ? 'bg-[#192941] text-[#59C8FF]' : 'text-[#A7B6CA] hover:text-[#F0F5FF]'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewLayout('grid')}
              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                viewLayout === 'grid' ? 'bg-[#192941] text-[#59C8FF]' : 'text-[#A7B6CA] hover:text-[#F0F5FF]'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none bg-[#101A2B] border border-[#24354C] text-xs font-semibold text-[#F0F5FF] pl-3 pr-8 py-2 rounded-xl focus:outline-none focus:border-[#3988FF] cursor-pointer"
            >
              <option value="deadline">Deadline</option>
              <option value="progress">Progress</option>
              <option value="title">Title</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#A7B6CA] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* + New Goal Primary Button */}
          <button
            onClick={onOpenGoalModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold btn-electric-primary cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Goal</span>
          </button>
        </div>
      </div>

      {/* Category Pills (Matches Image 3) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-[#2563EB] to-[#3988FF] text-white shadow-sm shadow-[#3988FF]/20 border border-[#59C8FF]/40'
                  : 'bg-[#101A2B] text-[#A7B6CA] hover:text-[#F0F5FF] hover:bg-[#131F32] border border-[#24354C]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Goal Cards Grid / List (Matches Image 3) */}
      {filteredGoals.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-[#101A2B] border border-dashed border-[#24354C] p-6 space-y-3">
          <Target className="w-10 h-10 text-[#59C8FF]/40 mx-auto" />
          <h3 className="text-sm font-semibold text-[#F0F5FF]">No goals found</h3>
          <p className="text-xs text-[#A7B6CA] max-w-sm mx-auto">
            {searchQuery
              ? 'Try modifying your search filter.'
              : 'Add your first academic or personal goal to track milestones and progress.'}
          </p>
          <button
            onClick={onOpenGoalModal}
            className="px-4 py-2 rounded-xl text-xs font-semibold btn-electric-primary cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Goal</span>
          </button>
        </div>
      ) : (
        <div
          className={
            viewLayout === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5'
              : 'space-y-4'
          }
        >
          {filteredGoals.map((goal, idx) => {
            const theme = getGoalTheme(goal.category, idx);
            const daysRemaining = getDaysRemaining(goal.targetDate);
            const progress = getGoalProgress(goal, idx);
            const velocity = getVelocityStatus(goal);
            const VelocityIcon = velocity.icon;
            const priority = goal.priority || (idx % 2 === 0 ? 'high' : 'medium');
            const linkedTasks = tasks.filter((t) => t.goalId === goal.id);
            const isExpanded = expandedGoalId === goal.id;

            // SVG Circular Progress Ring computation
            const radius = 22;
            const circumference = 2 * Math.PI * radius;
            const strokeDashoffset = circumference - (progress / 100) * circumference;

            return (
              <div
                key={goal.id}
                className="rounded-2xl bg-[#101A2B] border border-[#24354C] hover:border-[#3988FF] finova-card-hover p-5 flex flex-col justify-between space-y-4 relative overflow-hidden shadow-sm"
              >
                {/* Top Row: Category tag, Eye icon, Circular Progress Ring */}
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <span
                      className={`text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-md border ${theme.badge}`}
                    >
                      {goal.category || 'Personal'}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-[#F0F5FF] tracking-tight leading-snug">
                      {goal.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setExpandedGoalId(isExpanded ? null : goal.id)}
                      className="p-1.5 rounded-lg text-[#A7B6CA] hover:text-[#59C8FF] hover:bg-[#131F32] transition-colors cursor-pointer"
                      title="Inspect details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Circular Progress Ring (Matches Image 3) */}
                    <div className="relative w-14 h-14 flex items-center justify-center">
                      <svg className="w-14 h-14 -rotate-90">
                        <circle
                          cx="28"
                          cy="28"
                          r={radius}
                          stroke="#131F32"
                          strokeWidth="3.5"
                          fill="transparent"
                        />
                        <circle
                          cx="28"
                          cy="28"
                          r={radius}
                          stroke={theme.ringColor}
                          strokeWidth="3.5"
                          fill="transparent"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          className="transition-all duration-700 ease-out"
                        />
                      </svg>
                      <div className="absolute text-[11px] font-mono font-bold text-[#F0F5FF]">
                        {progress}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Horizontal Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-[#131F32] overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${theme.barGradient} rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(89,200,255,0.4)]`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Status Badges Row (Matches Image 3) */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                  <div className="flex items-center gap-2">
                    {/* Priority badge */}
                    <span className="capitalize text-[#7789A4] font-mono text-[11px]">
                      {priority === 'high' ? '↑ High' : priority === 'critical' ? '⚡ Critical' : '– Medium'}
                    </span>

                    {/* Velocity status */}
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-medium ${velocity.color}`}
                    >
                      <VelocityIcon className="w-3 h-3" />
                      <span>{velocity.label}</span>
                    </span>
                  </div>

                  {/* Streak & Due days badge */}
                  <div className="flex items-center gap-3 text-[11px] text-[#A7B6CA]">
                    {goal.streak && goal.streak > 0 ? (
                      <span className="flex items-center gap-1 text-amber-400 font-mono">
                        <Flame className="w-3.5 h-3.5" />
                        <span>{goal.streak}d</span>
                      </span>
                    ) : null}
                    <span className="font-mono">
                      {daysRemaining !== null ? `Due in ${daysRemaining}d` : 'No deadline'}
                    </span>
                  </div>
                </div>

                {/* Expandable details view */}
                {isExpanded && (
                  <div className="pt-3 border-t border-[#24354C] space-y-2 text-xs">
                    <div className="text-[11px] font-mono text-[#7789A4] uppercase">
                      Linked Tasks ({linkedTasks.length})
                    </div>
                    {linkedTasks.length === 0 ? (
                      <p className="text-[#7789A4] italic text-xs">
                        No tasks linked to this goal yet.
                      </p>
                    ) : (
                      <div className="space-y-1">
                        {linkedTasks.map((t) => (
                          <div
                            key={t.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-[#0B1220] border border-[#24354C]"
                          >
                            <span className={t.status === 'completed' ? 'line-through text-[#7789A4]' : 'text-[#F0F5FF]'}>
                              {t.title}
                            </span>
                            <span className="text-[10px] font-mono text-[#A7B6CA]">
                              {t.estimatedMinutes}m
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="text-rose-400 hover:text-rose-300 text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Goal</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
