import { useState, useEffect } from "react";
import { getLatestJobs } from "../api/job"; 
import JobCard from "../components/JobCard";

function Home() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await getLatestJobs();
        const jobList = Array.isArray(data) ? data : (data?.jobs || data?.data || []);
        setJobs(jobList);
      } catch (err) {
        console.error("Lỗi lấy bài đăng:", err);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: "0 20px" }}>
      <h3 style={{ borderBottom: "2px solid #2563eb", paddingBottom: 10, textAlign: "center", color: "#ffffff" }}>
        🔥 Việc làm mới nhất
      </h3>

      {loading && <p style={{ textAlign: "center", color: "#cbd5e1" }}>Đang tải danh sách...</p>}

      {!loading && jobs.length === 0 && (
        <p style={{ textAlign: "center", color: "#94a3b8" }}>Chưa có bài tuyển dụng nào.</p>
      )}

      {!loading && jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}

export default Home;