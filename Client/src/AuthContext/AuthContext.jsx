import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../Axios/AxiosInstance';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await axios.get('/api/auth/verify', { withCredentials: true });
        if (response.data.success) {
          setIsAuthenticated(true);
          setUser(response.data.user);
        }
      } catch (error) {
        console.error('Auth verification error:', error.response ? error.response.data : error.message);
      } finally {
        setLoading(false);
      }
    };
    verifyAuth();
  }, []);

  const handleLogin = async (credentials, navigate) => {
    try {
      console.log('Login request URL:', axios.defaults.baseURL + '/api/auth/login');
      console.log('Login request data:', credentials);
      const response = await axios.post('/api/auth/login', credentials, { withCredentials: true });
      setIsAuthenticated(true);
      setUser(response.data.user);
      // Check user role and navigate accordingly
      const redirectPath = response.data.user.role === 'admin' ? '/admin' : '/';
      navigate(redirectPath);
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Login error:', error.response ? error.response.data : error.message);
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

const handleRegister = async (data, navigate) => {
  try {
    console.log('Register request URL:', axios.defaults.baseURL + '/api/auth/register');
    console.log('Register request data:', data);
    const response = await axios.post('/api/auth/register', data, { withCredentials: true });

    setIsAuthenticated(true);
    setUser(response.data.user); // ✅ Properly set full user object including role

    navigate('/');
    return { success: true, message: response.data.message };
  } catch (error) {
    console.error('Register error:', error.response ? error.response.data : error.message);
    return { success: false, message: error.response?.data?.message || 'Registration failed' };
  }
};


  const handleLogout = async () => {
    try {
      console.log('Logout request URL:', axios.defaults.baseURL + '/api/auth/logout');
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
      setIsAuthenticated(false);
      setUser(null);
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      console.error('Logout error:', error.response ? error.response.data : error.message);
      return { success: false, message: 'Logout failed' };
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, handleLogin, handleRegister, handleLogout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);