Continuum — Frontend

The interface for reviewing AI-generated storyboard shots and tracking visual consistency of characters, locations, and props across a sequence.

Stack
React + TypeScript
Vite
Tailwind (core utility classes)
Getting Started
bash
cd frontend
npm install
cp .env.example .env   # fill in real values
npm run dev

App runs locally at http://localhost:5173 (or whatever port Vite assigns).

Project Structure
src/
├── components/
│   ├── Navbar.tsx
│   ├── Sidebar.tsx
│   ├── ShotGrid.tsx
│   ├── ShotCard.tsx
│   ├── ShotDetail.tsx
│   ├── AssetsView.tsx
│   ├── AddAsset.tsx
│   ├── ConsistencyChart.tsx  (or similar — check exact names in repo)
│   ├── StatusChip.tsx
│   ├── Waveform.tsx
│   └── Settings.tsx
├── data/
│   └── mockData.ts       — placeholder data only, not real assets
├── App.tsx
├── main.tsx
├── index.css
└── types.ts
Design System

Full token reference lives in /docs/design_tokens.md at the repo root. Quick reference:

Backgrounds

Token	Hex	Use
Base	
#1C1C1E	Main app background
Panel	
#232325	Cards, sidebar
Elevated	
#2A2A2C	Hover state
Border	
#2E2E30	Dividers

Text

Token	Hex	Use
Primary	
#EDEAE3	Main text
Muted	
#8A8A8E	Secondary/labels

Status accents (used only when meaningful, never decoratively)

Status	Hex	Meaning
Active/primary	
#B8945F	Selected nav item, primary action
Consistent	
#7A9E8C	Shot passes consistency check
Flagged	
#C9756B	Inconsistency detected
Needs review	
#C9A24B	Borderline / warning

Rules

No gradients, no glow effects, matte surfaces only
Only one accent color visible in the top nav at a time (the active tab)
Character/location/prop chips get individual muted colors — desaturated tones (terracotta, ochre, dusty rose, sage), never bright/saturated
Data

src/data/mockData.ts holds placeholder shots, characters, locations, and props for local development. Real data will come from the ClickHouse-backed API once the backend is live — swap the mock import for a real fetch when that's ready, keep the same shape/types (types.ts) to avoid breaking components.

Empty States

Character, location, and prop lists should render as genuine empty states (no invented names or placeholder people) until a user actually adds one via the "Add Character / Location / Prop" flow.

Known Issues / To Do
 Confirm scroll lock on the shot detail panel (background should not scroll while panel is open)
 Wire up real image upload for Add Character/Location/Prop forms
 Connect to live ClickHouse-backed API once backend is ready
 Verify component filenames match structure above (some were truncated in earlier file tree view)
Related
Main repo README: /README.md
Design tokens: /docs/design_tokens.md
Data schema: /data/schema.sql
