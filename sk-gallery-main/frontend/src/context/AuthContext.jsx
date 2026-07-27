import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.PROD ? '/api/auth' : 'http://localhost:5000/api/auth';
  
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { data } = await axios.get(`${API_URL}/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser({ ...data, token });
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post(`${API_URL}/login`, { email, password });
    localStorage.setItem('token', data.token);
    setUser(data);
  };

  const googleLogin = async (token, role = 'customer') => {
    const { data } = await axios.post(`${API_URL}/google`, { token, role });
    localStorage.setItem('token', data.token);
    setUser(data);
  };

  const register = async (userData) => {
    await axios.post(`${API_URL}/register`, userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, googleLogin, register, logout }}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};
