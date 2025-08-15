# CareNow Healthcare Appointment Management System

## 🌐 Application URL
**Live Demo:** https://6lwu7jajdn7t.space.minimax.io

## 📋 Project Overview
CareNow is a comprehensive healthcare appointment management system built with modern React and TypeScript. It features secure authentication, intuitive patient booking, and robust admin management capabilities.

## ✨ Key Features Implemented

### 🏥 Core Functionality
- **Dual User Roles**: Patient and Admin interfaces
- **Secure Authentication**: Register, login, and role-based access
- **Appointment Booking**: Patients can schedule appointments with available doctors
- **Admin Dashboard**: Review, accept, reject, and manage all appointments
- **Real-time Status Updates**: Track appointment status from pending to completion

### 🎨 Design & UX
- **Medical Theme**: Professional blue, white, and green color scheme
- **Responsive Design**: Mobile-friendly interface optimized for all devices
- **CareNow Branding**: Custom logo integration throughout the application
- **Intuitive Navigation**: Clean, accessible interface design
- **Status Indicators**: Clear visual feedback for appointment statuses

### 🔧 Technical Features
- **React 18** with TypeScript for type-safe development
- **Appwrite Backend** for authentication, database, and storage
- **Sentry Integration** for error monitoring and performance tracking
- **shadcn UI Components** for consistent, modern design system
- **Form Validation** with React Hook Form and comprehensive error handling
- **Professional Architecture** following modern React best practices

## 🚀 Technology Stack

### Frontend
- **React 18.3** + **TypeScript 5.6**
- **Vite 6.0** for fast development and optimized builds
- **Tailwind CSS** for styling with custom healthcare theme
- **shadcn UI** components for consistent design
- **React Hook Form** for form management and validation
- **React Router** for client-side navigation

### Backend & Services
- **Appwrite** for authentication, database, and backend services
- **Sentry** for error monitoring and performance tracking
- **TypeScript** for type-safe API interactions

## 🛠️ IMPORTANT: Appwrite Database Setup Required

**⚠️ CRITICAL SETUP STEP**: Before the application can function properly, you need to manually create the database and collections in your Appwrite Console.

### Database Configuration

1. **Create Database**:
   - Database ID: `carenow_db`
   - Name: `CareNow Database`

2. **Create Collections**:

#### Users Collection
- **Collection ID**: `users`
- **Attributes**:
  - `name` (String, size: 255, required)
  - `email` (Email, required)
  - `phone` (String, size: 20, required)
  - `role` (Enum: ['patient', 'admin'], required)

#### Doctors Collection
- **Collection ID**: `doctors`
- **Attributes**:
  - `name` (String, size: 255, required)
  - `specialty` (String, size: 255, required)
  - `available` (Boolean, required)
  - `email` (Email, optional)
  - `phone` (String, size: 20, optional)

#### Appointments Collection
- **Collection ID**: `appointments`
- **Attributes**:
  - `patientId` (String, size: 255, required)
  - `patientName` (String, size: 255, required)
  - `patientEmail` (Email, required)
  - `patientPhone` (String, size: 20, required)
  - `doctorId` (String, size: 255, required)
  - `doctorName` (String, size: 255, required)
  - `appointmentDate` (String, size: 50, required)
  - `appointmentTime` (String, size: 50, required)
  - `reason` (String, size: 1000, required)
  - `status` (Enum: ['pending', 'accepted', 'rejected', 'completed'], required)
  - `notes` (String, size: 1000, optional)

### Sample Data Setup

After creating the collections, add sample doctors to the `doctors` collection:

```json
[
  {
    "name": "Sarah Johnson",
    "specialty": "Family Medicine",
    "available": true
  },
  {
    "name": "Michael Chen",
    "specialty": "Cardiology",
    "available": true
  },
  {
    "name": "Emily Rodriguez",
    "specialty": "Pediatrics",
    "available": true
  },
  {
    "name": "David Thompson",
    "specialty": "Orthopedics",
    "available": true
  },
  {
    "name": "Lisa Park",
    "specialty": "Dermatology",
    "available": true
  },
  {
    "name": "Robert Wilson",
    "specialty": "Internal Medicine",
    "available": true
  }
]
```

## 👥 Demo Accounts

For testing purposes, you can create these demo accounts:

### Patient Account
- **Email**: `patient@carenow.com`
- **Password**: `password123`
- **Role**: Patient
- **Name**: John Smith
- **Phone**: +1-555-0123

### Admin Account
- **Email**: `admin@carenow.com`
- **Password**: `password123`
- **Role**: Admin
- **Name**: Dr. Administrator
- **Phone**: +1-555-0199

## 🎯 User Journey

### For Patients
1. **Register/Login** with patient role
2. **Browse Available Doctors** by specialty
3. **Book Appointments** by selecting doctor, date, time, and reason
4. **Track Status** of booked appointments
5. **View History** of all appointments

### For Admins
1. **Login** with admin credentials
2. **View Dashboard** with appointment statistics
3. **Review Appointments** with patient details
4. **Accept/Reject** pending appointments
5. **Add Notes** and manage appointment workflow
6. **Mark Completed** appointments

## 🔐 Security Features

- **Role-based Access Control**: Separate patient and admin interfaces
- **Secure Authentication**: Appwrite-powered login system
- **Input Validation**: Comprehensive form validation on frontend and backend
- **Error Monitoring**: Sentry integration for security incident tracking
- **Type Safety**: TypeScript ensures type-safe data handling

## 📱 Responsive Design

- **Mobile-First**: Optimized for smartphones and tablets
- **Desktop-Friendly**: Full-featured desktop experience
- **Touch-Friendly**: Large tap targets and intuitive gestures
- **Accessibility**: WCAG-compliant design patterns

## 🚀 Next Steps

1. **Complete Appwrite Setup** following the database configuration guide above
2. **Test User Flows** with both patient and admin accounts
3. **Customize Branding** if needed (colors, logo, etc.)
4. **Production Deployment** with your own domain and SSL
5. **User Training** for healthcare staff

## 🆘 Support

If you encounter any issues:
1. Verify Appwrite database setup is complete
2. Check browser console for error messages
3. Ensure all required fields are filled in forms
4. Verify user roles are correctly assigned

---

**Built with ❤️ for modern healthcare management**

*This application represents a production-ready healthcare appointment management system with enterprise-level security and user experience.*