# 🔥 Firebase Setup Guide - Free Tier

This guide will help you set up Firebase for **FREE** with generous limits perfect for internal use.

## 📊 Firebase Free Tier Limits (Spark Plan)

- **Firestore Database**: 1 GB storage, 50K reads/day, 20K writes/day
- **Storage**: 5 GB storage, 1 GB downloads/day
- **Authentication**: Unlimited
- **Hosting**: 10 GB storage, 360 MB/day transfer

**These limits are MORE than enough for internal patient management!**

## 🚀 Step-by-Step Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `hospital-management-system` (or your preferred name)
4. **Disable Google Analytics** (to keep it simple and free)
5. Click **"Create project"**

### 2. Enable Required Services

#### Enable Firestore Database

1. In Firebase Console, click **"Firestore Database"** in left menu
2. Click **"Create database"**
3. Select **"Start in test mode"** (we'll secure it later)
4. Choose a location (closest to you, e.g., `us-central1`)
5. Click **"Enable"**

#### Enable Storage

1. Click **"Storage"** in left menu
2. Click **"Get started"**
3. Select **"Start in test mode"**
4. Click **"Next"** → **"Done"**

#### Enable Authentication (Optional - we use simple login)

1. Click **"Authentication"** in left menu
2. Click **"Get started"**
3. You can skip this since we use simple doctor login

### 3. Get Your Firebase Configuration

1. Click the **⚙️ gear icon** next to "Project Overview"
2. Select **"Project settings"**
3. Scroll down to **"Your apps"** section
4. Click the **Web icon** (`</>`)
5. Register app with nickname: `Hospital Management Web`
6. **Copy the `firebaseConfig` object**

### 4. Update Your Firebase Config

1. Open `src/config/firebase.ts`
2. Replace the config object with your copied config:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID" // Optional
};
```

### 5. Set Up Security Rules

#### Firestore Security Rules

1. Go to **Firestore Database** → **Rules** tab
2. Replace with these rules (allows read/write for development):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write for patients
    match /patients/{document=**} {
      allow read, write: if true;
    }
    
    // Allow read/write for users
    match /users/{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. Click **"Publish"**

#### Storage Security Rules

1. Go to **Storage** → **Rules** tab
2. Replace with these rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow read/write access to all files in the patients directory
    match /patients/{patientCode}/{allPaths=**} {
      allow read, write: if true;
    }
    
    // Default: deny all other access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

3. Click **"Publish"**

### 6. Test Your Setup

1. Run your app: `npm start`
2. Try adding a patient
3. Check Firebase Console → Firestore Database to see if data appears
4. Try uploading a file and check Storage

## 🔒 Security Note

The rules above allow **unrestricted access**. For production:
- Add authentication checks
- Limit access by user roles
- Add validation rules

For **internal use only**, these rules are fine.

## 💰 Cost Monitoring

Firebase will **NOT charge you** unless you exceed free tier limits. You can:

1. Set up billing alerts: **Project Settings** → **Usage and billing** → **Set budget alerts**
2. Monitor usage in Firebase Console dashboard
3. For internal use, you'll likely stay well within free limits

## ✅ Verification Checklist

- [ ] Firebase project created
- [ ] Firestore Database enabled
- [ ] Storage enabled
- [ ] Config updated in `src/config/firebase.ts`
- [ ] Firestore rules published
- [ ] Storage rules published
- [ ] Tested adding a patient
- [ ] Tested file upload

## 🆘 Troubleshooting

**Error: "Permission denied"**
- Check that security rules are published
- Verify rules allow read/write

**Error: "Storage quota exceeded"**
- Check Storage usage in Firebase Console
- Delete old files if needed
- Free tier: 5 GB total

**Error: "Firestore quota exceeded"**
- Check Firestore usage
- Free tier: 1 GB storage, 50K reads/day

## 📚 Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Pricing](https://firebase.google.com/pricing)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

---

**You're all set!** Your Firebase backend is ready for internal use. 🎉

