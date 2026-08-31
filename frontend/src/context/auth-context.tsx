import { createContext, type ReactNode, useContext, useState } from "react"
import {
  type LoginResponse,
  loginUser,
  logoutUser,
  type RegisterPayload,
  registerUser,
  type User,
} from "@/api/auth"

type AuthContextValue = {
  user: User | null
  login: (email: string, password: string) => Promise<LoginResponse>
  register: (formData: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("user")
      return saved && saved !== "undefined" && saved !== "null"
        ? (JSON.parse(saved) as User)
        : null
    } catch {
      return null
    }
  })

  const login = async (email: string, password: string) => {
    const res = await loginUser({ email, password })
    const payload = (res.data || res) as LoginResponse

    if (payload?.access_token) {
      localStorage.setItem("access_token", payload.access_token)
    }
    if (payload?.refresh_token) {
      localStorage.setItem("refresh_token", payload.refresh_token)
    }

    const userData = payload.user || (payload as unknown as User)

    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData))
      setUser(userData)
    }

    return payload
  }

  const register = async (formData: RegisterPayload) => {
    await registerUser(formData)
  }

  const logout = async () => {
    try {
      await logoutUser()
    } catch (e) {
      console.warn("Lỗi API logout:", e)
    } finally {
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
      localStorage.removeItem("user")
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
