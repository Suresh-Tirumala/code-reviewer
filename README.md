
# debugger

**debugger** is a high-performance, real-time code analysis and refactoring platform. It provides developers with an intelligent workspace for instant code reviews, automated refactoring, and interactive simulation, all wrapped in a sleek, modern interface.

## 🚀 Key Features

- **Ultra-Low Latency Analysis**: Powered by **Gemini 3 Flash**, providing near-instant feedback on code quality, security, and performance.
- **AI Logo Synthesis**: Integrated identity generation using **Gemini 2.5 Flash Image**. Create and apply professional robot branding directly from the workspace settings.
- **Antigravity Background**: A high-performance, interactive 3D particle system built with **Three.js** and **React Three Fiber** that responds to user interaction.
- **Multimodal AI Assistant**: A persistent side-panel assistant featuring real-time chat and **Gemini 2.5 Flash TTS** for high-quality audio responses.
- **3D-Flip Secure Gateway**: A professional, secure authentication interface with optimized CSS 3D transitions.
- **Visual Preview Environment**: Real-time rendering for web-based code (HTML/CSS/SVG) within an integrated sandbox.

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **3D Graphics**: Three.js, @react-three/fiber
- **Styling**: Tailwind CSS
- **AI Intelligence**: Gemini API (Gemini 3 Flash, Gemini 2.5 Flash Image/TTS)
- **Utilities**: Highlight.js, Marked.js, FontAwesome 6

## 💻 Local Development Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Gemini API Key](https://aistudio.google.com/)

### 2. Configuration
Create a `.env` file in the project root:

```bash
# AI Keys
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# MongoDB (backend)
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB_NAME=ai_code_reviewer

# Frontend to backend URL
VITE_API_BASE_URL=http://localhost:4000

# Backend port
PORT=4000
```

### 3. Installation
```bash
npm install
```

### 4. Start Backend API (MongoDB)
```bash
npm run server
```

### 5. Start Frontend Development Server
```bash
npm run dev
```
The application will be accessible at `http://localhost:5173`.

MongoDB API will be accessible at `http://localhost:4000`.

### 6. Test MongoDB Connection
```bash
curl http://localhost:4000/api/health
```

## 📁 Project Architecture

- `services/aiService.ts`: Core AI logic using Groq models for analysis, rewrite, and chat.
- `services/geminiService.ts`: Gemini-specific logic used by selected multimodal features.
- `services/reviewStoreService.ts`: Frontend persistence client for MongoDB review storage.
- `server/index.js`: Express API routes for health and review persistence.
- `server/db.js`: MongoDB connection and collection helpers.

---
*Crafted for speed. Powered by Gemini.*
