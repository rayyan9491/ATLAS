import React, { useEffect, useState } from 'react';
import { LiveWaveCanvas } from './LiveWaveCanvas.tsx';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface FirstEntryLoadingScreenProps {
  displayName: string;
  onReady: () => void;
}

export const FirstEntryLoadingScreen: React.FC<FirstEntryLoadingScreenProps> = ({
  displayName,
  onReady,
}) => {
  const [initStage, setInitStage] = useState<'profile' | 'workspace' | 'ready' | 'error'>('profile');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const runInitialization = async () => {
    try {
      setErrorMessage(null);
      setInitStage('profile');

      // Stage 1: Confirm profile & local cache are ready
      await new Promise((resolve) => setTimeout(resolve, 600));
      setInitStage('workspace');

      // Stage 2: Finalize workspace structure & route readiness
      await new Promise((resolve) => setTimeout(resolve, 700));
      setInitStage('ready');

      // Brief transition into Home dashboard
      await new Promise((resolve) => setTimeout(resolve, 400));
      onReady();
    } catch (err: any) {
      console.error('Initialization error:', err);
      setInitStage('error');
      setErrorMessage(err?.message || 'Unable to complete workspace setup. Please retry.');
    }
  };

  useEffect(() => {
    runInitialization();
  }, []);

  return (
    <div className="relative min-h-screen bg-[#060913] text-[#F8FAFC] flex flex-col justify-center items-center px-4 py-12 overflow-hidden select-none">
      {/* Background Animated Deep Navy / Blue Waves */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-50">
        <LiveWaveCanvas className="w-full h-full" intensity={0.8} showParticles={false} />
      </div>

      {/* Ambient soft glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[340px] bg-gradient-to-tr from-blue-600/10 via-cyan-500/15 to-transparent blur-3xl pointer-events-none rounded-full" />

      {/* Center Panel with Electric-Blue Edge Finishing */}
      <div className="relative z-10 w-full max-w-md p-8 sm:p-10 rounded-2xl bg-[#0D1424]/90 border border-[#1E2D4A] backdrop-blur-xl shadow-[0_0_35px_-5px_rgba(56,189,248,0.25)] text-center space-y-6">
        {/* Brand Icon Badge */}
        <div className="relative mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-400 to-indigo-500 p-[1px] shadow-lg shadow-cyan-500/30">
          <div className="w-full h-full rounded-2xl bg-[#080D1A] flex items-center justify-center">
            <span className="font-mono text-cyan-300 font-extrabold text-base tracking-widest animate-pulse">
              ATL
            </span>
          </div>
        </div>

        {/* Brand Name */}
        <div className="space-y-1">
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-cyan-400 font-semibold">
            ATLAS
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Making room for your next move.
          </h1>
          <p className="text-sm text-[#94A3B8] font-normal pt-1">
            {displayName ? `Setting up your personal workspace, ${displayName}…` : 'Setting up your personal workspace…'}
          </p>
        </div>

        {initStage === 'error' ? (
          <div className="pt-2 space-y-4">
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 text-left">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage || 'Failed to initialize workspace.'}</span>
            </div>
            <button
              onClick={runInitialization}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Workspace Initialization</span>
            </button>
          </div>
        ) : (
          /* Smooth Electric Blue Progress Indicator */
          <div className="pt-2 space-y-3">
            <div className="w-full h-1.5 rounded-full bg-[#141C2E] overflow-hidden p-[1px] border border-[#1E2D4A]">
              <div
                className={`h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-400 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(56,189,248,0.5)] ${
                  initStage === 'profile'
                    ? 'w-1/3'
                    : initStage === 'workspace'
                    ? 'w-4/5'
                    : 'w-full'
                }`}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-[#64748B]">
              <span>WORKSPACE READY</span>
              <span className="text-cyan-400 font-medium">
                {initStage === 'profile' ? '40%' : initStage === 'workspace' ? '85%' : '100%'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
