# Testing Guide

**Personal Development System - Testing Instructions**

---

## 🚀 Quick Test Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Firebase (Required for Testing)

1. **Create Firebase Project:**
   - Go to https://console.firebase.google.com
   - Click "Add project"
   - Name: `sudo-me` (or your choice)
   - Enable Google Analytics (optional)

2. **Enable Authentication:**
   - Go to Authentication → Sign-in method
   - Enable "Email/Password"
   - Save

3. **Create Firestore Database:**
   - Go to Firestore Database
   - Click "Create database"
   - Start in **test mode** (for development)
   - Choose location (closest to you)

4. **Get Firebase Config:**
   - Go to Project Settings → General
   - Scroll to "Your apps"
   - Click Web icon (</>)
   - Copy the config values

5. **Create `.env.local` file:**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Fill in your Firebase config:
   ```bash
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

6. **Set Firestore Security Rules:**
   - Go to Firestore Database → Rules
   - Replace with:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```
   - Click "Publish"

### 3. (Optional) Set Up LLM for Coaching Tips

Get Gemini API key:
- Visit: https://aistudio.google.com/apikey
- Sign in with Google
- Create API key
- Add to `.env.local`:
  ```bash
  GEMINI_API_KEY=your_gemini_key_here
  ```

---

## 🧪 Running Tests

### Development Server

```bash
npm run dev
```

Visit: `http://localhost:3000`

### Type Check

```bash
npm run type-check
```

### Lint

```bash
npm run lint
```

### Build

```bash
npm run build
```

### Production Build Test

```bash
npm run build
npm run start
```

---

## ✅ Test Checklist

### Authentication
- [ ] Sign up with new account
- [ ] Login with existing account
- [ ] Logout works
- [ ] Protected routes redirect to login

### Dashboard
- [ ] Day X/90 counter displays correctly
- [ ] Phase indicator shows correct phase
- [ ] Progress bar updates
- [ ] Real-time stats update (after logging data)
- [ ] Navigation links work

### Daily Log
- [ ] Form submits successfully
- [ ] All fields save correctly
- [ ] Discipline score calculates
- [ ] Date-based document ID created
- [ ] Validation errors show for invalid input

### Finance
- [ ] Add transaction works
- [ ] Budget health indicator updates
- [ ] Monthly spending calculates correctly
- [ ] Transaction list shows in real-time
- [ ] Validation works (amount, category, etc.)

### Goals
- [ ] Create goal works
- [ ] Goals display correctly
- [ ] Timeframe colors show correctly
- [ ] Real-time updates work
- [ ] Validation works

### Weekly Scorecard
- [ ] Scorecard generates correctly
- [ ] All metrics calculate properly
- [ ] Total score displays
- [ ] Week date range shows correctly

### Investment Portfolio
- [ ] Portfolio calculates from transactions
- [ ] 30/40/30 allocation works
- [ ] Progress toward ₹5L shows
- [ ] Real-time updates work

---

## 🐛 Common Issues

### Issue: "Firebase: Error (auth/configuration-not-found)"
**Solution:** Check `.env.local` file exists and has correct Firebase config

### Issue: "Permission denied" in Firestore
**Solution:** Check Firestore security rules are set correctly

### Issue: "Module not found" errors
**Solution:** Run `npm install` again

### Issue: TypeScript errors
**Solution:** Run `npm run type-check` to see specific errors

### Issue: Build fails
**Solution:** Check all environment variables are set in `.env.local`

---

## 📊 Test Results

After testing, document:
- ✅ What works
- ⚠️ What needs fixes
- ❌ What's broken

---

**Ready to test!** Start with `npm run dev` and follow the checklist above.




