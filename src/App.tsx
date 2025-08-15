import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Login } from '@/components/Login';
import { Register } from '@/components/Register';
import { PatientDashboard } from '@/components/PatientDashboard';
import { AdminDashboard } from '@/components/AdminDashboard';
import './App.css';

function AuthWrapper() {
  const { user, loading, databaseReady } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <img src="/carenow_logo.png" alt="CareNow" className="h-16 mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Initializing CareNow</h2>
          <p className="text-gray-600 mb-4">Setting up your healthcare appointment system...</p>
          
          <div className="max-w-sm mx-auto space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <div className={`w-3 h-3 rounded-full mr-3 ${databaseReady ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></div>
              Database: {databaseReady ? 'Ready' : 'Initializing...'}
            </div>
          </div>
          
          <div className="mt-6 text-xs text-gray-500">
            This may take a moment on first run while we set up the database.
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    if (showRegister) {
      return <Register onSwitchToLogin={() => setShowRegister(false)} />;
    } else {
      return <Login onSwitchToRegister={() => setShowRegister(true)} />;
    }
  }

  // Route based on user role
  if (user.role === 'admin') {
    return <AdminDashboard />;
  } else {
    return <PatientDashboard />;
  }
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AuthWrapper />
      </AuthProvider>
    </Router>
  );
}

export default App;