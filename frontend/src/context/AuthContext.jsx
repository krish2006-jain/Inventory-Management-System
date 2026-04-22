/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api
        .get("/auth/me")
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password, role) => {
    const res = await api.post("/auth/login", { email, password, role });
    const data = res.data;
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser({
      id: data.id,
      role: data.role,
      email: data.email,
      username: data.username,
      phone: data.phone,
      avator: data.avator,
      status: data.status,
    });
    return data;
  };

  const register = async (fields) => {
    const res = await api.post("/auth/register", fields);
    const data = res.data;
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser({
      id: data.id,
      role: data.role,
      email: data.email,
      username: data.username,
      phone: data.phone,
      avator: data.avator,
      status: data.status,
    });
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}

export default AuthContext;
