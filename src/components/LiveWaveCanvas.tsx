import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext.tsx';
import { useApp } from '../context/AppContext.tsx';

interface LiveWaveCanvasProps {
  className?: string;
  intensity?: number;
  showParticles?: boolean;
}

export const LiveWaveCanvas: React.FC<LiveWaveCanvasProps> = ({
  className = '',
  intensity = 1,
  showParticles = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const { preferences } = useApp();

  // Check if reduced motion is requested
  const reducedMotionSetting = preferences?.appearance?.reducedMotion ?? false;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let dpr = window.devicePixelRatio || 1;
    let width = 0;
    let height = 0;

    const resize = () => {
      if (!canvas || !canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      width = rect.width || window.innerWidth;
      height = rect.height || window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // Check system prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const isSystemReducedMotion = mediaQuery.matches || reducedMotionSetting;

    // Atmospheric drift time
    let time = 0;
    const speed = isSystemReducedMotion ? 0.0004 : 0.0032 * intensity;

    // Subtle cursor attraction for gentle wave breath
    let mouseX = width * 0.5;
    let mouseY = height * 0.5;
    let currentMouseX = mouseX;
    let currentMouseY = mouseY;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Optional subtle ethereal dust motes (only when explicitly requested)
    const motes = showParticles
      ? Array.from({ length: 18 }).map(() => ({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.5 + 0.6,
          speedX: (Math.random() - 0.5) * 0.15,
          speedY: (Math.random() - 0.5) * 0.1,
          alpha: Math.random() * 0.4 + 0.15,
          phase: Math.random() * Math.PI * 2,
        }))
      : [];

    // Helper: sample undulating silk ribbon curve with natural S-curve shape
    // mimicking the reference image (left rise, center dip, right sweeping crest)
    const sampleRibbonY = (
      xFrac: number,
      baseYFrac: number,
      amp1: number,
      amp2: number,
      phaseOffset: number,
      t: number
    ) => {
      // Macro S-curve envelope matching reference image:
      // Left starts mid-high, dips in left-center (~0.35), swells high in right-center (~0.75), slopes down
      const macroEnvelope =
        -Math.sin(xFrac * Math.PI * 1.25 + 0.2) * (height * 0.26) +
        Math.cos(xFrac * Math.PI * 0.85 - 0.5) * (height * 0.12);

      // Living organic harmonics
      const harmonic1 = Math.sin(xFrac * 4.2 + t * 1.2 + phaseOffset) * amp1;
      const harmonic2 = Math.cos(xFrac * 7.8 - t * 0.9 + phaseOffset * 1.4) * amp2;
      const harmonic3 = Math.sin(xFrac * 2.1 + t * 0.5 + phaseOffset * 0.6) * (amp1 * 0.5);

      // Very subtle, gentle cursor influence
      const distFromMouse = Math.abs(xFrac * width - currentMouseX) / (width * 0.45);
      const mouseInfluence = Math.max(0, 1 - distFromMouse) * (currentMouseY - height * baseYFrac) * 0.04;

      return height * baseYFrac + macroEnvelope + harmonic1 + harmonic2 + harmonic3 + mouseInfluence;
    };

    const render = () => {
      time += speed;
      currentMouseX += (mouseX - currentMouseX) * 0.02;
      currentMouseY += (mouseY - currentMouseY) * 0.02;

      ctx.clearRect(0, 0, width, height);

      if (!isLight) {
        // Deep obsidian canvas base
        ctx.fillStyle = '#03050C';
        ctx.fillRect(0, 0, width, height);

        // Ambient dark navy glow in upper-left and center-left matching reference photo
        const ambientGlow = ctx.createRadialGradient(
          width * 0.18,
          height * 0.28,
          width * 0.05,
          width * 0.3,
          height * 0.45,
          width * 0.8
        );
        ambientGlow.addColorStop(0, 'rgba(10, 38, 95, 0.42)');
        ambientGlow.addColorStop(0.5, 'rgba(6, 20, 60, 0.22)');
        ambientGlow.addColorStop(1, 'rgba(3, 5, 12, 0)');

        ctx.fillStyle = ambientGlow;
        ctx.fillRect(0, 0, width, height);

        // Lower right ambient blue veil
        const lowerGlow = ctx.createRadialGradient(
          width * 0.75,
          height * 0.65,
          0,
          width * 0.7,
          height * 0.6,
          width * 0.65
        );
        lowerGlow.addColorStop(0, 'rgba(8, 45, 115, 0.25)');
        lowerGlow.addColorStop(1, 'rgba(3, 5, 12, 0)');
        ctx.fillStyle = lowerGlow;
        ctx.fillRect(0, 0, width, height);
      } else {
        // Clean pearl/slate base in light theme
        ctx.fillStyle = '#F4F7FC';
        ctx.fillRect(0, 0, width, height);

        const lightGlow = ctx.createRadialGradient(
          width * 0.2,
          height * 0.3,
          0,
          width * 0.3,
          height * 0.4,
          width * 0.7
        );
        lightGlow.addColorStop(0, 'rgba(219, 234, 254, 0.7)');
        lightGlow.addColorStop(1, 'rgba(244, 247, 252, 0)');
        ctx.fillStyle = lightGlow;
        ctx.fillRect(0, 0, width, height);
      }

      // Ethereal subtle floating particles
      if (showParticles && motes.length > 0) {
        for (const p of motes) {
          p.x += p.speedX;
          p.y += p.speedY;
          p.phase += 0.015;

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          const currentAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.phase));
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = isLight
            ? `rgba(99, 102, 241, ${currentAlpha * 0.5})`
            : `rgba(103, 232, 249, ${currentAlpha})`;
          ctx.fill();
        }
      }

      // -------------------------------------------------------------
      // FLOWING SILK RIBBONS (5-Layered Master Composition)
      // Layered from back to front, blending smoothly with luminous depth
      // -------------------------------------------------------------
      const steps = 90;

      // Layer 1: Deep Background Sapphire Wave (Back Ambient Ribbon)
      {
        ctx.save();
        if (!isLight) ctx.globalCompositeOperation = 'screen';

        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
          const xF = i / steps;
          const x = xF * width;
          const y = sampleRibbonY(xF, 0.48, 48, 28, 0.0, time * 0.75);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        for (let i = steps; i >= 0; i--) {
          const xF = i / steps;
          const x = xF * width;
          const y = sampleRibbonY(xF, 0.68, 55, 32, 0.35, time * 0.75) + 60;
          ctx.lineTo(x, y);
        }
        ctx.closePath();

        const grad1 = ctx.createLinearGradient(0, height * 0.3, width, height * 0.7);
        if (isLight) {
          grad1.addColorStop(0, 'rgba(186, 230, 253, 0.25)');
          grad1.addColorStop(0.5, 'rgba(147, 197, 253, 0.3)');
          grad1.addColorStop(1, 'rgba(196, 181, 253, 0.15)');
        } else {
          grad1.addColorStop(0, 'rgba(7, 30, 95, 0.38)');
          grad1.addColorStop(0.45, 'rgba(14, 60, 165, 0.42)');
          grad1.addColorStop(0.8, 'rgba(10, 42, 130, 0.25)');
          grad1.addColorStop(1, 'rgba(4, 15, 55, 0.08)');
        }
        ctx.fillStyle = grad1;
        ctx.fill();
        ctx.restore();
      }

      // Layer 2: Mid-Back Flowing Cobalt Ribbon
      {
        ctx.save();
        if (!isLight) ctx.globalCompositeOperation = 'screen';

        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
          const xF = i / steps;
          const x = xF * width;
          const y = sampleRibbonY(xF, 0.42, 42, 22, 0.8, time * 0.88);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        for (let i = steps; i >= 0; i--) {
          const xF = i / steps;
          const x = xF * width;
          const y = sampleRibbonY(xF, 0.58, 48, 26, 1.15, time * 0.88) + 40;
          ctx.lineTo(x, y);
        }
        ctx.closePath();

        const grad2 = ctx.createLinearGradient(0, height * 0.25, width, height * 0.65);
        if (isLight) {
          grad2.addColorStop(0, 'rgba(56, 189, 248, 0.2)');
          grad2.addColorStop(0.6, 'rgba(96, 165, 250, 0.28)');
          grad2.addColorStop(1, 'rgba(129, 140, 248, 0.12)');
        } else {
          grad2.addColorStop(0, 'rgba(8, 55, 160, 0.45)');
          grad2.addColorStop(0.35, 'rgba(14, 90, 215, 0.52)');
          grad2.addColorStop(0.7, 'rgba(2, 70, 185, 0.38)');
          grad2.addColorStop(1, 'rgba(5, 25, 80, 0.12)');
        }
        ctx.fillStyle = grad2;
        ctx.fill();

        // Soft ridge contour stroke
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
          const xF = i / steps;
          const x = xF * width;
          const y = sampleRibbonY(xF, 0.42, 42, 22, 0.8, time * 0.88);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = isLight
          ? 'rgba(56, 189, 248, 0.35)'
          : 'rgba(56, 189, 248, 0.55)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();
      }

      // Layer 3: HERO SILK RIBBON (Directly matching the glowing blue silk in the reference image)
      {
        ctx.save();
        if (!isLight) ctx.globalCompositeOperation = 'screen';

        // Draw the main broad silk sheet
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
          const xF = i / steps;
          const x = xF * width;
          const y = sampleRibbonY(xF, 0.38, 38, 20, 1.7, time * 1.0);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        for (let i = steps; i >= 0; i--) {
          const xF = i / steps;
          const x = xF * width;
          const y = sampleRibbonY(xF, 0.54, 46, 24, 2.05, time * 1.0) + 30;
          ctx.lineTo(x, y);
        }
        ctx.closePath();

        const heroGrad = ctx.createLinearGradient(
          width * 0.1,
          height * 0.2,
          width * 0.9,
          height * 0.7
        );
        if (isLight) {
          heroGrad.addColorStop(0, 'rgba(14, 165, 233, 0.35)');
          heroGrad.addColorStop(0.4, 'rgba(56, 189, 248, 0.42)');
          heroGrad.addColorStop(0.75, 'rgba(99, 102, 241, 0.32)');
          heroGrad.addColorStop(1, 'rgba(147, 197, 253, 0.18)');
        } else {
          heroGrad.addColorStop(0, 'rgba(14, 115, 245, 0.65)'); // rich vibrant electric blue
          heroGrad.addColorStop(0.35, 'rgba(2, 132, 199, 0.58)'); // cyan-blue transition
          heroGrad.addColorStop(0.7, 'rgba(20, 95, 235, 0.52)'); // electric cobalt
          heroGrad.addColorStop(1, 'rgba(8, 40, 140, 0.2)'); // deep fade
        }
        ctx.fillStyle = heroGrad;
        ctx.fill();

        // Primary Luminous Crest Edge (Glowing cyan / electric line with atmospheric bloom)
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
          const xF = i / steps;
          const x = xF * width;
          const y = sampleRibbonY(xF, 0.38, 38, 20, 1.7, time * 1.0);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        const crestGrad = ctx.createLinearGradient(0, 0, width, 0);
        if (isLight) {
          crestGrad.addColorStop(0, 'rgba(2, 132, 199, 0.6)');
          crestGrad.addColorStop(0.45, 'rgba(14, 165, 233, 0.85)');
          crestGrad.addColorStop(0.8, 'rgba(99, 102, 241, 0.7)');
          crestGrad.addColorStop(1, 'rgba(56, 189, 248, 0.4)');
        } else {
          crestGrad.addColorStop(0, 'rgba(56, 189, 248, 0.7)');
          crestGrad.addColorStop(0.35, 'rgba(103, 232, 249, 0.95)'); // brilliant neon cyan
          crestGrad.addColorStop(0.65, 'rgba(56, 189, 248, 0.9)');
          crestGrad.addColorStop(0.88, 'rgba(147, 197, 253, 0.85)');
          crestGrad.addColorStop(1, 'rgba(56, 189, 248, 0.45)');
        }

        ctx.strokeStyle = crestGrad;
        ctx.lineWidth = 2.4;
        if (!isLight) {
          ctx.shadowColor = 'rgba(56, 189, 248, 0.65)';
          ctx.shadowBlur = 22;
        }
        ctx.stroke();

        ctx.restore();
      }

      // Layer 4: Foreground Curving Fold (The overlapping sheer veil)
      {
        ctx.save();
        if (!isLight) ctx.globalCompositeOperation = 'screen';

        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
          const xF = i / steps;
          const x = xF * width;
          // Creates the downward curling fold across the center valley
          const y = sampleRibbonY(xF, 0.45, 34, 18, 2.5, time * 1.1) + Math.sin(xF * Math.PI) * 18;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        for (let i = steps; i >= 0; i--) {
          const xF = i / steps;
          const x = xF * width;
          const y = sampleRibbonY(xF, 0.58, 38, 22, 2.85, time * 1.1) + 24;
          ctx.lineTo(x, y);
        }
        ctx.closePath();

        const foldGrad = ctx.createLinearGradient(0, height * 0.35, width, height * 0.6);
        if (isLight) {
          foldGrad.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
          foldGrad.addColorStop(0.5, 'rgba(125, 211, 252, 0.35)');
          foldGrad.addColorStop(1, 'rgba(165, 180, 252, 0.15)');
        } else {
          foldGrad.addColorStop(0, 'rgba(56, 189, 248, 0.48)');
          foldGrad.addColorStop(0.4, 'rgba(14, 165, 255, 0.55)');
          foldGrad.addColorStop(0.75, 'rgba(2, 85, 210, 0.38)');
          foldGrad.addColorStop(1, 'rgba(4, 20, 80, 0.1)');
        }
        ctx.fillStyle = foldGrad;
        ctx.fill();

        // Delicate luminous inner fold line
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
          const xF = i / steps;
          const x = xF * width;
          const y = sampleRibbonY(xF, 0.45, 34, 18, 2.5, time * 1.1) + Math.sin(xF * Math.PI) * 18;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = isLight
          ? 'rgba(14, 165, 233, 0.5)'
          : 'rgba(103, 232, 249, 0.75)';
        ctx.lineWidth = 1.6;
        if (!isLight) {
          ctx.shadowColor = 'rgba(103, 232, 249, 0.5)';
          ctx.shadowBlur = 14;
        }
        ctx.stroke();

        ctx.restore();
      }

      // Layer 5: Lower Anchoring Ribbon (Softly flows behind the dock area)
      {
        ctx.save();
        if (!isLight) ctx.globalCompositeOperation = 'screen';

        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
          const xF = i / steps;
          const x = xF * width;
          const y = sampleRibbonY(xF, 0.62, 32, 16, 3.4, time * 0.7);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        for (let i = steps; i >= 0; i--) {
          const xF = i / steps;
          const x = xF * width;
          const y = sampleRibbonY(xF, 0.78, 36, 18, 3.8, time * 0.7) + 50;
          ctx.lineTo(x, y);
        }
        ctx.closePath();

        const lowerRibbonGrad = ctx.createLinearGradient(0, height * 0.55, width, height * 0.85);
        if (isLight) {
          lowerRibbonGrad.addColorStop(0, 'rgba(196, 181, 253, 0.18)');
          lowerRibbonGrad.addColorStop(1, 'rgba(224, 231, 255, 0.1)');
        } else {
          lowerRibbonGrad.addColorStop(0, 'rgba(10, 45, 140, 0.32)');
          lowerRibbonGrad.addColorStop(0.5, 'rgba(4, 25, 95, 0.24)');
          lowerRibbonGrad.addColorStop(1, 'rgba(2, 10, 40, 0.05)');
        }
        ctx.fillStyle = lowerRibbonGrad;
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [intensity, showParticles, isLight, reducedMotionSetting]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none select-none ${className}`}
    />
  );
};
