# 🕵️‍♂️ AI Mystery Room (Enhanced Noir Edition)

> An advanced, immersive, AI-powered interactive detective investigation web application powered by **Google Gemini** and **MongoDB**, featuring structured JSON mystery generation, real-time suspect interrogations, an interactive corkboard evidence board with red yarn connections, and locked backend anti-cheat validation.

---

## 🌟 Key Highlights & Architecture

- **Dynamic Procedural Mysteries**: Infinite replayability. Case files are generated on-the-fly using Google Gemini (`@google/genai`) with structured JSON schemas and strict Zod validation.
- **Interactive Evidence Board (Corkboard UI)**: A tactile visual corkboard where detectives can drag suspect cards, evidence files, pin custom notes, and draw interactive **red yarn string connections** between clues and suspects.
- **AI Suspect Interrogation Chat**: Direct simulated chat interface with suspects constrained by strict persona prompts, alibis, and hidden guilt states via Gemini prompt-chaining.
- **Strategic Action Points (AP) System**: Uncovering physical clues costs Action Points. Detectives must balance information gathering against resource limits.
- **Anti-Cheat Backend Security**: Culprit identity (`isCulprit`), motives, and case solutions (`solutionExplanation`) are strictly filtered and never leaked to the client until a formal accusation is submitted.
- **Atmospheric Noir Aesthetic**: Moody dark-mode UI with amber streetlamp glows, typewriter text animations, vintage dossier folders, and a native Web Audio API synthesizer for rain and moody jazz ambience (zero external asset dependencies).
- **Zero-Setup Turnkey Fallbacks**: Operates seamlessly out of the box with or without an active `GEMINI_API_KEY` or remote `MONGODB_URI` via high-fidelity procedural AI generators and embedded fallback storage.

---

## 📐 Difficulty Scaling Matrix & Scoring Engine

| Difficulty Tier | Suspects | Clues | Hints | Action Points (AP) | Base Accusation Points |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Easy** | 3 | 5 | 2 | 12 AP | 100 pts |
| **Medium** | 4 | 7 | 3 | 10 AP | 150 pts |
| **Hard** | 5 | 9 | 3 | 8 AP | 200 pts |

### Formal Scoring Formula

$$\text{Final Score} = \max\left(0, \text{Base Points} + (\text{Clues Discovered} \times 5) - (\text{Hints Used} \times 10)\right)$$

- **Clues Discovered Bonus**: $+5$ pts per uncovered clue.
- **Hint Penalty**: $-10$ pts per hint requested.
- **Detective Rank Thresholds**:
  - `Master Detective`: $\ge 180$ pts
  - `Senior Detective`: $\ge 130$ pts
  - `Private Eye`: $\ge 80$ pts
  - `Junior Sleuth`: $< 80$ pts

---

## 🛠️ Technology Stack

### Frontend Client
- **React 18** & **Vite**: Ultra-fast SPA foundation with Hot Module Replacement.
- **Tailwind CSS**: Custom noir palette (`noir-950`, `detective-amber`, `detective-crimson`, `corkboard-pattern`).
- **Framer Motion**: Smooth animations for modals, card flips, and typewriter loaders.
- **Lucide React**: Vector detective iconography.
- **React Router DOM v7**: Declarative client routing.
- **Canvas-Confetti**: Victory celebration on case solved.
- **Web Audio API**: Native procedural synthesizer for rain ambience and sound effects.

### Backend Server
- **Node.js** & **Express.js**: REST API with centralized error handling.
- **MongoDB & Mongoose**: Document models for cases, suspects, clues, hints, and leaderboard.
- **Google Gemini API** (`@google/genai` / `@google/generative-ai`): Structured JSON generation.
- **Zod**: Runtime schema validation and sanitization.
- **Express Rate Limit & CORS**: Production security controls.

---

## 🔒 Security Architecture

