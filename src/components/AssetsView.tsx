import React, { useState } from 'react';
import { Character, LocationAsset, PropAsset, StoryboardShot } from '../types';
import { Users, MapPin, Box, Tag, Plus, UserPlus } from 'lucide-react';

interface AssetsViewProps {
  characters: Character[];
  locations: LocationAsset[];
  propsList: PropAsset[];
  shots: StoryboardShot[];
  onAddCharacterToken: (charId: string, token: string) => void;
  onOpenAddModal: (type: 'character' | 'location' | 'prop') => void;
}

export const AssetsView: React.FC<AssetsViewProps> = ({
  characters,
  locations,
  propsList,
  shots,
  onAddCharacterToken,
  onOpenAddModal,
}) => {
  const [activeTab, setActiveTab] = useState<'characters' | 'locations' | 'props'>('characters');
  const [newTokenText, setNewTokenText] = useState<{ [key: string]: string }>({});

  const handleAddTokenSubmit = (charId: string, e: React.FormEvent) => {
    e.preventDefault();
    const token = newTokenText[charId]?.trim();
    if (!token) return;
    onAddCharacterToken(charId, token);
    setNewTokenText((prev) => ({ ...prev, [charId]: '' }));
  };

  return (
    <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-4">
      {/* View Header Tabs */}
      <div className="bg-[#232325] border border-[#2E2E30] p-3 rounded-lg flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('characters')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'characters'
                ? 'bg-[#2A2A2C] text-[#B8945F] border border-[#B8945F]/40 font-semibold'
                : 'text-[#8A8A8E] hover:text-[#EDEAE3]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Character Profiles ({characters.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('locations')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'locations'
                ? 'bg-[#2A2A2C] text-[#B8945F] border border-[#B8945F]/40 font-semibold'
                : 'text-[#8A8A8E] hover:text-[#EDEAE3]'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Locations ({locations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('props')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'props'
                ? 'bg-[#2A2A2C] text-[#B8945F] border border-[#B8945F]/40 font-semibold'
                : 'text-[#8A8A8E] hover:text-[#EDEAE3]'
            }`}
          >
            <Box className="w-4 h-4" />
            <span>Key Props ({propsList.length})</span>
          </button>
        </div>

        {/* Action button */}
        <button
          onClick={() =>
            onOpenAddModal(
              activeTab === 'characters' ? 'character' : activeTab === 'locations' ? 'location' : 'prop'
            )
          }
          className="px-3.5 py-1.5 rounded bg-[#B8945F] text-[#1C1C1E] hover:bg-[#C9A24B] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>
            Add {activeTab === 'characters' ? 'Character' : activeTab === 'locations' ? 'Location' : 'Prop'}
          </span>
        </button>
      </div>

      {/* CHARACTERS TAB */}
      {activeTab === 'characters' && (
        characters.length === 0 ? (
          <div className="bg-[#232325] p-12 rounded-lg border border-dashed border-[#2E2E30] text-center space-y-4 max-w-lg mx-auto my-12">
            <div className="w-12 h-12 rounded bg-[#1C1C1E] border border-[#2E2E30] flex items-center justify-center mx-auto text-[#8A8A8E]">
              <UserPlus className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-[#EDEAE3]">No Characters Registered</h3>
              <p className="text-xs text-[#8A8A8E] max-w-sm mx-auto leading-relaxed">
                Create character profile sheets with reference images and prompt tokens to maintain visual continuity across sequence shots.
              </p>
            </div>
            <button
              onClick={() => onOpenAddModal('character')}
              className="px-4 py-2 rounded bg-[#B8945F] text-[#1C1C1E] hover:bg-[#C9A24B] font-semibold text-xs flex items-center gap-1.5 mx-auto transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add First Character
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {characters.map((char) => {
              const charShotsCount = shots.filter((s) => s.characters.includes(char.id)).length;

              return (
                <div
                  key={char.id}
                  className="bg-[#232325] p-4 rounded-lg space-y-4 border border-[#2E2E30]"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded overflow-hidden border border-[#2E2E30] shrink-0">
                        <img
                          src={char.avatarUrl}
                          alt={char.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-[#EDEAE3]">{char.name}</h3>
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-mono font-medium text-[#EDEAE3]"
                            style={{ backgroundColor: `${char.color}30` }}
                          >
                            {char.colorName || 'Muted Chip'}
                          </span>
                        </div>
                        <p className="text-xs text-[#8A8A8E]">{char.role}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-[#B8945F]">{charShotsCount} Shots</span>
                      <p className="text-[10px] text-[#8A8A8E]">{char.consistencyRate}% Health</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#EDEAE3] leading-relaxed bg-[#1C1C1E] p-3 rounded border border-[#2E2E30]">
                    {char.description}
                  </p>

                  {/* Reference Turnarounds */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono uppercase text-[#8A8A8E]">Reference Images</span>
                    <div className="grid grid-cols-3 gap-2">
                      {char.refImages.map((imgUrl, i) => (
                        <div key={i} className="aspect-square rounded overflow-hidden border border-[#2E2E30] bg-[#1C1C1E]">
                          <img src={imgUrl} alt="Reference" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Prompt Anchors */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono uppercase text-[#B8945F] font-semibold flex items-center gap-1">
                      <Tag className="w-3 h-3" /> Key Prompt Anchor Tokens
                    </span>

                    <div className="flex flex-wrap gap-1.5">
                      {char.keyPromptTokens.map((token, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 rounded bg-[#1C1C1E] border border-[#2E2E30] text-[11px] font-mono text-[#EDEAE3]"
                        >
                          "{token}"
                        </span>
                      ))}
                    </div>

                    {/* Add Anchor Form */}
                    <form onSubmit={(e) => handleAddTokenSubmit(char.id, e)} className="flex gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Add prompt anchor token..."
                        value={newTokenText[char.id] || ''}
                        onChange={(e) => setNewTokenText((prev) => ({ ...prev, [char.id]: e.target.value }))}
                        className="flex-1 bg-[#1C1C1E] border border-[#2E2E30] text-[#EDEAE3] px-3 py-1.5 rounded text-xs font-mono focus:outline-none focus:border-[#B8945F]"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded bg-[#2A2A2C] hover:bg-[#323235] text-[#EDEAE3] border border-[#2E2E30] text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#8A8A8E]" /> Add
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* LOCATIONS TAB */}
      {activeTab === 'locations' && (
        locations.length === 0 ? (
          <div className="bg-[#232325] p-12 rounded-lg border border-dashed border-[#2E2E30] text-center space-y-4 max-w-lg mx-auto my-12">
            <div className="w-12 h-12 rounded bg-[#1C1C1E] border border-[#2E2E30] flex items-center justify-center mx-auto text-[#8A8A8E]">
              <MapPin className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-[#EDEAE3]">No Locations Registered</h3>
              <p className="text-xs text-[#8A8A8E] max-w-sm mx-auto leading-relaxed">
                Add environment locations and lighting notes to ensure scenic consistency across storyboards.
              </p>
            </div>
            <button
              onClick={() => onOpenAddModal('location')}
              className="px-4 py-2 rounded bg-[#B8945F] text-[#1C1C1E] hover:bg-[#C9A24B] font-semibold text-xs flex items-center gap-1.5 mx-auto transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add First Location
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {locations.map((loc) => (
              <div key={loc.id} className="bg-[#232325] p-4 rounded-lg space-y-3 border border-[#2E2E30]">
                <div className="aspect-video w-full rounded overflow-hidden border border-[#2E2E30]">
                  <img src={loc.imageUrl} alt={loc.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>

                <div>
                  <span className="text-[10px] font-mono text-[#8A8A8E] uppercase">{loc.type}</span>
                  <h3 className="text-sm font-bold text-[#EDEAE3]">{loc.name}</h3>
                  <p className="text-xs text-[#8A8A8E] mt-1 leading-relaxed">{loc.description}</p>
                </div>

                <div className="p-2.5 rounded bg-[#1C1C1E] border border-[#2E2E30] space-y-1">
                  <span className="text-[10px] font-mono text-[#8A8A8E] uppercase">Lighting Rules</span>
                  <p className="text-[11px] text-[#EDEAE3]">{loc.lightingNotes}</p>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* PROPS TAB */}
      {activeTab === 'props' && (
        propsList.length === 0 ? (
          <div className="bg-[#232325] p-12 rounded-lg border border-dashed border-[#2E2E30] text-center space-y-4 max-w-lg mx-auto my-12">
            <div className="w-12 h-12 rounded bg-[#1C1C1E] border border-[#2E2E30] flex items-center justify-center mx-auto text-[#8A8A8E]">
              <Box className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-[#EDEAE3]">No Key Props Registered</h3>
              <p className="text-xs text-[#8A8A8E] max-w-sm mx-auto leading-relaxed">
                Track hero items, weapons, tools, or wearables used by characters in scene shots.
              </p>
            </div>
            <button
              onClick={() => onOpenAddModal('prop')}
              className="px-4 py-2 rounded bg-[#B8945F] text-[#1C1C1E] hover:bg-[#C9A24B] font-semibold text-xs flex items-center gap-1.5 mx-auto transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add First Prop
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {propsList.map((prop) => (
              <div key={prop.id} className="bg-[#232325] p-4 rounded-lg space-y-3 border border-[#2E2E30]">
                <div className="aspect-square w-full rounded overflow-hidden border border-[#2E2E30]">
                  <img src={prop.imageUrl} alt={prop.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>

                <div>
                  <span className="text-[10px] font-mono text-[#8A8A8E] uppercase">{prop.category}</span>
                  <h3 className="text-sm font-bold text-[#EDEAE3]">{prop.name}</h3>
                  <p className="text-xs text-[#8A8A8E] mt-1 leading-relaxed">{prop.description}</p>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};
