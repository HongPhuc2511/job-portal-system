import { Link, useParams } from "react-router-dom";
import { useGetJobPost } from "@/api/post-api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function PostDetailPage() {
	const { id } = useParams();
	const postId = Number(id);

	const { data: post, isPending, isError } = useGetJobPost(postId);

	if (isPending) {
		return (
			<main className="mx-auto max-w-4xl pt-8 px-4">
				<Skeleton className="h-10 w-2/3 mb-6" />
				<Skeleton className="h-64 w-full" />
			</main>
		);
	}

	if (isError || !post) {
		return (
			<main className="mx-auto max-w-4xl pt-8 px-4">
				<Alert variant="destructive">
					<AlertTitle>Không tìm thấy</AlertTitle>
					<AlertDescription>
						Bài đăng này không tồn tại hoặc đã bị xóa.
					</AlertDescription>
				</Alert>
				<Button className="mt-4" variant="outline" render={<Link to="/" />}>
					Về trang chủ
				</Button>
			</main>
		);
	}

	return <main className="mx-auto max-w-4xl space-y-6 pt-6 pb-12 px-4"></main>;
}
