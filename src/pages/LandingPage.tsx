import React from 'react';

interface LandingPageProps {
  onEnterApp: () => void;
  isLoading?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, isLoading = false }) => {
  return (
    <div className="relative w-full h-screen min-h-[640px] bg-[#02050E] text-white overflow-hidden flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* -----------------------------------------------------------------
          BACKGROUND ATMOSPHERIC ARC & SPACE HORIZON GLOW
          Matching image_cafc130c.png: Giant glowing blue curved arc across center
         ----------------------------------------------------------------- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Deep ambient radial glow behind central hero */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[700px] rounded-full opacity-60 blur-[120px]"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(14, 165, 233, 0.28) 0%, rgba(30, 58, 138, 0.18) 45%, rgba(2, 5, 14, 0) 75%)'
          }}
        />

        {/* High-intensity central bloom behind typography */}
        <div 
          className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full opacity-40 blur-[80px]"
          style={{
            background: 'radial-gradient(circle at center, rgba(56, 189, 248, 0.45) 0%, rgba(37, 99, 235, 0.2) 60%, transparent 100%)'
          }}
        />

        {/* Curved Atmospheric Horizon Arc (SVG) */}
        <svg 
          className="absolute top-[8%] left-1/2 -translate-x-1/2 w-[1600px] md:w-[2200px] lg:w-[2600px] h-[650px] md:h-[850px] opacity-95" 
          viewBox="0 0 2000 800" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Outer diffused blue atmosphere filter */}
            <filter id="superGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="36" result="blur1" />
              <feGaussianBlur stdDeviation="16" result="blur2" />
              <feMerge>
                <feMergeNode in="blur1" />
                <feMergeNode in="blur2" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Sharp core highlight glow */}
            <filter id="coreGlow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="8" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Arc linear gradient spanning cyan -> royal blue -> bright cyan */}
            <linearGradient id="arcStrokeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.1" />
              <stop offset="15%" stopColor="#0369a1" stopOpacity="0.6" />
              <stop offset="35%" stopColor="#0ea5e9" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="1" />
              <stop offset="65%" stopColor="#0ea5e9" stopOpacity="0.95" />
              <stop offset="85%" stopColor="#0369a1" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.1" />
            </linearGradient>

            {/* Crisp white inner rim gradient */}
            <linearGradient id="coreWhiteGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="30%" stopColor="#e0f2fe" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="70%" stopColor="#e0f2fe" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Layer 1: Wide diffused atmospheric blue halo */}
          <path 
            d="M -100 650 Q 1000 120 2100 650" 
            stroke="url(#arcStrokeGrad)" 
            strokeWidth="90" 
            strokeLinecap="round"
            filter="url(#superGlow)" 
            opacity="0.55" 
          />

          {/* Layer 2: Vivid cyan-blue vibrant arc ring */}
          <path 
            d="M -100 650 Q 1000 120 2100 650" 
            stroke="url(#arcStrokeGrad)" 
            strokeWidth="32" 
            strokeLinecap="round"
            filter="url(#coreGlow)" 
            opacity="0.85" 
          />

          {/* Layer 3: Brilliant white/cyan core horizon rim */}
          <path 
            d="M -100 650 Q 1000 120 2100 650" 
            stroke="url(#coreWhiteGrad)" 
            strokeWidth="6" 
            strokeLinecap="round"
            opacity="0.9" 
          />
        </svg>

        {/* Subtle background noise texture or particle mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.04]" />
      </div>

      {/* -----------------------------------------------------------------
          HEADER / BRANDING (TASTEFUL TOP BAR)
         ----------------------------------------------------------------- */}
       <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 md:py-8 flex items-center justify-between">
        {/* ATLAS Tasteful Logo & Brand Name */}
        <div className="flex items-center gap-3 group cursor-pointer" onClick={onEnterApp}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-cyan-300 p-[1px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all duration-300">
            <div className="w-full h-full bg-[#030712] rounded-[11px] flex items-center justify-center">
              <span className="font-mono text-cyan-400 font-extrabold text-xs tracking-wider">ATL</span>
            </div>
          </div>
          <span className="font-bold text-lg md:text-xl tracking-tight text-white group-hover:text-cyan-300 transition-colors">
            ATLAS
          </span>
        </div>

        {/* Header Action Link */}
        <button
          onClick={onEnterApp}
          className="text-xs md:text-sm font-medium text-slate-300 hover:text-cyan-300 transition-colors px-3 py-1.5 rounded-lg border border-slate-800/80 hover:border-cyan-500/30 bg-slate-900/40 backdrop-blur-md"
        >
          Launch Workspace
        </button>
      </header>

      {/* -----------------------------------------------------------------
          HERO MAIN CONTENT (SLOGAN + PROMINENT BUTTON ONLY)
         ----------------------------------------------------------------- */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 text-center max-w-5xl mx-auto my-auto -mt-4">
        
        {/* Main Hero Slogan Heading */}
        {/* "Your life. Your system. Your next move." */}
        {/* Exact typographic match to reference: Bold Sans + Elegant Italic Serif emphasis */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-white leading-[1.08] max-w-4xl drop-shadow-2xl">
          <span className="block">Your life. Your system.</span>
          <span className="block mt-1 sm:mt-2 text-white">
            Your{' '}
            <span className="font-serif-hero font-normal italic text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-sky-300 to-cyan-100 drop-shadow-[0_0_35px_rgba(56,189,248,0.6)]">
              next move.
            </span>
          </span>
        </h1>

        {/* ONE Prominent Button Directly Beneath Heading */}
        <div className="mt-10 md:mt-12 flex items-center justify-center">
          <button
            onClick={onEnterApp}
            disabled={isLoading}
            className="btn-hero-glow group relative inline-flex items-center justify-center gap-3 px-8 md:px-10 py-4 md:py-4.5 rounded-full text-base md:text-lg font-bold tracking-wide cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-[#02050E] disabled:opacity-75 disabled:cursor-wait"
          >
            <span>{isLoading ? 'Loading workspace...' : 'Enter ATLAS'}</span>
            <svg 
              className={`w-5 h-5 text-cyan-100 transform ${isLoading ? 'animate-spin' : 'group-hover:translate-x-1'} transition-transform duration-200`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>

      </main>

      {/* Subtle bottom spacing to ensure perfect vertical center balance */}
      <div className="relative z-10 h-12 md:h-16 w-full pointer-events-none" />

    </div>
  );
};
