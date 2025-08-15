import { Client, Account, Databases, ID, Query, Models } from 'appwrite';

// Appwrite configuration
export const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('67fa6adc0026e143b28f');

export const account = new Account(client);
export const databases = new Databases(client);

// Database and Collection IDs - Using project ID as default database
export const DATABASE_ID = '67fa6adc0026e143b28f';
export const USERS_COLLECTION_ID = 'users';
export const DOCTORS_COLLECTION_ID = 'doctors';
export const APPOINTMENTS_COLLECTION_ID = 'appointments';

// Export ID and Query for convenience
export { ID, Query };

// Type definitions - making Document fields optional for easier usage
export interface User {
  $id: string;
  name: string;
  email: string;
  phone: string;
  role: 'patient' | 'admin';
  $createdAt?: string;
  $updatedAt?: string;
  $permissions?: string[];
  $collectionId?: string;
  $databaseId?: string;
  $sequence?: number;
}

export interface Doctor {
  $id: string;
  name: string;
  specialty: string;
  available: boolean;
  email?: string;
  phone?: string;
  $createdAt?: string;
  $updatedAt?: string;
  $permissions?: string[];
  $collectionId?: string;
  $databaseId?: string;
  $sequence?: number;
}

export interface Appointment {
  $id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  reason: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  notes?: string;
  $createdAt?: string;
  $updatedAt?: string;
  $permissions?: string[];
  $collectionId?: string;
  $databaseId?: string;
  $sequence?: number;
}

// User roles
export const USER_ROLES = {
  PATIENT: 'patient',
  ADMIN: 'admin'
} as const;

// Appointment statuses
export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  COMPLETED: 'completed'
} as const;

export default client;