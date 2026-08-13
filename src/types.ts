export type ViewMode = 'shots' | 'assets' | 'reports' | 'settings';

export interface Character {
  id: string;
  name: string;
  role: string;
  color: string; // e.g., "#e05638" (Terracotta)
  colorName: string; // e.g. "Terracotta"
  avatarUrl: string;
  refImages: string[];
  description: string;
  keyPromptTokens: string[];
  consistencyRate: number; // e.g., 94
}

export interface LocationAsset {
  id: string;
  name: string;
  type: string; // Interior / Exterior / Sci-Fi / etc.
  imageUrl: string;
  description: string;
  lightingNotes: string;
  keyPromptTokens: string[];
}

export interface PropAsset {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  description: string;
  associatedCharacterId?: string;
}

export type ConsistencyStatus = 'consistent' | 'needs_review' | 'inconsistent';

export interface ChecklistItems {
  facialFeatures: boolean;
  hairStyle: boolean;
  costume: boolean;
  colorPaletteAndLighting: boolean;
  propsAndAccessories: boolean;
}

export interface ShotNote {
  id: string;
  author: string;
  avatar: string;
  role: string;
  text: string;
  timestamp: string;
  resolved?: boolean;
}

export interface StoryboardShot {
  id: string;
  shotNumber: string; // e.g. "S01-01"
  sceneNumber: string; // e.g. "Scene 1"
  title: string;
  description: string;
  imageUrl: string;
  characters: string[]; // Character IDs
  locationId: string; // Location ID
  propIds: string[]; // Prop IDs
  consistencyScore: number; // 0 - 100
  status: ConsistencyStatus;
  checklist: ChecklistItems;
  checklistFlags: {
    facialFeatures?: string;
    hairStyle?: string;
    costume?: string;
    colorPaletteAndLighting?: string;
    propsAndAccessories?: string;
  };
  prompt: string;
  negativePrompt: string;
  seed: number;
  aiModel: string; // e.g. "Flux 1.1 Pro", "Midjourney v6.1", "Runway Gen-3"
  aspectRatio: string;
  cameraSettings: {
    focalLength: string;
    angle: string;
    movement: string;
  };
  lightingStyle: string;
  notes: ShotNote[];
}

export interface FilterOptions {
  searchQuery: string;
  characterId: string | null;
  locationId: string | null;
  status: ConsistencyStatus | 'all';
  sortBy: 'sequence' | 'score_asc' | 'score_desc' | 'flagged_first';
}
