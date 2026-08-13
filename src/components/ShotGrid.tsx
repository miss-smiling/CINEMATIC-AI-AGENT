import React from 'react';
import { StoryboardShot, Character, LocationAsset, ConsistencyStatus } from '../types';
import { ShotCard } from './ShotCard';
import { Search, ArrowUpDown, X, CheckCircle2, AlertCircle, Clock, Film, Plus } from 'lucide-react';

interface ShotGridProps {
  shots: StoryboardShot[];
  characters: Character[];
  locations: LocationAsset[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCharacterFilter: string | null;
  onSelectCharacterFilter: (id: string | null) => void;
  selectedLocationFilter: string | null;
  onSelectLocationFilter: (id: string | null) => void;
  selectedStatusFilter: ConsistencyStatus | 'all';
  onSelectStatusFilter: (status: ConsistencyStatus | 'all') => void;
  sortBy: 'sequence' | 'score_asc' | 'score_desc' | 'flagged_first';
  onSortByChange: (sort: 'sequence' | 'score_asc' | 'score_desc' | 'flagged_first') => void;
  hoveredCharacterId: string | null;
  selectedShotId: string | null;
  onSelectShot: (shot: StoryboardShot) => void;
  onNewShotClick?: () => void;
}

export const ShotGrid: React.FC<ShotGridProps> = ({
  shots,
  characters,
  locations,
  searchQuery,
  onSearchChange,
  selectedCharacterFilter,
  onSelectCharacterFilter,
  selectedLocationFilter,
  onSelectLocationFilter,
  selectedStatusFilter,
  onSelectStatusFilter,
  sortBy,
  onSortByChange,
  hoveredCharacterId,
  selectedShotId,
  onSelectShot,
  onNewShotClick,
}) => {
  // Find character color for sidebar hover highlight
  const hoveredCharacter = characters.find((c) => c.id === hoveredCharacterId);

  // Filter logic
  const filteredShots = shots.filter((shot) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = shot.title.toLowerCase().includes(q);
      const descMatch = shot.description.toLowerCase().includes(q);
      const promptMatch = shot.prompt.toLowerCase().includes(q);
      const shotNumMatch = shot.shotNumber.toLowerCase().includes(q);
      if (!titleMatch && !descMatch && !promptMatch && !shotNumMatch) return false;
    }

    if (selectedCharacterFilter) {
      if (!shot.characters.includes(selectedCharacterFilter)) return false;
    }

    if (selectedLocationFilter) {
      if (shot.locationId !== selectedLocationFilter) return false;
    }

    if (selectedStatusFilter !== 'all') {
      if (shot.status !== selectedStatusFilter) return false;
    }

    return true;
  });

  // Sort logic
  const sortedShots = [...filteredShots].sort((a, b) => {
    if (sortBy === 'score_asc') return a.consistencyScore - b.consistencyScore;
    if (sortBy === 'score_desc') return b.consistencyScore - a.consistencyScore;
    if (sortBy === 'flagged_first') {
      const rank = (status: ConsistencyStatus) => (status === 'inconsistent' ? 0 : status === 'needs_review' ? 1 : 2);
      return rank(a.status) - rank(b.status);
    }
    return a.shotNumber.localeCompare(b.shotNumber);
  });

  const clearAllFilters = () => {
    onSearchChange('');
    onSelectCharacterFilter(null);
    onSelectLocationFilter(null);
    onSelectStatusFilter('all');
  };

  const hasActiveFilters =
    searchQuery || selectedCharacterFilter || selectedLocationFilter || selectedStatusFilter !== 'all';

  return (
    <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-4">
      {/* Search & Toolbar Bar */}
      <div className="bg-[#232325] border border-[#2E2E30] p-3 rounded-lg flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8E]" />
          <input
            type="text"
            placeholder="Search shots, prompts, scene numbers..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#1C1C1E] border border-[#2E2E30] text-[#EDEAE3] pl-9 pr-8 py-1.5 rounded text-xs placeholder:text-[#8A8A8E] focus:outline-none focus:border-[#B8945F]"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8A8A8E] hover:text-[#EDEAE3] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Buttons & Sort */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-[#1C1C1E] p-1 rounded border border-[#2E2E30] text-xs">
            <button
              onClick={() => onSelectStatusFilter('all')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                selectedStatusFilter === 'all'
                  ? 'bg-[#2A2A2C] text-[#EDEAE3] font-semibold'
                  : 'text-[#8A8A8E] hover:text-[#EDEAE3]'
              }`}
            >
              All ({shots.length})
            </button>
            <button
              onClick={() => onSelectStatusFilter('consistent')}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer ${
                selectedStatusFilter === 'consistent'
                  ? 'bg-[#7A9E8C]/20 text-[#7A9E8C] font-semibold border border-[#7A9E8C]/50'
                  : 'text-[#8A8A8E] hover:text-[#7A9E8C]'
              }`}
            >
              <CheckCircle2 className="w-3 h-3 text-[#7A9E8C]" />
              <span>Consistent</span>
            </button>
            <button
              onClick={() => onSelectStatusFilter('needs_review')}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer ${
                selectedStatusFilter === 'needs_review'
                  ? 'bg-[#C9A24B]/20 text-[#C9A24B] font-semibold border border-[#C9A24B]/50'
                  : 'text-[#8A8A8E] hover:text-[#C9A24B]'
              }`}
            >
              <Clock className="w-3 h-3 text-[#C9A24B]" />
              <span>Review</span>
            </button>
            <button
              onClick={() => onSelectStatusFilter('inconsistent')}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer ${
                selectedStatusFilter === 'inconsistent'
                  ? 'bg-[#C9756B]/20 text-[#C9756B] font-semibold border border-[#C9756B]/50'
                  : 'text-[#8A8A8E] hover:text-[#C9756B]'
              }`}
            >
              <AlertCircle className="w-3 h-3 text-[#C9756B]" />
              <span>Flagged</span>
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#1C1C1E] border border-[#2E2E30] px-3 py-1.5 rounded text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#8A8A8E]" />
            <span className="text-[#8A8A8E] hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as any)}
              className="bg-transparent text-[#EDEAE3] focus:outline-none cursor-pointer font-sans"
            >
              <option value="sequence" className="bg-[#1C1C1E] text-[#EDEAE3]">
                Sequence Order
              </option>
              <option value="score_desc" className="bg-[#1C1C1E] text-[#EDEAE3]">
                Score (High → Low)
              </option>
              <option value="score_asc" className="bg-[#1C1C1E] text-[#EDEAE3]">
                Score (Low → High)
              </option>
              <option value="flagged_first" className="bg-[#1C1C1E] text-[#EDEAE3]">
                Flagged First
              </option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs bg-[#2A2A2C] text-[#C9756B] border border-[#2E2E30] hover:bg-[#323235] transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Sidebar Character Highlight Banner */}
      {hoveredCharacter && (
        <div className="bg-[#232325] border border-[#B8945F] p-2.5 px-4 rounded flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs font-mono">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: hoveredCharacter.color }}
            />
            <span className="text-[#8A8A8E]">Highlighting shots featuring:</span>
            <span className="font-bold text-[#EDEAE3]">
              {hoveredCharacter.name} ({hoveredCharacter.role})
            </span>
          </div>
          <span className="text-[11px] text-[#8A8A8E] font-mono">
            {shots.filter((s) => s.characters.includes(hoveredCharacter.id)).length} shots
          </span>
        </div>
      )}

      {/* Shots Grid */}
      {shots.length === 0 ? (
        <div className="bg-[#232325] p-12 rounded-lg border border-dashed border-[#2E2E30] text-center space-y-4 max-w-lg mx-auto my-12">
          <div className="w-12 h-12 rounded bg-[#1C1C1E] border border-[#2E2E30] flex items-center justify-center mx-auto text-[#8A8A8E]">
            <Film className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-[#EDEAE3]">No Storyboard Shots Created</h3>
            <p className="text-xs text-[#8A8A8E] max-w-sm mx-auto leading-relaxed">
              Start building your reel sequence by creating your first shot frame with prompt parameters.
            </p>
          </div>
          {onNewShotClick && (
            <button
              onClick={onNewShotClick}
              className="px-4 py-2 rounded bg-[#B8945F] text-[#1C1C1E] hover:bg-[#C9A24B] font-semibold text-xs flex items-center gap-1.5 mx-auto transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add First Shot
            </button>
          )}
        </div>
      ) : sortedShots.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedShots.map((shot) => {
            const isHighlighted = hoveredCharacterId !== null && shot.characters.includes(hoveredCharacterId);

            return (
              <ShotCard
                key={shot.id}
                shot={shot}
                allCharacters={characters}
                isHighlightedBySidebar={isHighlighted}
                highlightColor={hoveredCharacter?.color}
                isSelected={selectedShotId === shot.id}
                onClick={() => onSelectShot(shot)}
              />
            );
          })}
        </div>
      ) : (
        <div className="bg-[#232325] p-12 rounded-lg border border-[#2E2E30] text-center space-y-3">
          <Film className="w-8 h-8 text-[#8A8A8E] mx-auto" />
          <h3 className="text-sm font-semibold text-[#EDEAE3]">No Storyboard Shots Match Filters</h3>
          <p className="text-xs text-[#8A8A8E] max-w-md mx-auto">
            Try resetting your search query or character filter to view the full shot sequence.
          </p>
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 rounded text-xs font-medium bg-[#2A2A2C] text-[#EDEAE3] border border-[#2E2E30] hover:bg-[#323235] transition-colors cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};
