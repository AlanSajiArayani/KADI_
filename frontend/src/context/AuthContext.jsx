import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode"; // Fix jwt-decode import

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Check for expiration
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          // You ideally fetch full profile from /api/profile here.
          // For demo, we decode what is available, and use default "profileComplete: true" to skip onboarding in mock flow
          setUser({ ...decoded, profileComplete: Boolean(decoded.profileComplete) || true });
        }
      } catch (err) {
        logout();
      }
    }
    setLoading(false);
  }, [token]);

  const login = (jwtToken, userData) => {
    localStorage.setItem('token', jwtToken);
    setToken(jwtToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const completeProfile = (userData) => {
    setUser({ ...user, ...userData, profileComplete: true });
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, completeProfile, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
