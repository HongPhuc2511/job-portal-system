import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useGetEmployerPosts } from "@/api/post-api";
import { AutoPagination } from "@/components/auto-pagination";
import { JobPostCard, JobPostSkeletons } from "@/components/job-post-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import type { JobPost } from "@/types/post";

export default function EmployerPostsPage() {
	const { user } = useAuth();

	if (!user) return null;

	if (user.role !== "employer") {
		return <div>Bạn không có quyền truy cập trang này.</div>;
	}

	return (
		<main className="mx-auto max-w-5xl pt-4">
			<div className="flex items-center justify-between gap-4">
				<h3 className="font-bold text-lg">Quản lý bài đăng</h3>
				<Button render={<Link to="/posts/create" />}>
					<PlusIcon data-icon="inline-start" />
					Tạo bài đăng mới
				</Button>
			</div>

			<div className="py-4">
				<EmployerPostList employerId={user.id} />
			</div>
		</main>
	);
}

function EmployerPostList({ employerId }: { employerId: number }) {
	const [page, setPage] = useState(1);
	const postsQuery = useGetEmployerPosts(employerId, page);

	if (postsQuery.status === "pending") return <JobPostSkeletons />;

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
					<JobPostCard key={post.id} post={post} isManager />
				))}
			</div>

			<div className="mt-6">
				<AutoPagination pagination={pagination} goToPage={goToPage} />
			</div>
		</>
	);
}
