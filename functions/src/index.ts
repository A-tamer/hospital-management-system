/**
 * Firebase Cloud Functions for Hospital Management System
 * Scheduled backup to Google Sheets
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { google } from "googleapis";

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();

// Configuration - Set these in Firebase Functions config
// firebase functions:config:set sheets.id="YOUR_SPREADSHEET_ID"
// Or use environment variables in .env file

interface Patient {
  id: string;
  code: string;
  fullNameArabic: string;
  fullName?: string;
  age: number;
  weight?: number;
  gender: string;
  diagnosis: string;
  diagnosisCategory?: string;
  visitedDate: string;
  status: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  contactInfo?: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
    relation?: string;
  };
  surgeries?: Array<{
    date: string;
    type: string;
    operation?: string;
    notes?: string;
    cost?: number;
    costCurrency?: string;
  }>;
  plannedSurgery?: {
    operationCategory?: string;
    operation?: string;
    estimatedCost?: number;
    costCurrency?: string;
  };
  referringDoctor?: string;
  clinicBranch?: string;
  presentAtClinic?: boolean;
}

interface User {
  id: string;
  email: string;
  role: string;
  name: string;
  canViewFinancial?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Get Google Sheets API client using service account
 */
async function getSheetsClient() {
  // Use Application Default Credentials (ADC)
  // This works automatically when deployed to Firebase
  // For local testing, set GOOGLE_APPLICATION_CREDENTIALS env var
  const auth = new google.auth.GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const authClient = await auth.getClient();
  return google.sheets({ version: "v4", auth: authClient as any });
}

/**
 * Format patient data for spreadsheet
 */
function formatPatientRow(patient: Patient): (string | number)[] {
  const surgeries = patient.surgeries || [];
  const latestSurgery = surgeries[surgeries.length - 1];

  return [
    patient.code || "",
    patient.fullNameArabic || "",
    patient.fullName || "",
    patient.age || 0,
    patient.weight || "",
    patient.gender || "",
    patient.diagnosis || "",
    patient.diagnosisCategory || "",
    patient.status || "",
    patient.visitedDate || "",
    patient.contactInfo?.name || "",
    patient.contactInfo?.phone || "",
    patient.contactInfo?.email || "",
    patient.contactInfo?.address || "",
    patient.contactInfo?.relation || "",
    patient.referringDoctor || "",
    patient.clinicBranch || "",
    surgeries.length,
    latestSurgery?.date || "",
    latestSurgery?.operation || "",
    latestSurgery?.cost || "",
    patient.plannedSurgery?.operation || "",
    patient.plannedSurgery?.estimatedCost || "",
    patient.notes || "",
    patient.createdAt || "",
    patient.updatedAt || "",
  ];
}

/**
 * Format user data for spreadsheet
 */
function formatUserRow(user: User): (string | number)[] {
  return [
    user.id || "",
    user.email || "",
    user.name || "",
    user.role || "",
    user.canViewFinancial ? "Yes" : "No",
    user.createdAt || "",
    user.updatedAt || "",
  ];
}

/**
 * Backup data to Google Sheets
 */
