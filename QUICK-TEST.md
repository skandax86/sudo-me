# Quick Test Guide

**Fastest way to test the MVP**

---

## ⚡ Quick Start (5 minutes)

### Step 1: Firebase Setup

1. **Create Firebase Project:**
   - Visit: https://console.firebase.google.com
   - Click "Add project"
   - Name it (e.g., "sudo-me-test")
   - Continue → Continue → Create project

2. **Enable Authentication:**
   - Left menu → Authentication → Get started
   - Enable "Email/Password" → Save

3. **Create Firestore:**
   - Left menu → Firestore Database → Create database
   - Start in **test mode** (for development)
   - Choose location → Enable

4. **Get Config:**
   - Project Settings (gear icon) → General
   - Scroll to "Your apps" → Click Web icon (</>)
   - Register app → Copy config

5. **Create `.env.local`:**
   ```bash
   # In project root
   cat > .env.local << 'EOF'
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   EOF
   ```

6. **Set Security Rules:**
   - Firestore Database → Rules tab
   - Paste:
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

### Step 2: Run Application

```bash
# Install dependencies (if not done)
npm install

# Start dev server
npm run dev
```

### Step 3: Test in Browser

1. Open: `http://localhost:3000`
2. Click "Sign Up"
3. Create account (email + password)
4. You'll be redirected to dashboard
5. Test features:
   - Click "Log Today" → Fill form → Save
   - Click "Finance" → Add transaction
   - Click "Goals" → Create goal
   - Check dashboard stats update

---

## ✅ What to Test

### Must Test:
- [ ] Sign up works
- [ ] Login works
- [ ] Dashboard loads
- [ ] Daily log saves
- [ ] Finance transaction adds
- [ ] Goal creates
- [ ] Real-time updates work

### Nice to Test:
- [ ] Weekly scorecard generates
- [ ] Portfolio calculates
- [ ] LLM coaching tips (if API key set)

---

## 🐛 Troubleshooting

**Error: "Firebase: Error (auth/configuration-not-found)"**
→ Check `.env.local` exists and has correct values

**Error: "Permission denied"**
→ Check Firestore security rules are published

**Error: "Module not found"**
→ Run `npm install`

**Build fails**
→ Check all env variables in `.env.local`

---

## 📊 Test Results

After testing, note:
- ✅ What works
- ⚠️ Issues found
- 💡 Suggestions

---

**Ready!** Run `npm run dev` and start testing.




