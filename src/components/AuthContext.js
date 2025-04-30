// context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);  // Store logged-in user data
  const [isAuthenticated, setIsAuthenticated] = useState(false);  // Authentication status

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("user"));

    if (token && userData) {
      setIsAuthenticated(true);
      setUser(userData);
    }
    setLoading(false); // Indicate that initialization is complete
  }, []);

  useEffect(() => {
    // Check if the user has a stored token in localStorage
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user'));  // Get user data from localStorage

    if (token && userData) {
      setIsAuthenticated(true);
      setUser(userData);  // Set the user data from localStorage
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('token', userData.token);  // Store token in localStorage
    localStorage.setItem('user', JSON.stringify(userData));  // Store user data in localStorage
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');  // Remove token on logout
    localStorage.removeItem('user');   // Remove user data on logout
    window.location.reload();
  };
  
  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
