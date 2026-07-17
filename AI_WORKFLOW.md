# AI-Native Workflow Note

## AI Tools Utilized
* **Primary Assistant:** Gemini (for rapid scaffolding, architecture validation, and troubleshooting).

## Where AI Materially Accelerated Delivery
Given the strict 4-6 hour timebox, AI was utilized strictly as an execution accelerator, not an architectural substitute. It significantly sped up:
* **Boilerplate Generation:** Scaffolding the initial Node.js/Express server structure and Mongoose schemas (User and Document models).
* **UI Scaffolding:** Generating the baseline Tailwind CSS responsive grids for the dashboard and the modal UI components, allowing me to focus on the JavaScript state logic rather than CSS pixel-pushing.
* **Middleware Configuration:** Rapidly configuring the `multer` memory storage setup for the `.txt` file upload and buffer processing pipeline.

## AI Output Rejected or Modified
Maintaining engineering standards required actively overriding the AI in several areas:
* **Scope Creep (Authentication):** The AI initially suggested a full JWT-based authentication flow with hashed passwords. I explicitly rejected this to respect the timebox, replacing it with a custom `localStorage` and HTTP-header mock-auth flow to demonstrate backend permission logic without the overhead.
* **Dependency Conflicts:** The AI attempted to import Tailwind using deprecated v3 directives (`@tailwind base;`), which caused a Turbopack compilation crash in Next.js. I had to manually debug the stack trace and implement the modern Tailwind v4 `@import "tailwindcss";` standard.
* **State Management:** I rejected the AI's suggestion to use complex global state management (like Redux), keeping the React components lean using native `useState` and `useEffect` hooks paired with Axios interceptors.

## Verification & Quality Assurance
To ensure I wasn't blindly accepting generated code, I verified the implementation through:
1. **Security & Boundary Testing:** Manually testing the edge cases of the sharing model (e.g., attempting to access a document as User B that was only owned by User A, ensuring the backend returned a `403 Forbidden`).
2. **Automated Testing:** Writing and executing a Jest/Supertest suite to validate the Express API authorization logic.
3. **UX Validation:** Testing the TipTap editor canvas to ensure the HTML serialization accurately preserved rich-text formatting (bold, italic, lists) across page reloads and database calls.