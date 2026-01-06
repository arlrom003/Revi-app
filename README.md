# Revi - AI-Powered Flashcard Study Tracker

Revi is a mobile-first web application for managing and tracking flashcard study sessions with AI-powered analytics. Built with React (frontend) and Node.js/Express (backend), using Supabase for data storage and authentication.

## Features

### Core Functionality
- **User Authentication**: Secure login and signup with Supabase Auth
- **Deck Management**: Create, edit, and organize flashcard decks
- **Card Creation**: Add flashcards manually or bulk import via CSV
- **Study Sessions**: Interactive spaced repetition study interface
- **Progress Tracking**: Track mastery levels and study statistics
- **Analytics Dashboard**: Visualize study patterns and performance

### Key Features
- 📱 Mobile-first responsive design
- 🎯 Spaced repetition algorithm
- 📊 Advanced analytics and insights
- 📈 Study streak tracking
- 🎨 Modern UI with Tailwind CSS
- 🔒 Row-level security with Supabase
- 📤 CSV import/export functionality

## Tech Stack

### Frontend
- React 18
- React Router for navigation
- Tailwind CSS for styling
- Recharts for data visualization
- Vite for build tooling

### Backend
- Node.js with Express
- Supabase for database and auth
- Multer for file uploads
- CSV parsing for bulk imports

### Database
- PostgreSQL (via Supabase)
- Tables: users, decks, cards, reviews, study_sessions

## Project Structure

```
Revi-app/
├── revi-frontend/          # React frontend application
│   ├── src/
│   │   ├── services/       # API service layer
│   │   ├── lib/           # Utility functions
│   │   ├── Dashboard.jsx  # Main dashboard
│   │   ├── ReviewSession.jsx
│   │   ├── DeckDetails.jsx
│   │   └── ...
│   ├── android/           # Capacitor Android build
│   └── package.json
│
└── revi-backend/          # Express backend API
    ├── routes/            # API route handlers
    │   ├── auth.js
    │   ├── decks.js
    │   ├── cards.js
    │   ├── reviews.js
    │   ├── analytics.js
    │   └── upload.js
    ├── services/          # Business logic
    │   └── analyticsService.js
    ├── middleware/        # Express middleware
    │   └── auth.js
    ├── config/            # Configuration
    │   └── supabase.js
    ├── server.js          # Express app entry point
    └── package.json
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account

### Backend Setup

1. Navigate to the backend directory:
```bash
cd revi-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your Supabase credentials:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
PORT=3001
```

4. Start the development server:
```bash
npm run dev
```

The backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd revi-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```env
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

### Database Setup

1. Create a new Supabase project
2. Run the following SQL to create the required tables:

```sql
-- Users table (managed by Supabase Auth)

-- Decks table
CREATE TABLE public.decks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Cards table
CREATE TABLE public.cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deck_id UUID REFERENCES public.decks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  mastery_level INT DEFAULT 0,
  last_reviewed TIMESTAMPTZ,
  next_review TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating TEXT NOT NULL CHECK (rating IN ('easy', 'medium', 'hard')),
  reviewed_at TIMESTAMPTZ DEFAULT now()
);

-- Study sessions table
CREATE TABLE public.study_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  deck_id UUID REFERENCES public.decks(id) ON DELETE CASCADE,
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE,
  result TEXT NOT NULL,
  duration_seconds INT,
  studied_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (example for decks)
CREATE POLICY "Users can view their own decks"
  ON public.decks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own decks"
  ON public.decks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own decks"
  ON public.decks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own decks"
  ON public.decks FOR DELETE
  USING (auth.uid() = user_id);

-- Add similar policies for cards, reviews, and study_sessions
```

## API Endpoints

### Authentication
- `POST /auth/signup` - Create new user account
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user

### Decks
- `GET /decks` - Get all decks for authenticated user
- `GET /decks/:id` - Get single deck details
- `POST /decks` - Create new deck
- `PUT /decks/:id` - Update deck
- `DELETE /decks/:id` - Delete deck

### Cards
- `GET /cards/:deckId` - Get all cards in a deck
- `POST /cards` - Create new card
- `PUT /cards/:id` - Update card
- `DELETE /cards/:id` - Delete card

### Reviews
- `POST /reviews` - Submit card review
- `GET /reviews/:deckId` - Get review history

### Analytics
- `GET /analytics/dashboard` - Get dashboard statistics
- `GET /analytics/overview` - Get overview statistics
- `GET /analytics/history` - Get study history

### Upload
- `POST /upload/csv` - Bulk import cards via CSV

## Mobile Deployment (Android)

The app uses Capacitor for mobile deployment:

```bash
cd revi-frontend
npm run build
npx cap sync
npx cap open android
```

## Contributing

This is a student project. Feel free to fork and experiment!

## License

MIT License - feel free to use this project for learning purposes.

## Author

Created as a computer science student project.
