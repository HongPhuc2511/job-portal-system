import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Header } from "@/components/header"
import { AuthProvider } from "@/context/auth-context"
import { Home } from "@/pages/home"
import Login from "@/pages/login"
import Register from "@/pages/register"
import Resumes from "@/pages/resumes"

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/resume" element={<Resumes />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
