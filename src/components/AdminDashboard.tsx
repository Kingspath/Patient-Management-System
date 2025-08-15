import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { databases, DATABASE_ID, APPOINTMENTS_COLLECTION_ID, Query, Appointment } from '@/lib/appwrite';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatDateTime } from '@/lib/utils';
import * as Sentry from '@sentry/react';
import { CalendarIcon, CheckIcon, Cross1Icon, PersonIcon, MobileIcon, EnvelopeClosedIcon } from '@radix-ui/react-icons';

export function AdminDashboard() {
  const { user, logout, databaseReady } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [notes, setNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadAppointments();
  }, [filterStatus, databaseReady]);

  const loadAppointments = async () => {
    try {
      if (!databaseReady) {
        // Show empty appointments when database isn't ready
        setAppointments([]);
        return;
      }
      
      const queries = [Query.orderDesc('$createdAt')];
      
      if (filterStatus !== 'all') {
        queries.push(Query.equal('status', filterStatus));
      }
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        APPOINTMENTS_COLLECTION_ID,
        queries
      );
      setAppointments(response.documents as unknown as Appointment[]);
    } catch (error: any) {
      console.error('Failed to load appointments:', error);
      if (error.message?.includes('Database not found') || error.message?.includes('Collection not found')) {
        // Show empty when database isn't ready
        setAppointments([]);
        setError('Database not configured. Please set up the required collections.');
      } else {
        setError('Failed to load appointments.');
      }
      Sentry.captureException(error);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, status: string, notes?: string) => {
    try {
      setError('');
      setSuccess('');
      setIsLoading(true);
      
      if (!databaseReady) {
        setError('Database not configured. Cannot update appointments at this time.');
        return;
      }
      
      const updateData: any = { status };
      if (notes) {
        updateData.notes = notes;
      }
      
      await databases.updateDocument(
        DATABASE_ID,
        APPOINTMENTS_COLLECTION_ID,
        appointmentId,
        updateData
      );
      
      setSuccess(`Appointment ${status} successfully!`);
      setSelectedAppointment(null);
      setNotes('');
      loadAppointments();
    } catch (err: any) {
      console.error('Update error:', err);
      setError(err.message || 'Failed to update appointment.');
      Sentry.captureException(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusStats = () => {
    const stats = appointments.reduce((acc, apt) => {
      acc[apt.status] = (acc[apt.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total: appointments.length,
      pending: stats.pending || 0,
      accepted: stats.accepted || 0,
      rejected: stats.rejected || 0,
      completed: stats.completed || 0
    };
  };

  const stats = getStatusStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/carenow_logo.png" alt="CareNow" className="h-8 w-auto" />
              <span className="ml-2 text-xl font-bold text-gray-900">CareNow Admin</span>
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
              <strong>Setup Required:</strong> The Appwrite database is not configured. Please set up the database and collections in your Appwrite Console to enable appointment management.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
                <div className="text-sm text-gray-600">Accepted</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                <div className="text-sm text-gray-600">Rejected</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Appointments List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center">
                      <CalendarIcon className="mr-2 h-5 w-5 text-blue-600" />
                      Appointments Management
                    </CardTitle>
                    <CardDescription>Review and manage patient appointments</CardDescription>
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                    disabled={!databaseReady}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {!databaseReady ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Database setup required to view appointments</p>
                      <p className="text-sm text-gray-400 mt-2">Please configure the Appwrite database and collections</p>
                    </div>
                  ) : appointments.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No appointments found</p>
                  ) : (
                    appointments.map(appointment => (
                      <div 
                        key={appointment.$id} 
                        className={`border rounded-lg p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                          selectedAppointment?.$id === appointment.$id ? 'border-blue-500 bg-blue-50' : 'bg-white'
                        }`}
                        onClick={() => setSelectedAppointment(appointment)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <PersonIcon className="mr-2 h-4 w-4 text-gray-400" />
                            <span className="font-medium">{appointment.patientName}</span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formatDateTime(`${appointment.appointmentDate}T${appointment.appointmentTime}`)}
                          </div>
                          <div className="flex items-center">
                            <PersonIcon className="mr-2 h-4 w-4" />
                            Dr. {appointment.doctorName}
                          </div>
                          <p className="mt-2 truncate">
                            <strong>Reason:</strong> {appointment.reason}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Appointment Details & Actions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Appointment Details</CardTitle>
                <CardDescription>
                  {selectedAppointment ? 'Review and take action' : 'Select an appointment to view details'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {success && (
                  <Alert className="border-green-200 bg-green-50 text-green-800 mb-4">
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                {selectedAppointment ? (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Patient Information</Label>
                        <div className="mt-1 space-y-1 text-sm">
                          <div className="flex items-center">
                            <PersonIcon className="mr-2 h-4 w-4 text-gray-400" />
                            {selectedAppointment.patientName}
                          </div>
                          <div className="flex items-center">
                            <EnvelopeClosedIcon className="mr-2 h-4 w-4 text-gray-400" />
                            {selectedAppointment.patientEmail}
                          </div>
                          <div className="flex items-center">
                            <MobileIcon className="mr-2 h-4 w-4 text-gray-400" />
                            {selectedAppointment.patientPhone}
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Appointment Details</Label>
                        <div className="mt-1 space-y-1 text-sm">
                          <div className="flex items-center">
                            <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
                            {formatDateTime(`${selectedAppointment.appointmentDate}T${selectedAppointment.appointmentTime}`)}
                          </div>
                          <div className="flex items-center">
                            <PersonIcon className="mr-2 h-4 w-4 text-gray-400" />
                            Dr. {selectedAppointment.doctorName}
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Reason for Visit</Label>
                        <p className="mt-1 text-sm text-gray-600">{selectedAppointment.reason}</p>
                      </div>

                      {selectedAppointment.notes && (
                        <div>
                          <Label className="text-sm font-medium">Notes</Label>
                          <p className="mt-1 text-sm text-gray-600">{selectedAppointment.notes}</p>
                        </div>
                      )}

                      <div>
                        <Label className="text-sm font-medium">Current Status</Label>
                        <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedAppointment.status)}`}>
                          {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    {!databaseReady ? (
                      <div className="pt-4 border-t">
                        <p className="text-sm text-gray-500">Database setup required to manage appointments</p>
                      </div>
                    ) : selectedAppointment.status === 'pending' ? (
                      <div className="space-y-4 pt-4 border-t">
                        <div>
                          <Label htmlFor="notes">Add Notes (Optional)</Label>
                          <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add any notes for this appointment..."
                            className="mt-1"
                          />
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => updateAppointmentStatus(selectedAppointment.$id, 'accepted', notes)}
                            disabled={isLoading}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <CheckIcon className="mr-1 h-4 w-4" />
                            Accept
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => updateAppointmentStatus(selectedAppointment.$id, 'rejected', notes)}
                            disabled={isLoading}
                            className="flex-1"
                          >
                            <Cross1Icon className="mr-1 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ) : selectedAppointment.status === 'accepted' ? (
                      <div className="space-y-4 pt-4 border-t">
                        <div>
                          <Label htmlFor="notes">Add Notes (Optional)</Label>
                          <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add completion notes..."
                            className="mt-1"
                          />
                        </div>
                        
                        <Button
                          onClick={() => updateAppointmentStatus(selectedAppointment.$id, 'completed', notes)}
                          disabled={isLoading}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          Mark as Completed
                        </Button>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Select an appointment to view details and take actions</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}