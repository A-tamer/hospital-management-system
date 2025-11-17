# Fixing "Failed to add patient" Error

## Quick Fix: Update Firestore Security Rules

The error "Failed to add patient" is most commonly caused by Firestore security rules blocking write operations.

### Steps to Fix:

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your project: `hospital-management-syst-dc6d6`

2. **Navigate to Firestore Database → Rules**

3. **Update the Rules** with the following:

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

4. **Click "Publish"** to save the rules

5. **Wait 1-2 minutes** for the rules to propagate

6. **Try adding a patient again** in your application

### Important Security Note:
These rules allow **anyone** to read and write data. This is **ONLY for development/testing**. 

For production, implement proper authentication:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /patients/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    match /users/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.token.role == 'admin';
    }
  }
}
```

### How to Check the Error in Browser Console:

1. Open the browser (http://localhost:3000)
2. Press F12 to open Developer Tools
3. Go to the "Console" tab
4. Try adding a patient
5. Look for the error message (should show the actual Firebase error)
6. Common errors:
   - `permission-denied` → Update security rules (see above)
   - `missing-required-field` → Check patient data structure
   - `network-error` → Check internet connection

### Alternative: Check If Firestore Database Exists

1. Go to Firebase Console → Firestore Database
2. If you see "Get started" or "Create database", click it
3. Choose "Start in test mode"
4. Select a location close to your users
5. Click "Done"

### Verify Firebase Connection:

Open browser console and check for these messages:
- Should see: "Attempting to add patient: {...}"
- Should NOT see: "Firebase connection failed"
- Should NOT see: "permission-denied"

If you still see errors after updating the rules, check the browser console for the exact error message.

