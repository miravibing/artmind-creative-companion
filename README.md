# ArtMind – Creative Assistant for Artists

> A Progressive Web App (PWA) that helps artists maintain consistent creative practice through AI-powered prompts, habit tracking, mood journaling, and curated learning resources.

**BSc (Hons) Business Information Systems — Final Year Project**
Westminster International University in Tashkent (WIUT)
Module: 6BUIS007C-n — Business Information Systems Project

---

## Overview

ArtMind addresses a documented challenge in creative practice: artists frequently experience art block, burnout, and difficulty maintaining consistent routines. Existing tools tackle either art education *or* wellbeing in isolation — ArtMind integrates both into a single, accessible platform.

The platform is designed for art students, self-taught digital artists, and creative hobbyists who benefit from structured routine scaffolding, lightweight wellbeing reflection, and on-demand creative inspiration — without the pressure of clinical-style mental health tools.

### SDG Alignment

| SDG | Contribution |
|-----|-------------|
| **SDG 3** – Good Health & Well-being | Mood journaling, burnout prevention, wellbeing-aware UX |
| **SDG 8** – Decent Work & Economic Growth | Supports sustainable creative work patterns |
| **SDG 9** – Industry, Innovation & Infrastructure | Accessible PWA using modern web infrastructure and AI |
| **SDG 17** – Partnerships for the Goals | Community challenges, educator/artist group collaboration |

---

## Features

| Module | Description |
|--------|-------------|
| **Dashboard** | Personalised greeting, daily AI-generated prompt, habit streak overview, mood summary |
| **AI Prompt Generator** | On-demand creative prompts powered by Gemini AI, with favourites and history |
| **Habit Tracker** | Create custom habits, log daily completions, track streaks and consistency |
| **Mood Journal** | Daily mood check-ins (1–5 scale + optional notes), history view |
| **Learning Resources** | Curated library of art learning content with search and category filters |
| **Community Challenges** | Seasonal art challenges with likes, bookmarks, comments, and participation tracking |
| **User Profile** | Avatar upload, display name, personalised settings |

---

## Tech Stack

### Frontend
- **React 18** + **TypeScript** — component-based UI with type safety
- **Vite** — fast development server and build tool
- **Tailwind CSS** — utility-first styling
- **shadcn/ui** — accessible component library built on Radix UI
- **React Router v6** — client-side routing
- **React Query (@tanstack/react-query)** — server state caching
- **Lucide React** — icon library
- **Recharts** — data visualisation for mood trends

### Backend (Supabase / Lovable Cloud)
- **PostgreSQL** — relational database with full schema and constraints
- **Supabase Auth** — email/password authentication with JWT sessions
- **Row Level Security (RLS)** — database-level per-user data isolation
- **Supabase Edge Functions (Deno/TypeScript)** — serverless backend logic for AI prompt generation
- **Supabase Storage** — file storage for avatars and challenge cover images

### AI Integration
- **Google Gemini** via Lovable AI Gateway — generates structured creative prompts
- AI API keys are stored server-side in Edge Function environment secrets and never exposed to the browser

### Deployment
- **Vercel** — frontend hosting via GitHub integration
- **GitHub** — version control and CI/CD pipeline

---

## Architecture

```
┌─────────────┐     HTTPS      ┌──────────────────┐
│   Browser   │ ─────────────→ │   Vercel CDN     │
│  (React PWA)│ ←───────────── │  (Static Build)  │
└──────┬──────┘                └──────────────────┘
       │
       │  Supabase JS Client (JWT in header)
       │
       ├── Auth ──────────→ Supabase Auth ──→ PostgreSQL (auth.users)
       │
       ├── Data CRUD ─────→ PostgREST API ──→ PostgreSQL (RLS enforced)
       │                                        ├── habits
       │                                        ├── habit_completions
       │                                        ├── mood_entries
       │                                        ├── prompt_favorites
       │                                        ├── challenges
       │                                        └── user_streaks
       │
       ├── RPC ───────────→ PostgreSQL Function (update_login_streak)
       │
       ├── Storage ───────→ Supabase Storage (avatars, challenge-covers)
       │
       └── Edge Function ─→ generate-prompt (Deno TypeScript)
                                  │
                                  │  Server-side AI key (never client-exposed)
                                  ↓
                             Lovable AI Gateway → Google Gemini
                                  │
                                  ↓
                             Structured JSON → Client UI
```

