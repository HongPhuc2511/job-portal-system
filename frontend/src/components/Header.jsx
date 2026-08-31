import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px 30px",
      backgroundColor: "#1e293b",
      color: "#ffffff"
    }}>
      {/* Logo */}
      <div style={{ fontSize: "20px", fontWeight: "bold" }}>
        <Link to="/" style={{ color: "#ffffff", textDecoration: "none" }}>
          💼 JobPortal
        </Link>
      </div>

      {/* Menu */}
      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        <Link to="/" style={{ color: "#cbd5e1", textDecoration: "none" }}>Trang chủ</Link>
        <Link to="/" style={{ color: "#cbd5e1", textDecoration: "none" }}>Tìm việc làm</Link>
        <Link to="/" style={{ color: "#cbd5e1", textDecoration: "none" }}>Tuyển dụng</Link>
      </div>

      {/* Auth Status */}
      <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
        {user ? (
          <>
            <span style={{ fontSize: "14px", color: "#e2e8f0" }}>
              Xin chào, <strong>{user.full_name || user.email}</strong>
            </span>
            <button
              onClick={handleLogout}
              style={{
                padding: "6px 14px",
                backgroundColor: "#dc2626",
                color: "#ffffff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "500"
              }}
            >
              Đăng xuất
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              style={{
                color: "#ffffff",
                textDecoration: "none",
                padding: "6px 12px",
                border: "1px solid #cbd5e1",
                borderRadius: "4px"
              }}
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              style={{
                color: "#ffffff",
                backgroundColor: "#2563eb",
                textDecoration: "none",
                padding: "6px 12px",
                borderRadius: "4px"
              }}
            >
              Đăng ký
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;