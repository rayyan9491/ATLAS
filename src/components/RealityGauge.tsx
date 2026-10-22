import React from 'react';
import { AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react';
import { RealityCheckResult } from '../types/index.ts';

interface RealityGaugeProps {
  workload: RealityCheckResult;
  onOpenReplan: () => void;
  onAdjustAvailableTime: (newMinutes: number) => void;
}

export const RealityGauge: React.FC<RealityGaugeProps> = ({
  workload,
  onOpenReplan,
  onAdjustAvailableTime,
}) => {
  const { availableMinutes, remainingMinutes, plannedMinutes, diffMinutes, percentUtilized, status, overMinutes } = workload;

  // Visual meter percent clamped to 100 for arc stroke
  const clampedPercent = Math.min(100, percentUtilized);
  const strokeDashoffset = 251.2 - (251.2 * (clampedPercent * 0.75)) / 100;

  const getStatusColor = () => {
    if (status === 'over_capacity') return '#FB7185'; // rose
    if (status === 'under_capacity') return '#67E8F9'; // cyan
    return '#A78BFA'; // violet
  };

  const getStatusLabel = () => {
    if (status === 'over_capacity') return 'Over Capacity';
    if (status === 'under_capacity') return 'High Buffer';
    return 'Balanced Load';
  };

  const color = getStatusColor();

  return (
    <div className="p-5 rounded-2xl bg-[#121622] border border-[#252B3B] relative overflow-hidden flex flex-col justify-between">
      {/* Background radial glow */}
      <div
        className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{ backgroundColor: color }}
      />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-[#67E8F9]" />
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#939BB0] font-semibold">
            Reality Check Workload
          </h3>
        </div>
        <span
          className="text-[11px] font-mono px-2 py-0.5 rounded-full border font-semibold flex items-center gap-1.5"
          style={{
            borderColor: `${color}40`,
            backgroundColor: `${color}15`,
            color: color,
          }}
        >
          {status === 'over_capacity' && <AlertTriangle size={12} />}
          {status === 'balanced' && <CheckCircle size={12} />}
          {status === 'under_capacity' && <Zap size={12} />}
          <span>{getStatusLabel()}</span>
        </span>
      </div>

      {/* Main Gauge Graphic */}
      <div className="flex items-center justify-between gap-6 my-2">
        <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-135" viewBox="0 0 100 100">
            {/* Background Arc */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#181D2B"
              strokeWidth="10"
              fill="transparent"
              strokeDasharray="251.2"
              strokeDashoffset="62.8" /* 75% arc */
              strokeLinecap="round"
            />
            {/* Value Arc */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke={color}
              strokeWidth="10"
              fill="transparent"
              strokeDasharray="251.2"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold font-mono text-[#F4F5FA] tracking-tight">
              {percentUtilized}%
            </span>
            <span className="text-[10px] font-mono text-[#939BB0]">Workload</span>
          </div>
        </div>

        {/* Breakdown Stats */}
        <div className="flex-1 space-y-2 text-xs">
          <div className="flex justify-between items-center py-1 border-b border-[#252B3B]/60">
            <span className="text-[#939BB0]">Available Time</span>
            <span className="font-mono font-semibold text-[#F4F5FA]">{availableMinutes} min</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-[#252B3B]/60">
            <span className="text-[#939BB0]">Remaining Work</span>
            <span className="font-mono font-semibold text-[#F4F5FA]">{remainingMinutes} min</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-[#939BB0]">Capacity Delta</span>
            <span
              className={`font-mono font-bold ${
                diffMinutes < 0
                  ? 'text-[#FB7185]'
                  : diffMinutes > 20
                  ? 'text-[#67E8F9]'
                  : 'text-[#A78BFA]'
              }`}
            >
              {diffMinutes < 0 ? `-${overMinutes}m deficit` : `+${diffMinutes}m buffer`}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Availability quick adjustment */}
      <div className="pt-3 border-t border-[#252B3B] mt-2 flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-[11px] text-[#939BB0]">
          <span>Adjust Day Availability:</span>
          <div className="flex items-center gap-1">
            {[60, 120, 180, 240].map((mins) => (
              <button
                key={mins}
                onClick={() => onAdjustAvailableTime(mins)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                  availableMinutes === mins
                    ? 'bg-[#A78BFA] text-black font-bold'
                    : 'bg-[#181D2B] text-[#939BB0] hover:text-[#F4F5FA]'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenReplan}
            className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              status === 'over_capacity'
                ? 'bg-[#FB7185]/20 text-[#FB7185] border border-[#FB7185]/50 hover:bg-[#FB7185]/30'
                : 'bg-[#181D2B] hover:bg-[#252B3B] text-[#F4F5FA] border border-[#252B3B]'
            }`}
          >
            <Zap size={14} className={status === 'over_capacity' ? 'text-[#FB7185]' : 'text-[#67E8F9]'} />
            <span>{status === 'over_capacity' ? 'Resolve Overload (Replan)' : 'Optimize Schedule'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
