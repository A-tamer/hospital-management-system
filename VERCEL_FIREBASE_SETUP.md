# Vercel + Firebase Setup Guide

## 🎯 Your Vercel Domain

**Production URL:** https://hospital-management-system-paa8q8w5o-ahmed-wafas-projects.vercel.app/

---

## ✅ Step 1: Whitelist Vercel Domain in Firebase

Firebase needs to know which domains are allowed to use your Firebase project.

### 1. Go to Firebase Console

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select project: **hospital-management-syst-dc6d6**

### 2. Add Authorized Domains

1. Click **Authentication** in the left sidebar
2. Go to **Settings** tab at the top
3. Scroll down to **Authorized domains** section
4. Click **Add domain** button
5. Add these domains:
   ```
   hospital-management-system-paa8q8w5o-ahmed-wafas-projects.vercel.app
   hospital-management-system-git-main-ahmed-wafas-projects.vercel.app
   *.vercel.app
   ```
6. Click **Add**

**Why:** Firebase Auth will only work on domains you've authorized. Vercel gives you multiple preview URLs, so we need to whitelist them all.

---

## ✅ Step 2: Deploy Security Rules (CRITICAL!)

Your Vercel site will show "Permission Denied" errors until you deploy the Firestore rules!

### Deploy Firestore Rules

1. Still in Firebase Console
2. Click **Firestore Database** → **Rules** tab
3. Copy ALL contents from [`firestore.rules`](firestore.rules) in your project
4. Paste into Firebase Console editor
5. Click **Publish**
6. Verify "Last updated: just now"

### Deploy Storage Rules

1. Click **Storage** → **Rules** tab
2. Copy ALL contents from [`storage.rules`](storage.rules)
3. Paste into Firebase Console
4. Click **Publish**

### Enable Authentication

1. Click **Authentication** → **Get Started** (if needed)
2. Go to **Sign-in method** tab
3. Enable **Email/Password**
4. Click **Save**

---

## ✅ Step 3: Create Admin User

### In Firebase Console

1. Go to **Authentication** → **Users** tab
2. Click **Add user**
3. Enter:
   - Email: `your@email.com`
   - Password: `your-secure-password`
4. Copy the **User UID** (looks like: `a1b2c3d4e5f6...`)

### In Firestore Database

1. Go to **Firestore Database**
2. Click on **users** collection
3. Click **Add document**
4. Set **Document ID** to the User UID you copied above
5. Add these fields:
   ```
   name: "Your Name" (string)
   email: "your@email.com" (string)
   password: "" (string - leave empty)
   role: "admin" (string)
   canViewFinancial: true (boolean)
   createdAt: (timestamp - now)
   updatedAt: (timestamp - now)
   ```
6. Click **Save**

---

## ✅ Step 4: Verify Vercel Build

### Check Build Status

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Find your project: **hospital-management-system**
3. Check the **Deployments** tab
4. Latest deployment should show: ✅ **Ready**

If build failed:
- Click on the failed deployment
- Check the **Build Logs**
- Look for error messages
- The build should now succeed after our fixes!

---

## ✅ Step 5: Test Your Vercel Site

1. Go to: https://hospital-management-system-paa8q8w5o-ahmed-wafas-projects.vercel.app/
2. You should see the login page
3. Try to login with the credentials you created
4. **Expected:** Login succeeds, patients page loads
5. **If permission error:** Rules not deployed yet - go back to Step 2

---

## 🔍 Troubleshooting Vercel Build

### Build Failed with "Command failed: npm run build"

**Cause:** TypeScript errors or dependency issues

**Solution:**
1. Check Vercel build logs for specific error
2. Make sure all dependencies are in `package.json`
3. Try building locally: `npm run build`
4. Fix any errors, commit, push

### Build Succeeds but Site Shows Blank Page

**Cause:** Routing issue or build output directory wrong

