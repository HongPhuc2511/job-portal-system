import { useQueryClient } from "@tanstack/react-query";
import {
	BriefcaseIcon,
	ClockIcon,
	FileTextIcon,
	PlusIcon,
	TrendingUpIcon,
	TriangleAlertIcon,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
	useDeletePost,
	useGetEmployerPosts,
	useGetEmployerStats,
} from "@/api/post-api";
import { AutoPagination } from "@/components/auto-pagination";
import { JobPostCard, JobPostSkeletons } from "@/components/job-post-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogMedia,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Description } from "@/components/ui/description";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/context/auth-context";
import { extractBackendErrors } from "@/lib/backend-error";
import type { JobPost } from "@/types/post";

export default function EmployerPostsPage() {
	const { user } = useAuth();

	if (!user) return null;

	if (user.role !== "employer") {
		return <div>Bạn không có quyền truy cập trang này.</div>;
	}

	return (
		<main className="mx-auto max-w-4xl pt-10 px-4">
			<EmployerStats />

			<div className="flex items-center justify-between gap-4">
				<h3 className="font-bold text-xl">Quản lý bài đăng</h3>
				<Button render={<Link to="/manage-posts/create" />}>
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

type StatCard = {
	label: string;
	icon: React.ComponentType;
	key:
		| "total_posts"
		| "active_posts"
		| "total_applications"
		| "pending_applications";
};

const STAT_CARDS: StatCard[] = [
	{
		label: "Tổng tin đã đăng",
		icon: BriefcaseIcon,
		key: "total_posts",
	},
	{
		label: "Tin đang tuyển",
		icon: TrendingUpIcon,
		key: "active_posts",
	},
	{
		label: "Tổng CV nhận được",
		icon: FileTextIcon,
		key: "total_applications",
	},
	{
		label: "Hồ sơ chờ duyệt",
		icon: ClockIcon,
		key: "pending_applications",
	},
];

export function EmployerStats() {
	const { data: stats, status, error } = useGetEmployerStats();

	const cards = STAT_CARDS.map((card) => ({
		...card,
		value: stats?.[card.key],
	}));

	let content: React.ReactNode;

	switch (status) {
		case "pending":
			content = cards.map((card) => (
				<Card className="p-4 rounded-sm h-23">
					<div className="flex flex-col gap-2">
						<Description className="text-muted-foreground gap-1.5">
							<card.icon /> {card.label}
						</Description>
						<Skeleton className="h-8 " />
					</div>
				</Card>
			));
			break;
		case "error":
			content = (
				<Alert variant="destructive" className="col-span-full h-23">
					<AlertDescription>{error?.message}</AlertDescription>
				</Alert>
			);
			break;
		default:
			content = cards.map((card) => (
				<Card className="p-4 rounded-sm" key={card.label}>
					<div className="flex flex-col gap-2">
						<Description className="text-muted-foreground gap-1.5">
							<card.icon /> {card.label}
						</Description>

						<div className="text-2xl tracking-tight font-bold">
							{card.value}
						</div>
					</div>
				</Card>
			));
	}

	return (
		<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 pb-8">
			{content}
		</div>
	);
}

function EmployerPostList({ employerId }: { employerId: number }) {
	const [page, setPage] = useState(1);
	const postsQuery = useGetEmployerPosts(employerId, page);
	const queryClient = useQueryClient();

	const [postToDelete, setPostToDelete] = useState<JobPost | null>(null);

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

	const handlePostDeleted = () => {
		// Nếu trang hiện tại chỉ có đúng bài đang xoá thì lùi về trang trước,
		// tránh rơi vào một trang trống sau khi xoá.
		const itemCount = postsQuery.data?.items.length ?? 0;
		if (itemCount === 1 && page > 1) {
			setPage(page - 1);
		}

		setPostToDelete(null);
		queryClient.invalidateQueries({
			queryKey: ["employer-posts", { employerId }],
		});
	};

	return (
		<>
			<div className="flex flex-col gap-4">
				{posts.length === 0 ? (
					<p className="py-8 text-center text-muted-foreground">
						Chưa có bài đăng nào.
					</p>
				) : (
					posts.map((post) => (
						<JobPostCard
							key={post.id}
							post={post}
							isManager
							onDeleteRequest={setPostToDelete}
						/>
					))
				)}
			</div>

			<div className="mt-6">
				<AutoPagination pagination={pagination} goToPage={goToPage} />
			</div>

			<DeletingDialog
				key={postToDelete?.id ?? 0}
				post={postToDelete}
				onOpenChange={(open) => {
					if (!open) setPostToDelete(null);
				}}
				onDeleted={handlePostDeleted}
			/>
		</>
	);
}

function DeletingDialog({
	post,
	onOpenChange,
	onDeleted,
}: {
	post: JobPost | null;
	onOpenChange: (open: boolean) => void;
	onDeleted?: (post: JobPost) => void;
}) {
	const deletePost = useDeletePost();
	const [deleteError, setDeleteError] = useState<string | null>(null);
	const open = post != null;

	const handleOpenChange = (nextOpen: boolean) => {
		// Không cho đóng dialog (Esc/bấm ra ngoài) trong lúc đang xoá.
		if (!nextOpen && deletePost.isPending) return;
		onOpenChange(nextOpen);
	};

	const confirmDelete = async () => {
		if (!post) return;
		setDeleteError(null);
		try {
			await deletePost.mutateAsync(post.id);
			toast.add({ type: "success", title: "Xoá bài đăng thành công" });
			onDeleted?.(post);
		} catch (rawError) {
			const error = extractBackendErrors(rawError);
			setDeleteError(
				error.globalErrors[0] ?? "Xoá bài đăng thất bại. Vui lòng thử lại.",
			);
		}
	};

	return (
		<AlertDialog open={open} onOpenChange={handleOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogMedia>
						<TriangleAlertIcon className="text-destructive" />
					</AlertDialogMedia>
					<AlertDialogTitle>Xoá bài đăng?</AlertDialogTitle>
					<AlertDialogDescription>
						Bạn có chắc chắn muốn xoá bài đăng “{post?.title}”? Hành động này
						không thể hoàn tác.
					</AlertDialogDescription>
				</AlertDialogHeader>

				{deleteError && (
					<p
						role="alert"
						className="text-center text-sm font-medium text-destructive"
					>
						{deleteError}
					</p>
				)}

				<AlertDialogFooter>
					<AlertDialogCancel disabled={deletePost.isPending}>
						Huỷ bỏ
					</AlertDialogCancel>
					<AlertDialogAction
						variant="destructive"
						disabled={deletePost.isPending}
						onClick={confirmDelete}
					>
						{deletePost.isPending ? "Đang xoá..." : "Xoá bài đăng"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
