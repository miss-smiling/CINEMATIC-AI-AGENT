import React, { useState } from 'react';
import { Character, LocationAsset, PropAsset } from '../types';
import {
  Users,
  MapPin,
  Box,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  FilterX,
  Plus,
  UserPlus,
} from 'lucide-react';

interface SidebarProps {
  characters: Character[];
  locations: LocationAsset[];
  propsList: PropAsset[];
  hoveredCharacterId: string | null;
  onHoverCharacter: (id: string | null) => void;
  selectedCharacterFilter: string | null;
  onSelectCharacterFilter: (id: string | null) => void;
  selectedLocationFilter: string | null;
  onSelectLocationFilter: (id: string | null) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenAddModal: (type: 'character' | 'location' | 'prop') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  characters,
  locations,
  propsList,
  hoveredCharacterId,
  onHoverCharacter,
  selectedCharacterFilter,
  onSelectCharacterFilter,
  selectedLocationFilter,
  onSelectLocationFilter,
  collapsed,
  onToggleCollapse,
  onOpenAddModal,
}) => {
  const [openSections, setOpenSections] = useState({
    characters: true,
    locations: true,
    props: true,
  });

  const toggleSection = (section: 'characters' | 'locations' | 'props') => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const hasActiveFilters = selectedCharacterFilter !== null || selectedLocationFilter !== null;

  return (
    <aside
      className={`bg-[#232325] border-r border-[#2E2E30] flex flex-col transition-all duration-200 ease-in-out z-20 shrink-0 ${
        collapsed ? 'w-16' : 'w-72'
      }`}
    >
      {/* Sidebar Header */}
      <div className="p-3.5 border-b border-[#2E2E30] flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase font-semibold text-[#8A8A8E] tracking-wider">
              Asset References
            </span>
            {hasActiveFilters && (
              <button
                onClick={() => {
                  onSelectCharacterFilter(null);
                  onSelectLocationFilter(null);
                }}
                className="text-[10px] text-[#B8945F] hover:underline flex items-center gap-1 cursor-pointer"
                title="Clear Asset Filters"
              >
                <FilterX className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded text-[#8A8A8E] hover:text-[#EDEAE3] hover:bg-[#2A2A2C] transition-colors mx-auto cursor-pointer"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {/* CHARACTERS SECTION */}
        <div>
          <div className="flex items-center justify-between p-1">
            <button
              onClick={() => toggleSection('characters')}
              className={`flex-1 flex items-center justify-between p-1 rounded text-xs font-medium text-[#EDEAE3] hover:bg-[#2A2A2C] transition-colors cursor-pointer ${
                collapsed ? 'justify-center' : ''
              }`}
              title="Characters"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#8A8A8E]" />
                {!collapsed && <span>Characters ({characters.length})</span>}
              </div>
              {!collapsed && (
                openSections.characters ? <ChevronDown className="w-3.5 h-3.5 text-[#8A8A8E]" /> : <ChevronRight className="w-3.5 h-3.5 text-[#8A8A8E]" />
              )}
            </button>

            {!collapsed && (
              <button
                onClick={() => onOpenAddModal('character')}
                className="p-1 rounded text-[#8A8A8E] hover:text-[#EDEAE3] hover:bg-[#2A2A2C] transition-colors cursor-pointer"
                title="Add Character"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {(openSections.characters || collapsed) && (
            <div className="mt-1 space-y-1">
              {characters.length === 0 ? (
                !collapsed ? (
                  <div className="p-3 rounded bg-[#1C1C1E] border border-[#2E2E30] text-center space-y-2">
                    <div className="w-8 h-8 rounded bg-[#232325] border border-[#2E2E30] flex items-center justify-center mx-auto text-[#8A8A8E]">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#EDEAE3]">No characters yet</p>
                      <p className="text-[10px] text-[#8A8A8E] mt-0.5">Add reference models for consistency</p>
                    </div>
                    <button
                      onClick={() => onOpenAddModal('character')}
                      className="w-full py-1.5 px-2 rounded bg-[#2A2A2C] hover:bg-[#323235] text-[#EDEAE3] border border-[#2E2E30] text-xs font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-[#8A8A8E]" /> Add Character
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => onOpenAddModal('character')}
                    className="w-full p-2 text-center text-[#8A8A8E] hover:bg-[#2A2A2C] rounded"
                    title="Add Character"
                  >
                    <Plus className="w-4 h-4 mx-auto" />
                  </button>
                )
              ) : (
                characters.map((char) => {
                  const isHovered = hoveredCharacterId === char.id;
                  const isFiltered = selectedCharacterFilter === char.id;

                  return (
                    <div
                      key={char.id}
                      onMouseEnter={() => onHoverCharacter(char.id)}
                      onMouseLeave={() => onHoverCharacter(null)}
                      onClick={() => onSelectCharacterFilter(isFiltered ? null : char.id)}
                      className={`group relative flex items-center gap-2.5 p-1.5 rounded transition-colors cursor-pointer ${
                        isFiltered
                          ? 'bg-[#2A2A2C] border border-[#B8945F]'
                          : isHovered
                          ? 'bg-[#2A2A2C] border border-[#2E2E30]'
                          : 'hover:bg-[#2A2A2C] border border-transparent'
                      } ${collapsed ? 'justify-center' : ''}`}
                      title={`${char.name} (${char.role}) - Hover to highlight matching shots`}
                    >
                      <div className="relative w-8 h-8 rounded overflow-hidden shrink-0 border border-[#2E2E30]">
                        <img
                          src={char.avatarUrl}
                          alt={char.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span
                          className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-[#1C1C1E]"
                          style={{ backgroundColor: char.color }}
                        />
                      </div>

                      {!collapsed && (
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-medium text-[#EDEAE3] truncate group-hover:text-[#B8945F] transition-colors">
                              {char.name}
                            </span>
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: char.color }}
                              title={`Color tag: ${char.colorName || 'Muted Tag'}`}
                            />
                          </div>
                          <p className="text-[10px] text-[#8A8A8E] truncate">{char.role}</p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* LOCATIONS SECTION */}
        <div className="pt-2 border-t border-[#2E2E30]">
          <div className="flex items-center justify-between p-1">
            <button
              onClick={() => toggleSection('locations')}
              className={`flex-1 flex items-center justify-between p-1 rounded text-xs font-medium text-[#EDEAE3] hover:bg-[#2A2A2C] transition-colors cursor-pointer ${
                collapsed ? 'justify-center' : ''
              }`}
              title="Locations"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#8A8A8E]" />
                {!collapsed && <span>Locations ({locations.length})</span>}
              </div>
              {!collapsed && (
                openSections.locations ? <ChevronDown className="w-3.5 h-3.5 text-[#8A8A8E]" /> : <ChevronRight className="w-3.5 h-3.5 text-[#8A8A8E]" />
              )}
            </button>

            {!collapsed && (
              <button
                onClick={() => onOpenAddModal('location')}
                className="p-1 rounded text-[#8A8A8E] hover:text-[#EDEAE3] hover:bg-[#2A2A2C] transition-colors cursor-pointer"
                title="Add Location"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {(openSections.locations || collapsed) && (
            <div className="mt-1 space-y-1">
              {locations.length === 0 ? (
                !collapsed ? (
                  <div className="p-3 rounded bg-[#1C1C1E] border border-[#2E2E30] text-center space-y-2">
                    <div className="w-8 h-8 rounded bg-[#232325] border border-[#2E2E30] flex items-center justify-center mx-auto text-[#8A8A8E]">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#EDEAE3]">No locations yet</p>
                      <p className="text-[10px] text-[#8A8A8E] mt-0.5">Define background environments</p>
                    </div>
                    <button
                      onClick={() => onOpenAddModal('location')}
                      className="w-full py-1.5 px-2 rounded bg-[#2A2A2C] hover:bg-[#323235] text-[#EDEAE3] border border-[#2E2E30] text-xs font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-[#8A8A8E]" /> Add Location
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => onOpenAddModal('location')}
                    className="w-full p-2 text-center text-[#8A8A8E] hover:bg-[#2A2A2C] rounded"
                    title="Add Location"
                  >
                    <Plus className="w-4 h-4 mx-auto" />
                  </button>
                )
              ) : (
                locations.map((loc) => {
                  const isFiltered = selectedLocationFilter === loc.id;

                  return (
                    <div
                      key={loc.id}
                      onClick={() => onSelectLocationFilter(isFiltered ? null : loc.id)}
                      className={`group relative flex items-center gap-2.5 p-1.5 rounded transition-colors cursor-pointer ${
                        isFiltered
                          ? 'bg-[#2A2A2C] border border-[#B8945F]'
                          : 'hover:bg-[#2A2A2C] border border-transparent'
                      } ${collapsed ? 'justify-center' : ''}`}
                      title={loc.name}
                    >
                      <div className="w-8 h-8 rounded overflow-hidden shrink-0 border border-[#2E2E30]">
                        <img
                          src={loc.imageUrl}
                          alt={loc.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {!collapsed && (
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-[#EDEAE3] truncate group-hover:text-[#B8945F] transition-colors">
                            {loc.name}
                          </p>
                          <p className="text-[10px] text-[#8A8A8E] truncate">{loc.type}</p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* PROPS SECTION */}
        <div className="pt-2 border-t border-[#2E2E30]">
          <div className="flex items-center justify-between p-1">
            <button
              onClick={() => toggleSection('props')}
              className={`flex-1 flex items-center justify-between p-1 rounded text-xs font-medium text-[#EDEAE3] hover:bg-[#2A2A2C] transition-colors cursor-pointer ${
                collapsed ? 'justify-center' : ''
              }`}
              title="Props"
            >
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-[#8A8A8E]" />
                {!collapsed && <span>Key Props ({propsList.length})</span>}
              </div>
              {!collapsed && (
                openSections.props ? <ChevronDown className="w-3.5 h-3.5 text-[#8A8A8E]" /> : <ChevronRight className="w-3.5 h-3.5 text-[#8A8A8E]" />
              )}
            </button>

            {!collapsed && (
              <button
                onClick={() => onOpenAddModal('prop')}
                className="p-1 rounded text-[#8A8A8E] hover:text-[#EDEAE3] hover:bg-[#2A2A2C] transition-colors cursor-pointer"
                title="Add Prop"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {(openSections.props || collapsed) && (
            <div className="mt-1 space-y-1">
              {propsList.length === 0 ? (
                !collapsed ? (
                  <div className="p-3 rounded bg-[#1C1C1E] border border-[#2E2E30] text-center space-y-2">
                    <div className="w-8 h-8 rounded bg-[#232325] border border-[#2E2E30] flex items-center justify-center mx-auto text-[#8A8A8E]">
                      <Box className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#EDEAE3]">No props yet</p>
                      <p className="text-[10px] text-[#8A8A8E] mt-0.5">Track key hero items</p>
                    </div>
                    <button
                      onClick={() => onOpenAddModal('prop')}
                      className="w-full py-1.5 px-2 rounded bg-[#2A2A2C] hover:bg-[#323235] text-[#EDEAE3] border border-[#2E2E30] text-xs font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-[#8A8A8E]" /> Add Prop
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => onOpenAddModal('prop')}
                    className="w-full p-2 text-center text-[#8A8A8E] hover:bg-[#2A2A2C] rounded"
                    title="Add Prop"
                  >
                    <Plus className="w-4 h-4 mx-auto" />
                  </button>
                )
              ) : (
                propsList.map((prop) => (
                  <div
                    key={prop.id}
                    className={`group relative flex items-center gap-2.5 p-1.5 rounded hover:bg-[#2A2A2C] transition-colors ${
                      collapsed ? 'justify-center' : ''
                    }`}
                    title={`${prop.name} (${prop.category})`}
                  >
                    <div className="w-8 h-8 rounded overflow-hidden shrink-0 border border-[#2E2E30]">
                      <img
                        src={prop.imageUrl}
                        alt={prop.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {!collapsed && (
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[#EDEAE3] truncate group-hover:text-[#B8945F] transition-colors">
                          {prop.name}
                        </p>
                        <p className="text-[10px] text-[#8A8A8E] truncate">{prop.category}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Footer */}
      {!collapsed && (
        <div className="p-3 border-t border-[#2E2E30] bg-[#1C1C1E] text-[11px] text-[#8A8A8E]">
          <span>Select an asset to filter sequence shots.</span>
        </div>
      )}
    </aside>
  );
};
