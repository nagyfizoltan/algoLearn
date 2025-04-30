// Példa a ProtectedRoute komponensre
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth(); // ellenőrzi, hogy van-e bejelentkezett felhasználó
  if (!user) {
    return <Navigate to="/login" />; // ha nincs felhasználó, irányítsd át a bejelentkezéshez
  }

  return children;
};

export default ProtectedRoute;
