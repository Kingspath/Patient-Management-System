import { databases, DATABASE_ID, DOCTORS_COLLECTION_ID, ID } from '@/lib/appwrite';
import * as Sentry from '@sentry/react';

// Sample doctors data
const SAMPLE_DOCTORS = [
  {
    name: 'Sarah Johnson',
    specialty: 'Family Medicine',
    available: true
  },
  {
    name: 'Michael Chen',
    specialty: 'Cardiology',
    available: true
  },
  {
    name: 'Emily Rodriguez',
    specialty: 'Pediatrics',
    available: true
  },
  {
    name: 'David Thompson',
    specialty: 'Orthopedics',
    available: true
  },
  {
    name: 'Lisa Park',
    specialty: 'Dermatology',
    available: true
  },
  {
    name: 'Robert Wilson',
    specialty: 'Internal Medicine',
    available: true
  }
];

export async function initializeDoctors() {
  try {
    // Check if doctors already exist
    const existingDoctors = await databases.listDocuments(
      DATABASE_ID,
      DOCTORS_COLLECTION_ID
    );
    
    if (existingDoctors.documents.length === 0) {
      console.log('Initializing sample doctors...');
      
      for (const doctor of SAMPLE_DOCTORS) {
        await databases.createDocument(
          DATABASE_ID,
          DOCTORS_COLLECTION_ID,
          ID.unique(),
          doctor
        );
      }
      
      console.log('Sample doctors initialized successfully');
    }
  } catch (error: any) {
    // Handle database not found error gracefully
    if (error.message?.includes('Database not found') || error.message?.includes('Collection not found')) {
      console.warn('Database or collections not yet set up. Please configure Appwrite database in console.');
      console.warn('Required setup:');
      console.warn('1. Create database with ID:', DATABASE_ID);
      console.warn('2. Create collections: users, doctors, appointments');
      console.warn('3. Configure proper permissions for each collection');
    } else {
      console.error('Failed to initialize doctors:', error);
      Sentry.captureException(error);
    }
  }
}

// Demo accounts information
export const DEMO_ACCOUNTS = {
  patient: {
    email: 'patient@carenow.com',
    password: 'password123',
    name: 'John Smith',
    phone: '+1-555-0123',
    role: 'patient'
  },
  admin: {
    email: 'admin@carenow.com',
    password: 'password123',
    name: 'Dr. Administrator',
    phone: '+1-555-0199',
    role: 'admin'
  }
};

// Mock doctors data for when database is not available
export const MOCK_DOCTORS = SAMPLE_DOCTORS.map((doctor, index) => ({
  $id: `mock_doctor_${index}`,
  ...doctor,
  $createdAt: new Date().toISOString(),
  $updatedAt: new Date().toISOString(),
  $permissions: [],
  $collectionId: DOCTORS_COLLECTION_ID,
  $databaseId: DATABASE_ID
}));