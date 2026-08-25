import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check session storage first for demo user state
    const demoUser = sessionStorage.getItem('nyayamitra_demo_user');
    if (demoUser) {
      try {
        setCurrentUser(JSON.parse(demoUser));
        setLoading(false);
      } catch (e) {
        console.warn('Invalid session user');
      }
    }

    // Firebase built-in auth state observer
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const createMockUser = (email, name = null) => {
    const displayName = name || (email ? email.split('@')[0] : 'Aarav Sharma');
    const mockUser = {
      uid: `user-${Date.now()}`,
      email: email || 'citizen.nyayamitra@gov.in',
      displayName: displayName.charAt(0).toUpperCase() + displayName.slice(1),
      photoURL: null,
      getIdToken: async () => 'demo-firebase-id-token-xyz'
    };
    sessionStorage.setItem('nyayamitra_demo_user', JSON.stringify(mockUser));
    setCurrentUser(mockUser);
    return mockUser;
  };

  const loginWithEmail = async (email, password) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      return res.user;
    } catch (err) {
      console.warn('Firebase Auth falling back to demo mode:', err.message);
      // Fallback for hackathon demo mode regardless of Firebase API key status
      return createMockUser(email);
    }
  };

  const signupWithEmail = async (email, password, name) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      if (name && res.user) {
        await updateProfile(res.user, { displayName: name });
      }
      return res.user;
    } catch (err) {
      console.warn('Firebase Signup falling back to demo mode:', err.message);
      return createMockUser(email, name);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      return res.user;
    } catch (err) {
      console.warn('Google Auth falling back to demo mode:', err.message);
      return createMockUser('citizen.india@gmail.com', 'Aarav Sharma');
    }
  };

  const loginDemoUser = () => {
    return createMockUser('citizen.demo@nyayamitra.gov.in', 'Rajesh Kumar (Citizen)');
  };

  const logout = async () => {
    sessionStorage.removeItem('nyayamitra_demo_user');
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Signout note:', err.message);
    }
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    loginWithEmail,
    signupWithEmail,
    loginWithGoogle,
    loginDemoUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
