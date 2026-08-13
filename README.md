CONTINUUM — FRONTEND

The interface for reviewing AI-generated storyboard shots and tracking visual consistency of characters, locations, and props across a sequence.

STACK

Built with React and TypeScript, using Vite as the build tool and Tailwind for styling with core utility classes.

GETTING STARTED

Navigate into the frontend folder, run npm install to install dependencies, copy .env.example to .env and fill in real values, then run npm run dev to start the local development server. The app will run locally, typically at http://localhost:5173 depending on the port Vite assigns.

PROJECT STRUCTURE

The source code lives in the src folder. Inside components, you will find Navbar.tsx, Sidebar.tsx, ShotGrid.tsx, ShotCard.tsx, ShotDetail.tsx, AssetsView.tsx, AddAsset.tsx, the consistency chart component, StatusChip.tsx, Waveform.tsx, and Settings.tsx. The data folder contains mockData.ts, which holds placeholder data only, not real assets. At the top level of src you will also find App.tsx, main.tsx, index.css, and types.ts.

DESIGN SYSTEM

The full token reference lives in docs/design_tokens.md at the repo root. For backgrounds, the base app background is 
#1C1C1E, panel and sidebar backgrounds use 
#232325, hover states use 
#2A2A2C, and borders and dividers use 
#2E2E30. For text, primary text uses 
#EDEAE3 and secondary or muted text uses 
#8A8A8E. Status accent colors are used only when meaningful, never decoratively. The active or primary accent, used for the selected navigation item or primary actions, is 
#B8945F. Consistent status uses 
#7A9E8C. Flagged or inconsistent status uses 
#C9756B. Needs review or warning status uses 
#C9A24B.

There should be no gradients, no glow effects, and only flat matte surfaces throughout the interface. Only one accent color should be visible in the top navigation at any time, reserved for the currently active tab. Character, location, and prop chips should each receive their own individual muted color, using desaturated tones such as terracotta, ochre, dusty rose, or sage, rather than bright or saturated colors.

DATA

The mockData.ts file holds placeholder shots, characters, locations, and props used for local development. Real data will eventually come from the ClickHouse-backed API once the backend is live. When that happens, swap the mock data import for a real fetch call, while keeping the same shape defined in types.ts so existing components do not break.

EMPTY STATES

Character, location, and prop lists should render as genuine empty states, with no invented names or placeholder people, until a user actually adds one through the Add Character, Add Location, or Add Prop flow.

KNOWN ISSUES AND OPEN ITEMS

The scroll behavior of the shot detail panel still needs to be confirmed, so that the background does not scroll while the panel is open. Real image upload for the Add Character, Add Location, and Add Prop forms still needs to be wired up. The frontend still needs to be connected to the live ClickHouse-backed API once the backend is ready. Component filenames should also be double checked against the structure described above, since some names appeared truncated in an earlier file tree view.

RELATED DOCUMENTS

The main repository README is located at the root of the repo. Design tokens are documented in docs/design_tokens.md. The data schema is defined in data/schema.sql.
