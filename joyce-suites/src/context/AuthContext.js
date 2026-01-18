import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { jwtDecode } from "jwt-decode";
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

  // Use refs to track state without causing re-renders
  const userRef = useRef(null);
  const initializedRef = useRef(false);

  // Storage keys
  const STORAGE_KEYS = {
    USER: 'joyce-suites-user',
    TOKEN: 'joyce-suites-token',
    ROLE: 'joyce-suites-role'
  };

  // Stable callback for login
  const login = useCallback(async (email, password) => {
    setError('');
    setLoading(true);

    try {
      console.log('🔐 Attempting login for:', email);
      const response = await apiService.auth.login(email, password);

      if (response.success) {
        const userData = {
          ...response.user,
          loginTime: new Date().toISOString()
        };

        console.log('✅ Login successful:', userData.email);
        setUser(userData);
        userRef.current = userData;

        // Store user data, token, and role
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
        if (response.token) {
          localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
          console.log('💾 Token stored');
        }
        if (userData.role) {
          localStorage.setItem(STORAGE_KEYS.ROLE, userData.role);
        }

        return { success: true, user: userData };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (err) {
      const errorMessage = err.message || 'An error occurred during login';
      console.error('❌ Login error:', errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Stable callback for signup
  const signup = useCallback(async (userData) => {
    setError('');
    setLoading(true);

    try {
      console.log('📝 Attempting signup for:', userData.email);
      const response = await apiService.auth.signup(userData);

      if (response.success) {
        const newUser = {
          ...response.user,
          loginTime: new Date().toISOString()
        };

        console.log('✅ Signup successful:', newUser.email);
        setUser(newUser);
        userRef.current = newUser;

        // Store user data and token
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
        if (response.token) {
          localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
        }
        if (newUser.role) {
          localStorage.setItem(STORAGE_KEYS.ROLE, newUser.role);
        }

        return { success: true, user: newUser };
      } else {
        throw new Error(response.message || 'Signup failed');
      }
    } catch (err) {
      const errorMessage = err.message || 'An error occurred during signup';
      console.error('❌ Signup error:', errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Stable callback for logout
  const logout = useCallback(async () => {
    console.log('🚪 Logging out...');

    // Clear local state immediately
    setUser(null);
    userRef.current = null;
    setError('');

    // Clear local storage
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.ROLE);

    console.log('🗑️ Local auth data cleared');

    // Try to call logout endpoint (don't block on this)
    try {
      await apiService.auth.logout();
      console.log('✅ Logout endpoint called successfully');
    } catch (error) {
      console.warn('⚠️ Logout endpoint unreachable:', error.message);
    }
  }, []);

  // Stable callback for updateProfile
  const updateProfile = useCallback(async (updatedData) => {
    if (!userRef.current) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      console.log('🔄 Updating profile...');
      const response = await apiService.auth.updateProfile(updatedData);

      if (response.success) {
        const updatedUser = { ...userRef.current, ...response.user };
        setUser(updatedUser);
        userRef.current = updatedUser;
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
        if (updatedUser.role) {
          localStorage.setItem(STORAGE_KEYS.ROLE, updatedUser.role);
        }
        console.log('✅ Profile updated');
        return { success: true, user: updatedUser };
      } else {
        throw new Error(response.message || 'Profile update failed');
      }
    } catch (err) {
      const errorMessage = err.message || 'An error occurred while updating profile';
      console.error('❌ Profile update error:', errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Stable callback for refreshUser
  const refreshUser = useCallback(async () => {
    if (!userRef.current) return;

    try {
      console.log('🔄 Refreshing user data...');
      const profile = await apiService.auth.getProfile();
      const updatedUser = { ...userRef.current, ...profile };
      setUser(updatedUser);
      userRef.current = updatedUser;
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      console.log('✅ User data refreshed');
    } catch (error) {
      console.error('❌ Error refreshing user data:', error);
      // Don't log out on refresh failure
    }
  }, []);

  const clearError = useCallback(() => setError(''), []);

  // Initialize auth - runs only once
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initializeAuth = () => {
      try {
        const savedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);

        if (savedToken) {
          try {
            const decodedNode = jwtDecode(savedToken);
            const currentTime = Date.now() / 1000;

            if (decodedNode.exp < currentTime) {
              console.log('⚠️ Token expired');
              localStorage.removeItem(STORAGE_KEYS.TOKEN);
              localStorage.removeItem(STORAGE_KEYS.USER);
              localStorage.removeItem(STORAGE_KEYS.ROLE);
              setUser(null);
            } else {
              // Use decoded token for instant user state
              const userData = {
                user_id: decodedNode.user_id,
                email: decodedNode.email,
                full_name: decodedNode.full_name,
                role: decodedNode.role,
                photo_path: decodedNode.photo_path,
                room_number: decodedNode.room_number,
                is_active: decodedNode.is_active
              };

              console.log('✅ Fast Auth Restore from Token:', userData.email);
              setUser(userData);
              userRef.current = userData;
            }

          } catch (decodeError) {
            console.error('❌ Error decoding token:', decodeError);
            localStorage.removeItem(STORAGE_KEYS.TOKEN);
          }
        } else {
          console.log('ℹ️ No saved token found');
        }
      } catch (err) {
        console.error('❌ Error initializing auth:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Helper functions
  const isTenant = user?.role === 'tenant';
  const isCaretaker = user?.role === 'caretaker';
  const isAdmin = user?.role === 'admin';
  const hasRole = useCallback((role) => user?.role === role, [user?.role]);

  const value = React.useMemo(() => ({
    user,
    login,
    signup,
    logout,
    updateProfile,
    refreshUser,
    loading,
    error,
    clearError,
    isTenant,
    isCaretaker,
    isAdmin,
    hasRole,
    getToken: () => localStorage.getItem(STORAGE_KEYS.TOKEN),
    getRole: () => user?.role || localStorage.getItem(STORAGE_KEYS.ROLE),
  }), [user, loading, error, isTenant, isCaretaker, isAdmin, login, signup, logout, updateProfile, refreshUser, clearError, hasRole]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;