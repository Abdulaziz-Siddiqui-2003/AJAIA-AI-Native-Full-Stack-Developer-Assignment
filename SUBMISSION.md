# AjaiaDocs - Submission Deliverables

## Live Application Links
* **Frontend Application (Vercel):** [Insert your Vercel URL here]
* **Backend API (Render):** [Insert your Render URL here]
* **Walkthrough Video:** [Insert your unlisted YouTube/Loom URL here]

## Testing Instructions
* **No passwords required.** 
* To test the application and the sharing permissions, use the **"Active User" dropdown** in the top-right corner of the global header. This acts as a mock-login.
* You can switch between seeded users (e.g., Alice, Bob, Charlie) instantly. Try creating a document as Alice, sharing it with Bob, and then switching to Bob's profile to view the shared document on the dashboard.

## What is Working End-to-End
* **Rich Text Editing:** Full document creation and formatting via TipTap.
* **Data Persistence:** A 1-second debounced auto-save synchronizes editor changes to the MongoDB backend without blocking the UI.
* **File Ingestion:** Uploading a `.txt` file securely parses the buffer and converts it into a new, editable HTML document in the workspace.
* **Access Control:** Clear separation of Document Owners vs. Shared Users, complete with UI badging and backend endpoint protection.

## What is Incomplete / Intentionally Deprioritized
* **Real-Time Multiplayer Cursors:** Implementing a true CRDT (Conflict-free Replicated Data Type) engine or OT (Operational Transformation) system takes significant time. I prioritized a highly stable single-player experience with robust database persistence over a buggy multiplayer attempt.
* **Production Authentication:** Full JWT/OAuth was bypassed in favor of a simulated header-based auth flow to strictly focus on the document and sharing features.
* **Folder Structures:** All documents are managed in a flat, single-level dashboard view.

## Next Steps (With an additional 2-4 hours)
1. **WebSocket Integration:** Swap the REST-based debounced auto-save for a Socket.io connection to support real-time document broadcasts to shared users.
2. **PDF Export:** Utilize a library like `html2pdf` or `puppeteer` to allow users to export their workspace files directly from the editor toolbar.
3. **Resilient Error Handling:** Implement global Next.js Error Boundaries and toast notifications to gracefully handle network timeouts or backend cold-starts.