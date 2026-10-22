import React, { useState } from 'react';
import { ArrowRight, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { LiveWaveCanvas } from '../components/LiveWaveCanvas.tsx';
import { FirstEntryLoadingScreen } from '../components/FirstEntryLoadingScreen.tsx';

interface WelcomeScreenProps {
  onComplete: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
  const { initializeUser, loading } = useAuth();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [savedDisplayName, setSavedDisplayName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();

    if (!cleanName) {
      setError('Please enter your name to continue.');
      return;
    }

    if (cleanName.length > 40) {
      setError('Name must be 40 characters or fewer.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      // Save display name and initialize user profile
      await initializeUser(cleanName);
      setSavedDisplayName(cleanName);
      // Transition cleanly to the premium loading screen
      setShowLoadingScreen(true);
    } catch (err: any) {
      console.error('Failed to initialize profile:', err);
      setError(err?.message || 'Unable to start. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (showLoadingScreen) {
    return (
      <FirstEntryLoadingScreen
        displayName={savedDisplayName}
        onReady={onComplete}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-[#060913] text-[#F8FAFC] flex flex-col justify-center items-center px-4 py-12 overflow-hidden selection:bg-blue-500/30 selection:text-white">
      {/* Background Animated Blue Waves */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-45">
        <LiveWaveCanvas className="w-full h-full" intensity={0.9} showParticles={false} />
      </div>

      {/* Subtle ambient light */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[320px] bg-gradient-to-tr from-blue-600/10 via-cyan-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-400 to-indigo-500 flex items-center justify-center font-bold text-black font-mono text-sm shadow-lg shadow-cyan-500/25 mb-4">
            ATL
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Welcome to ATLAS
          </h1>
          <p className="text-sm text-[#94A3B8]">
            What should we call you?
          </p>
        </div>

        {/* Name Form */}
        <div className="relative rounded-2xl bg-[#0D1424]/90 border border-[#1E2D4A] backdrop-blur-xl p-6 shadow-2xl shadow-black/80">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                <input
                  id="displayNameInput"
                  type="text"
                  autoFocus
                  required
                  maxLength={40}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Your name"
                  className="w-full pl-10 pr-4 py-3 bg-[#080D1A] border border-[#1A263D] rounded-xl text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/40 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || loading || !name.trim()}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white btn-electric-primary transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
