import { MapPinIcon, PlusIcon, WalletIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useGetEmployerPosts } from "@/api/post-api";
import { AutoPagination } from "@/components/auto-pagination";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth-context";
import { formatDisplayDate } from "@/lib/datetime";
import { formatSalary } from "@/lib/salary";
import {
	EXPERIENCE_LEVELS_MAP,
	JOB_POST_STATUS_MAP,
	JOB_TYPES_MAP,
	type JobPost,
	type JobPostStatus,
	WORK_MODELS_MAP,
} from "@/types/post";

const STATUS_VARIANT: Record<
	JobPostStatus,
	"default" | "secondary" | "outline"
> = {
	ACTIVE: "default",
	CLOSED: "secondary",
	EXPIRED: "outline",
};

export default function EmployerPostsPage() {
	const { user } = useAuth();

	if (!user) return null;

	if (user.role !== "employer") {
		return <div>Bạn không có quyền truy cập trang này.</div>;
	}

	return (
		<main className="mx-auto max-w-5xl pt-4">
			<div className="flex items-center justify-between gap-4 pb-4">
				<h3 className="font-bold text-lg">Quản lý bài đăng</h3>
				<Button render={<Link to="/posts/create" />}>
					<PlusIcon data-icon="inline-start" />
					Tạo bài đăng mới
				</Button>
			</div>

			<EmployerPostList employerId={user.id} />
		</main>
	);
}

function EmployerPostList({ employerId }: { employerId: number }) {
	const [page, setPage] = useState(1);
	const postsQuery = useGetEmployerPosts(employerId, page);

	if (postsQuery.status === "pending") return <PostListSkeleton />;

	if (postsQuery.status === "error")
		return (
			<Alert variant="destructive" className="mb-4">
				<AlertTitle>Có lỗi xảy ra</AlertTitle>
				<AlertDescription>
					Không thể tải danh sách bài đăng. Vui lòng thử lại sau.
				</AlertDescription>
			</Alert>
		);

	const posts: JobPost[] = postsQuery.data.items;
	const pagination = postsQuery.data.pagination;

	const goToPage = (nextPage: number) => {
		setPage(nextPage);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<>
			<div className="flex flex-col gap-4">
				{posts.map((post) => (
					<PostCard key={post.id} post={post} />
				))}
			</div>

			<div className="mt-6 mb-2">
				<AutoPagination pagination={pagination} goToPage={goToPage} />
			</div>
		</>
	);
}

function PostCard({ post }: { post: JobPost }) {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-start justify-between gap-3">
					<CardTitle className="text-base">{post.title}</CardTitle>
					<Badge variant={STATUS_VARIANT[post.status]}>
						{JOB_POST_STATUS_MAP[post.status]}
					</Badge>
				</div>
			</CardHeader>
			<CardContent className="flex flex-col gap-3">
				<p className="flex items-center gap-1.5 text-sm font-medium">
					<WalletIcon className="size-4" />
					{formatSalary(post.salary_min, post.salary_max)}
					<span className="text-muted-foreground">
						/ {WORK_MODELS_MAP[post.work_model]}
					</span>
				</p>

				<div className="flex flex-wrap gap-1.5">
					<Badge variant="secondary">{JOB_TYPES_MAP[post.job_type]}</Badge>
					<Badge variant="secondary">
						{EXPERIENCE_LEVELS_MAP[post.experience_level]}
					</Badge>
				</div>

				<div className="flex items-center gap-1.5 text-sm text-muted-foreground">
					<MapPinIcon className="size-4" />
					{post.address || "Chưa cập nhật địa điểm"}

					<div className="ml-auto flex gap-x-4 gap-y-1 text-xs text-muted-foreground">
						<span>Số lượng: {post.head_count}</span>
						<span>Hạn ứng tuyển: {formatDisplayDate(post.deadline)}</span>
						<span>Đăng ngày: {formatDisplayDate(post.published_at)}</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function PostListSkeleton() {
	return (
		<div className="flex flex-col gap-4">
			{[...Array(3)].map((_, index) => (
				<Card key={index}>
					<CardContent className="flex flex-col gap-3">
						<Skeleton className="h-5 w-1/3" />
						<Skeleton className="h-4 w-1/2" />
						<Skeleton className="h-4 w-2/3" />
					</CardContent>
				</Card>
			))}
		</div>
	);
}
