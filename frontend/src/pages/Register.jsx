import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({
    email: "",
    full_name: "",
    password: "",
    role: "seeker",
    phone: "",
    company_name: "",
    company_website: "",
  });
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Đăng ký thất bại");
    }
  };

  return (
    <div style={{ maxWidth: 360, margin: "60px auto" }}>
      <h2>Đăng ký</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="full_name"
          placeholder="Họ tên"
          onChange={handleChange}
          style={{ display: "block", width: "100%", marginBottom: 10 }}
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          style={{ display: "block", width: "100%", marginBottom: 10 }}
        />
        <input
          name="password"
          type="password"
          placeholder="Mật khẩu"
          onChange={handleChange}
          style={{ display: "block", width: "100%", marginBottom: 10 }}
        />
        <input
          name="phone"
          placeholder="Số điện thoại (tùy chọn)"
          onChange={handleChange}
          style={{ display: "block", width: "100%", marginBottom: 10 }}
        />

        <label style={{ display: "block", marginBottom: 10 }}>
          Bạn là:{" "}
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="seeker">Ứng viên</option>
            <option value="employer">Nhà tuyển dụng</option>
          </select>
        </label>

        {form.role === "employer" && (
          <>
            <input
              name="company_name"
              placeholder="Tên công ty"
              onChange={handleChange}
              style={{ display: "block", width: "100%", marginBottom: 10 }}
            />
            <input
              name="company_website"
              placeholder="Website công ty (tùy chọn)"
              onChange={handleChange}
              style={{ display: "block", width: "100%", marginBottom: 10 }}
            />
          </>
        )}

        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">Đăng ký</button>
      </form>
      <p>
        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
      </p>
    </div>
  );
}