import {
	BriefcaseIcon,
	BuildingIcon,
	CalendarIcon,
	FileTextIcon,
	MapPinIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useGetMyApplications } from "@/api/post-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDisplayDate } from "@/lib/datetime";
import { formatSalary } from "@/lib/salary";
import { APPLICATION_STATUS_MAP } from "@/types/application";

export default function MyApplicationsPage() {
	const { data: applications, isLoading, isError } = useGetMyApplications();

	if (isLoading) {
		return (
			<main className="mx-auto max-w-4xl space-y-6 pt-8 pb-12 px-4">
				<h1 className="font-bold text-2xl">Công việc đã ứng tuyển</h1>
				<div className="flex flex-col gap-4">
					{[1, 2, 3].map((i) => (
						<Skeleton key={i} className="h-36 w-full" />
					))}
				</div>
			</main>
		);
	}

	if (isError) {
		return (
			<main className="mx-auto max-w-4xl pt-16 px-4 text-center text-destructive">
				Có lỗi xảy ra khi tải danh sách. Vui lòng thử lại sau.
			</main>
		);
	}

	return (
		<main className="mx-auto max-w-4xl space-y-8 pt-8 pb-12 px-4">
			<div>
				<h1 className="font-bold text-2xl tracking-tight">
					Công việc đã ứng tuyển
				</h1>
				<p className="mt-1 text-muted-foreground text-sm">
					Theo dõi trạng thái các hồ sơ bạn đã gửi đến nhà tuyển dụng.
				</p>
			</div>

			{applications?.length === 0 ? (
				<Card className="border-dashed">
					<CardContent className="flex flex-col items-center gap-2 py-12 text-center">
						<BriefcaseIcon className="size-10 text-muted-foreground" />
						<p className="text-muted-foreground text-sm">
							Bạn chưa ứng tuyển công việc nào.
						</p>
						<Button
							className="mt-2"
							render={<Link to="/" />}
							nativeButton={false}
						>
							Tìm việc ngay
						</Button>
					</CardContent>
				</Card>
			) : (
				<div className="flex flex-col gap-4">
					{applications?.map((app) => {
						const statusInfo = APPLICATION_STATUS_MAP[app.status];
						const isRemote = app.job_post.work_model === "REMOTE";

						return (
							<Card
								key={app.id}
								className="transition-colors hover:bg-muted/30"
							>
								<CardContent className="p-5 flex flex-col md:flex-row gap-5 md:items-center">
									<div className="flex-1 space-y-2.5">
										<div className="flex flex-wrap justify-between items-start gap-4">
											<Link
												to={`/posts/${app.job_post.id}`}
												className="font-semibold text-lg text-primary hover:underline line-clamp-1"
											>
												{app.job_post.title}
											</Link>
											<Badge variant={statusInfo.variant} className="shrink-0">
												{statusInfo.label}
											</Badge>
										</div>

										<div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
											<BuildingIcon className="size-4 text-muted-foreground" />
											{app.job_post.employer.company_name ||
												app.job_post.employer.full_name}
										</div>

										<div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
											<span className="flex items-center gap-1.5">
												<MapPinIcon className="size-4" />
												{isRemote ? "Toàn Quốc" : app.job_post.province.name}
											</span>
											<span className="flex items-center gap-1 text-green-700 font-medium">
												{formatSalary(
													app.job_post.salary_min,
													app.job_post.salary_max,
												)}
											</span>
										</div>
									</div>

									<div className="border-t md:border-t-0 md:border-l pt-3 md:pt-0 md:pl-5 min-w-50 flex flex-col gap-2 text-sm">
										<div className="flex items-center gap-2 text-muted-foreground">
											<CalendarIcon className="size-4 shrink-0" />
											<span>
												Nộp ngày:{" "}
												<span className="font-medium text-foreground">
													{formatDisplayDate(app.created_at)}
												</span>
											</span>
										</div>
										<div className="flex items-center gap-2 text-muted-foreground">
											<FileTextIcon className="size-4 shrink-0" />
											<span className="truncate">
												CV:{" "}
												<span
													className="font-medium text-foreground"
													title={app.resume.title}
												>
													{app.resume.title}
												</span>
											</span>
										</div>
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			)}
		</main>
	);
}