```
Client (React SPA)
   │
   ├── GET /api/cases/:id ───────────► Express Controller ──► Case.toPublicJSON()
   │                                                             │
   │                                                             ▼
   │   [STRIPPED PAYLOAD]                               Strips out:
   │   { suspects: [{ name, role, bio, alibi }],        • isCulprit
   │     clues: [{ title, description, discovered }],   • motive
   │     hints: [{ text, unlocked }] }                  • solutionExplanation
   │
   └── POST /api/cases/:id/accuse ───► Backend Verification Engine
                                         │
                                         ▼ (Only revealed post-verdict)
                                       { verdict: "SOLVED",
                                         isCorrect: true,
                                         trueCulpritName: "...",
                                         solutionExplanation: "..." }
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-username/ai-mystery-room.git
cd "ai-mystery-room"

# Install all dependencies (root, server, and client)
npm run install:all
```

### 2. Configure Environment Variables (Optional)
Create `.env` in `/server`:
```env
PORT=5000
NODE_ENV=development

# Optional: MongoDB URI (defaults to local mongodb or resilient fallback)
MONGODB_URI=mongodb://127.0.0.1:27017/ai_mystery_room

# Optional: Google Gemini API Key from Google AI Studio (https://aistudio.google.com/)
GEMINI_API_KEY=your_gemini_api_key_here

CLIENT_ORIGIN=http://localhost:5173
```
> *Note: If no `GEMINI_API_KEY` is provided, the system automatically uses its rich procedural noir mystery generator with 100% feature parity!*

### 3. Run Development Servers
```bash
# Starts both Backend (port 5000) and Frontend (port 5173) concurrently:
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Run Backend Test Suite
```bash
cd server
npm test
```
All 34 automated unit and security assertion tests will run and validate the schema, difficulty scaling, anti-cheat protection, clue unlocking, interrogation, and score calculation!

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status, database connection, and Gemini status. |
| `POST` | `/api/cases` | Generates a new case dossier via Gemini. Body: `{ premise, difficulty, genre }`. |
| `GET` | `/api/cases` | Lists recent case records. |
| `GET` | `/api/cases/:id` | Returns active public case state (**sanitized of all secret solution data**). |
| `POST` | `/api/cases/:id/clues/:clueId/discover` | Unlocks a physical clue and deducts 1 Action Point. |
| `POST` | `/api/cases/:id/hints` | Unlocks the next hint and applies a 10-point scoring penalty. |
| `POST` | `/api/cases/:id/interrogate` | Sends a prompt-chained question to a suspect. Body: `{ suspectId, question }`. |
| `POST` | `/api/cases/:id/accuse` | Submits final accusation, validates against culprit, calculates final score, and reveals full solution. |
| `GET` | `/api/leaderboard` | Returns Hall of Fame top scores and detective rankings. |

---

## 🚢 Production Deployment

### Option A: Unified Monolith (Render / Railway / Docker)
The Express backend is pre-configured to build and serve the static Vite client:
1. Set build command: `npm install && npm run build:client && cd server && npm install`
2. Set start command: `cd server && npm start`
3. Configure environment variables (`GEMINI_API_KEY`, `MONGODB_URI`, `NODE_ENV=production`, `PORT=5000`).

### Option B: Decoupled Deployment (Vercel Frontend + Render Backend)
- **Frontend (Vercel)**:
  - Root directory: `client`
  - Build command: `npm run build`
  - Output directory: `dist`
  - Environment variable: `VITE_API_URL` pointing to backend.
- **Backend (Render / Railway)**:
  - Root directory: `server`
  - Start command: `node src/server.js`
  - Set `CLIENT_ORIGIN` to your Vercel deployment URL.

---

## 📜 License
MIT License • Developed for the **AI Mystery Room** Project.
>>>>>>> 3c14136 (feat: complete AI Mystery Room full-stack application with Gemini AI, corkboard UI, and secure anti-cheat backend)
