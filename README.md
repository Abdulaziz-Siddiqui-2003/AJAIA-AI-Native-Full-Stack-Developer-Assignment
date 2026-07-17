# AjaiaDocs - Collaborative Editor

A lightweight, full-stack collaborative document editor built for the Ajaia engineering assignment.

## Features
- Rich text editing (TipTap) with debounced auto-save.
- File Upload: Converts `.txt` files into editable documents.
- Mock Authentication: Switch between seeded users via the top navigation.
- Sharing permissions: Differentiates between owned and shared documents.

## Tech Stack
- Frontend: Next.js (App Router), Tailwind CSS v4
- Backend: Node.js, Express, Multer
- Database: MongoDB Atlas (Mongoose)

## Local Setup Instructions
1. Clone the repository.
2. Setup the Backend:
   - `cd backend`
   - `npm install`
   - Create a `.env` file with your `MONGODB_URI` and `PORT=5000`
   - `npm run dev` (This will automatically seed the test users)
3. Setup the Frontend:
   - Open a new terminal
   - `cd frontend`
   - `npm install`
   - `npm run dev`
4. Open `http://localhost:3000` in your browser.