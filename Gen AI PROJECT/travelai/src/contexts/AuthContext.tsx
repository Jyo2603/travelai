import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { UserData, getCurrentUserData, signOutUser, deleteUserAccount } from '../services/authService';

interface AuthContextType {
  currentUser: UserData | null;
  loading: boolean;
  isAuthenticated: boolean;
  isFirstTimeLogin: boolean;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  setFirstTimeLogin: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  isAuthenticated: false,
  isFirstTimeLogin: false,
  logout: async () => {},
  deleteAccount: async () => {},
  setFirstTimeLogin: () => {}
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirstTimeLogin, setIsFirstTimeLogin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('AuthContext - onAuthStateChanged:', user ? 'User signed in' : 'User signed out');
      if (user) {
        // User is signed in
        try {
          let userData = await getCurrentUserData();
          console.log('AuthContext - userData from Firestore:', userData);
          
          // If no Firestore data, create from Firebase Auth user
          if (!userData) {
            let firstName = 'User';
            let lastName = '';
            let displayName = user.email?.split('@')[0] || 'User';
            
            if (user.displayName) {
              const nameParts = user.displayName.split(' ');
              firstName = nameParts[0] || 'User';
              lastName = nameParts.slice(1).join(' ') || '';
              displayName = user.displayName;
            }
            
            userData = {
              uid: user.uid,
              email: user.email || '',
              firstName: firstName,
              lastName: lastName,
              displayName: displayName,
              createdAt: new Date()
            };
            console.log('AuthContext - created fallback userData:', userData);
          }
          
          setCurrentUser(userData);
        } catch (error) {
          console.error('Error getting user data:', error);
          setCurrentUser(null);
        }
      } else {
        // User is signed out
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await signOutUser();
      setCurrentUser(null);
      setIsFirstTimeLogin(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const deleteAccount = async () => {
    try {
      await deleteUserAccount();
      setCurrentUser(null);
      setIsFirstTimeLogin(false);
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    isAuthenticated: !!currentUser,
    isFirstTimeLogin,
    logout,
    deleteAccount,
    setFirstTimeLogin: setIsFirstTimeLogin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
