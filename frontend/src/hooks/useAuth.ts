import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const TOKEN_KEY = 'token';

/* =========================
   MAIN AUTH HOOK
========================= */
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check auth on first load
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    setIsAuthenticated(!!token);
  }, []);

  // Login
  const login = useCallback(
    (token: string) => {
      if (!token) return;

      localStorage.setItem(TOKEN_KEY, token);
      setIsAuthenticated(true);

      navigate('/predict', { replace: true });
    },
    [navigate]
  );

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setIsAuthenticated(false);

    navigate('/signin', { replace: true });
  }, [navigate]);

  return {
    isAuthenticated,
    login,
    logout,
  };
};

/* =========================
   PROTECTED ROUTES
   (Use inside pages like Predict, Dashboard)
========================= */
export const useRequireAuth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      navigate('/signin', { replace: true });
    }
  }, [navigate]);
};

/* =========================
   REDIRECT IF ALREADY LOGGED IN
   (OPTIONAL – use ONLY on landing page)
========================= */
export const useRedirectIfAuth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      navigate('/predict', { replace: true });
    }
  }, [navigate]);
};

