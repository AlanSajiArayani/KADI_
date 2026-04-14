import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const StaffAuthContext = createContext();

export const useStaffAuth = () => useContext(StaffAuthContext);

export const StaffAuthProvider = ({ children }) => {
  const [staff, setStaff] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('staffToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          logoutStaff();
        } else {
          setStaff(decoded);
        }
      } catch (err) {
        logoutStaff();
      }
    }
    setLoading(false);
  }, [token]);

  const loginStaff = (jwtToken, staffData) => {
    localStorage.setItem('staffToken', jwtToken);
    setToken(jwtToken);
    setStaff(staffData);
  };

  const logoutStaff = () => {
    localStorage.removeItem('staffToken');
    setToken(null);
    setStaff(null);
  };

  return (
    <StaffAuthContext.Provider value={{ staff, token, loginStaff, logoutStaff, loading }}>
      {!loading && children}
    </StaffAuthContext.Provider>
  );
};
