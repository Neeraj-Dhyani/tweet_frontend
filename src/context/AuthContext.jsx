import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getCurrentUser, loginUser } from "../api";
import { publicUser } from "../utils";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("wire_token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem("wire_token")));

  const refreshUser = useCallback(async () => {
    try {
      const res = await getCurrentUser();
      setUser(publicUser(res.data.user));
    } catch {
      localStorage.removeItem("wire_token");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) refreshUser();
    // eslint-disable-next-line
  }, []);

  async function login(username, password) {
    const res = await loginUser({ username, password });
    localStorage.setItem("wire_token", res.data.token);
    setToken(res.data.token);
    await refreshUser();
  }

  function logout() {
    localStorage.removeItem("wire_token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
