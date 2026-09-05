import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getLatestJobs, type Job } from "@/api/job";
import { JobCard } from "@/components/job-card";

export function Home() {
	const [jobs, setJobs] = useState<Job[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;

		const fetchJobs = async () => {
			try {
				const data = await getLatestJobs();
				const jobList = Array.isArray(data)
					? data
					: data?.jobs || data?.data || [];
				if (!cancelled) {
					setJobs(jobList);
				}
			} catch (err) {
				console.error("Lỗi lấy bài đăng:", err);
				if (!cancelled) {
					setJobs([]);
				}
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		};

		fetchJobs();

		return () => {
			cancelled = true;
		};
	}, []);

	return (
		<main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-10">
			<h2 className="border-primary border-b-2 pb-3 text-center font-bold text-xl">
				🔥 Việc làm mới nhất
			</h2>

			{loading && (
				<p className="flex items-center justify-center gap-2 text-muted-foreground">
					<Loader2 className="size-4 animate-spin" />
					Đang tải danh sách...
				</p>
			)}

			{!loading && jobs.length === 0 && (
				<p className="text-center text-muted-foreground">
					Chưa có bài tuyển dụng nào.
				</p>
			)}

			{!loading && jobs.map((job) => <JobCard key={job.id} job={job} />)}
		</main>
	);
}

export default Home;