---

## Database Schema

Core tables with Row Level Security enforced on all user data:

| Table | Purpose |
|-------|---------|
| `profiles` | User display name, avatar URL, preferences |
| `habits` | User-defined creative habits |
| `habit_completions` | Daily habit check-off records |
| `mood_entries` | Daily mood score (1–5) and optional reflection notes |
| `prompt_favorites` | Saved AI-generated prompts |
| `user_streaks` | Login streak tracking (current and longest) |
| `challenges` | Community art challenges |
| `challenge_likes` | Challenge like records |
| `challenge_bookmarks` | User-saved challenges |
| `challenge_participants` | Challenge join records |
| `challenge_comments` | Comments on challenges |

All tables enforce `auth.uid() = user_id` via RLS policies — users can only read and write their own rows.

---

## Running Locally

### Prerequisites
- Node.js 18+ and npm
- A Supabase project with the schema and RLS policies applied

### Setup

```sh
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/artmind.git
cd artmind

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
```

Add your Supabase credentials to `.env`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

```sh
# 4. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key (safe for client) |

> **Note:** The AI API key for prompt generation is stored as a server-side secret in the Supabase Edge Function environment and is never exposed to the browser or committed to this repository.

---

## Project Structure

```
src/
├── App.tsx                  # Root: routing, auth provider, global UI
├── main.tsx                 # Entry point
├── contexts/
│   └── AuthContext.tsx      # Global auth session state
├── pages/
│   ├── Dashboard.tsx        # Home: prompt, streaks, mood overview
│   ├── Habits.tsx           # Habit CRUD and daily completions
│   ├── Mood.tsx             # Mood check-in and history
│   ├── Prompt.tsx           # AI prompt generation and favourites
│   ├── Resources.tsx        # Curated learning resource library
│   ├── Challenges.tsx       # Community challenges
│   └── Auth.tsx             # Login and signup
├── components/
│   ├── layout/
│   │   └── Navigation.tsx   # Desktop top-bar + mobile bottom-bar
│   ├── dashboard/           # Dashboard widget components
│   └── ui/                  # shadcn/ui component library
└── integrations/
    └── supabase/            # Auto-generated Supabase client + types
supabase/
└── functions/
    └── generate-prompt/     # Edge Function: AI prompt generation (Deno)
```

---

## Security

- **Authentication:** Email/password with JWT session management and auto-refresh
- **Authorisation:** Database-level Row Level Security — no application-layer bypass possible
- **AI key safety:** API keys stored in Edge Function environment secrets, never in client code or repository
- **Data minimisation:** Only necessary user data is collected; mood entries are strictly private per-user
- **Transport:** All communication over HTTPS

---

## Academic Context

This project was developed as the final-year capstone for the BSc (Hons) Business Information Systems programme at WIUT. It demonstrates:

- **Business analysis:** User research (surveys and interviews), competitor analysis, SWOT, MoSCoW prioritisation, SDG alignment
- **Computing:** Full-stack PWA development, relational database design, RLS-based security, serverless AI integration
- **Project management:** Agile iterative development, supervisor-reviewed sprints, documented progress

The use of AI-assisted frontend scaffolding (Lovable platform) accelerated UI iteration. All database schema design, RLS policy implementation, backend logic, system architecture decisions, and academic research were produced independently by the student.

---

## License

This project was created for academic purposes as part of a final year university project. All rights reserved by the author.
