import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { databases, DATABASE_ID, APPOINTMENTS_COLLECTION_ID, DOCTORS_COLLECTION_ID, ID, Query, Appointment, Doctor } from '@/lib/appwrite';
import { MOCK_DOCTORS } from '@/lib/sampleData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useForm } from 'react-hook-form';
import { formatDateTime } from '@/lib/utils';
import * as Sentry from '@sentry/react';
import { CalendarIcon, ClockIcon, PersonIcon } from '@radix-ui/react-icons';

interface AppointmentFormData {
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  reason: string;
}

export function PatientDashboard() {
  const { user, logout, databaseReady } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<AppointmentFormData>();

  useEffect(() => {
    loadDoctors();
    loadAppointments();
  }, [databaseReady]);

  const loadDoctors = async () => {
    try {
      if (!databaseReady) {
        // Use mock data when database isn't ready
        setDoctors(MOCK_DOCTORS as unknown as Doctor[]);
        return;
      }
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        DOCTORS_COLLECTION_ID,
        [Query.equal('available', true)]
      );
      setDoctors(response.documents as unknown as Doctor[]);
    } catch (error: any) {
      console.error('Failed to load doctors:', error);
      if (error.message?.includes('Database not found') || error.message?.includes('Collection not found')) {
        // Fallback to mock data
        setDoctors(MOCK_DOCTORS as unknown as Doctor[]);
        setError('Database not configured. Using sample data for demonstration.');
      } else {
        setError('Failed to load doctors. Please refresh and try again.');
      }
      Sentry.captureException(error);
    }
  };

  const loadAppointments = async () => {
    try {
      if (!databaseReady) {
        // Show empty appointments when database isn't ready
        setAppointments([]);
        return;
      }
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        APPOINTMENTS_COLLECTION_ID,
        [
          Query.equal('patientId', user?.$id || ''),
          Query.orderDesc('$createdAt')
        ]
      );
      setAppointments(response.documents as unknown as Appointment[]);
    } catch (error: any) {
      console.error('Failed to load appointments:', error);
      if (error.message?.includes('Database not found') || error.message?.includes('Collection not found')) {
        // Show empty when database isn't ready
        setAppointments([]);
      } else {
        setError('Failed to load appointments.');
      }
      Sentry.captureException(error);
    }
  };

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      setError('');
      setSuccess('');
      setIsLoading(true);
      
      if (!databaseReady) {
        setError('Database not configured. Appointments cannot be saved at this time.');
        return;
      }
      
      const selectedDoctor = doctors.find(doc => doc.$id === data.doctorId);
      if (!selectedDoctor) {
        setError('Please select a valid doctor');
        return;
      }

      const appointmentDateTime = new Date(`${data.appointmentDate}T${data.appointmentTime}`);
      if (appointmentDateTime <= new Date()) {
        setError('Please select a future date and time');
        return;
      }

      await databases.createDocument(
        DATABASE_ID,
        APPOINTMENTS_COLLECTION_ID,
        ID.unique(),
        {
          patientId: user?.$id,
          patientName: user?.name,
          patientEmail: user?.email,
          patientPhone: user?.phone || '',
          doctorId: data.doctorId,
          doctorName: selectedDoctor.name,
          appointmentDate: data.appointmentDate,
          appointmentTime: data.appointmentTime,
          reason: data.reason,
          status: 'pending'
        }
      );
      
      setSuccess('Appointment booked successfully! We will contact you soon.');
      reset();
      loadAppointments();
    } catch (err: any) {
      console.error('Booking error:', err);
      setError(err.message || 'Failed to book appointment. Please try again.');
      Sentry.captureException(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/carenow_logo.png" alt="CareNow" className="h-8 w-auto" />
              <span className="ml-2 text-xl font-bold text-gray-900">CareNow</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name}</span>
              <Button variant="outline" onClick={logout}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!databaseReady && (
          <Alert className="mb-6 border-orange-200 bg-orange-50 text-orange-800">
            <AlertDescription>
              <strong>Setup Required:</strong> The Appwrite database is not configured. Please set up the database and collections in your Appwrite Console to enable full functionality.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Book Appointment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5 text-blue-600" />
                Book New Appointment
              </CardTitle>
              <CardDescription>Schedule your appointment with our healthcare professionals</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {success && (
                  <Alert className="border-green-200 bg-green-50 text-green-800">
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="doctorId" required>Select Doctor</Label>
                  <select
                    id="doctorId"
                    {...register('doctorId', { required: 'Please select a doctor' })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Choose a doctor...</option>
                    {doctors.map(doctor => (
                      <option key={doctor.$id} value={doctor.$id}>
                        Dr. {doctor.name} - {doctor.specialty}
                      </option>
                    ))}
                  </select>
                  {errors.doctorId && (
                    <p className="text-sm text-red-600">{errors.doctorId.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="appointmentDate" required>Date</Label>
                    <Input
                      id="appointmentDate"
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      {...register('appointmentDate', { required: 'Date is required' })}
                    />
                    {errors.appointmentDate && (
                      <p className="text-sm text-red-600">{errors.appointmentDate.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="appointmentTime" required>Time</Label>
                    <Input
                      id="appointmentTime"
                      type="time"
                      {...register('appointmentTime', { required: 'Time is required' })}
                    />
                    {errors.appointmentTime && (
                      <p className="text-sm text-red-600">{errors.appointmentTime.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason" required>Reason for Visit</Label>
                  <Textarea
                    id="reason"
                    placeholder="Please describe your symptoms or reason for the appointment..."
                    {...register('reason', { 
                      required: 'Reason is required',
                      minLength: {
                        value: 10,
                        message: 'Please provide more details (at least 10 characters)'
                      }
                    })}
                  />
                  {errors.reason && (
                    <p className="text-sm text-red-600">{errors.reason.message}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || !databaseReady}
                >
                  {isLoading ? 'Booking...' : databaseReady ? 'Book Appointment' : 'Database Setup Required'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* My Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ClockIcon className="mr-2 h-5 w-5 text-green-600" />
                My Appointments
              </CardTitle>
              <CardDescription>View your scheduled and past appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {!databaseReady ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Database setup required to view appointments</p>
                  </div>
                ) : appointments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No appointments found</p>
                ) : (
                  appointments.map(appointment => (
                    <div key={appointment.$id} className="border rounded-lg p-4 bg-white">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <PersonIcon className="mr-2 h-4 w-4 text-gray-400" />
                          <span className="font-medium">Dr. {appointment.doctorName}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formatDateTime(`${appointment.appointmentDate}T${appointment.appointmentTime}`)}
                        </div>
                        <p className="mt-2">
                          <strong>Reason:</strong> {appointment.reason}
                        </p>
                        {appointment.notes && (
                          <p className="mt-2">
                            <strong>Notes:</strong> {appointment.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}