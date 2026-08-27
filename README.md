
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
# API Key for Gemini (Required for all AI features)
GEMINI_API_KEY=your_gemini_api_key_here

# API Key for Groq (used by core review/rewrite/chat flows)
GROQ_API_KEY=your_groq_api_key_here

# MySQL configuration for backend API
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=code_reviewer
MYSQL_CONNECTION_LIMIT=10

# Backend server port
PORT=4000
```

### 3. Installation
```bash
npm install
```

### 4. Start Development Server
```bash
npm run dev
```
The application will be accessible at `http://localhost:5173`.

### 5. Start Backend API (MySQL)
```bash
npm run server
```
Health check endpoint: `http://localhost:4000/api/health`

## 📁 Project Architecture

- `src/services/geminiService.ts`: Core AI logic using Gemini 3 Flash for analysis and Gemini 2.5 for TTS.
- `src/services/logoService.ts`: Specialized service for AI image generation and branding.
- `src/components/Antigravity.tsx`: 3D particle background engine.
- `src/components/LogoGenerator.tsx`: UI for custom identity synthesis.
- `src/components/AssistantPanel.tsx`: Persistent multimodal interaction hub.

---
*Crafted for speed. Powered by Gemini.*
