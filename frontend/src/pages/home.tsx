import { Loader2, SearchIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getLatestJobs, type Job, type JobFilterParams } from "@/api/job";
import { useProvinces } from "@/api/location";
import { JobCard } from "@/components/job-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { JOB_TYPES_MAP } from "@/types/post";

export function Home() {
	const [jobs, setJobs] = useState<Job[]>([]);
	const [loading, setLoading] = useState(true);

	const [provinceId, setProvinceId] = useState<string>("all");
	const [jobType, setJobType] = useState<string>("all");
	const [salary, setSalary] = useState<string>("");

	const { data: provinces } = useProvinces();

	const fetchJobs = useCallback(async () => {
		setLoading(true);
		try {
			const params: JobFilterParams = {};
			if (provinceId !== "all") params.province_id = Number(provinceId);
			if (jobType !== "all") params.job_type = jobType;
			if (salary.trim() !== "") params.salary = Number(salary);

			const data = await getLatestJobs(params);
			const jobList = Array.isArray(data)
				? data
				: data?.jobs || data?.data || [];
			setJobs(jobList);
		} catch (err) {
			console.error("Lỗi lấy bài đăng:", err);
			setJobs([]);
		} finally {
			setLoading(false);
		}
	}, [provinceId, jobType, salary]);

	useEffect(() => {
		fetchJobs();
	}, [fetchJobs]);

	return (
		<main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-10">
			<h2 className="border-primary border-b-2 pb-3 text-center font-bold text-xl">
				🔥 Việc làm mới nhất
			</h2>

			<div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-muted/30 p-4 rounded-xl border">
				<Select
					value={provinceId}
					onValueChange={(val) => setProvinceId(val ?? "all")}
				>
					<SelectTrigger>
						<SelectValue placeholder="Tất cả địa điểm" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Tất cả địa điểm</SelectItem>
						{provinces?.map((p) => (
							<SelectItem key={p.id} value={String(p.id)}>
								{p.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select
					value={jobType}
					onValueChange={(val) => setJobType(val ?? "all")}
				>
					<SelectTrigger>
						<SelectValue placeholder="Loại hình" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Tất cả ngành nghề</SelectItem>
						{Object.entries(JOB_TYPES_MAP).map(([key, label]) => (
							<SelectItem key={key} value={key}>
								{label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Input
					type="number"
					min={0}
					placeholder="Mức lương tối thiểu..."
					value={salary}
					onChange={(e) => setSalary(e.target.value)}
					className="bg-background"
				/>

				<Button onClick={fetchJobs} className="w-full">
					<SearchIcon className="mr-2 size-4" />
					Lọc kết quả
				</Button>
			</div>

			{loading && (
				<p className="flex items-center justify-center gap-2 text-muted-foreground pt-8">
					<Loader2 className="size-4 animate-spin" />
					Đang tìm kiếm việc làm...
				</p>
			)}

			{!loading && jobs.length === 0 && (
				<p className="text-center text-muted-foreground pt-8">
					Không tìm thấy bài tuyển dụng nào phù hợp với tiêu chí của bạn.
				</p>
			)}

			<div className="grid gap-4">
				{!loading && jobs.map((job) => <JobCard key={job.id} job={job} />)}
			</div>
		</main>
	);
}

export default Home;
