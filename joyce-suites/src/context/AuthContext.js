import React, { createContext, useState, useContext, useEffect } from 'react';

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

  // Mock user database for demo purposes
  const mockUsers = [
    { id: 1, email: 'tenant@example.com', password: 'password', role: 'tenant', name: 'John Tenant', unit: 'A101' },
    { id: 2, email: 'caretaker@example.com', password: 'password', role: 'caretaker', name: 'Jane Caretaker' },
    { id: 3, email: 'admin@example.com', password: 'password', role: 'admin', name: 'Admin User' },
  ];

  useEffect(() => {
    // Check for stored authentication on app start
    const savedUser = localStorage.getItem('joyce-suites-user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (err) {
        console.error('Error parsing saved user data:', err);
        localStorage.removeItem('joyce-suites-user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setError('');
    setLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Find user in mock database
      const foundUser = mockUsers.find(u => u.email === email && u.password === password);
      
      if (!foundUser) {
        throw new Error('Invalid email or password');
      }

      // Remove password from user object before storing
      const { password: _, ...userWithoutPassword } = foundUser;
      
      const userData = {
        ...userWithoutPassword,
        loginTime: new Date().toISOString()
      };

      setUser(userData);
      localStorage.setItem('joyce-suites-user', JSON.stringify(userData));
      
      return { success: true, user: userData };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    setError('');
    setLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if user already exists
      const existingUser = mockUsers.find(u => u.email === userData.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // In a real app, this would call your backend API
      const newUser = {
        id: Date.now(),
        ...userData,
        loginTime: new Date().toISOString()
      };

      setUser(newUser);
      localStorage.setItem('joyce-suites-user', JSON.stringify(newUser));
      
      return { success: true, user: newUser };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setError('');
    localStorage.removeItem('joyce-suites-user');
  };

  const updateProfile = (updatedData) => {
    if (user) {
      const updatedUser = { ...user, ...updatedData };
      setUser(updatedUser);
      localStorage.setItem('joyce-suites-user', JSON.stringify(updatedUser));
      return { success: true, user: updatedUser };
    }
    return { success: false, error: 'No user logged in' };
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