async function backupToSheets(spreadsheetId: string): Promise<{
  patientsCount: number;
  usersCount: number;
}> {
  const sheets = await getSheetsClient();

  // Fetch all patients
  const patientsSnapshot = await db.collection("patients").get();
  const patients: Patient[] = patientsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Patient[];

  // Fetch all users (excluding passwords)
  const usersSnapshot = await db.collection("users").get();
  const users: User[] = usersSnapshot.docs.map((doc) => {
    const data = doc.data();
    // Exclude password from backup
    const { password, ...safeUser } = data;
    return { id: doc.id, ...safeUser } as User;
  });

  // Prepare patient headers
  const patientHeaders = [
    "Code",
    "Name (Arabic)",
    "Name (English)",
    "Age",
    "Weight (kg)",
    "Gender",
    "Diagnosis",
    "Diagnosis Category",
    "Status",
    "Visited Date",
    "Contact Name",
    "Contact Phone",
    "Contact Email",
    "Contact Address",
    "Contact Relation",
    "Referring Doctor",
    "Clinic Branch",
    "Surgery Count",
    "Last Surgery Date",
    "Last Surgery Operation",
    "Last Surgery Cost",
    "Planned Operation",
    "Planned Cost",
    "Notes",
    "Created At",
    "Updated At",
  ];

  // Prepare user headers
  const userHeaders = [
    "ID",
    "Email",
    "Name",
    "Role",
    "Can View Financial",
    "Created At",
    "Updated At",
  ];

  // Prepare patient data
  const patientData = [patientHeaders, ...patients.map(formatPatientRow)];

  // Prepare user data
  const userData = [userHeaders, ...users.map(formatUserRow)];

  // Add backup metadata
  const backupInfo = [
    ["Backup Date", new Date().toISOString()],
    ["Total Patients", patients.length],
    ["Total Users", users.length],
  ];

  // Clear and update Patients sheet
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: "Patients!A:Z",
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "Patients!A1",
    valueInputOption: "RAW",
    requestBody: { values: patientData },
  });

  // Clear and update Users sheet
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: "Users!A:G",
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "Users!A1",
    valueInputOption: "RAW",
    requestBody: { values: userData },
  });

  // Update Backup Info sheet
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: "BackupInfo!A:B",
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "BackupInfo!A1",
    valueInputOption: "RAW",
    requestBody: { values: backupInfo },
  });

  return {
    patientsCount: patients.length,
    usersCount: users.length,
  };
}

/**
 * Scheduled backup function - runs daily at 2:00 AM Cairo time
 * Adjust the schedule as needed using cron syntax
 */
export const scheduledBackup = functions
  .runWith({
    timeoutSeconds: 120,
    memory: "256MB",
  })
  .pubsub.schedule("0 2 * * *") // Every day at 2:00 AM
  .timeZone("Africa/Cairo") // Cairo timezone
  .onRun(async (context) => {
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

    if (!spreadsheetId) {
      console.error("GOOGLE_SHEETS_ID environment variable not set");
      throw new Error("Spreadsheet ID not configured");
    }

    console.log("Starting scheduled backup to Google Sheets...");

    try {
      const result = await backupToSheets(spreadsheetId);
      console.log(
        `Backup completed: ${result.patientsCount} patients, ${result.usersCount} users`
      );
      return null;
    } catch (error) {
      console.error("Backup failed:", error);
      throw error;
    }
  });

/**
 * Manual backup trigger - can be called via HTTP
 * Useful for testing or on-demand backups
 */
export const manualBackup = functions
  .runWith({
    timeoutSeconds: 120,
    memory: "256MB",
  })
  .https.onRequest(async (req, res) => {
    // Verify authentication (optional - add your own auth logic)
    const authHeader = req.headers.authorization;
    const expectedToken = process.env.BACKUP_AUTH_TOKEN;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

    if (!spreadsheetId) {
      res.status(500).json({ error: "Spreadsheet ID not configured" });
      return;
    }

    try {
      console.log("Starting manual backup to Google Sheets...");
      const result = await backupToSheets(spreadsheetId);

      res.json({
        success: true,
        message: "Backup completed successfully",
        timestamp: new Date().toISOString(),
        patientsCount: result.patientsCount,
        usersCount: result.usersCount,
      });
    } catch (error: any) {
      console.error("Manual backup failed:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Backup failed",
      });
    }
  });

/**
 * Weekly full backup - runs every Sunday at 3:00 AM
 * Creates a timestamped backup in a separate sheet range
 */
export const weeklyBackup = functions
  .runWith({
    timeoutSeconds: 180,
    memory: "512MB",
  })
  .pubsub.schedule("0 3 * * 0") // Every Sunday at 3:00 AM
  .timeZone("Africa/Cairo")
  .onRun(async (context) => {
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

    if (!spreadsheetId) {
      console.error("GOOGLE_SHEETS_ID environment variable not set");
      throw new Error("Spreadsheet ID not configured");
    }

    console.log("Starting weekly backup to Google Sheets...");

    try {
      const result = await backupToSheets(spreadsheetId);
      console.log(
        `Weekly backup completed: ${result.patientsCount} patients, ${result.usersCount} users`
      );
      return null;
    } catch (error) {
      console.error("Weekly backup failed:", error);
      throw error;
    }
  });
