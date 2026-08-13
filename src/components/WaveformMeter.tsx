import React from 'react';

interface WaveformMeterProps {
  score: number; // 0 to 100
  barCount?: number;
  height?: number;
  interactive?: boolean;
}

export const WaveformMeter: React.FC<WaveformMeterProps> = ({
  score,
  barCount = 20,
  height = 48,
}) => {
  // Determine color theme based on score using muted palette rules
  const isHigh = score >= 85;
  const isMed = score >= 70 && score < 85;

  const getBarColor = (index: number) => {
    const opacity = 0.5 + (Math.sin(index * 0.5) + 1) * 0.25;
    if (isHigh) return `rgba(122, 158, 140, ${opacity})`; // #7A9E8C
    if (isMed) return `rgba(201, 162, 75, ${opacity})`;  // #C9A24B
    return `rgba(201, 117, 107, ${opacity})`;           // #C9756B
  };

  const getBarHeightPercent = (index: number) => {
    const normIndex = index / (barCount - 1);
    const baseWave = Math.sin(normIndex * Math.PI * 2.5) * 0.3 + 0.6;
    const scoreFactor = 0.3 + (score / 100) * 0.7;
    const barFactor = (Math.sin(index * 1.7) * 0.2 + 0.8) * baseWave * scoreFactor;
    return Math.max(15, Math.min(100, Math.round(barFactor * 100)));
  };

  return (
    <div className="flex flex-col gap-2 p-3 rounded bg-[#1C1C1E] border border-[#2E2E30]">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-[#8A8A8E] flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: isHigh ? '#7A9E8C' : isMed ? '#C9A24B' : '#C9756B' }} />
          Harmonic Consistency Meter
        </span>
        <span className="font-bold" style={{ color: isHigh ? '#7A9E8C' : isMed ? '#C9A24B' : '#C9756B' }}>
          {score}% Match
        </span>
      </div>

      <div 
        className="flex items-end justify-between gap-1 w-full px-1"
        style={{ height: `${height}px` }}
      >
        {Array.from({ length: barCount }).map((_, i) => {
          const heightPercent = getBarHeightPercent(i);
          const barColor = getBarColor(i);
          const animDelay = (i * 0.08) % 1.2;

          return (
            <div
              key={i}
              className="w-full rounded-xs transition-all duration-300 animate-waveform"
              style={{
                height: `${heightPercent}%`,
                backgroundColor: barColor,
                animationDelay: `${animDelay}s`,
                animationDuration: `${1.1 + (i % 3) * 0.3}s`,
              }}
              title={`Frequency Bin ${i + 1}: ${heightPercent}% amplitude`}
            />
          );
        })}
      </div>

      <div className="flex justify-between items-center text-[10px] text-[#8A8A8E] font-mono">
        <span>0Hz (Face/Costume)</span>
        <span>1kHz (Lighting)</span>
        <span>5kHz (Fine Geometry)</span>
      </div>
    </div>
  );
};
