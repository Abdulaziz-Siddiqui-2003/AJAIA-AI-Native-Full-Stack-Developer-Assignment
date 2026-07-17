# Architecture & AI Workflow Note

## Architecture & Prioritization
Due to the strict 4-6 hour timebox, I ruthlessly prioritized core functionality over enterprise-grade complexity:
* **Storage:** I chose MongoDB for its flexible schema, allowing me to easily store HTML strings and user references without complex migrations.
* **Authentication:** Implementing a full JWT/OAuth flow would consume too much time. I utilized a mock-auth pattern via `localStorage` and custom HTTP headers to satisfy the sharing constraints while maintaining scope.
* **Real-time vs Auto-save:** CRDTs (like Yjs) or WebSockets are ideal for real-time multiplayer editing, but they introduce massive synchronization complexity. I prioritized a highly stable single-player experience with a 1-second debounced REST API auto-save to ensure data persistence.

## AI-Native Workflow
I utilized AI (Gemini) as an accelerator for boilerplate generation and scaffolding, specifically for:
* Generating the Mongoose schema structures.
* Scaffolding the initial Tailwind CSS grid layouts for the dashboard.
* Configuring the `multer` middleware for buffer processing.

**Rejections & Corrections:**
* The AI initially suggested a complex global state management setup (Redux). I rejected this, as standard React context/state and Next.js routers were much leaner for this scope.
* The AI attempted to import Tailwind using v3 syntax, which caused a Turbopack crash. I manually debugged and updated the configuration to the modern Tailwind v4 standard.

**Verification:**
I manually verified all edge cases around the mock authentication (ensuring User B cannot edit User A's unshared document) and utilized automated Jest testing to verify the backend API authorization boundary logic.