# ReviseCast

> Audio-first revision platform for competitive exam aspirants.
> Spotify + educational revision + exam preparation.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native + Expo + TypeScript |
| Backend | Node.js + Express.js + TypeScript |
| Database | MongoDB + Mongoose |
| Auth | JWT (access + refresh tokens) + bcrypt |
| State | Zustand (mobile) |
| Audio | expo-av |
| Storage | Local filesystem (dev) / S3 (prod) |

## Project Structure

`
revisecast/
├── apps/
│   ├── backend/         # Express.js REST API
│   │   ├── src/
│   │   │   ├── models/      # MongoDB models
│   │   │   ├── routes/      # API routes
│   │   │   ├── middleware/  # Auth, authorization
│   │   │   ├── services/    # StorageService, AI stubs
│   │   │   └── scripts/     # Seed script
│   │   └── uploads/         # Local file storage
│   └── mobile/          # Expo React Native app
│       ├── src/
│       │   ├── api/         # API client + modules
│       │   ├── components/  # EpisodeCard, MiniPlayer, etc.
│       │   ├── navigation/  # Root, Tab, Auth navigators
│       │   ├── screens/     # student/, creator/, admin/
│       │   ├── stores/      # Zustand (auth, player)
│       │   ├── theme/       # Colors, typography, spacing
│       │   └── utils/       # Formatters, helpers
│       └── App.tsx
└── packages/
    └── shared-types/    # Shared TypeScript interfaces
`

## Quick Start

### Prerequisites

- Node.js >= 18
- MongoDB running locally (mongod)
- Expo Go app on your phone (optional, for device testing)

### 1. Install dependencies

`ash
# In the root directory
npm install
cd apps/backend && npm install
cd ../mobile && npm install
`

### 2. Start MongoDB

`ash
mongod
`

### 3. Seed the database

`ash
cd apps/backend
npm run seed
`

This creates:
- 4 exams (GATE CS, UPSC, SSC CGL, CAT)
- 9 GATE CS subjects with 20+ topics
- ~15 sample episodes
- Demo accounts (see below)

### 4. Start the backend

`ash
cd apps/backend
npm run dev
# → http://localhost:4000
`

### 5. Start the mobile app

`ash
cd apps/mobile
npx expo start
# → Press 'w' for web browser (no Android Studio required!)
# → Scan QR with Expo Go app for mobile
`cool work

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Student | rahul@revisecast.com | student123 |
| Creator | arjun@revisecast.com | creator123 |
| Admin | admin@revisecast.com | admin123 |

## API Reference

### Auth
- POST /api/auth/register — Register
- POST /api/auth/login — Login
- POST /api/auth/refresh — Refresh token
- GET /api/auth/me — Current user

### Content
- GET /api/exams — List exams
- GET /api/exams/:id/subjects — Subjects for exam
- GET /api/subjects/:id/topics — Topics for subject
- GET /api/episodes — Browse episodes (search, filter, paginate)
- GET /api/episodes/quick — Short episodes (≤20 min)
- GET /api/episodes/popular — Popular this week
- GET /api/episodes/featured — Featured episodes

### Student
- POST /api/progress/:episodeId — Save progress
- GET /api/progress/in-progress — Continue listening
- POST /api/bookmarks/:episodeId — Bookmark
- DELETE /api/bookmarks/:episodeId — Remove bookmark

### Creator
- POST /api/creator/episodes — Upload episode (multipart)
- GET /api/creator/episodes — My episodes
- GET /api/creator/analytics — Basic analytics

### Admin
- GET /api/admin/stats — Dashboard stats
- GET /api/admin/pending — Pending episodes
- PATCH /api/admin/episodes/:id/approve — Approve
- PATCH /api/admin/episodes/:id/reject — Reject

## Environment Variables

### Backend (pps/backend/.env)
`env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/revisecast
JWT_SECRET=your_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
STORAGE_TYPE=local
UPLOADS_DIR=./uploads
BASE_URL=http://localhost:4000
NODE_ENV=development
`

### Mobile (pps/mobile/.env)
`env
EXPO_PUBLIC_API_URL=http://localhost:4000/api
`

> **Note for physical device testing**: Replace localhost with your machine's local IP address (e.g., 192.168.1.x).

## Audio Storage

The backend uses a StorageService abstraction:

`	ypescript
interface StorageService {
  upload(file, folder): Promise<string>  // returns URL
  delete(url): Promise<void>
}
`

- **Dev**: Files saved to ./uploads/audio/ and ./uploads/thumbnails/
- **Prod**: Implement S3StorageService and set STORAGE_TYPE=s3

## Testing the Flows

### Student Flow
1. Register/Login as student
2. Browse Home → see featured, quick, popular episodes
3. Tap episode → Episode Detail screen
4. Tap Play → Full Player opens
5. Play, pause, seek, change speed
6. Close app → reopen → progress is saved, resume works
7. Bookmark episode → appears in Library

### Creator Flow
1. Register/Login as creator
2. Profile → Creator Dashboard
3. Tap Upload → 10-step upload flow
4. Episode submitted with status "pending"

### Admin Flow
1. Login as admin
2. Profile → Admin Dashboard
3. View stats, pending episodes
4. Approve/reject pending submissions

### Premium Flow
1. Browse episodes with "PRO" badge
2. Tap premium episode → see metadata
3. Tap Play → Premium lock screen
4. GET /api/subscriptions/plans shows plan structure

## Phase 2 — AI Audio Generation (Roadmap)

The AI pipeline stubs are in pps/backend/src/services/ai/AIPipeline.ts.

`
PDF/Text/Lecture
      ↓
ContentExtractor     ← PyMuPDF / LangChain
      ↓
ScriptGenerator      ← GPT-4 / Gemini API
      ↓                 (NOT word-for-word — key concepts,
      ↓                  formulas, PYQ insights, memory tricks)
AudioGenerator       ← ElevenLabs / Google TTS
      ↓
Episode (status: pending)
      ↓
Admin review → Publish
`

To implement Phase 2:
1. Install langchain, openai, elevenlabs packages
2. Implement the stub classes in AIPipeline.ts
3. Add a /api/creator/ai-generate route
4. Add file picker to Creator upload flow

## Production Checklist

- [ ] Change JWT secrets
- [ ] Set MONGODB_URI to MongoDB Atlas URI
- [ ] Set STORAGE_TYPE=s3 and configure AWS credentials
- [ ] Enable HTTPS
- [ ] Set up proper CORS origins
- [ ] Configure rate limiting
- [ ] Set up monitoring (e.g., Sentry)
