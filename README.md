# RecallAI – AI Study Assistant

RecallAI is a modern, production-grade AI-powered study assistant built with React, Vite, TypeScript, Tailwind CSS, Express.js, and Google Gemini API. It transforms free-form study notes, lecture excerpts, or educational topics into interactive flashcards and multiple-choice quizzes with automated active-recall revision loops.

> **Important**: RecallAI is **NOT** a chatbot. The AI generates strict, validated JSON schemas which are parsed, validated with Zod, and rendered into rich interactive learning interfaces.

---

## 🌟 Key Features

### 1. Multi-Format AI Generation
- **Flashcards**: Bite-sized study cards featuring 3D perspective flip animations, core definitions, and educational explanations.
- **Interactive Quizzes**: Multiple-choice assessments with single-question focus, selectable options, immediate feedback, detailed rationales, and running timers.
- **Comprehensive Mode**: Generates both a flashcard deck and a quiz simultaneously from a single set of notes.
- **Pedagogical Difficulty Tuning**: Easy (definitions & fundamentals), Medium (core mechanisms & relationships), or Hard (edge cases, synthesis, & trade-offs).
- **Adjustable Volume**: Generate 3 to 15 questions or cards per topic.

### 2. Interactive Flashcard Learning Experience
- 3D CSS perspective card flip (`rotateY(180deg)` with `preserve-3d` and `backface-visibility: hidden`).
- Front displays the key question or concept; back reveals the answer and in-depth educational explanation.
- **Card Mastery Classification**:
  - `Mark as Known` (Key `2`)
  - `Need Revision` (Key `1`)
- Keyboard accessibility: Space / Enter to flip, Left / Right arrows to navigate.
- Deck shuffle and restart controls.
- Session completion modal with mastery score and targeted practice for weak cards.

### 3. Interactive Quiz & Assessment Experience
- Single-question interface with selectable options (A, B, C, D).
- Option selection with distinct hover and active states.
- Post-submission instant feedback:
  - Correct answer highlighted in emerald green with checkmark.
  - Incorrect selection highlighted in rose red with cross.
  - In-depth explanation of the underlying concept.
- Running elapsed session timer.
- Final results dashboard:
  - Total questions, correct answers, incorrect answers, accuracy percentage, time taken.
  - Grade badge and celebratory confetti on high scores ($\ge 70\%$).
  - Full question-by-question review comparing user choices against correct answers.

### 4. Wrong Answer Revision System
- Automatically captures every question answered incorrectly during quizzes into an active recall revision queue.
- Users can review missed questions, correct answers, and explanations.
- **Targeted Revision Quiz**: Retake *only* the missed questions.
- Questions answered correctly during revision are automatically removed from the queue.
- Ability to manually remove items or clear the queue.

### 5. Performance Dashboard & Analytics
- Metrics summary:
  - Total study sessions completed
  - Total flashcards reviewed
  - Total quizzes attempted
  - Average quiz accuracy
  - Questions awaiting revision
- **Interactive SVG Accuracy Trend Chart**: Visualizes performance across recent quiz attempts.
- Chronological study activity feed with dates, scores, and status badges.
- Persistent local storage: all data, attempts, and study sets remain available upon page reload.

### 6. Suggested Topics & Instant Curriculum
- Pre-built high-yield curricula for key computer science disciplines:
  - Operating Systems
  - Database Management Systems
  - Machine Learning
  - Computer Networks
  - Data Structures and Algorithms

---

## 🛠️ Technology Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18, Vite | Component-driven UI and high-performance bundling |
| **Language** | TypeScript | Strict type safety across components, hooks, and services |
| **Styling & Theme** | Tailwind CSS | SaaS styling inspired by Linear & Notion |
| **Icons & Visuals** | Lucide React | Modern icons for UI elements and navigation |
| **Animations** | Framer Motion, Canvas Confetti | Smooth page transitions and reward feedback |
| **Schema Validation** | Zod | Runtime validation of AI-generated JSON payloads |
| **Backend Framework** | Node.js, Express.js | API routing, CORS handling, and centralized error management |
| **AI Integration** | **Groq API** (`groq-sdk`, Llama 3.3 70B) & Google Gemini (`@google/generative-ai`) | Ultra-fast LLM inference for structured JSON generation |
| **Configuration** | Dotenv | Secure environment variable handling |

---

## 🏗️ Architecture & Clean Separation

