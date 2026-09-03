import { useState } from "react"
import { type Job, searchJobs } from "@/api/job"
import JobCard from "@/components/job-card"

export function JobSearch() {
  const [keyword, setKeyword] = useState("")
  const [results, setResults] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!keyword.trim()) return

    setLoading(true)
    setHasSearched(true)
    try {
      const data = await searchJobs(keyword)
      const jobList = Array.isArray(data) ? data : data.jobs || data.data || []
      setResults(jobList)
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          placeholder="Nhập tên công việc, kỹ năng..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="w-full max-w-md rounded border p-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-blue-500 p-2 px-4 text-white"
        >
          {loading ? "Đang tìm..." : "Tìm kiếm"}
        </button>
      </form>

      <div className="mt-6 flex flex-col gap-4">
        {loading && <p className="text-gray-500">Đang tải dữ liệu...</p>}

        {!loading && hasSearched && results.length === 0 && (
          <p className="text-red-500">
            Không tìm thấy tin tuyển dụng nào phù hợp (Hoặc database đang rỗng).
          </p>
        )}

        {!loading &&
          results.length > 0 &&
          results.map((job) => <JobCard key={job.id} job={job} />)}
      </div>
    </div>
  )
}
