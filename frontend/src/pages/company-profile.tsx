import { GlobeIcon, PhoneIcon, UserRoundIcon } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useGetEmployerPublicProfile } from "@/api/auth";
import { useGetEmployerPosts } from "@/api/post-api";
import { AutoPagination } from "@/components/auto-pagination";
import { JobPostCard, JobPostSkeletons } from "@/components/job-post-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Description } from "@/components/ui/description";
import { Skeleton } from "@/components/ui/skeleton";
import type { EmployerPublicProfile } from "@/types/employer";

export default function CompanyProfilePage() {
	const { id } = useParams();
	const employerId = Number(id);
	const validEmployerId = Number.isInteger(employerId) && employerId > 0;

	const profileQuery = useGetEmployerPublicProfile(employerId);
	const profile = profileQuery.data;

	return (
		<main className="mx-auto max-w-3xl space-y-6 pt-12 pb-10">
			{(!validEmployerId || profileQuery.isError) && <CompanyNotFound />}

			{validEmployerId && profileQuery.isPending && <CompanyProfileSkeleton />}

			{validEmployerId && profile != null && (
				<>
					<CompanyProfileCard profile={profile} />
					<CompanyPostList key={profile.id} employerId={profile.id} />
				</>
			)}
		</main>
	);
}

function CompanyProfileCard({ profile }: { profile: EmployerPublicProfile }) {
	const displayName = profile.company_name || profile.full_name || "Công ty";

	const website = profile.company_website?.trim();
	const websiteUrl =
		website && !/^https?:\/\//i.test(website) ? `https://${website}` : website;

	return (
		<Card>
			<CardContent className="flex flex-col items-center gap-5 sm:flex-row">
				<Avatar aria-hidden="true" className="size-32">
					<AvatarFallback className="text-5xl font-bold">
						{displayName.charAt(0)}
					</AvatarFallback>
				</Avatar>

				<div className="min-w-0 flex-1 space-y-1.5">
					<h1 className="font-bold text-xl break-words">{displayName}</h1>

					{profile.full_name && (
						<Description>
							<UserRoundIcon />
							Liên hệ: {profile.full_name}
						</Description>
					)}

					{profile.phone && (
						<Description>
							<PhoneIcon />
							<a href={`tel:${profile.phone}`} className="hover:underline">
								{profile.phone}
							</a>
						</Description>
					)}

					{websiteUrl && (
						<Description>
							<GlobeIcon />
							<a
								href={websiteUrl}
								target="_blank"
								rel="noreferrer"
								className="break-all text-primary hover:underline"
							>
								{website}
							</a>
						</Description>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

function CompanyPostList({ employerId }: { employerId: number }) {
	const [page, setPage] = useState(1);
	const postsQuery = useGetEmployerPosts(employerId, page);

	if (postsQuery.status === "pending") return <JobPostSkeletons />;

	if (postsQuery.status === "error")
		return (
			<Alert variant="destructive">
				<AlertTitle>Có lỗi xảy ra</AlertTitle>
				<AlertDescription>
					Không thể tải danh sách bài đăng của công ty. Vui lòng thử lại sau.
				</AlertDescription>
			</Alert>
		);

	const posts = postsQuery.data.items;
	const pagination = postsQuery.data.pagination;

	const goToPage = (nextPage: number) => {
		setPage(nextPage);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<section className="space-y-4">
			<h2 className="font-bold text-lg">
				Bài đăng tuyển dụng ({pagination.total})
			</h2>

			{posts.length === 0 ? (
				<p className="py-8 text-center text-muted-foreground">
					Công ty chưa có bài đăng nào.
				</p>
			) : (
				<div className="flex flex-col gap-4">
					{posts.map((post) => (
						<JobPostCard key={post.id} post={post} />
					))}
				</div>
			)}

			<div className="flex justify-center">
				<AutoPagination pagination={pagination} goToPage={goToPage} />
			</div>
		</section>
	);
}

function CompanyNotFound() {
	return (
		<div className="flex flex-col items-start gap-4">
			<Alert variant="destructive">
				<AlertTitle>Không tìm thấy công ty</AlertTitle>
				<AlertDescription>
					Không thể tải thông tin công ty. Vui lòng kiểm tra lại đường dẫn.
				</AlertDescription>
			</Alert>
			<Button variant="outline" render={<Link to="/" />}>
				Về trang chủ
			</Button>
		</div>
	);
}

function CompanyProfileSkeleton() {
	return (
		<Card>
			<CardContent className="flex items-center gap-5 p-6">
				<Skeleton className="size-16 shrink-0 rounded-xl" />
				<div className="flex-1 space-y-2">
					<Skeleton className="h-6 w-1/3" />
					<Skeleton className="h-4 w-1/2" />
					<Skeleton className="h-4 w-2/5" />
				</div>
			</CardContent>
		</Card>
	);
}
