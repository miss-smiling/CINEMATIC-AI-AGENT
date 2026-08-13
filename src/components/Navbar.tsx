import React from 'react';
import { ViewMode } from '../types';
import { LayoutGrid, Users, BarChart3, Settings, Film, Plus, Download } from 'lucide-react';

interface NavbarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  avgScore: number;
  totalShots: number;
  flaggedCount: number;
  onNewShotClick: () => void;
  onExportReport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  totalShots,
  flaggedCount,
  onNewShotClick,
  onExportReport,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#232325] border-b border-[#2E2E30] px-4 lg:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Brand logo and Project Badge */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => onViewChange('shots')}>
            <div className="w-8 h-8 rounded bg-[#2A2A2C] border border-[#2E2E30] flex items-center justify-center text-[#EDEAE3] group-hover:border-[#8A8A8E] transition-colors">
              <Film className="w-4 h-4 text-[#EDEAE3]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-[#EDEAE3] font-sans uppercase">
                  CONTINUUM
                </span>
                <span className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-[#2A2A2C] text-[#8A8A8E] border border-[#2E2E30]">
                  Studio
                </span>
              </div>
              <p className="text-[11px] text-[#8A8A8E] hidden sm:block font-sans">
                Visual Consistency Audit Platform
              </p>
            </div>
          </div>

          <div className="h-5 w-px bg-[#2E2E30] hidden sm:block" />

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono bg-[#1C1C1E] border border-[#2E2E30] px-3 py-1 rounded text-[#8A8A8E]">
            <span className="w-2 h-2 rounded-full bg-[#7A9E8C]" />
            <span>Project:</span>
            <span className="font-semibold text-[#EDEAE3]">Chronos Dawn (Act I)</span>
          </div>
        </div>

        {/* Center: Main View Navigation - Only active tab gets #B8945F */}
        <nav className="flex items-center bg-[#1C1C1E] p-1 rounded-lg border border-[#2E2E30]">
          <button
            onClick={() => onViewChange('shots')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
              currentView === 'shots'
                ? 'bg-[#2A2A2C] text-[#B8945F] border border-[#B8945F]/40 font-semibold'
                : 'text-[#8A8A8E] hover:text-[#EDEAE3] hover:bg-[#2A2A2C]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Shot Sequence</span>
            <span className={`ml-1 px-1.5 py-0.2 rounded text-[10px] font-mono ${
              currentView === 'shots' ? 'bg-[#1C1C1E] text-[#B8945F]' : 'bg-[#2A2A2C] text-[#8A8A8E]'
            }`}>
              {totalShots}
            </span>
          </button>

          <button
            onClick={() => onViewChange('assets')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
              currentView === 'assets'
                ? 'bg-[#2A2A2C] text-[#B8945F] border border-[#B8945F]/40 font-semibold'
                : 'text-[#8A8A8E] hover:text-[#EDEAE3] hover:bg-[#2A2A2C]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Asset Library</span>
          </button>

          <button
            onClick={() => onViewChange('reports')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
              currentView === 'reports'
                ? 'bg-[#2A2A2C] text-[#B8945F] border border-[#B8945F]/40 font-semibold'
                : 'text-[#8A8A8E] hover:text-[#EDEAE3] hover:bg-[#2A2A2C]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Audit Reports</span>
            {flaggedCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#C9756B]" />
            )}
          </button>

          <button
            onClick={() => onViewChange('settings')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
              currentView === 'settings'
                ? 'bg-[#2A2A2C] text-[#B8945F] border border-[#B8945F]/40 font-semibold'
                : 'text-[#8A8A8E] hover:text-[#EDEAE3] hover:bg-[#2A2A2C]'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </nav>

        {/* Right: Actions (Score badge removed completely per rule) */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            onClick={onExportReport}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-[#1C1C1E] border border-[#2E2E30] text-[#8A8A8E] hover:text-[#EDEAE3] hover:bg-[#2A2A2C] transition-colors cursor-pointer"
            title="Export Consistency Report"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>

          <button
            onClick={onNewShotClick}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-semibold bg-[#B8945F] text-[#1C1C1E] hover:bg-[#C9A24B] transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Shot</span>
          </button>
        </div>
      </div>
    </header>
  );
};
