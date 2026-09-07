import {
	BriefcaseBusinessIcon,
	DollarSignIcon,
	MapIcon,
	SearchIcon,
} from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useProvinces } from "@/api/location";
import { useGetJobPosts } from "@/api/post-api";
import { AutoPagination } from "@/components/auto-pagination";
import { JobPostCard, JobPostSkeletons } from "@/components/job-post-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import { Card } from "@/components/ui/card";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { PaginationMeta } from "@/types/paginate";
import { JOB_TYPES_MAP, type JobPost } from "@/types/post";

export function Home() {
	const [searchParams, setSearchParams] = useSearchParams();

	// Bộ lọc nháp — chỉ được áp dụng (ghi vào URL) khi bấm "Lọc kết quả".
	const [draftProvinceId, setDraftProvinceId] = useState<string | null>(
		searchParams.get("provinceId"),
	);
	const [draftJobType, setDraftJobType] = useState<string | null>(
		searchParams.get("jobType"),
	);
	const [draftSalary, setDraftSalary] = useState<string | null>(
		searchParams.get("salary"),
	);
	const [draftKeyword, setDraftKeyword] = useState<string | null>(
		searchParams.get("keyword"),
	);

	const { data: provinces } = useProvinces();
	const provincesSelectItems =
		provinces?.map((p) => ({
			value: p.id.toString(),
			label: p.name,
		})) || [];

	const applyFilters = () => {
		const params = new URLSearchParams();
		if (draftProvinceId) params.set("provinceId", draftProvinceId);
		if (draftJobType) params.set("jobType", draftJobType);
		if (draftSalary) params.set("salary", draftSalary);
		const keyword = draftKeyword?.trim();
		if (keyword) params.set("keyword", keyword);
		params.set("page", "1"); // về trang đầu khi đổi bộ lọc
		setSearchParams(params);
	};

	return (
		<main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-10">
			<h2 className="text-center font-bold text-2xl text-primary">
				Việc làm mới nhất
			</h2>

			<Card className="sticky top-16 gap-2 p-4 -mx-12 shadow-lg bg-secondary/50 backdrop-blur">
				<InputGroup className="bg-background h-10">
					<InputGroupInput
						type="text"
						placeholder="Tìm kiếm theo từ khoá (tiêu đề, kỹ năng, ...)"
						value={draftKeyword ?? ""}
						onChange={(e) => setDraftKeyword(e.target.value || null)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								applyFilters();
							}
						}}
					/>

					<InputGroupAddon>
						<SearchIcon />
					</InputGroupAddon>
				</InputGroup>

				<div className="flex gap-2">
					<ButtonGroup className="w-full flex-1">
						<ButtonGroupText className="size-8 p-2">
							<MapIcon />
						</ButtonGroupText>
						<Select
							items={provincesSelectItems}
							value={draftProvinceId}
							onValueChange={setDraftProvinceId}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Lọc theo địa điểm" />
							</SelectTrigger>
							<SelectContent className="w-3xs h-64">
								<SelectItem value={null}>Tất cả địa điểm</SelectItem>

								{provincesSelectItems.map((p) => (
									<SelectItem key={p.value} value={p.value}>
										{p.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</ButtonGroup>

					<ButtonGroup className="w-full flex-1">
						<ButtonGroupText className="size-8 p-2">
							<BriefcaseBusinessIcon />
						</ButtonGroupText>
						<Select
							items={JOB_TYPES_MAP}
							value={draftJobType}
							onValueChange={setDraftJobType}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Lọc theo loại công việc" />
							</SelectTrigger>
							<SelectContent className="w-3xs">
								<SelectItem value={null}>Tất cả loại công việc</SelectItem>

								{Object.entries(JOB_TYPES_MAP).map(([key, label]) => (
									<SelectItem key={key} value={key}>
										{label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</ButtonGroup>

					<InputGroup className="bg-background flex-1">
						<InputGroupInput
							type="number"
							min={0}
							placeholder="Mức lương mong muốn"
							value={draftSalary ?? ""}
							onChange={(e) => setDraftSalary(e.target.value || null)}
						/>
						<InputGroupAddon>
							<DollarSignIcon />
						</InputGroupAddon>
					</InputGroup>

					<Button onClick={applyFilters}>
						<SearchIcon />
						Tìm kiếm
					</Button>
				</div>
			</Card>

			<div className="pt-4">
				<JobPostList />
			</div>
		</main>
	);
}

function JobPostList() {
	const [searchParams, setSearchParams] = useSearchParams();

	const provinceId = searchParams.get("provinceId")
		? Number(searchParams.get("provinceId"))
		: null;
	const jobType = searchParams.get("jobType");
	const keyword = searchParams.get("keyword");
	const salary = searchParams.get("salary")
		? Number(searchParams.get("salary"))
		: null;
	const page = Math.max(1, Number(searchParams.get("page")) || 1);

	const { status, data, error } = useGetJobPosts({
		filter: {
			provinceId,
			jobType,
			salary,
			keyword,
		},
		page,
		pageSize: 10,
	});

	if (status === "pending")
		return (
			<div className="space-y-3">
				<div className="flex items-center gap-1">
					<span className="font-bold">
						<Skeleton className="w-6 h-5" />
					</span>{" "}
					việc làm mới nhất trong tháng{" "}
					{`${new Date().getMonth() + 1}/${new Date().getFullYear()}`}
				</div>
				<JobPostSkeletons />
			</div>
		);

	if (status === "error")
		return (
			<Alert variant="destructive" className="mb-4">
				<AlertTitle>Có lỗi xảy ra</AlertTitle>
				<AlertDescription>
					Không thể tải danh sách bài đăng: {error.message}
				</AlertDescription>
			</Alert>
		);

	const posts: JobPost[] = data.items;
	const pagination: PaginationMeta = data.pagination;

	const goToPage = (nextPage: number) => {
		const params = new URLSearchParams(searchParams);
		params.set("page", String(nextPage));
		setSearchParams(params);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<div className="space-y-3">
			<div>
				<span className="font-bold">{pagination.total}</span> việc làm mới nhất
				trong tháng {`${new Date().getMonth() + 1}/${new Date().getFullYear()}`}
			</div>

			<div className="flex flex-col gap-6">
				{posts.map((post) => (
					<JobPostCard key={post.id} post={post} />
				))}
			</div>

			<div className="mt-6">
				<AutoPagination pagination={pagination} goToPage={goToPage} />
			</div>
		</div>
	);
}

export default Home;
