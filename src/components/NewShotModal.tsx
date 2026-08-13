import React, { useState } from 'react';
import { StoryboardShot, Character, LocationAsset, PropAsset } from '../types';
import { X, Plus } from 'lucide-react';

interface NewShotModalProps {
  characters: Character[];
  locations: LocationAsset[];
  propsList: PropAsset[];
  nextShotNumber: string;
  nextSceneNumber: string;
  onClose: () => void;
  onAddShot: (newShot: StoryboardShot) => void;
}

export const NewShotModal: React.FC<NewShotModalProps> = ({
  characters,
  locations,
  propsList,
  nextShotNumber,
  nextSceneNumber,
  onClose,
  onAddShot,
}) => {
  const [shotNumber, setShotNumber] = useState(nextShotNumber);
  const [sceneNumber, setSceneNumber] = useState(nextSceneNumber);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('blurry, low quality, oversaturated, altered hair color, bad anatomy');
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>(
    characters.length > 0 ? [characters[0].id] : []
  );
  const [selectedLocation, setSelectedLocation] = useState<string>(
    locations.length > 0 ? locations[0].id : ''
  );
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80');

  const handleToggleCharacter = (id: string) => {
    if (selectedCharacters.includes(id)) {
      if (selectedCharacters.length > 1) {
        setSelectedCharacters(selectedCharacters.filter((c) => c !== id));
      }
    } else {
      setSelectedCharacters([...selectedCharacters, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !prompt.trim()) return;

    const newShot: StoryboardShot = {
      id: `shot-${Date.now()}`,
      shotNumber: shotNumber.trim() || nextShotNumber,
      sceneNumber: sceneNumber.trim() || nextSceneNumber,
      title: title.trim(),
      description: description.trim() || 'Custom storyboard shot added by user.',
      imageUrl: imageUrl.trim(),
      characters: selectedCharacters,
      locationId: selectedLocation,
      propIds: [],
      consistencyScore: 92,
      status: 'consistent',
      checklist: {
        facialFeatures: true,
        hairStyle: true,
        costume: true,
        colorPaletteAndLighting: true,
        propsAndAccessories: true,
      },
      checklistFlags: {},
      prompt: prompt.trim(),
      negativePrompt: negativePrompt.trim(),
      seed: Math.floor(Math.random() * 90000000) + 10000000,
      aiModel: 'Flux 1.1 Pro',
      aspectRatio: '16:9',
      cameraSettings: { focalLength: '35mm', angle: 'Eye Level', movement: 'Slow Track In' },
      lightingStyle: 'Cinematic key light matching location profile',
      notes: [],
    };

    onAddShot(newShot);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1C1E]/80 animate-fade-in">
      <div className="bg-[#232325] w-full max-w-xl p-5 rounded-lg border border-[#2E2E30] space-y-4 overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2E2E30]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#1C1C1E] text-[#B8945F] border border-[#2E2E30] flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#EDEAE3]">Add Storyboard Shot</h2>
              <p className="text-xs text-[#8A8A8E]">Add a new keyframe shot to the sequence.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-[#8A8A8E] hover:text-[#EDEAE3] hover:bg-[#2A2A2C] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-[#8A8A8E] block mb-1">Shot # ID</label>
              <input
                type="text"
                value={shotNumber}
                onChange={(e) => setShotNumber(e.target.value)}
                className="w-full bg-[#1C1C1E] border border-[#2E2E30] text-[#EDEAE3] px-3 py-1.5 rounded text-xs font-mono focus:outline-none focus:border-[#B8945F]"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-[#8A8A8E] block mb-1">Scene #</label>
              <input
                type="text"
                value={sceneNumber}
                onChange={(e) => setSceneNumber(e.target.value)}
                className="w-full bg-[#1C1C1E] border border-[#2E2E30] text-[#EDEAE3] px-3 py-1.5 rounded text-xs font-mono focus:outline-none focus:border-[#B8945F]"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-[#8A8A8E] block mb-1">Shot Title</label>
            <input
              type="text"
              placeholder="e.g., Tactical Briefing Reaction"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#1C1C1E] border border-[#2E2E30] text-[#EDEAE3] px-3 py-1.5 rounded text-xs focus:outline-none focus:border-[#B8945F]"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-[#8A8A8E] block mb-1">Action Description</label>
            <textarea
              placeholder="Describe what happens in the frame..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-[#1C1C1E] border border-[#2E2E30] text-[#EDEAE3] p-2.5 rounded text-xs focus:outline-none focus:border-[#B8945F]"
            />
          </div>

          {/* Characters Tagging */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-[#B8945F] block font-semibold">
              Characters Present
            </label>
            {characters.length === 0 ? (
              <p className="text-xs text-[#8A8A8E] italic p-2 rounded bg-[#1C1C1E] border border-dashed border-[#2E2E30]">
                No characters registered yet. Add characters in Asset Library to tag them here.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {characters.map((char) => {
                  const isSelected = selectedCharacters.includes(char.id);
                  return (
                    <button
                      type="button"
                      key={char.id}
                      onClick={() => handleToggleCharacter(char.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono border transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#2A2A2C] text-[#EDEAE3] border-[#B8945F]'
                          : 'bg-[#1C1C1E] text-[#8A8A8E] border-[#2E2E30] hover:text-[#EDEAE3]'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: char.color || '#B57878' }} />
                      <span>{char.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Location Picker */}
          <div>
            <label className="text-[11px] font-mono text-[#8A8A8E] block font-semibold mb-1">Environment Location</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full bg-[#1C1C1E] border border-[#2E2E30] text-[#EDEAE3] px-3 py-1.5 rounded text-xs font-mono focus:outline-none focus:border-[#B8945F]"
            >
              {locations.length === 0 ? (
                <option value="">No locations registered yet</option>
              ) : (
                locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.type})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Prompt */}
          <div>
            <label className="text-[11px] font-mono text-[#8A8A8E] block mb-1">AI Generation Prompt</label>
            <textarea
              placeholder="Cinematic medium shot of Dr. Elena Vance..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="w-full bg-[#1C1C1E] border border-[#2E2E30] text-[#EDEAE3] p-2.5 rounded text-xs font-mono focus:outline-none focus:border-[#B8945F]"
              required
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="text-[11px] font-mono text-[#8A8A8E] block mb-1">Preview Image URL</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-[#1C1C1E] border border-[#2E2E30] text-[#EDEAE3] px-3 py-1.5 rounded text-xs font-mono focus:outline-none focus:border-[#B8945F]"
              required
            />
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2E2E30]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded text-xs font-medium text-[#8A8A8E] hover:text-[#EDEAE3] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded text-xs font-semibold bg-[#B8945F] text-[#1C1C1E] hover:bg-[#C9A24B] transition-colors cursor-pointer"
            >
              Add Shot to Sequence
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
