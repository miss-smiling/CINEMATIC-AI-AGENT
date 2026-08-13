import React, { useState, useEffect } from 'react';
import { StoryboardShot, Character } from '../types';
import { Sparkles, AlertTriangle, Film, TrendingUp, ChevronRight, BarChart2, ShieldAlert } from 'lucide-react';

interface ConsistencyDashboardProps {
  shots: StoryboardShot[];
  characters: Character[];
  onSelectShot: (shot: StoryboardShot) => void;
}

export const ConsistencyDashboard: React.FC<ConsistencyDashboardProps> = ({
  shots,
  characters,
  onSelectShot,
}) => {
  const [animateBars, setAnimateBars] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimateBars(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Compute metrics
  const totalShots = shots.length;
  const avgScore = Math.round(
    shots.reduce((acc, s) => acc + s.consistencyScore, 0) / (totalShots || 1)
  );

  const flaggedShots = shots.filter((s) => s.status === 'inconsistent' || s.status === 'needs_review');
  const consistentShotsCount = shots.filter((s) => s.status === 'consistent').length;
  const needsReviewCount = shots.filter((s) => s.status === 'needs_review').length;
  const inconsistentCount = shots.filter((s) => s.status === 'inconsistent').length;

  return (
    <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-4">
      {/* Three Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Average Consistency Score */}
        <div className="bg-[#232325] p-4 rounded-lg flex items-center justify-between border border-[#2E2E30]">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase text-[#8A8A8E]">Average Consistency</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#EDEAE3] font-mono">{avgScore}%</span>
              <span className="text-xs font-mono text-[#7A9E8C] flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" /> +2.4%
              </span>
            </div>
            <p className="text-[11px] text-[#8A8A8E]">Target score: 85%+</p>
          </div>
          <div className="w-10 h-10 rounded bg-[#1C1C1E] border border-[#2E2E30] flex items-center justify-center text-[#B8945F]">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Shots Flagged */}
        <div className="bg-[#232325] p-4 rounded-lg flex items-center justify-between border border-[#2E2E30]">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase text-[#8A8A8E]">Shots Flagged</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#C9756B] font-mono">{flaggedShots.length}</span>
              <span className="text-xs font-mono text-[#8A8A8E]">
                ({needsReviewCount} review, {inconsistentCount} critical)
              </span>
            </div>
            <p className="text-[11px] text-[#8A8A8E]">Action needed before final render</p>
          </div>
          <div className="w-10 h-10 rounded bg-[#1C1C1E] border border-[#2E2E30] flex items-center justify-center text-[#C9756B]">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Total Shots */}
        <div className="bg-[#232325] p-4 rounded-lg flex items-center justify-between border border-[#2E2E30]">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase text-[#8A8A8E]">Total Shots Tagged</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#7A9E8C] font-mono">{totalShots}</span>
              <span className="text-xs font-mono text-[#7A9E8C]">{consistentShotsCount} Passed</span>
            </div>
            <p className="text-[11px] text-[#8A8A8E]">Across Sequence</p>
          </div>
          <div className="w-10 h-10 rounded bg-[#1C1C1E] border border-[#2E2E30] flex items-center justify-center text-[#7A9E8C]">
            <Film className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Bar Chart: Score per Shot */}
      <div className="bg-[#232325] p-4 rounded-lg space-y-4 border border-[#2E2E30]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-[#EDEAE3] flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-[#B8945F]" /> Sequence Consistency Bar Chart
            </h3>
            <p className="text-xs text-[#8A8A8E]">
              Individual score per shot across full story reel sequence.
            </p>
          </div>

          {/* Color Legend Tiers */}
          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7A9E8C]" />
              <span className="text-[#8A8A8E]">Consistent (≥85%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C9A24B]" />
              <span className="text-[#8A8A8E]">Review (70-84%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C9756B]" />
              <span className="text-[#8A8A8E]">Flagged (&lt;70%)</span>
            </div>
          </div>
        </div>

        {/* Animated Bar Chart Container */}
        <div className="h-56 w-full bg-[#1C1C1E] p-4 rounded border border-[#2E2E30] flex items-end justify-between gap-2 overflow-x-auto">
          {shots.map((shot, idx) => {
            const isConsistent = shot.status === 'consistent';
            const isReview = shot.status === 'needs_review';
            const barBg = isConsistent ? 'bg-[#7A9E8C]' : isReview ? 'bg-[#C9A24B]' : 'bg-[#C9756B]';

            const staggerDelay = idx * 0.04;

            return (
              <div
                key={shot.id}
                onClick={() => onSelectShot(shot)}
                className="group relative flex-1 flex flex-col items-center gap-2 h-full justify-end cursor-pointer min-w-[28px]"
              >
                {/* Score hover tooltip */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute -top-8 px-2 py-1 rounded bg-[#2A2A2C] border border-[#2E2E30] text-[10px] font-mono text-[#EDEAE3] whitespace-nowrap z-20 pointer-events-none">
                  {shot.shotNumber}: {shot.consistencyScore}%
                </div>

                {/* Animated Height Bar */}
                <div
                  className={`w-full max-w-[28px] rounded-t transition-all duration-500 ease-out ${barBg} group-hover:brightness-110`}
                  style={{
                    height: animateBars ? `${shot.consistencyScore}%` : '0%',
                    transitionDelay: `${staggerDelay}s`,
                  }}
                />

                <span className="text-[10px] font-mono text-[#8A8A8E] group-hover:text-[#EDEAE3] truncate">
                  {shot.shotNumber.replace('S0', '')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Character Consistency Rates & Flagged Shots Action List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Character Consistency Breakdown */}
        <div className="bg-[#232325] p-4 rounded-lg space-y-4 border border-[#2E2E30]">
          <h3 className="text-sm font-semibold text-[#EDEAE3] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#B8945F]" /> Character Continuity Health
          </h3>

          <div className="space-y-3">
            {characters.length === 0 ? (
              <div className="p-4 rounded border border-dashed border-[#2E2E30] bg-[#1C1C1E] text-center text-xs text-[#8A8A8E]">
                No character profiles registered yet. Add characters in Asset Library to track individual continuity health.
              </div>
            ) : (
              characters.map((char) => {
                const charShots = shots.filter((s) => s.characters.includes(char.id));
                const charAvgScore = charShots.length
                  ? Math.round(charShots.reduce((acc, s) => acc + s.consistencyScore, 0) / charShots.length)
                  : char.consistencyRate;

                return (
                  <div key={char.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: char.color || '#B57878' }} />
                        <span className="text-[#EDEAE3] font-semibold">{char.name}</span>
                        <span className="text-[10px] text-[#8A8A8E]">({charShots.length} shots)</span>
                      </div>
                      <span className="text-[#EDEAE3] font-bold">{charAvgScore}%</span>
                    </div>

                    <div className="w-full h-1.5 rounded bg-[#1C1C1E] overflow-hidden border border-[#2E2E30]">
                      <div
                        className="h-full rounded transition-all duration-500"
                        style={{
                          width: `${charAvgScore}%`,
                          backgroundColor: char.color || '#B57878',
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Flagged Shots Review List */}
        <div className="bg-[#232325] p-4 rounded-lg space-y-4 border border-[#2E2E30]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#EDEAE3] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#C9756B]" /> Flagged Continuity Issues ({flaggedShots.length})
            </h3>
            <span className="text-[10px] text-[#C9756B] font-mono">Requires Review</span>
          </div>

          <div className="space-y-2">
            {flaggedShots.map((shot) => (
              <div
                key={shot.id}
                onClick={() => onSelectShot(shot)}
                className="group flex items-center justify-between p-2.5 rounded bg-[#1C1C1E] border border-[#2E2E30] hover:border-[#B8945F] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={shot.imageUrl}
                    alt={shot.title}
                    className="w-12 h-9 rounded object-cover border border-[#2E2E30] shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#B8945F]">{shot.shotNumber}</span>
                      <span className="text-xs font-semibold text-[#EDEAE3] group-hover:text-[#B8945F]">
                        {shot.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#C9756B] line-clamp-1">
                      {Object.values(shot.checklistFlags)[0] || 'Inconsistency detected in character style'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono font-bold text-[#C9756B]">{shot.consistencyScore}%</span>
                  <ChevronRight className="w-4 h-4 text-[#8A8A8E] group-hover:text-[#EDEAE3] transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
