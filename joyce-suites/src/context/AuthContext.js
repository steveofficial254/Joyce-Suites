import React, { createContext, useState, useContext, useEffect } from 'react';
import apiService from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Storage keys
  const STORAGE_KEYS = {
    USER: 'joyce-suites-user',
    TOKEN: 'joyce-suites-token'
  };

  useEffect(() => {
    // Check for stored authentication on app start
    const initializeAuth = async () => {
      try {
        const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
        const savedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);

        if (savedUser && savedToken) {
          const userData = JSON.parse(savedUser);
          
          // Verify token is still valid by making a profile request
          try {
            const profile = await apiService.auth.getProfile();
            setUser({ ...userData, ...profile });
          } catch (error) {
            // Token is invalid, clear storage
            console.error('Token validation failed:', error);
            logout();
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setError('');
    setLoading(true);

    try {
      const response = await apiService.auth.login(email, password);
      
      if (response.success) {
        const userData = {
          ...response.user,
          loginTime: new Date().toISOString()
        };

        setUser(userData);
        
        // Store user data and token
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
        if (response.token) {
          localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
        }
        
        return { success: true, user: userData };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (err) {
      const errorMessage = err.message || 'An error occurred during login';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    setError('');
    setLoading(true);

    try {
      const response = await apiService.auth.signup(userData);
      
      if (response.success) {
        const newUser = {
          ...response.user,
          loginTime: new Date().toISOString()
        };

        setUser(newUser);
        
        // Store user data and token
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
        if (response.token) {
          localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
        }
        
        return { success: true, user: newUser };
      } else {
        throw new Error(response.message || 'Signup failed');
      }
    } catch (err) {
      const errorMessage = err.message || 'An error occurred during signup';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint if available
      await apiService.auth.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear local state regardless of API call success
      setUser(null);
      setError('');
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
    }
  };

  const updateProfile = async (updatedData) => {
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      const response = await apiService.auth.updateProfile(updatedData);
      
      if (response.success) {
        const updatedUser = { ...user, ...response.user };
        setUser(updatedUser);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
        return { success: true, user: updatedUser };
      } else {
        throw new Error(response.message || 'Profile update failed');
      }
    } catch (err) {
      const errorMessage = err.message || 'An error occurred while updating profile';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const refreshUser = async () => {
    if (!user) return;

    try {
      const profile = await apiService.auth.getProfile();
      const updatedUser = { ...user, ...profile };
      setUser(updatedUser);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error refreshing user data:', error);
      // If refresh fails, log user out
      logout();
    }
  };

  const clearError = () => setError('');

  // Helper functions for role-based access
  const isTenant = () => user?.role === 'tenant';
  const isCaretaker = () => user?.role === 'caretaker';
  const isAdmin = () => user?.role === 'admin';

  const value = {
    user,
    login,
    signup,
    logout,
    updateProfile,
    refreshUser,
    loading,
    error,
    clearError,
    isTenant: isTenant(),
    isCaretaker: isCaretaker(),
    isAdmin: isAdmin(),
    hasRole: (role) => user?.role === role,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;