import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";

function Home() {
  const { user, logout } = useAuth();
  return (
    <div style={{ maxWidth: 600, margin: "60px auto" }}>
      <h2>Xin chào, {user?.full_name}</h2>
      <p>Vai trò: {user?.role === "employer" ? "Nhà tuyển dụng" : "Ứng viên"}</p>
      <button onClick={logout}>Đăng xuất</button>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;