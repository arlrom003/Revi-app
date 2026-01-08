# Revi - AI-Powered Flashcard Study Tracker

**A mobile-first full-stack application** for managing and tracking flashcard study sessions with AI-powered analytics. Built with **React + Vite** (frontend), **Node.js/Express** (backend), and deployed as both a **web app** and **Android APK**.

Revi uses Supabase for secure authentication and database management, OpenRouter for AI-powered flashcard generation, and Capacitor for native Android deployment.

---

## ✨ Features

### Core Functionality
- **User Authentication**: Secure login/signup with Supabase Auth
- **Deck Management**: Create, edit, and organize flashcard decks
- **Card Creation**: Add flashcards manually or bulk import via CSV
- **Study Sessions**: Interactive spaced repetition study interface
- **Progress Tracking**: Track mastery levels and study statistics
- **Analytics Dashboard**: Visualize study patterns, performance, and trends
- **Account Management**: Delete account, change password, profile settings

### Key Features
- 📱 **Mobile-first responsive design** (works great on phones)
- 🤖 **AI-powered flashcard generation** using OpenRouter
- 📊 **Advanced analytics and insights** with visual charts
- 📈 **Study streak tracking and mastery levels**
- 🎨 **Modern UI with Tailwind CSS**
- 🔒 **Row-level security** with Supabase RLS
- 📤 **CSV import/export** functionality
- 📦 **Android APK** deployment via Capacitor

---

## 🛠 Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Capacitor** - Native Android packaging
- **Axios** - HTTP client

### Backend
- **Node.js + Express** - Server framework
- **Supabase** - PostgreSQL database + Auth
- **OpenRouter API** - AI flashcard generation
- **Multer** - File uploads
- **CSV parsing** - Bulk imports

### Database
- **PostgreSQL** (via Supabase)
- **Tables**: users, decks, cards, review_sessions, card_reviews
- **Row-Level Security (RLS)** for data privacy

---

## 🚀 Quick Start

### Prerequisites
- **Node.js v18+** and npm
- **Supabase account** (free tier works)
- **OpenRouter API key** (free tier available)
- **Git**

### 1. Clone the repository
```bash
git clone https://github.com/arlrom003/Revi-app.git
cd Revi-app
```

### 2. Backend Setup
```bash
cd revi-backend
npm install
```

Create `.env` file:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENROUTER_API_KEY=your_openrouter_key
PORT=3000
```

Start backend:
```bash
npm run dev
# Backend runs on http://localhost:3000/api
```

### 3. Frontend Setup
```bash
cd revi-frontend
npm install
```

Create `.env` file:
```env
VITE_API_URL=http://localhost:3000/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Start frontend:
```bash
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 📱 Mobile Deployment (Android APK)

Revi can be built as a native Android APK using **Capacitor**.

### Prerequisites
- **Android Studio** installed
- **Android SDK** (API level 21+)

### Build APK
```bash
cd revi-frontend
npm run build          # Build web assets
npx cap sync          # Sync to Android project
npx cap open android  # Open in Android Studio
```

In Android Studio:
1. **Build → Build APK(s)** for debug APK
2. **Build → Generate Signed Bundle/APK** for release (Play Store)

The APK will be available at:
- Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release: `android/app/build/outputs/bundle/release/app-release.aab`

### Important Notes for Mobile
- Update `VITE_API_URL` to your production backend URL (not localhost)
- Ensure backend is deployed on HTTPS (e.g., Render, Vercel, AWS)
- Test on real device or Android emulator

---

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/signup` - Create account
- `POST /api/auth/logout` - Logout

### Decks
- `GET /api/decks` - Get all user decks
- `POST /api/decks` - Create deck
- `GET /api/decks/:id` - Get deck details
- `PUT /api/decks/:id` - Update deck
- `DELETE /api/decks/:id` - Delete deck

### Cards
- `GET /api/decks/:deckId` - Get cards in deck
- `POST /api/cards` - Create card
- `PUT /api/cards/:id` - Update card
- `DELETE /api/cards/:id` - Delete card

### Study Sessions
- `POST /api/review-sessions` - Save review session
- `GET /api/history` - Get study history

### Analytics
- `GET /api/analytics/overview` - Overview stats (decks, cards, sessions, ratings)
- `GET /api/analytics/dashboard` - Dashboard data with mastery levels
- `GET /api/analytics/history` - Detailed study history

### Account
- `DELETE /api/account` - Delete user account (requires "DELETE" confirmation)
- `POST /api/auth/change-password` - Change password

### AI Features
- `POST /api/upload-file` - Upload flashcards
- `POST /api/generate-flashcards` - AI-generate flashcards from text

---

## 📊 Database Schema

### Decks Table
```sql
CREATE TABLE public.decks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Cards Table
```sql
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
```

### Review Sessions Table
```sql
CREATE TABLE public.review_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  deck_id UUID REFERENCES public.decks(id) ON DELETE CASCADE,
  total_cards INT,
  easy_count INT DEFAULT 0,
  medium_count INT DEFAULT 0,
  hard_count INT DEFAULT 0,
  duration_seconds INT,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 🔐 Security & Best Practices

1. **Never commit `.env` files** - They contain sensitive API keys
2. **Use Row-Level Security (RLS)** - All tables have RLS enabled
3. **Protect OpenRouter keys** - Call OpenRouter only from backend, not frontend
4. **HTTPS only** - Always use HTTPS in production
5. **Service Role Key** - Only used server-side for admin operations (account deletion)

---

## 📂 Project Structure

```
Revi-app/
├── revi-frontend/           # React + Vite frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API calls
│   │   ├── lib/             # Utilities (Supabase, auth)
│   │   ├── layout/          # Layout components
│   │   └── App.jsx
│   ├── public/              # Static assets
│   └── vite.config.js
│
├── revi-backend/            # Node.js + Express backend
│   ├── routes/              # API route handlers
│   ├── middleware/          # Auth, error handling
│   ├── config/              # Supabase config
│   ├── server.js            # Main server file
│   └── package.json
│
├── android/                 # Capacitor Android project
│   └── app/build/outputs/   # APK/AAB outputs
│
└── README.md
```

---

## 🚀 Deployment

### Backend (Render)
1. Push to GitHub
2. Create new service on Render
3. Connect GitHub repo
4. Set environment variables
5. Deploy

### Frontend (Vercel/Netlify)
1. Build: `npm run build`
2. Deploy `dist/` folder
3. Set `VITE_API_URL` to your backend URL

### Android (Google Play Store)
1. Build signed APK: `Build → Generate Signed Bundle/APK`
2. Create Google Play Console account
3. Upload AAB file and follow submission guidelines

---

## 🤝 Contributing

This is a student project. Feel free to fork, experiment, and learn!

To contribute:
1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

MIT License - Free to use for learning and educational purposes.

---

## 👨‍💻 Author

Created as a computer science student project to demonstrate full-stack development, mobile deployment, and AI integration.

**Questions?** Open an issue on GitHub or reach out!
