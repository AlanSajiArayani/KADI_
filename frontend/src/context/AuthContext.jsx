import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode"; 
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://127.0.0.1:5000';

  useEffect(() => {
    const hydrateUser = async () => {
      if (token) {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 < Date.now()) {
            logout();
          } else {
            // First load local storage
            setUser(prev => {
              const merged = { ...decoded, ...prev, profileComplete: prev?.profileComplete || true };
              localStorage.setItem('user', JSON.stringify(merged));
              return merged;
            });

            // Second, fetch real DB instance silently
            try {
              const { data } = await axios.get(`${API_URL}/auth/profile`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              // CRITICAL: Deeply merge local state with server state to prevent wiping fields
              setUser(prev => {
                const updated = { ...prev, ...data };
                localStorage.setItem('user', JSON.stringify(updated));
                return updated;
              });
            } catch (err) { console.error("Could not reach DB for fresh profile", err); }
          }
        } catch (err) {
          logout();
        }
      }
      setLoading(false);
    };
    
    hydrateUser();
  }, [token]);

  const login = (jwtToken, userData) => {
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const completeProfile = (userData) => {
    setUser(prevUser => {
      const updated = { 
        ...prevUser, 
        ...userData, 
        profileComplete: true,
        // Explicit priority for new mobile number if present
        mobileNumber: userData.mobileNumber || prevUser?.mobileNumber 
      };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, completeProfile, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
