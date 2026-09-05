import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Header } from "@/components/header"
import ProtectedRoute from "@/components/protected-route"
import { AuthProvider } from "@/context/auth-context"
import { Home } from "@/pages/home"
import { Login } from "@/pages/login"
import { Register } from "@/pages/register"
import Resumes from "@/pages/resumes"
import ResumeBuilder from "./pages/resume_builder"
import ResumeDetailPage from "./pages/resume_detail"

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/resumes" element={<Resumes />} />
          <Route
            path="/resumes/builder"
            element={
              <ProtectedRoute>
                <ResumeBuilder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resumes/:id"
            element={
              <ProtectedRoute>
                <ResumeDetailPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
