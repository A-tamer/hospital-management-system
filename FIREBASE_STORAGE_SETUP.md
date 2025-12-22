# 🔥 Firebase Storage Setup Guide

This guide will help you enable and configure Firebase Storage for file uploads in your hospital management system.

> **📚 For a complete integration guide with testing, troubleshooting, and production setup, see [FIREBASE_STORAGE_INTEGRATION_GUIDE.md](./FIREBASE_STORAGE_INTEGRATION_GUIDE.md)**

## ✅ Step 1: Enable Billing (Required for Storage)

**Important:** Firebase Storage requires the Blaze (pay-as-you-go) plan, but you still get a generous free tier!

1. **Go to Firebase Console**
   - Visit [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Select your project: `hospital-management-syst-dc6d6`

2. **Enable Billing**
   - Click the **⚙️ gear icon** next to "Project Overview"
   - Select **"Usage and billing"**
   - Click **"Modify plan"** or **"Upgrade"**
   - Select **"Blaze plan"** (Pay as you go)
   - Click **"Continue"**
   - Add a payment method (credit card required, but you won't be charged unless you exceed free tier)
   - Complete the billing setup

**Don't worry!** The Blaze plan includes:
- **5 GB Storage** - FREE
- **1 GB downloads/day** - FREE
- You only pay if you exceed these limits (unlikely for internal use)

## ✅ Step 2: Enable Firebase Storage in Console

1. **Go to Storage**
   - Click **"Storage"** in the left sidebar
   - You should now see the Storage setup screen (not the upgrade message)

2. **Initial Setup**
   - Click **"Get started"** button
   - Select **"Start in test mode"** (we'll secure it later)
   - Choose a storage location (same as Firestore, e.g., `us-central1`)
   - Click **"Done"**

## ✅ Step 3: Configure Storage Security Rules

1. **Go to Storage Rules**
   - In Firebase Console → **Storage** → Click **"Rules"** tab

2. **Update Rules**
   - Replace the rules with this code:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow read/write access to patient files
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

3. **Publish Rules**
   - Click **"Publish"** button

## ✅ Step 4: Verify Storage is Linked in Your Project

Your project already has Storage initialized! Check `src/config/firebase.ts`:

```typescript
import { getStorage } from "firebase/storage";

// Storage is already initialized
const storage = getStorage(app);

export { app, db, analytics, storage };
```

✅ **Storage is already linked!** The code is ready to use.

## ✅ Step 5: Test File Upload

1. **Run your app**
   ```bash
   npm start
   ```

2. **Test Upload**
   - Go to Patients page
   - Add or edit a patient
   - Try uploading:
     - Personal photo
     - Surgery image
     - Radiology files
     - Lab files

3. **Verify in Console**
   - Go to Firebase Console → **Storage**
   - You should see files in `patients/{patientCode}/` folders

## 📁 File Structure in Storage

Files are organized like this:
```
patients/
  ├── 2024/11/0001/
  │   ├── personalImage/
  │   │   └── [timestamp]-image.jpg
  │   ├── surgeryImage/
  │   │   └── [timestamp]-surgery.jpg
  │   ├── radiology/
  │   │   ├── [timestamp]-scan1.pdf
  │   │   └── [timestamp]-scan2.pdf
  │   └── lab/
  │       └── [timestamp]-results.pdf
  └── 2024/11/0002/
      └── ...
```

## 🔒 Security Rules Explained

**Current Rules (Test Mode):**
- ✅ Allows all read/write to `patients/{patientCode}/**`
- ❌ Denies all other paths
- ⚠️ **For development/internal use only**

**For Production (Recommended):**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Only authenticated users can upload
    match /patients/{patientCode}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null 
                   && request.resource.size < 10 * 1024 * 1024; // 10MB limit
    }
  }
}
```

## 💾 Storage Limits (Free Tier on Blaze Plan)

Even with billing enabled, you get these FREE limits:
- **Total Storage**: 5 GB (FREE)
- **Downloads**: 1 GB/day (FREE)
- **Uploads**: Unlimited (within storage limit)
- **Operations**: 50K/day (FREE)

**You only pay if you exceed these limits:**
- Storage: $0.026/GB/month after 5 GB
- Downloads: $0.12/GB after 1 GB/day

**For internal hospital use, 5 GB is usually sufficient and you'll stay FREE!**

**Cost Protection:** You can set a budget alert to get notified if usage increases.

## 🛠️ Troubleshooting

### Error: "Upgrade project" message
- **Solution**: You need to enable billing first (see Step 1)
- Storage requires Blaze plan, but free tier still applies
- Add payment method (won't be charged unless you exceed free limits)

### Error: "Storage quota exceeded"
- **Solution**: Check Storage usage in Firebase Console
- Delete old/unused files if needed
- Free tier: 5 GB total

### Error: "Permission denied"
- **Solution**: 
  1. Check Storage rules are published
  2. Verify rules allow read/write
  3. Check file path matches rule pattern

### Error: "File too large"
- **Solution**: 
  - Current limit: ~10MB per file (default)
  - For larger files, increase limit in rules or compress files

### Files not uploading
- **Check**:
  1. Storage is enabled in Firebase Console
  2. Rules are published
  3. Network connection
  4. Browser console for errors

## 📊 Monitor Storage Usage

1. Go to Firebase Console → **Storage**
2. View:
   - Total storage used
   - Files count
   - Download bandwidth
3. Set up alerts:
   - **Project Settings** → **Usage and billing** → **Set budget alerts**

## ✅ Verification Checklist

- [ ] **Billing enabled (Blaze plan)** ⚠️ REQUIRED FIRST
- [ ] Storage enabled in Firebase Console
- [ ] Storage rules published
- [ ] Storage initialized in `src/config/firebase.ts` ✅ (Already done)
- [ ] Tested file upload
- [ ] Files visible in Storage console
- [ ] Files display correctly in app

## 🎉 You're All Set!

Your Firebase Storage is now:
- ✅ Enabled
- ✅ Linked to your project
- ✅ Ready for file uploads

The app will automatically:
- Upload files when adding/editing patients
- Store files in organized folders
- Display files in patient details
- Handle file downloads

---

**Need Help?** Check the main [FIREBASE_SETUP_GUIDE.md](./FIREBASE_SETUP_GUIDE.md) for general Firebase setup.

