import {
	BriefcaseIcon,
	ClockIcon,
	FileTextIcon,
	TrendingUpIcon,
} from "lucide-react";
import { useGetEmployerDashboard } from "@/api/post-api";
import { Card, CardContent } from "@/components/ui/card";

export default function EmployerDashboard() {
	const { data: stats, isLoading } = useGetEmployerDashboard();

	const cards = stats
		? [
				{
					label: "Tổng tin đã đăng",
					value: stats.total_posts,
					icon: BriefcaseIcon,
				},
				{
					label: "Tin đang tuyển",
					value: stats.active_posts,
					icon: TrendingUpIcon,
				},
				{
					label: "Tổng CV nhận được",
					value: stats.total_applications,
					icon: FileTextIcon,
				},
				{
					label: "Hồ sơ chờ duyệt",
					value: stats.pending_applications,
					icon: ClockIcon,
				},
			]
		: [];

	return (
		<div className="mx-auto max-w-5xl space-y-8 px-4 py-12">
			<div>
				<h1 className="font-semibold text-2xl tracking-tight">
					Dashboard nhà tuyển dụng
				</h1>
				<p className="mt-1 text-muted-foreground text-sm">
					Tổng quan tin đăng và hồ sơ ứng tuyển của bạn.
				</p>
			</div>

			{isLoading ? (
				<p className="text-muted-foreground text-sm">Đang tải...</p>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{cards.map((card) => (
						<Card key={card.label}>
							<CardContent className="flex items-center gap-4 py-6">
								<div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary">
									<card.icon className="size-5" />
								</div>
								<div className="min-w-0">
									<p className="font-semibold text-2xl tracking-tight">
										{card.value}
									</p>
									<p className="truncate text-muted-foreground text-xs">
										{card.label}
									</p>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