RecallAI maintains a strict separation between frontend and backend:
- **No Secret Exposure**: The Google Gemini API key is **never** embedded in frontend bundles. All AI generation requests pass through the Express backend server.
- **Flexible Key Configuration**: The backend reads `GEMINI_API_KEY` from `backend/.env`. Additionally, users can provide an API key in the UI Settings modal, which is sent via an encrypted `x-gemini-api-key` header without requiring a server restart.
- **Race Condition Prevention**: Client requests use `AbortController` to cancel in-flight queries when new requests are triggered, preventing stale AI responses from overwriting newer user requests.
- **Two-Layer Zod Validation**: Zod validates the schema on the Express backend before transmitting the payload, and the React frontend validates the payload again before mutating component state.

```
recall-ai/
├── backend/
│   ├── src/
│   │   ├── data/
│   │   │   └── sampleStudySets.js      # Curated fallbacks for suggested topics
│   │   ├── routes/
│   │   │   └── ai.routes.js            # Express API endpoints (/generate, /health, /sample)
│   │   ├── schemas/
│   │   │   └── study.schema.js         # Zod schemas for flashcards and quiz structures
│   │   ├── services/
│   │   │   └── gemini.service.js       # Gemini API caller, prompt engineering & JSON cleaner
│   │   └── server.js                   # Express application entrypoint
│   ├── .env.example                    # Backend environment template
│   └── package.json
│
├── src/
│   ├── components/
│   │   ├── ErrorState.tsx              # Error display with retry & settings shortcuts
│   │   ├── Flashcard.tsx               # 3D perspective card with flip animation
│   │   ├── FlashcardViewer.tsx         # Deck navigator, shortcuts, & session manager
│   │   ├── Header.tsx                  # Sticky top navigation bar
│   │   ├── LoadingState.tsx            # Animated multi-step AI progress indicator
│   │   ├── ProgressBar.tsx             # Animated progress bar
│   │   ├── QuizQuestion.tsx            # Single question card with selectable options
│   │   ├── QuizResults.tsx             # Quiz summary, confetti, & review list
│   │   ├── Sidebar.tsx                 # Navigation drawer with API health badge
│   │   └── StudyInput.tsx              # Main input form with topic pills & selectors
│   │
│   ├── hooks/
│   │   ├── useFlashcards.ts            # Flashcard flip state, known/revision tracking
│   │   ├── useQuiz.ts                  # Quiz flow, timer, score, & wrong question collection
│   │   └── useStudyHistory.ts          # LocalStorage sync, metrics, & revision queue
│   │
│   ├── pages/
│   │   ├── CreateStudySet.tsx          # Full creation studio with preview
│   │   ├── Dashboard.tsx               # Primary dashboard & featured suggestions
│   │   ├── FlashcardsPage.tsx          # Dedicated flashcard study view
│   │   ├── PerformancePage.tsx         # Analytics and visual accuracy trend chart
│   │   ├── QuizPage.tsx                # Active quiz player & results
│   │   ├── RevisionPage.tsx            # Wrong answer revision queue manager
│   │   ├── SettingsPage.tsx            # API key setup & test connection tool
│   │   └── StudySetsPage.tsx           # Library of all saved study sets
│   │
│   ├── services/
│   │   └── api.ts                      # Client API client with AbortController
│   ├── types/
│   │   └── study.ts                    # TypeScript types and interfaces
│   ├── utils/
│   │   ├── storage.ts                  # LocalStorage management with seed sets
│   │   └── validation.ts               # Frontend Zod validation schemas
│   ├── App.tsx                         # Main React application coordinator
│   └── main.tsx                        # React DOM mounting
│
├── vite.config.ts                      # Vite configuration with /api proxy
├── tailwind.config.js                  # Custom palette, shadows, and animations
└── package.json                        # Root package with concurrently scripts
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher (tested on Node v22)
- **npm**: v9.0.0 or higher
- A free **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/app/apikey).

---

### Step 1: Clone & Install Dependencies

Run the installation command from the project root:

```bash
# Install frontend and root dependencies
npm install

# Install backend dependencies
npm --prefix backend install
```

Alternatively, use the convenience shortcut:
```bash
npm run install:all
```

---

### Step 2: Environment Variable Setup

1. Open `backend/.env` (or copy from `backend/.env.example`):
```bash
cp backend/.env.example backend/.env
```

2. Open `backend/.env` and insert your **Groq API Key**:
```env
PORT=5000

# Active AI Provider: "groq" (Fastest) or "gemini"
AI_PROVIDER=groq

# Groq API Key from https://console.groq.com/keys
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile

# Optional: Google Gemini API Key
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
```

*(You can also configure or test your Groq API key directly inside the app's **Settings** page).*

---

### Step 3: Run the Application

To run both the Express backend and the Vite frontend simultaneously with unified logging:

```bash
npm run dev
```

This starts:
- **Express Backend**: `http://localhost:5000`
- **Vite Frontend**: `http://localhost:5173` (with `/api` automatically proxied to port 5000)

