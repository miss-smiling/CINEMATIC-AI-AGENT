import React from 'react';
import { StoryboardShot, Character } from '../types';
import { StatusChip } from './StatusChip';

interface ShotCardProps {
  shot: StoryboardShot;
  allCharacters: Character[];
  isHighlightedBySidebar: boolean;
  highlightColor?: string;
  isSelected: boolean;
  onClick: () => void;
}

export const ShotCard: React.FC<ShotCardProps> = ({
  shot,
  allCharacters,
  isHighlightedBySidebar,
  highlightColor = '#B8945F',
  isSelected,
  onClick,
}) => {
  // Resolve characters present in this shot
  const shotCharacters = shot.characters
    .map((id) => allCharacters.find((c) => c.id === id))
    .filter((c): c is Character => c !== undefined);

  return (
    <div
      onClick={onClick}
      className={`group relative rounded-lg overflow-hidden cursor-pointer transition-colors duration-150 bg-[#232325] border ${
        isSelected
          ? 'border-[#B8945F] bg-[#2A2A2C]'
          : isHighlightedBySidebar
          ? 'border-[#B8945F] z-10'
          : 'border-[#2E2E30] hover:border-[#8A8A8E] hover:bg-[#2A2A2C]'
      }`}
    >
      {/* Thumbnail Aspect Ratio Frame */}
      <div className="relative aspect-video w-full overflow-hidden bg-[#1C1C1E]">
        <img
          src={shot.imageUrl}
          alt={shot.title}
          className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
          referrerPolicy="no-referrer"
        />

        {/* Flat Gradient Overlay for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1E]/90 via-transparent to-[#1C1C1E]/30 pointer-events-none" />

        {/* Top Header Overlay: Shot Number & Status Chip */}
        <div className="absolute top-2 inset-x-2 flex items-center justify-between gap-2 z-10">
          <span className="px-2 py-0.5 rounded bg-[#1C1C1E]/90 border border-[#2E2E30] text-[10px] font-mono font-semibold text-[#EDEAE3] tracking-wide">
            {shot.shotNumber}
          </span>
          <StatusChip status={shot.status} score={shot.consistencyScore} size="sm" />
        </div>

        {/* Bottom Left Corner: Character Identity Chips */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 z-10">
          {shotCharacters.map((char) => (
            <div
              key={char.id}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#1C1C1E]/90 border border-[#2E2E30]"
              title={`Character present: ${char.name}`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: char.color || '#B57878' }}
              />
              <span className="text-[10px] font-mono text-[#EDEAE3] font-medium hidden sm:inline">
                {char.name.split(' ')[1] || char.name}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom Right Corner: AI Model Pill */}
        <div className="absolute bottom-2 right-2 z-10">
          <span className="text-[10px] font-mono text-[#8A8A8E] bg-[#1C1C1E]/90 border border-[#2E2E30] px-1.5 py-0.5 rounded">
            {shot.aiModel}
          </span>
        </div>
      </div>

      {/* Shot Info Footer */}
      <div className="p-3 bg-[#232325] border-t border-[#2E2E30] space-y-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-semibold text-[#EDEAE3] group-hover:text-[#B8945F] transition-colors truncate">
            {shot.title}
          </h3>
          <span className="text-[10px] text-[#8A8A8E] font-mono shrink-0">
            {shot.sceneNumber}
          </span>
        </div>
        <p className="text-[11px] text-[#8A8A8E] line-clamp-1 font-sans">
          {shot.description}
        </p>
      </div>

      {/* Sidebar Highlight Border */}
      {isHighlightedBySidebar && !isSelected && (
        <div className="absolute inset-0 rounded-lg pointer-events-none border-2 border-[#B8945F]" />
      )}
    </div>
  );
};
