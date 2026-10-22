import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { Header } from './components/Header.tsx';
import { LiveWaveCanvas } from './components/LiveWaveCanvas.tsx';
import { WelcomeScreen } from './pages/WelcomeScreen.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { TodayDashboard } from './pages/TodayDashboard.tsx';
import { GoalsPage } from './pages/GoalsPage.tsx';
import { PlannerPage } from './pages/PlannerPage.tsx';
import { FocusRoomPage } from './pages/FocusRoomPage.tsx';
import { InsightsPage } from './pages/InsightsPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import { TaskModal } from './components/TaskModal.tsx';
import { GoalModal } from './components/GoalModal.tsx';
import { ReplanModal } from './components/ReplanModal.tsx';
import { Task } from './types/index.ts';

function AppContent() {
  const { userProfile, loading: authLoading } = useAuth();
  const {
    tasks,
    goals,
    createTask,
    updateTask,
    createGoal,
    applyReplan,
    todayDate,
    hasAiConfigured,
    userStats,
  } = useApp();

  // Route state
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const rawPath = window.location.pathname || '/';
    return rawPath.split('#')[0] || '/';
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isReplanModalOpen, setIsReplanModalOpen] = useState(false);

  // Browser navigation sync & hash cleanup
  useEffect(() => {
    if (window.location.hash) {
      window.history.replaceState({}, '', window.location.pathname || '/');
      window.scrollTo(0, 0);
    }

    const handlePopState = () => {
      if (window.location.hash) {
        window.history.replaceState({}, '', window.location.pathname || '/');
      }
      const rawPath = window.location.pathname || '/';
      setCurrentPath(rawPath.split('#')[0] || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    const cleanPath = path.split('#')[0] || '/';
    if (cleanPath !== currentPath || window.location.hash) {
      window.history.pushState({}, '', cleanPath);
      setCurrentPath(cleanPath);
      window.scrollTo(0, 0);
      setIsMobileMenuOpen(false);
    }
  };

  const handleOpenTaskModal = (task?: Task | null) => {
    setTaskToEdit(task || null);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = (taskData: any) => {
    if (taskData.id) {
      updateTask(taskData.id, taskData);
    } else {
      createTask(taskData);
    }
  };

  const handleSaveGoal = (goalData: any, initialMilestones: string[]) => {
    createGoal(goalData, initialMilestones);
  };

  const pathName = currentPath.split('?')[0];

  // Route normalization for legacy routes & cleaning unwanted hashes/routes
  useEffect(() => {
    if (window.location.hash) {
      window.history.replaceState({}, '', window.location.pathname || '/');
      window.scrollTo(0, 0);
    }

    if (authLoading) return;
    if (pathName === '/app/today') navigate('/today');
    else if (pathName === '/app/goals') navigate('/goals');
    else if (pathName === '/app/plan' || pathName === '/app/planner') navigate('/planner');
    else if (pathName === '/app/focus') navigate('/focus');
    else if (pathName === '/app/insights') navigate('/insights');
    else if (pathName === '/coach' || pathName === '/app/coach') navigate('/home');
    else if (pathName === '/app/profile') navigate('/profile');
    else if (pathName === '/app/settings') navigate('/settings');
    else if (
      pathName === '/desktop' ||
      pathName === '/signin' ||
      pathName === '/signup' ||
      pathName === '/app/deck' ||
      pathName === '/pricing' ||
      pathName.includes('pricing')
    ) {
      navigate('/');
    }
  }, [pathName, authLoading]);

  // Workspace entrance transition state
  const [isEnteringWorkspace, setIsEnteringWorkspace] = useState(false);
  const [enterError, setEnterError] = useState<string | null>(null);

  const handleEnterWorkspace = () => {
    if (isEnteringWorkspace) return;
    setIsEnteringWorkspace(true);
    setEnterError(null);
  };

  // Workspace initialization transition effect
  useEffect(() => {
    if (!isEnteringWorkspace) return;

    if (!authLoading) {
      const timer = setTimeout(() => {
        setIsEnteringWorkspace(false);
        if (!userProfile?.hasChosenName) {
          navigate('/welcome');
        } else {
          navigate('/home');
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isEnteringWorkspace, authLoading, userProfile]);

  // Dedicated Landing Page Hero (at / or /landing) - renders immediately on load
  if ((pathName === '/' || pathName === '/landing') && !isEnteringWorkspace) {
    return (
      <LandingPage
        onEnterApp={() => {
          if (!userProfile?.hasChosenName) {
            navigate('/welcome');
          } else {
            handleEnterWorkspace();
          }
        }}
        isLoading={isEnteringWorkspace}
      />
    );
  }

  // Loading state while entering workspace or initializing direct internal app route
  if (isEnteringWorkspace || (authLoading && pathName !== '/' && pathName !== '/landing')) {
    return (
      <div className="relative min-h-screen bg-[#07080C] text-[#F4F5FA] flex flex-col items-center justify-center overflow-hidden">
        <LiveWaveCanvas intensity={0.9} showParticles={false} />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 to-violet-500 flex items-center justify-center shadow-lg shadow-cyan-500/30 animate-pulse">
            <span className="font-mono text-black font-extrabold text-base">ATL</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-cyan-400">
            <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span>Opening your workspace...</span>
          </div>
          {enterError && (
            <div className="flex flex-col items-center gap-2 mt-2">
              <p className="text-xs text-rose-400">{enterError}</p>
              <button
                onClick={() => {
                  setEnterError(null);
                  handleEnterWorkspace();
                }}
                className="px-3.5 py-1.5 text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl hover:bg-rose-500/30 transition-colors cursor-pointer"
              >
                Retry Workspace Initialization
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // First-Visit Welcome Screen ("What should we call you? -> Continue")
  if (!userProfile?.hasChosenName || pathName === '/welcome') {
    return (
      <WelcomeScreen
        onComplete={() => {
          navigate('/home');
        }}
      />
    );
  }

  const availableMinutesToday =
    userStats.dailyAvailability[todayDate] !== undefined
      ? userStats.dailyAvailability[todayDate]
      : userStats.defaultAvailabilityMinutes || 300;

  // Render the active route inside workspace
  const renderCurrentPage = () => {
    switch (pathName) {
      case '/today':
        return (
          <TodayDashboard
            onNavigate={navigate}
            onOpenTaskModal={handleOpenTaskModal}
            onOpenReplanModal={() => setIsReplanModalOpen(true)}
          />
        );
      case '/goals':
        return (
          <GoalsPage
            onNavigate={navigate}
            onOpenGoalModal={() => setIsGoalModalOpen(true)}
          />
        );
      case '/planner':
        return (
          <PlannerPage
            onNavigate={navigate}
            onOpenTaskModal={() => handleOpenTaskModal(null)}
            onOpenReplanModal={() => setIsReplanModalOpen(true)}
          />
        );
      case '/focus':
        return <FocusRoomPage onNavigate={navigate} />;
      case '/insights':
        return <InsightsPage onNavigate={navigate} />;
      case '/profile':
        return <ProfilePage onNavigate={navigate} />;
      case '/settings':
        return <SettingsPage onNavigate={navigate} />;
      case '/home':
      default:
        return (
          <HomePage
            onNavigate={navigate}
            onOpenTaskModal={() => handleOpenTaskModal(null)}
            onOpenGoalModal={() => setIsGoalModalOpen(true)}
          />
        );
    }
  };

  return (
    <div className="relative min-h-screen bg-[#07080C] text-[#F4F5FA] flex overflow-hidden">
      {/* Background Luminous Blue Silk Waves */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40">
        <LiveWaveCanvas intensity={0.7} showParticles={false} />
      </div>

      {/* Shared Sidebar Navigation (Desktop & Mobile Drawer) */}
      <Sidebar
        currentPath={pathName}
        onNavigate={navigate}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main App Container */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <Header
          onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
          onOpenAddTask={() => handleOpenTaskModal(null)}
          onNavigate={navigate}
        />

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto">
          {renderCurrentPage()}
        </main>
      </div>

      {/* Shared Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        goals={goals}
        initialDate={todayDate}
      />

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSave={handleSaveGoal}
      />

      <ReplanModal
        isOpen={isReplanModalOpen}
        onClose={() => setIsReplanModalOpen(false)}
        tasks={tasks}
        goals={goals}
        currentDate={todayDate}
        availableMinutes={availableMinutesToday}
        hasAiConfigured={hasAiConfigured}
        onApplyReplan={applyReplan}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
