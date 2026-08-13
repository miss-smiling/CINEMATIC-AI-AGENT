/**
 * Continuum - Visual Consistency Engine for AI Storyboards
 */
import React, { useState } from 'react';
import {
  ViewMode,
  StoryboardShot,
  Character,
  LocationAsset,
  PropAsset,
  ChecklistItems,
  ConsistencyStatus,
} from './types';
import {
  INITIAL_CHARACTERS,
  INITIAL_LOCATIONS,
  INITIAL_PROPS,
  INITIAL_SHOTS,
} from './data/mockData';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ShotGrid } from './components/ShotGrid';
import { ShotDetailPanel } from './components/ShotDetailPanel';
import { ConsistencyDashboard } from './components/ConsistencyDashboard';
import { AssetsView } from './components/AssetsView';
import { SettingsView } from './components/SettingsView';
import { NewShotModal } from './components/NewShotModal';
import { AddAssetModal } from './components/AddAssetModal';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('shots');
  const [shots, setShots] = useState<StoryboardShot[]>(INITIAL_SHOTS);
  const [characters, setCharacters] = useState<Character[]>(INITIAL_CHARACTERS);
  const [locations, setLocations] = useState<LocationAsset[]>(INITIAL_LOCATIONS);
  const [propsList, setPropsList] = useState<PropAsset[]>(INITIAL_PROPS);

  // Filter & Highlight States
  const [hoveredCharacterId, setHoveredCharacterId] = useState<string | null>(null);
  const [selectedCharacterFilter, setSelectedCharacterFilter] = useState<string | null>(null);
  const [selectedLocationFilter, setSelectedLocationFilter] = useState<string | null>(null);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<ConsistencyStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'sequence' | 'score_asc' | 'score_desc' | 'flagged_first'>('sequence');

  // Active Detail Panel Shot & UI Overlays
  const [selectedShot, setSelectedShot] = useState<StoryboardShot | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isNewShotModalOpen, setIsNewShotModalOpen] = useState(false);

  // Asset creation modal states
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
  const [addAssetModalType, setAddAssetModalType] = useState<'character' | 'location' | 'prop'>('character');

  // Compute Overall Consistency Metrics
  const totalShotsCount = shots.length;
  const avgConsistencyScore = Math.round(
    shots.reduce((acc, s) => acc + s.consistencyScore, 0) / (totalShotsCount || 1)
  );
  const flaggedShotsCount = shots.filter(
    (s) => s.status === 'inconsistent' || s.status === 'needs_review'
  ).length;

  // Asset creation handlers
  const handleOpenAddModal = (type: 'character' | 'location' | 'prop') => {
    setAddAssetModalType(type);
    setIsAddAssetModalOpen(true);
  };

  const handleAddCharacter = (newChar: Character) => {
    setCharacters((prev) => [...prev, newChar]);
  };

  const handleAddLocation = (newLoc: LocationAsset) => {
    setLocations((prev) => [...prev, newLoc]);
  };

  const handleAddProp = (newProp: PropAsset) => {
    setPropsList((prev) => [...prev, newProp]);
  };

  // Toggle checklist item and update shot score live
  const handleUpdateShotChecklist = (shotId: string, newChecklist: ChecklistItems) => {
    const countTrue = Object.values(newChecklist).filter(Boolean).length;
    const newScore = countTrue * 20;

    let newStatus: ConsistencyStatus = 'consistent';
    if (newScore < 70) newStatus = 'inconsistent';
    else if (newScore < 85) newStatus = 'needs_review';

    setShots((prevShots) =>
      prevShots.map((s) => {
        if (s.id !== shotId) return s;
        return {
          ...s,
          checklist: newChecklist,
          consistencyScore: newScore,
          status: newStatus,
        };
      })
    );

    if (selectedShot && selectedShot.id === shotId) {
      setSelectedShot((prev) =>
        prev
          ? {
              ...prev,
              checklist: newChecklist,
              consistencyScore: newScore,
              status: newStatus,
            }
          : null
      );
    }
  };

  // Cycle shot status manually (for quick status override & testing transitions)
  const handleCycleShotStatus = (shotId: string) => {
    setShots((prevShots) =>
      prevShots.map((s) => {
        if (s.id !== shotId) return s;
        const nextStatus: ConsistencyStatus =
          s.status === 'consistent'
            ? 'needs_review'
            : s.status === 'needs_review'
            ? 'inconsistent'
            : 'consistent';
        const nextScore =
          nextStatus === 'consistent' ? 100 : nextStatus === 'needs_review' ? 80 : 60;

        const newChecklist = {
          facialFeatures: true,
          hairStyle: true,
          costume: true,
          colorPaletteAndLighting: nextStatus !== 'inconsistent',
          propsAndAccessories: nextStatus === 'consistent',
        };

        return {
          ...s,
          status: nextStatus,
          consistencyScore: nextScore,
          checklist: newChecklist,
        };
      })
    );

    if (selectedShot && selectedShot.id === shotId) {
      setSelectedShot((prev) => {
        if (!prev) return null;
        const nextStatus: ConsistencyStatus =
          prev.status === 'consistent'
            ? 'needs_review'
            : prev.status === 'needs_review'
            ? 'inconsistent'
            : 'consistent';
        const nextScore =
          nextStatus === 'consistent' ? 100 : nextStatus === 'needs_review' ? 80 : 60;
        const newChecklist = {
          facialFeatures: true,
          hairStyle: true,
          costume: true,
          colorPaletteAndLighting: nextStatus !== 'inconsistent',
          propsAndAccessories: nextStatus === 'consistent',
        };
        return {
          ...prev,
          status: nextStatus,
          consistencyScore: nextScore,
          checklist: newChecklist,
        };
      });
    }
  };

  // Add team note to a shot
  const handleAddNote = (shotId: string, text: string) => {
    const newNote = {
      id: `note-${Date.now()}`,
      author: 'Sarah Chen (Director)',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
      role: 'Director',
      text,
      timestamp: 'Just now',
    };

    setShots((prevShots) =>
      prevShots.map((s) => {
        if (s.id !== shotId) return s;
        return { ...s, notes: [...s.notes, newNote] };
      })
    );

    if (selectedShot && selectedShot.id === shotId) {
      setSelectedShot((prev) => (prev ? { ...prev, notes: [...prev.notes, newNote] } : null));
    }
  };

  // Add key prompt token to character
  const handleAddCharacterToken = (charId: string, token: string) => {
    setCharacters((prev) =>
      prev.map((c) => {
        if (c.id !== charId) return c;
        return { ...c, keyPromptTokens: [...c.keyPromptTokens, token] };
      })
    );
  };

  // Add new shot to list
  const handleAddShot = (newShot: StoryboardShot) => {
    setShots((prev) => [newShot, ...prev]);
  };

  // Export Consistency Report JSON
  const handleExportReport = () => {
    const reportData = {
      projectName: 'Continuum Production Sequence',
      exportTimestamp: new Date().toISOString(),
      overallMetrics: {
        totalShots: totalShotsCount,
        averageConsistencyScore: avgConsistencyScore,
        flaggedShotsCount,
      },
      characterHealth: characters.map((char) => {
        const charShots = shots.filter((s) => s.characters.includes(char.id));
        const avg = charShots.length
          ? Math.round(charShots.reduce((acc, s) => acc + s.consistencyScore, 0) / charShots.length)
          : char.consistencyRate;
        return {
          characterName: char.name,
          color: char.color,
          shotsCount: charShots.length,
          consistencyHealthScore: avg,
        };
      }),
      shots: shots.map((s) => ({
        shotNumber: s.shotNumber,
        sceneNumber: s.sceneNumber,
        title: s.title,
        status: s.status,
        score: s.consistencyScore,
        prompt: s.prompt,
        flags: s.checklistFlags,
      })),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `continuum-consistency-report-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-[#0b0d12] bg-grid-pattern text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onViewChange={(view) => setCurrentView(view)}
        avgScore={avgConsistencyScore}
        totalShots={totalShotsCount}
        flaggedCount={flaggedShotsCount}
        onNewShotClick={() => setIsNewShotModalOpen(true)}
        onExportReport={handleExportReport}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Persistent Sidebar */}
        <Sidebar
          characters={characters}
          locations={locations}
          propsList={propsList}
          hoveredCharacterId={hoveredCharacterId}
          onHoverCharacter={(id) => setHoveredCharacterId(id)}
          selectedCharacterFilter={selectedCharacterFilter}
          onSelectCharacterFilter={(id) => {
            setSelectedCharacterFilter(id);
            if (id && currentView !== 'shots') setCurrentView('shots');
          }}
          selectedLocationFilter={selectedLocationFilter}
          onSelectLocationFilter={(id) => {
            setSelectedLocationFilter(id);
            if (id && currentView !== 'shots') setCurrentView('shots');
          }}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onOpenAddModal={handleOpenAddModal}
        />

        {/* View Switcher Container */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {currentView === 'shots' && (
            <ShotGrid
              shots={shots}
              characters={characters}
              locations={locations}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCharacterFilter={selectedCharacterFilter}
              onSelectCharacterFilter={setSelectedCharacterFilter}
              selectedLocationFilter={selectedLocationFilter}
              onSelectLocationFilter={setSelectedLocationFilter}
              selectedStatusFilter={selectedStatusFilter}
              onSelectStatusFilter={setSelectedStatusFilter}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              hoveredCharacterId={hoveredCharacterId}
              selectedShotId={selectedShot?.id || null}
              onSelectShot={(shot) => setSelectedShot(shot)}
              onNewShotClick={() => setIsNewShotModalOpen(true)}
            />
          )}

          {currentView === 'reports' && (
            <ConsistencyDashboard
              shots={shots}
              characters={characters}
              onSelectShot={(shot) => {
                setSelectedShot(shot);
                setCurrentView('shots');
              }}
            />
          )}

          {currentView === 'assets' && (
            <AssetsView
              characters={characters}
              locations={locations}
              propsList={propsList}
              shots={shots}
              onAddCharacterToken={handleAddCharacterToken}
              onOpenAddModal={handleOpenAddModal}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView onExportReport={handleExportReport} />
          )}
        </main>

        {/* Right Slide-over Shot Detail Panel */}
        {selectedShot && (
          <ShotDetailPanel
            shot={selectedShot}
            characters={characters}
            locations={locations}
            propsList={propsList}
            onClose={() => setSelectedShot(null)}
            onUpdateShotChecklist={handleUpdateShotChecklist}
            onCycleStatus={() => handleCycleShotStatus(selectedShot.id)}
            onAddNote={handleAddNote}
          />
        )}
      </div>

      {/* New Shot Modal */}
      {isNewShotModalOpen && (
        <NewShotModal
          characters={characters}
          locations={locations}
          propsList={propsList}
          nextShotNumber={`S0${Math.ceil((shots.length + 1) / 4)}-0${((shots.length) % 4) + 1}`}
          nextSceneNumber={`Scene ${Math.ceil((shots.length + 1) / 4)}`}
          onClose={() => setIsNewShotModalOpen(false)}
          onAddShot={handleAddShot}
        />
      )}

      {/* Add Asset Modal */}
      {isAddAssetModalOpen && (
        <AddAssetModal
          isOpen={isAddAssetModalOpen}
          initialType={addAssetModalType}
          onClose={() => setIsAddAssetModalOpen(false)}
          onAddCharacter={handleAddCharacter}
          onAddLocation={handleAddLocation}
          onAddProp={handleAddProp}
        />
      )}
    </div>
  );
}
