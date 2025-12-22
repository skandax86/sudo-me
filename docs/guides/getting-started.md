# Getting Started

**Version:** 1.0.0  
**Last Updated:** December 18, 2024

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ installed
- **npm** or **yarn** package manager
- **Git** for version control
- **Firebase CLI** installed globally
- **Firebase account** with a project created
- **Gemini API key** (Recommended - free tier available) for LLM features
  - Get free API key: https://aistudio.google.com/apikey
  - Alternative: Ollama (local, no API key needed)

---

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/sudo-me.git
cd sudo-me
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install Cloud Functions dependencies
cd functions
npm install
cd ..
```

### 3. Environment Setup

Create `.env.local` in the root directory:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# LLM Configuration (Recommended: Gemini Flash 2.5 - Free tier available)
GEMINI_API_KEY=your_gemini_key  # Get free key: https://aistudio.google.com/apikey

# Optional: Local development (Ollama - completely free)
# OLLAMA_URL=http://localhost:11434  # No API key needed

# Optional: Fallback (Hugging Face - free tier)
# HUGGINGFACE_API_KEY=your_hf_key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Firebase Setup

```bash
# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init

# Deploy Firestore rules and indexes
firebase deploy --only firestore:rules,firestore:indexes
```

### 5. Run Development Server

```bash
# Start Next.js dev server
npm run dev

# In another terminal, start Firebase emulators
firebase emulators:start
```

Visit `http://localhost:3000` to see the application.

---

## Project Structure

```
sudo-me/
├── src/                    # Frontend source code
│   ├── app/               # Next.js App Router pages
│   ├── components/        # React components
│   ├── lib/               # Utilities and helpers
│   ├── hooks/             # Custom React hooks
│   ├── store/             # State management
│   └── types/             # TypeScript types
├── functions/              # Cloud Functions
│   └── src/               # Function source code
├── public/                 # Static assets
├── docs/                   # Documentation
└── firebase.json           # Firebase configuration
```

---

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Write code following the project's coding standards
- Add tests for new features
- Update documentation if needed

### 3. Test Locally

```bash
# Run linter
npm run lint

# Run type checker
npm run type-check

# Run tests
npm test
```

### 4. Commit Changes

```bash
git add .
git commit -m "feat: add your feature description"
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Create a Pull Request on GitHub.

---

## Key Concepts

### Phase System

The app operates in 3 phases based on days from `startDate`:
- **Phase 1 (Days 1-30):** Foundation
- **Phase 2 (Days 31-60):** Intensity
- **Phase 3 (Days 61-90):** Mastery

### Discipline Scoring

Daily discipline score (0-100%) calculated from:
- Wake time (40%)
- No phone first hour (25%)
- Cold shower (15%)
- Meditation (15%)
- Plan tomorrow (5%)

### Budget System

Monthly budget limits:
- Essentials: ₹30,000 (max)
- Wants: ₹10,000 (max)
- Investments: ₹20,000 (target)
- Savings: ₹20,000 (target)
- Goals: ₹15,000 (target)

---

## Common Tasks

### Adding a New API Endpoint

1. Create function in `functions/src/http/`
2. Export in `functions/src/index.ts`
3. Deploy: `firebase deploy --only functions`
4. Update API documentation

### Adding a New Component

1. Create component in `src/components/`
2. Add to component library documentation
3. Write tests
4. Update Storybook (if applicable)

### Adding a New Collection

1. Update Firestore schema documentation
2. Add security rules
3. Create indexes if needed
4. Update TypeScript types

---

## Troubleshooting

### Firebase Connection Issues

```bash
# Check Firebase login
firebase login:list

# Re-login if needed
firebase login
```

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Type Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## Next Steps

1. Read [Technical Specification](../reference/technical-specification.md)
2. Review [Database Schema](../database/schema.md)
3. Check [API Documentation](../api/api-design.md)
4. Explore [Architecture](../architecture/system-architecture.md)

---

## Getting Help

- **Documentation:** Check `docs/` directory
- **Issues:** Create GitHub issue
- **Questions:** Refer to relevant documentation section

---

**Happy Coding! 🚀**

