import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Header } from "@/components/header"
import { AuthProvider } from "@/context/auth-context"
import { Home } from "@/pages/home"
import { Login } from "@/pages/login"
import { Register } from "@/pages/register"
import Resume from "@/pages/resume"

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/resume" element={<Resume />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
