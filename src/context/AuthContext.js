// import React, { createContext, useContext, useEffect, useState } from 'react';
// import { onAuthStateChanged } from 'firebase/auth';
// import { auth } from '../services/firebase';
// import { syncUser } from '../services/api';

// const AuthContext = createContext(null);

// export const useAuth = () => {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
//   return ctx;
// };

// export const AuthProvider = ({ children }) => {
//   const [currentUser, setCurrentUser] = useState(null); // Firebase user object
//   const [dbUser,      setDbUser]      = useState(null); // MongoDB user object
//   const [loading,     setLoading]     = useState(true);

//   useEffect(() => {
//     // Firebase listener — fires on login, logout, token refresh
//     const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
//       setCurrentUser(firebaseUser);

//       if (firebaseUser) {
//         try {
//           // Sync to MongoDB — creates user if first time, returns existing if not
//           const res = await syncUser({ name: firebaseUser.displayName });
//           setDbUser(res.data.data);
//         } catch (err) {
//           console.error('User sync failed:', err.message);
//         }
//       } else {
//         setDbUser(null);
//       }

//       setLoading(false);
//     });

//     return unsubscribe; // cleanup on unmount
//   }, []);

//   // Helper flags
//   const isOwner = dbUser?.role === 'salon_owner';
//   const isAdmin = dbUser?.role === 'admin';

//   return (
//     <AuthContext.Provider value={{ currentUser, dbUser, loading, isOwner, isAdmin, setDbUser }}>
//       {!loading && children}
//     </AuthContext.Provider>
//   );
// };

import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * AuthContext
 * -----------
 * JWT-based auth (not Firebase tokens).
 * token + user are stored in localStorage so they survive page refresh.
 * This mirrors the Redux setCredentials pattern from the reference files
 * but uses React context instead so we don't need Redux.
 */
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const TOKEN_KEY = 'mysalon_token';
const USER_KEY  = 'mysalon_user';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)) || null; } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);

  // Persist whenever they change
  useEffect(() => {
    if (token)       localStorage.setItem(TOKEN_KEY, token);
    else             localStorage.removeItem(TOKEN_KEY);
  }, [token]);

  useEffect(() => {
    if (currentUser) localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
    else             localStorage.removeItem(USER_KEY);
  }, [currentUser]);

  // Called after login/signup/google — same as Redux setCredentials
  const setCredentials = ({ user, token: t }) => {
    setCurrentUser(user);
    setToken(t);
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
  };

  const isOwner = currentUser?.role === 'salon_owner';
  const isAdmin = currentUser?.role === 'admin';

  return (
    <AuthContext.Provider value={{ currentUser, token, setCredentials, logout, isOwner, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};