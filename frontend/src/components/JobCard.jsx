function JobCard({ job }) {
  return (
    <div style={{
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      padding: "16px",
      marginBottom: "16px",
      backgroundColor: "#ffffff",
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
    }}>
      <h3 style={{ margin: "0 0 8px 0", color: "#2563eb" }}>{job.title}</h3>
      <p style={{ margin: "4px 0", fontWeight: "600", color: "#334155" }}>
        🏢 {job.company_name || "Công ty Tuyển dụng"}
      </p>
      <div style={{ display: "flex", gap: "15px", margin: "8px 0", color: "#64748b", fontSize: "14px" }}>
        <span>📍 {job.location || "Hồ Chí Minh"}</span>
        <span>💰 {job.salary ? `${job.salary} VNĐ` : "Thỏa thuận"}</span>
      </div>
      <small style={{ color: "#94a3b8" }}>
        Đăng ngày: {job.created_at ? new Date(job.created_at).toLocaleDateString("vi-VN") : "Vừa xong"}
      </small>
    </div>
  );
}

export default JobCard;