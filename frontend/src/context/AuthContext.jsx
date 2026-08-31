import { createContext, useContext, useState } from "react";
import { loginUser, logoutUser, registerUser } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved && saved !== "undefined" && saved !== "null" ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    const payload = res.data || res; 

    if (payload && payload.access_token) {
      localStorage.setItem("access_token", payload.access_token);
    }
    if (payload && payload.refresh_token) {
      localStorage.setItem("refresh_token", payload.refresh_token);
    }

    const userData = payload.user || payload;

    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    }

    return payload;
  };

  const register = async (formData) => {
    await registerUser(formData);
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.warn("Lỗi API logout:", e);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export default AuthContext;