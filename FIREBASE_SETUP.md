# Firebase Setup Guide for Hospital Management System

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `hospital-management-system`
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Firestore Database

1. In your Firebase project, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location close to your users
5. Click "Done"

## Step 3: Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and select Web (</>) icon
4. Register your app with a nickname
5. Copy the Firebase configuration object

## Step 4: Update Firebase Config

Replace the placeholder values in `src/config/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id"
};
```

## Step 5: Set Up Firestore Security Rules

In Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to patients collection
    match /patients/{document} {
      allow read, write: if true; // For development only
    }
    
    // Allow read/write access to users collection
    match /users/{document} {
      allow read, write: if true; // For development only
    }
  }
}
```

**⚠️ Important:** These rules allow public access. For production, implement proper authentication and authorization.

## Step 6: Test the Integration

1. Start your React app: `npm start`
2. Open browser console to check for Firebase connection
3. Try adding a patient - it should sync to Firestore
4. Check Firebase Console → Firestore Database to see your data

## Step 7: Production Security Rules (Optional)

For production, update Firestore rules with proper authentication:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /patients/{document} {
      allow read, write: if request.auth != null;
    }
    
    match /users/{document} {
      allow read, write: if request.auth != null && 
        request.auth.token.admin == true;
    }
  }
}
```

## Features You'll Get:

✅ **Real-time synchronization** - Changes appear instantly across all devices
✅ **Offline support** - App works offline and syncs when online
✅ **Scalable database** - Handles thousands of patients
✅ **Automatic backups** - Firebase handles data backup
✅ **Multi-user support** - Multiple users can work simultaneously

## Troubleshooting:

- **Connection issues**: Check your Firebase config values
- **Permission denied**: Verify Firestore security rules
- **Data not syncing**: Check browser console for errors
- **Offline mode**: App falls back to localStorage if Firebase fails

## Next Steps:

1. Set up Firebase Authentication for secure user login
2. Implement proper security rules
3. Add data validation and error handling
4. Set up Firebase Hosting for deployment