#### Running Services Individually:
- Start backend only: `npm run dev:backend`
- Start frontend only: `npm run dev:frontend`
- Build for production: `npm run build`

---

## 🤖 AI Integration & Structured Output

### Prompt Engineering & Structured JSON
RecallAI requests structured JSON output from Gemini using `responseMimeType: "application/json"` and strict format definitions:

#### Flashcards Schema:
```json
{
  "title": "Operating Systems",
  "type": "flashcards",
  "flashcards": [
    {
      "id": "card-1",
      "question": "What is a process?",
      "answer": "A process is a program in execution.",
      "explanation": "It includes the program code, current activity, and allocated resources."
    }
  ]
}
```

#### Quiz Schema:
```json
{
  "title": "Operating Systems Quiz",
  "type": "quiz",
  "questions": [
    {
      "id": "q1",
      "question": "Which of the following is a process?",
      "options": [
        "A program in execution",
        "A compiler",
        "A file",
        "A database"
      ],
      "correctAnswer": 0,
      "explanation": "A process is an instance of a program that is currently executing."
    }
  ]
}
```

### Sanitization & Resiliency Pipeline
1. **Preamble Stripping**: Removes markdown blocks (````json ... ````) and accidental preamble/postscript commentary.
2. **Grammar Correction**: Normalizes Unicode smart quotes (`“”` $\rightarrow$ `""`) and repairs trailing commas.
3. **Array & Index Normalization**: Ensures `correctAnswer` is within the bounds of `options` ($0 \le \text{correctAnswer} < \text{options.length}$).
4. **Zod Validation**: Validates the payload against `StudyContentSchema`. Rejects any payload missing critical fields.

---

## 🛡️ Error Handling Strategy

| Failure Scenario | Recovery Mechanism | User Experience |
| :--- | :--- | :--- |
| **Missing API Key** | Backend detects missing key and returns HTTP 401 with `MISSING_API_KEY`. | Displays error card with a 1-click button to configure the key in **Settings**, plus an option to preview with curated curricula. |
| **Invalid API Key** | Backend catches Google AI Studio 401/403 and returns `INVALID_API_KEY`. | Informs user that the provided API key was rejected by Google AI Studio. |
| **Rate Limit / 429** | Backend catches quota limits and maps to `RATE_LIMIT_EXCEEDED`. | Displays advisory explaining that Gemini API quota was reached, offering retry after a cooldown. |
| **Empty Response** | Detects empty or whitespace-only response from AI. | Prompts user with "Retry Generation" without discarding entered notes. |
| **Invalid Schema** | Zod safeParse catches missing arrays, out-of-bound indices, or malformed fields. | Returns HTTP 502 with specific schema error details; does not crash UI. |
| **Request Race Conditions** | `AbortController` cancels previous in-flight HTTP requests when a new request is dispatched. | Older responses are safely aborted, preventing older responses from overwriting newer ones. |
| **Network Failure** | Client catches fetch rejections and maps to `NETWORK_ERROR`. | Informs user to verify backend server is listening on port 5000. |
| **Preservation on Failure** | Input state is preserved in React state. | User notes are never erased when generation encounters an error. |

---

## ⚠️ Known Limitations

1. **Gemini Free-Tier Rate Limits**: Free Google AI Studio keys are subject to standard Google RPM (requests per minute) and TPM limits. If limits are reached, wait 30 seconds before retrying.
2. **Single-Node LocalStorage**: Study history and revision queues are persisted in browser `localStorage`. Using private/incognito browsing will not retain history across sessions.
3. **Offline AI Generation**: Live AI generation requires active internet connectivity to reach Google Gemini API endpoints. When offline, curated sample study sets are available.

---

## ⏱️ Time Spent

- **Architecture, Schema Design & Backend Setup**: ~45 minutes
- **Gemini API Integration, JSON Sanitization & Zod Validation**: ~45 minutes
- **Flashcard 3D Viewer & Keyboard Navigation**: ~35 minutes
- **Interactive Quiz Player, Timer, & Confetti Results**: ~40 minutes
- **Wrong Answer Revision Queue & Targeted Retake Flow**: ~35 minutes
- **Performance Dashboard, SVG Chart, & LocalStorage Hook**: ~30 minutes
- **UI Polishing, Responsive Design & Documentation**: ~30 minutes
- **Total Development Time**: ~4 hours 20 minutes

---

## 📄 License

MIT License. Built for technical demonstration and production-readiness evaluation.
