// ============================================================
// src/hooks/useAuth.js
//
// Manages authentication state for the whole app.
// Reads/writes the JWT from localStorage and exposes login/logout.
//
// WHY localStorage?
// The JWT needs to survive page refreshes (otherwise every reload
// would log you out). localStorage persists until explicitly cleared.
// For a single-user family app on a trusted device, this is fine.
// ============================================================

import { useState, useCallback } from 'react';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';

const TOKEN_KEY  = 'pharma_token';
const USER_KEY   = 'pharma_user';

// Read initial state from localStorage (survives page refresh)
const getStoredToken = () => localStorage.getItem(TOKEN_KEY);
const getStoredUser  = () => localStorage.getItem(USER_KEY);

const useAuth = () => {
  const [token,    setToken]    = useState(getStoredToken);
  const [username, setUsername] = useState(getStoredUser);
  const [loading,  setLoading]  = useState(false);

  const login = useCallback(async (usernameInput, password) => {
    setLoading(true);
    try {
      const res  = await authApi.login({ username: usernameInput, password });
      const data = res.data.data;

      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY,  data.username);

      setToken(data.token);
      setUsername(data.username);

      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid username or password';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUsername(null);
    toast.success('Logged out');
  }, []);

  const isAuthenticated = !!token;

  return { token, username, isAuthenticated, loading, login, logout };
};

export default useAuth;