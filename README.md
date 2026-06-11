# CineAI – Intelligent Movie Recommendation Platform

CineAI is a full-stack, AI-powered movie recommendation web application built with a modern, Netflix-style dark theme visual interface, a Python machine learning recommendation backend, and an interactive AI chat assistant.

## 🔗 Deployment Links

- **Web Application (Frontend)**: [https://frontend-abhisek-patels-projects.vercel.app](https://frontend-abhisek-patels-projects.vercel.app)
- **API Server (Backend)**: [https://cineai-backend-ltkt.onrender.com](https://cineai-backend-ltkt.onrender.com)
- **GitHub Repository**: [https://github.com/abhisek-977788/movie-recommendation](https://github.com/abhisek-977788/movie-recommendation)

---

## 🚀 Key Features

1. **Cinematic Glassmorphism UI**: High-end user interface built using Next.js 16 (App Router), Framer Motion, and Tailwind CSS.
2. **Hybrid Recommendation Engine**: Blends content-based filtering (TF-IDF + Cosine Similarity on genres, synopses, and metadata) and collaborative filtering (ratings matrix factorization) to generate movie suggestions.
3. **Interactive AI Chat Assistant**: Chat with CineAI to ask questions, discover movies by mood, find similar titles, and explore lists (powered by Google Gemini API with robust local database fallbacks).
4. **Interactive Ratings & Reviews**: Users can rate movies on a 5-star scale, toggle bookmark favorites, and write reviews which automatically undergo TextBlob sentiment analysis (classified as positive, negative, or neutral).
5. **Admin Dashboard**: Manage user privileges, add custom catalog entries, trigger TMDB catalog synchronizations, and inspect system activities.
6. **User Dashboards**: View user watch histories, bookmarks, ratings history, and manage personal settings.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 16 (React 19, App Router, TypeScript)
- **Styling**: Tailwind CSS + Custom CSS Design System Variables
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Deployment**: Vercel

### Backend
- **Framework**: FastAPI (Python 3)
- **ORM & Database**: SQLAlchemy + SQLite (Synchronous)
- **Security**: JWT Authentication + Password Hashing (bcrypt)
- **Machine Learning & Sentiment**: Scikit-Learn, Pandas, Numpy, Joblib, TextBlob
- **AI Integrations**: Google Gemini AI
- **External Data**: TMDB API Sync
- **Deployment**: Render

---

## 📂 Project Structure

```
d:\movie recommendation\
├── backend/                    # FastAPI Python backend
│   ├── app/
│   │   ├── main.py            # FastAPI entry point
│   │   ├── config.py          # Pydantic environment configurations
│   │   ├── database.py        # SQLite connections
│   │   ├── models/            # SQLAlchemy ORM models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── routers/           # API router endpoints
│   │   ├── services/          # Business logic layers (Auth, TMDB, Chat)
│   │   ├── ml/                # TF-IDFContent & collaborative filter scripts
│   │   └── utils/             # Security helper utilities
│   ├── requirements.txt       # Dependencies
│   └── seed_data.py           # MovieLens initial seeding script
├── frontend/                  # Next.js React frontend
│   ├── src/
│   │   ├── app/               # Page layouts and routers
│   │   ├── components/        # Redesigned premium modules
│   │   ├── lib/               # API clients, context wrappers, and types
│   │   └── styles/            # CSS variable systems
│   └── package.json           # Frontend configs
└── render.yaml                # Render service deploy config
```

---

## ⚙️ Environment Variables

### Backend Configuration (`backend/.env`)
```env
SECRET_KEY=cineai-super-secret-key-change-in-production-2024
DATABASE_URL=sqlite:///./cineai.db
TMDB_API_KEY=your_tmdb_api_key_here
TMDB_BASE_URL=https://api.themoviedb.org/3
TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p
GEMINI_API_KEY=your_gemini_api_key_here
ALLOWED_ORIGINS=https://frontend-abhisek-patels-projects.vercel.app
```

### Frontend Configuration (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=https://cineai-backend-ltkt.onrender.com
```

---

## 📖 License

This application is built for academic and demonstration purposes using movie listings from GroupLens MovieLens small dataset.
