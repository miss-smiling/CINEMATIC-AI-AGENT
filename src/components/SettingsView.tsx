import React, { useState } from 'react';
import { Sliders, Cpu, Save, Download, Check, ShieldCheck } from 'lucide-react';

interface SettingsViewProps {
  onExportReport: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onExportReport }) => {
  const [weights, setWeights] = useState({
    facialFeatures: 25,
    hairStyle: 20,
    costume: 25,
    colorPaletteAndLighting: 15,
    propsAndAccessories: 15,
  });

  const [saved, setSaved] = useState(false);
  const [modelPreset, setModelPreset] = useState('Flux 1.1 Pro');
  const [autoInjectAnchors, setAutoInjectAnchors] = useState(true);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-4 max-w-4xl mx-auto w-full">
      {/* Title */}
      <div className="bg-[#232325] p-4 rounded-lg flex items-center justify-between border border-[#2E2E30]">
        <div>
          <h2 className="text-base font-bold text-[#EDEAE3] flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#B8945F]" /> Continuity Engine Settings
          </h2>
          <p className="text-xs text-[#8A8A8E]">Configure weighting algorithms, AI generator presets, and anchor rules.</p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded bg-[#B8945F] text-[#1C1C1E] font-semibold text-xs flex items-center gap-1.5 hover:bg-[#C9A24B] transition-colors cursor-pointer"
        >
          {saved ? <Check className="w-4 h-4 text-[#1C1C1E]" /> : <Save className="w-4 h-4 text-[#1C1C1E]" />}
          <span>{saved ? 'Saved' : 'Save Config'}</span>
        </button>
      </div>

      {/* Model Generator Settings */}
      <div className="bg-[#232325] p-4 rounded-lg space-y-4 border border-[#2E2E30]">
        <h3 className="text-sm font-semibold text-[#EDEAE3] flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#7A9E8C]" /> Default AI Model & Generation Engine
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-mono text-[#8A8A8E] block mb-1.5">Primary Storyboard Generator</label>
            <select
              value={modelPreset}
              onChange={(e) => setModelPreset(e.target.value)}
              className="w-full bg-[#1C1C1E] border border-[#2E2E30] text-[#EDEAE3] px-3 py-2 rounded text-xs font-mono focus:outline-none focus:border-[#B8945F]"
            >
              <option value="Flux 1.1 Pro">Flux 1.1 Pro (Recommended for Photorealism)</option>
              <option value="Midjourney v6.1">Midjourney v6.1 (Cinematic Style)</option>
              <option value="Runway Gen-3 Alpha">Runway Gen-3 Alpha (Video Keyframe)</option>
              <option value="Sora Keyframe Pro">Sora Keyframe Pro</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3 rounded bg-[#1C1C1E] border border-[#2E2E30]">
            <div>
              <span className="text-xs font-semibold text-[#EDEAE3] block">Auto-Inject Character Anchors</span>
              <span className="text-[11px] text-[#8A8A8E]">Append character prompt tokens automatically</span>
            </div>
            <input
              type="checkbox"
              checked={autoInjectAnchors}
              onChange={(e) => setAutoInjectAnchors(e.target.checked)}
              className="w-4 h-4 accent-[#B8945F] rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Audit Weight Factors */}
      <div className="bg-[#232325] p-4 rounded-lg space-y-4 border border-[#2E2E30]">
        <h3 className="text-sm font-semibold text-[#EDEAE3] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#B8945F]" /> Audit Score Weight Distribution
        </h3>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-[#EDEAE3]">Facial Features & Geometry</span>
              <span className="text-[#B8945F] font-bold">{weights.facialFeatures}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              value={weights.facialFeatures}
              onChange={(e) => setWeights({ ...weights, facialFeatures: Number(e.target.value) })}
              className="w-full accent-[#B8945F] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-[#EDEAE3]">Costume & Wardrobe Seams</span>
              <span className="text-[#B8945F] font-bold">{weights.costume}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              value={weights.costume}
              onChange={(e) => setWeights({ ...weights, costume: Number(e.target.value) })}
              className="w-full accent-[#B8945F] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-[#EDEAE3]">Hair Style & Cut</span>
              <span className="text-[#B8945F] font-bold">{weights.hairStyle}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              value={weights.hairStyle}
              onChange={(e) => setWeights({ ...weights, hairStyle: Number(e.target.value) })}
              className="w-full accent-[#B8945F] cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Export Report Actions */}
      <div className="bg-[#232325] p-4 rounded-lg flex items-center justify-between border border-[#2E2E30]">
        <div>
          <h3 className="text-sm font-semibold text-[#EDEAE3]">Full Sequence Continuity Report Export</h3>
          <p className="text-xs text-[#8A8A8E]">Download formatted JSON audit breakdown with flagged shots.</p>
        </div>

        <button
          onClick={onExportReport}
          className="px-4 py-2 rounded bg-[#2A2A2C] hover:bg-[#323235] text-[#7A9E8C] border border-[#7A9E8C]/50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export JSON Audit</span>
        </button>
      </div>
    </div>
  );
};
