# 🏥 Hospital Management System

A comprehensive, modern patient management system built with React, TypeScript, and Firebase. Perfect for internal hospital/clinic use.

## ✨ Features

- ✅ **Bilingual Support**: English and Arabic patient names with search
- ✅ **Diagnosis Hierarchy**: Organized diagnosis categories and subcategories
- ✅ **Patient Records**: Complete patient information management
- ✅ **Multiple Surgeries**: Track multiple surgeries per patient with surgeons and costs
- ✅ **Follow-ups**: Numbered follow-up system with dates and notes
- ✅ **File Management**: Organized file uploads (personal images, surgery images, radiology, lab reports)
- ✅ **Contact Information**: Unified contact system with address
- ✅ **Financial Tracking**: Surgery costs with multiple currency support
- ✅ **Modern UI**: Collapsible sections, animations, skeleton loading
- ✅ **Responsive Design**: Works on phones, tablets, laptops, and desktops
- ✅ **Status Management**: Diagnosed, Pre-op, Post-op status tracking

## 🚀 Quick Start

### Prerequisites

- Node.js 14+ and npm
- Firebase account (free tier is sufficient)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/hospital-management-system.git
   cd hospital-management-system
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Firebase**:
   - Follow the guide in `FIREBASE_SETUP_GUIDE.md`
   - Update `src/config/firebase.ts` with your Firebase config

4. **Run the development server**:
   ```bash
   npm start
   ```

5. **Open your browser**:
   - Navigate to `http://localhost:3000`
   - Login with: `doctor` / `password123`

## 📚 Documentation

- **[FIREBASE_SETUP_GUIDE.md](./FIREBASE_SETUP_GUIDE.md)** - Complete Firebase setup instructions
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Deploy to Vercel (free hosting)

## 🧪 Testing with Dummy Data

The app includes comprehensive dummy data with all features:

- 8 sample patients with:
  - Arabic and English names
  - Contact information
  - Multiple surgeries with surgeons
  - Follow-up records
  - File uploads (images, radiology, lab reports)
  - Financial information

**To test**: The dummy data is automatically available when you first run the app.

## 🎯 Usage

### Adding a Patient

1. Click **"Add Patient"** button
2. Fill in the form sections (all collapsible):
   - Basic Information (required)
   - Contact Information
   - Personal Image
   - Surgery Image
   - Radiology Files
   - Lab Files
   - Surgeries (with surgeons and costs)
   - Follow-ups
3. Click **"Add Patient"**

### Viewing Patient Details

1. Click on any patient name in the patients list
2. View complete patient record with all information
3. Click **"Edit Patient"** to modify

### Searching

- Search works with both English and Arabic names
- Filter by diagnosis, status, year, and month
- Sort by name, date, or status

## 🔐 Authentication

**Default Login**:
- Username: `doctor`
- Password: `password123`

**⚠️ Change this password for production use!**

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript
- **Styling**: CSS3 with animations
- **Backend**: Firebase (Firestore + Storage)
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)

## 📁 Project Structure

```
src/
├── components/       # React components
│   ├── PatientForm.tsx
│   ├── Navbar.tsx
│   ├── CollapsibleSection.tsx
│   └── SkeletonLoader.tsx
├── pages/           # Page components
│   ├── Patients.tsx
│   ├── PatientDetail.tsx
│   ├── Dashboard.tsx
│   └── Statistics.tsx
├── services/         # Firebase services
│   └── firebaseService.ts
├── context/         # State management
│   └── PatientContext.tsx
├── types/           # TypeScript types
│   └── index.ts
└── utils/            # Utilities
    ├── sampleData.ts
    ├── diagnosisData.ts
    └── pdfGenerator.ts
```

## 🚀 Deployment

### Deploy to Vercel (Recommended - Free)

1. Push code to GitHub
2. Import to Vercel
3. Deploy automatically

**See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.**

## 💰 Cost

**100% FREE for internal use:**
- Firebase Free Tier (more than enough)
- Vercel Free Tier (unlimited deployments)
- No credit card required

## 🔒 Security

- Firebase security rules configured
- Simple doctor authentication
- Private repository recommended

## 📝 License

Internal use only.

## 🆘 Support

For issues or questions:
1. Check Firebase setup guide
2. Check deployment guide
3. Review Firebase Console for errors

## 🎉 Features Overview

### Patient Management
- ✅ Add/Edit/Delete patients
- ✅ Search by name (English/Arabic)
- ✅ Filter by diagnosis, status, date
- ✅ View detailed patient records

### Medical Records
- ✅ Multiple surgeries per patient
- ✅ Multiple surgeons per surgery
- ✅ Follow-up tracking
- ✅ File organization (images, radiology, lab)

### Financial
- ✅ Surgery cost tracking
- ✅ Multiple currency support (USD, EUR, GBP, SAR, EGP)

### UI/UX
- ✅ Collapsible form sections
- ✅ Smooth animations
- ✅ Skeleton loading states
- ✅ Responsive design
- ✅ Modern, clean interface

---

**Built with ❤️ for efficient patient management**
