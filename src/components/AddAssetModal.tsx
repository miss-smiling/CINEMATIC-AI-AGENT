import React, { useState } from 'react';
import { Character, LocationAsset, PropAsset } from '../types';
import { X, UserPlus, MapPin, Box, Upload } from 'lucide-react';

interface AddAssetModalProps {
  isOpen: boolean;
  initialType?: 'character' | 'location' | 'prop';
  onClose: () => void;
  onAddCharacter: (character: Character) => void;
  onAddLocation: (location: LocationAsset) => void;
  onAddProp: (prop: PropAsset) => void;
}

const COLOR_PRESETS = [
  { hex: '#B57878', name: 'Muted Rose' },
  { hex: '#B8945F', name: 'Muted Bronze' },
  { hex: '#7A9E8C', name: 'Muted Sage' },
  { hex: '#6B8BB8', name: 'Muted Steel' },
  { hex: '#957AB8', name: 'Muted Violet' },
];

const DEFAULT_PLACEHOLDER = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="100%" height="100%" fill="%231C1C1E"/><g fill="none" stroke="%232E2E30" stroke-width="2"><path d="M0 0l800 600M800 0l-800 600"/><circle cx="400" cy="300" r="120" stroke="%23B8945F" stroke-dasharray="8,8"/></g><text x="50%" y="50%" fill="%238A8A8E" font-family="sans-serif" font-size="20" text-anchor="middle" dominant-baseline="middle">NO REFERENCE ATTACHED</text></svg>`;

export const AddAssetModal: React.FC<AddAssetModalProps> = ({
  isOpen,
  initialType = 'character',
  onClose,
  onAddCharacter,
  onAddLocation,
  onAddProp,
}) => {
  const [assetType, setAssetType] = useState<'character' | 'location' | 'prop'>(initialType);
  const [name, setName] = useState('');
  const [subType, setSubType] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_PRESETS[0].hex);
  const [selectedColorName, setSelectedColorName] = useState(COLOR_PRESETS[0].name);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImagePreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const img = imagePreview || DEFAULT_PLACEHOLDER;

    if (assetType === 'character') {
      const newChar: Character = {
        id: `char-${Date.now()}`,
        name: name.trim(),
        role: subType.trim() || 'Lead Character',
        color: selectedColor,
        colorName: selectedColorName,
        avatarUrl: img,
        refImages: [img],
        description: description.trim() || 'Character model reference asset.',
        keyPromptTokens: [],
        consistencyRate: 100,
      };
      onAddCharacter(newChar);
    } else if (assetType === 'location') {
      const newLoc: LocationAsset = {
        id: `loc-${Date.now()}`,
        name: name.trim(),
        type: subType.trim() || 'Environment',
        imageUrl: img,
        description: description.trim() || 'Location environment reference asset.',
        lightingNotes: 'Standard lighting reference.',
        keyPromptTokens: [],
      };
      onAddLocation(newLoc);
    } else {
      const newProp: PropAsset = {
        id: `prop-${Date.now()}`,
        name: name.trim(),
        category: subType.trim() || 'Key Prop',
        imageUrl: img,
        description: description.trim() || 'Key prop reference asset.',
      };
      onAddProp(newProp);
    }

    setName('');
    setSubType('');
    setDescription('');
    setImagePreview(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1C1E]/80 animate-fade-in">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg bg-[#232325] border border-[#2E2E30] rounded-lg overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#2E2E30] flex items-center justify-between bg-[#1C1C1E]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-[#2A2A2C] border border-[#2E2E30] text-[#B8945F]">
              {assetType === 'character' ? (
                <UserPlus className="w-5 h-5" />
              ) : assetType === 'location' ? (
                <MapPin className="w-5 h-5" />
              ) : (
                <Box className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#EDEAE3]">
                Add {assetType === 'character' ? 'Character' : assetType === 'location' ? 'Location' : 'Prop'} Asset
              </h2>
              <p className="text-[11px] text-[#8A8A8E]">
                Register a new reference model
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-[#8A8A8E] hover:text-[#EDEAE3] hover:bg-[#2A2A2C] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Asset Type Selector Tabs */}
        <div className="px-4 pt-3 flex gap-2 border-b border-[#2E2E30] bg-[#1C1C1E]">
          <button
            type="button"
            onClick={() => setAssetType('character')}
            className={`px-3 py-1.5 rounded-t text-xs font-medium flex items-center gap-1.5 transition-colors border-t border-x ${
              assetType === 'character'
                ? 'bg-[#232325] text-[#B8945F] border-[#2E2E30]'
                : 'text-[#8A8A8E] border-transparent hover:text-[#EDEAE3]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" /> Character
          </button>
          <button
            type="button"
            onClick={() => setAssetType('location')}
            className={`px-3 py-1.5 rounded-t text-xs font-medium flex items-center gap-1.5 transition-colors border-t border-x ${
              assetType === 'location'
                ? 'bg-[#232325] text-[#B8945F] border-[#2E2E30]'
                : 'text-[#8A8A8E] border-transparent hover:text-[#EDEAE3]'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" /> Location
          </button>
          <button
            type="button"
            onClick={() => setAssetType('prop')}
            className={`px-3 py-1.5 rounded-t text-xs font-medium flex items-center gap-1.5 transition-colors border-t border-x ${
              assetType === 'prop'
                ? 'bg-[#232325] text-[#B8945F] border-[#2E2E30]'
                : 'text-[#8A8A8E] border-transparent hover:text-[#EDEAE3]'
            }`}
          >
            <Box className="w-3.5 h-3.5" /> Prop
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3 overflow-y-auto flex-1">
          {/* Name Field */}
          <div className="space-y-1">
            <label className="text-xs font-mono uppercase text-[#8A8A8E] font-semibold flex items-center justify-between">
              <span>
                {assetType === 'character'
                  ? 'Character Name'
                  : assetType === 'location'
                  ? 'Location Title'
                  : 'Prop Name'}{' '}
                <span className="text-[#C9756B]">*</span>
              </span>
            </label>
            <input
              type="text"
              required
              placeholder={
                assetType === 'character'
                  ? 'e.g. Elena Vance'
                  : assetType === 'location'
                  ? 'e.g. Command Bridge'
                  : 'e.g. Holo Communicator'
              }
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#1C1C1E] border border-[#2E2E30] text-[#EDEAE3] px-3 py-2 rounded text-xs font-mono placeholder-[#8A8A8E] focus:outline-none focus:border-[#B8945F]"
            />
          </div>

          {/* SubType Field */}
          <div className="space-y-1">
            <label className="text-xs font-mono uppercase text-[#8A8A8E] font-semibold">
              {assetType === 'character'
                ? 'Role / Designation'
                : assetType === 'location'
                ? 'Location Type'
                : 'Prop Category'}
            </label>
            <input
              type="text"
              placeholder={
                assetType === 'character'
                  ? 'e.g. Lead Protagonist, Pilot, Specialist'
                  : assetType === 'location'
                  ? 'e.g. Interior / Sci-Fi Bridge, Exterior / Wasteland'
                  : 'e.g. Gear, Artifact, Weapon, Tool'
              }
              value={subType}
              onChange={(e) => setSubType(e.target.value)}
              className="w-full bg-[#1C1C1E] border border-[#2E2E30] text-[#EDEAE3] px-3 py-2 rounded text-xs font-mono placeholder-[#8A8A8E] focus:outline-none focus:border-[#B8945F]"
            />
          </div>

          {/* Character Identity Color Picker */}
          {assetType === 'character' && (
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-[#8A8A8E] font-semibold flex items-center justify-between">
                <span>Identity Chip Color</span>
                <span className="text-[#B8945F] font-mono text-[11px]">{selectedColorName}</span>
              </label>
              <div className="grid grid-cols-5 gap-2">
                {COLOR_PRESETS.map((preset) => {
                  const isSelected = selectedColor === preset.hex;
                  return (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => {
                        setSelectedColor(preset.hex);
                        setSelectedColorName(preset.name);
                      }}
                      className={`flex items-center gap-1.5 p-1.5 rounded border text-[11px] transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-[#B8945F] bg-[#2A2A2C]'
                          : 'border-[#2E2E30] bg-[#1C1C1E] hover:border-[#8A8A8E]'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: preset.hex }}
                      />
                      <span className="truncate text-[#EDEAE3] text-[10px]">{preset.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Short Description */}
          <div className="space-y-1">
            <label className="text-xs font-mono uppercase text-[#8A8A8E] font-semibold">
              Description / Visual Details
            </label>
            <textarea
              rows={3}
              placeholder="Describe wardrobe, lighting features, facial traits, materials, or environment elements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#1C1C1E] border border-[#2E2E30] text-[#EDEAE3] p-2.5 rounded text-xs placeholder-[#8A8A8E] focus:outline-none focus:border-[#B8945F] resize-none"
            />
          </div>

          {/* Image Upload Area */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase text-[#8A8A8E] font-semibold flex items-center justify-between">
              <span>Reference Image Upload</span>
              <span className="text-[#8A8A8E] text-[10px]">Optional preview file</span>
            </label>

            <div className="border border-dashed border-[#2E2E30] hover:border-[#B8945F] rounded p-4 text-center transition-colors bg-[#1C1C1E] relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              />

              {imagePreview ? (
                <div className="relative aspect-video max-h-36 mx-auto rounded overflow-hidden border border-[#2E2E30] group">
                  <img
                    src={imagePreview}
                    alt="Uploaded Reference"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs text-[#EDEAE3]">
                    Click to replace image
                  </div>
                </div>
              ) : (
                <div className="space-y-2 py-2">
                  <div className="w-8 h-8 rounded bg-[#2A2A2C] border border-[#2E2E30] flex items-center justify-center mx-auto text-[#8A8A8E]">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-[#EDEAE3] font-medium">
                      Click or drag reference image here
                    </p>
                    <p className="text-[10px] text-[#8A8A8E] mt-0.5">
                      JPG, PNG, WebP up to 10MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex justify-end gap-2 border-t border-[#2E2E30]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded border border-[#2E2E30] text-xs font-medium text-[#8A8A8E] hover:text-[#EDEAE3] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-1.5 rounded bg-[#B8945F] text-[#1C1C1E] font-semibold text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Add {assetType === 'character' ? 'Character' : assetType === 'location' ? 'Location' : 'Prop'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