**Solution:**
- Added `vercel.json` with correct configuration
- Vercel should use `build/` directory
- All routes redirect to `index.html` for React Router

### Build Succeeds but Firebase Errors

**Cause:** Security rules not deployed or domain not authorized

**Solution:**
1. Deploy Firestore rules (Step 2)
2. Deploy Storage rules (Step 2)
3. Add Vercel domain to authorized domains (Step 1)

---

## 📊 Vercel Environment Variables (Optional)

If you want to use environment variables instead of hardcoded Firebase config:

### In Vercel Dashboard

1. Go to your project settings
2. Click **Environment Variables**
3. Add these:
   ```
   REACT_APP_FIREBASE_API_KEY=AIzaSyA3q3uB7hanQ3kv1HMEE-9EWI5-OSQNd9Y
   REACT_APP_FIREBASE_AUTH_DOMAIN=hospital-management-syst-dc6d6.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=hospital-management-syst-dc6d6
   REACT_APP_FIREBASE_STORAGE_BUCKET=hospital-management-syst-dc6d6.firebasestorage.app
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=465273771737
   REACT_APP_FIREBASE_APP_ID=1:465273771737:web:d4f1ea728f3266512e10c8
   REACT_APP_FIREBASE_MEASUREMENT_ID=G-FQ2PBSPSEF
   ```
4. Click **Save**
5. Redeploy your site

**Note:** Not required right now since config is hardcoded in `firebase.ts`.

---

## 🎯 Final Checklist

After completing all steps:

- [ ] ✅ Vercel domain added to Firebase authorized domains
- [ ] ✅ Firestore rules deployed (check "Last updated" timestamp)
- [ ] ✅ Storage rules deployed
- [ ] ✅ Firebase Authentication enabled (Email/Password)
- [ ] ✅ Admin user created in Authentication
- [ ] ✅ Matching user document created in Firestore users collection
- [ ] ✅ Vercel build succeeded (green checkmark)
- [ ] ✅ Can access https://hospital-management-system-paa8q8w5o-ahmed-wafas-projects.vercel.app/
- [ ] ✅ Can login with admin credentials
- [ ] ✅ Patients page loads without errors
- [ ] ✅ No "Permission Denied" errors in browser console

---

## 🚀 Auto-Deploy from GitHub

**Good news:** Vercel automatically deploys when you push to GitHub!

Every time you `git push origin main`:
1. Vercel detects the change
2. Builds your app
3. Deploys to your domain
4. Takes about 2-3 minutes

**But remember:** Firebase rules must be deployed manually in Firebase Console!

---

## 📱 Multiple Vercel URLs

Vercel gives you several URLs:

1. **Production:** `hospital-management-system-paa8q8w5o-ahmed-wafas-projects.vercel.app`
2. **Git Branch:** `hospital-management-system-git-main-ahmed-wafas-projects.vercel.app`
3. **Preview URLs:** For each deployment

**Important:** Add all these to Firebase authorized domains, or use wildcard: `*.vercel.app`

---

## 🆘 Still Having Issues?

### Check These:

1. **Vercel build logs:** Look for specific error messages
2. **Firebase Console → Authentication → Authorized domains:** Is Vercel domain listed?
3. **Firebase Console → Firestore → Rules:** Are new rules published? Check timestamp.
4. **Browser Console (F12):** What errors show when you try to login?

### Common Errors:

**"auth/unauthorized-domain"**
→ Add Vercel domain to Firebase authorized domains (Step 1)

**"permission-denied"**
→ Deploy Firestore rules (Step 2)

**"User data not found"**
→ Create user document in Firestore with matching UID (Step 3)

---

## ✅ Success Looks Like This

When everything is set up correctly:

1. ✅ Go to Vercel URL
2. ✅ See login page
3. ✅ Login with credentials
4. ✅ Redirected to patients page
5. ✅ No errors in console
6. ✅ Can create/edit patients
7. ✅ Everything works!

🎉 Your hospital management system is now live on Vercel!
