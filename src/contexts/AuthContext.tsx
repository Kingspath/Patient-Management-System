import React, { createContext, useContext, useEffect, useState } from 'react';
import { account, databases, DATABASE_ID, USERS_COLLECTION_ID, ID, User } from '@/lib/appwrite';
import { initializeDoctors } from '@/lib/sampleData';
import * as Sentry from '@sentry/react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isPatient: boolean;
  databaseReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [databaseReady, setDatabaseReady] = useState(false);

  useEffect(() => {
    checkUserSession();
    // Try to initialize sample data but don't fail if database isn't ready
    initializeDoctors().then(() => {
      setDatabaseReady(true);
    }).catch(() => {
      console.warn('Database not ready, operating in limited mode');
      setDatabaseReady(false);
    });
  }, []);

  const checkUserSession = async () => {
    try {
      const session = await account.get();
      if (session) {
        try {
          // Try to get user profile from our custom users collection
          const userProfile = await databases.getDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            session.$id
          );
          setUser(userProfile as unknown as User);
        } catch (profileError: any) {
          // If database isn't ready, create a basic user object from session
          if (profileError.message?.includes('Database not found') || profileError.message?.includes('Collection not found')) {
            console.warn('Database not ready, using session data only');
            const basicUser: User = {
              $id: session.$id,
              name: session.name,
              email: session.email,
              phone: '',
              role: 'patient', // Default role when database isn't available
              $createdAt: new Date().toISOString(),
              $updatedAt: new Date().toISOString(),
              $permissions: [],
              $collectionId: USERS_COLLECTION_ID,
              $databaseId: DATABASE_ID,
              $sequence: 0
            };
            setUser(basicUser);
          } else {
            throw profileError;
          }
        }
        
        // Set user context for Sentry
        Sentry.setUser({
          id: session.$id,
          email: session.email,
          username: session.name
        });
      }
    } catch (error) {
      console.log('No active session');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      await account.createEmailPasswordSession(email, password);
      await checkUserSession();
    } catch (error: any) {
      console.error('Login error:', error);
      Sentry.captureException(error);
      throw new Error(error.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, phone: string, role: string) => {
    try {
      setLoading(true);
      
      // Create account in Appwrite Auth
      const newAccount = await account.create(ID.unique(), email, password, name);
      
      // Try to create user profile in our custom collection
      try {
        const userProfile = await databases.createDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          newAccount.$id,
          {
            name,
            email,
            phone,
            role
          }
        );
        
        // Auto login after registration
        await account.createEmailPasswordSession(email, password);
        setUser(userProfile as unknown as User);
      } catch (dbError: any) {
        // If database isn't ready, still proceed with basic auth
        if (dbError.message?.includes('Database not found') || dbError.message?.includes('Collection not found')) {
          console.warn('Database not ready, creating basic user session');
          await account.createEmailPasswordSession(email, password);
          const basicUser: User = {
            $id: newAccount.$id,
            name,
            email,
            phone,
            role: role as 'patient' | 'admin',
            $createdAt: new Date().toISOString(),
            $updatedAt: new Date().toISOString(),
            $permissions: [],
            $collectionId: USERS_COLLECTION_ID,
            $databaseId: DATABASE_ID,
            $sequence: 0
          };
          setUser(basicUser);
        } else {
          throw dbError;
        }
      }
      
      // Set user context for Sentry
      Sentry.setUser({
        id: newAccount.$id,
        email: email,
        username: name
      });
      
    } catch (error: any) {
      console.error('Registration error:', error);
      Sentry.captureException(error);
      throw new Error(error.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
      Sentry.setUser(null);
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    }
  };

  const isAdmin = user?.role === 'admin';
  const isPatient = user?.role === 'patient';

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      isAdmin,
      isPatient,
      databaseReady
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}