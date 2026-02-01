# Google Sheets Scheduled Backup Setup Guide

This guide will help you set up automated daily backups of your hospital data to Google Sheets.

## Overview

The backup system includes:
- **Daily backup** at 2:00 AM Cairo time
- **Weekly backup** every Sunday at 3:00 AM
- **Manual backup** endpoint for on-demand backups

---

## Prerequisites

1. Firebase project on **Blaze plan** (pay-as-you-go) - required for scheduled functions
2. Google Cloud project with Sheets API enabled
3. A Google Spreadsheet to store backups

---

## Step-by-Step Setup

### Step 1: Create Google Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet named "Hospital Backup"
3. Create 3 sheets (tabs) with exact names:
   - `Patients`
   - `Users`
   - `BackupInfo`
4. Copy the Spreadsheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
   ```

### Step 2: Enable Google Sheets API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your Firebase project (hospital-management-syst-dc6d6)
3. Go to **APIs & Services** → **Enable APIs and Services**
4. Search for "Google Sheets API" and **Enable** it

### Step 3: Set Up Service Account Permissions

The Firebase service account needs access to your spreadsheet:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **IAM & Admin** → **Service Accounts**
3. Find the service account: `hospital-management-syst-dc6d6@appspot.gserviceaccount.com`
4. Copy this email address
5. Open your Google Spreadsheet
6. Click **Share** button
7. Add the service account email with **Editor** access
8. Uncheck "Notify people" and click **Share**

### Step 4: Install Firebase CLI (if not installed)

```bash
npm install -g firebase-tools
firebase login
```

### Step 5: Set Up Functions

```bash
# Navigate to project root
cd /Users/ahmedwafa/hospital-management-system

# Install function dependencies
cd functions
npm install

# Build TypeScript
npm run build

# Go back to project root
cd ..
```

### Step 6: Configure Environment Variables

#### Option A: Using Firebase Secrets (Recommended for production)

```bash
# Set the spreadsheet ID
firebase functions:secrets:set GOOGLE_SHEETS_ID

# Optionally set auth token for manual backup endpoint
firebase functions:secrets:set BACKUP_AUTH_TOKEN
```

#### Option B: Using .env file (for testing)

```bash
cd functions
cp .env.example .env
# Edit .env and add your spreadsheet ID
```

### Step 7: Deploy Functions

```bash
# From project root
firebase deploy --only functions
```

---

## Testing

### Test Manual Backup

After deployment, you can trigger a manual backup:

```bash
# Get your function URL from deployment output
curl -X POST https://us-central1-hospital-management-syst-dc6d6.cloudfunctions.net/manualBackup \
  -H "Authorization: Bearer YOUR_BACKUP_AUTH_TOKEN"
```

Or visit the URL in your browser (if no auth token is set).

### Check Logs

```bash
firebase functions:log
```

---

## Backup Schedule

| Backup Type | Schedule | Time (Cairo) |
|-------------|----------|--------------|
| Daily | Every day | 2:00 AM |
| Weekly | Every Sunday | 3:00 AM |

### Modify Schedule

Edit `functions/src/index.ts` and change the cron expression:

```typescript
// Daily at 2 AM
.pubsub.schedule("0 2 * * *")

// Every 6 hours
.pubsub.schedule("0 */6 * * *")

// Every Monday and Thursday at 3 AM
.pubsub.schedule("0 3 * * 1,4")
```

---

## Spreadsheet Structure

### Patients Sheet
| Column | Description |
|--------|-------------|
| Code | Patient code |
| Name (Arabic) | Arabic name |
| Name (English) | English name |
| Age | Patient age |
| Weight (kg) | Weight |
| Gender | Male/Female |
| Diagnosis | Diagnosis |
| ... | (and more) |

### Users Sheet
| Column | Description |
|--------|-------------|
| ID | User ID |
| Email | Email address |
| Name | Display name |
| Role | admin/doctor/user |
| Can View Financial | Yes/No |

### BackupInfo Sheet
| Field | Value |
|-------|-------|
| Backup Date | ISO timestamp |
| Total Patients | Count |
| Total Users | Count |

---

## Costs

Firebase Cloud Functions pricing (Blaze plan):
- First 2 million invocations/month: **Free**
- Cloud Functions compute: ~$0.0000025/GB-second

For daily backups, expect **< $1/month** typically.

---

## Troubleshooting

### "Permission denied" error
- Verify the service account email is added to the spreadsheet
- Ensure Google Sheets API is enabled

### "Spreadsheet ID not configured" error
- Set the GOOGLE_SHEETS_ID environment variable
- Redeploy functions after setting

### Backup not running
- Check Firebase Functions logs: `firebase functions:log`
- Verify you're on Blaze plan (required for scheduled functions)

### Sheets not found error
- Make sure sheet tabs are named exactly: `Patients`, `Users`, `BackupInfo`

---

## Security Notes

1. **Sensitive Data**: The backup excludes user passwords
2. **Service Account**: Only has access to the specific spreadsheet you share
3. **Auth Token**: Use BACKUP_AUTH_TOKEN to protect manual backup endpoint
4. **Access Control**: Limit who can access the backup spreadsheet

---

## Quick Commands Reference

```bash
# Deploy functions
firebase deploy --only functions

# View logs
firebase functions:log

# Test locally (optional)
cd functions
npm run serve

# Update environment variables
firebase functions:secrets:set GOOGLE_SHEETS_ID
```

---

## Need Help?

- [Firebase Functions Docs](https://firebase.google.com/docs/functions)
- [Google Sheets API Docs](https://developers.google.com/sheets/api)
- [Firebase Pricing](https://firebase.google.com/pricing)
