import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Validate session on startup
  useEffect(() => {
    const fetchSession = async () => {
      if (token) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data);
        } catch (error) {
          console.error('Failed to validate session:', error);
          logout();
        }
      }
      setLoading(false);
    };
    fetchSession();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: jwtToken, userDetails } = response.data;

      // Block admins from logging in via the client portal
      if (userDetails.role === 'ADMIN') {
        return { success: false, error: 'Admin accounts must use the Admin Operations Gateway.' };
      }

      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify(userDetails));
      setToken(jwtToken);
      setUser(userDetails);
      return { success: true, user: userDetails };
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, error: msg };
    }
  };

  // Completely separate admin login — calls /api/auth/login
  const adminLogin = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: jwtToken, userDetails } = response.data;

      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify(userDetails));
      setToken(jwtToken);
      setUser(userDetails);
      return { success: true, user: userDetails };
    } catch (error) {
      const msg = error.response?.data?.message || 'Admin authentication failed.';
      return { success: false, error: msg };
    }
  };

  const register = async (name, email, phone, password, panNumber, aadharNumber) => {
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        phone,
        password,
        panNumber,
        aadharNumber
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      let msg = 'Registration failed.';
      if (error.response?.data) {
        if (error.response.data.details && typeof error.response.data.details === 'object') {
          // Flatten specific Spring validation errors
          msg = Object.values(error.response.data.details).join(' ');
        } else {
          msg = error.response.data.message || msg;
        }
      }
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const forgotPassword = async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      // OTP is no longer returned in the response for security — check server logs
      return { success: true, message: response.data.message };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to trigger OTP.' };
    }
  };

  const verifyOtp = async (email, otp, newPassword) => {
    try {
      const response = await api.post('/auth/verify-otp', { email, otp, newPassword });
      return { success: true, message: response.data.message };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to reset password.' };
    }
  };

  const updateUserContext = (updatedDetails) => {
    setUser(updatedDetails);
    localStorage.setItem('user', JSON.stringify(updatedDetails));
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      adminLogin,
      register,
      logout,
      forgotPassword,
      verifyOtp,
      updateUserContext,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;

