import {
	BadgeDollarSignIcon,
	ClockIcon,
	MapPinIcon,
	SquarePenIcon,
	Trash2Icon,
	Users2Icon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Description } from "@/components/ui/description";
import { calculateRemainingDays } from "@/lib/datetime";
import { formatSalary } from "@/lib/salary";
import {
	EXPERIENCE_LEVELS_MAP,
	JOB_POST_STATUS_MAP,
	JOB_TYPES_MAP,
	type JobPost,
	type JobPostStatus,
	WORK_MODELS_MAP,
} from "@/types/post";
import { Skeleton } from "./ui/skeleton";

const STATUS_VARIANT: Record<
	JobPostStatus,
	"default" | "secondary" | "outline"
> = {
	ACTIVE: "default",
	CLOSED: "secondary",
	EXPIRED: "outline",
};

export function JobPostCard({
	post,
	isManager,
	onDeleteRequest,
}: {
	post: JobPost;
	isManager?: boolean;
	onDeleteRequest?: (post: JobPost) => void;
}) {
	return (
		<Card className="gap-3 pt-2.75 shadow">
			<CardHeader className="flex items-center gap-3">
				<CardTitle className="text-base">{post.title}</CardTitle>

				{isManager && (
					<Badge variant={STATUS_VARIANT[post.status]}>
						{JOB_POST_STATUS_MAP[post.status]}
					</Badge>
				)}

				{isManager && (
					<div className="flex items-center gap-2 ml-auto">
						<Button
							variant="outline"
							render={<Link to={`/posts/${post.id}/edit`} state={{ post }} />}
						>
							<SquarePenIcon /> Chỉnh sửa
						</Button>

						<Button
							size="icon"
							variant="destructive"
							aria-label={`Xoá bài đăng “${post.title}”`}
							onClick={() => onDeleteRequest?.(post)}
						>
							<Trash2Icon />
						</Button>
					</div>
				)}
			</CardHeader>

			<CardContent className="-mt-2 space-y-2">
				<Description className="font-medium text-green-700">
					<BadgeDollarSignIcon />
					{formatSalary(post.salary_min, post.salary_max)}

					<span className="text-muted-foreground">
						/ {WORK_MODELS_MAP[post.work_model]}
					</span>
				</Description>

				<Description>
					<MapPinIcon />

					{post.work_model === "REMOTE" ? (
						<span>Toàn Quốc</span>
					) : (
						<span>
							{post.district.name}, {post.province.name}
						</span>
					)}
				</Description>
			</CardContent>

			<CardFooter className="py-3">
				<div className="flex flex-wrap gap-1.5">
					<Badge variant="outline">{JOB_TYPES_MAP[post.job_type]}</Badge>
					<Badge variant="outline">
						{EXPERIENCE_LEVELS_MAP[post.experience_level]}
					</Badge>
				</div>

				<div className="ml-auto flex gap-x-5 text-xs text-muted-foreground">
					<Description>
						<Users2Icon />
						Số lượng: {post.head_count}
					</Description>

					<Description>
						<ClockIcon className="size-4" />
						Còn {calculateRemainingDays(post.deadline)} ngày
					</Description>
				</div>
			</CardFooter>
		</Card>
	);
}

export function JobPostSkeletons() {
	return (
		<div className="flex flex-col gap-4">
			{[...Array(15)].map((_, index) => (
				<Card key={index} className="h-38">
					<CardContent className="flex flex-col gap-3">
						<Skeleton className="h-6 w-1/3" />
						<Skeleton className="h-4 w-1/2" />
						<Skeleton className="h-4 w-2/3" />
						<Skeleton className="mt-2 h-6 w-full" />
					</CardContent>
				</Card>
			))}
		</div>
	);
}
