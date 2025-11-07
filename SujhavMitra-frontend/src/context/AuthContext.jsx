import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuth = async () => {
      console.log('Starting auth check...');
      try {
        const storedToken = localStorage.getItem('token');
        console.log('Stored token:', storedToken ? 'exists' : 'not found');
        
        if (!storedToken) {
          console.log('No token found, setting loading to false');
          setLoading(false);
          return;
        }

        // Verify token with backend
        console.log('Verifying token with backend...');
        const response = await fetch(`${API_BASE}/user/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${storedToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Auth response status:', response.status);
        
        if (response.ok) {
          const userData = await response.json();
          console.log('User data received:', userData);
          setUser(userData);
          setToken(storedToken);
          console.log('Auth successful, user set');
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.log('Auth failed with status:', response.status, 'Error:', errorData);
          // If token is invalid or expired, clear it
          if (response.status === 401) {
            console.log('Token expired or invalid, clearing...');
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Don't clear token on network errors
        if (error.name !== 'TypeError') {
          console.log('Non-network error, clearing token');
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        } else {
          console.log('Network error, keeping token');
        }
      } finally {
        console.log('Auth check completed, setting loading to false');
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE}/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token,
    isAdmin: user?.role_id === 1,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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

export default AuthContext;
