import { cn } from "cn";
import {
	BadgeDollarSignIcon,
	BuildingIcon,
	ClockIcon,
	EllipsisIcon,
	LockIcon,
	MapPinIcon,
	RotateCcwIcon,
	SquarePenIcon,
	Trash2Icon,
	Users2Icon,
	UsersIcon,
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
import { ButtonGroup } from "./ui/button-group";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Skeleton } from "./ui/skeleton";

const STATUS_VARIANT: Record<
	JobPostStatus,
	"yellow" | "destructive" | "outline"
> = {
	ACTIVE: "yellow",
	CLOSED: "destructive",
	EXPIRED: "outline",
};

export function JobPostCard({
	post,
	isManager,
	onDeleteRequest,
	onCloseRequest,
}: {
	post: JobPost;
	isManager?: boolean;
	onDeleteRequest?: (post: JobPost) => void;
	onCloseRequest?: (post: JobPost) => void;
}) {
	return (
		<Card
			className={cn(
				"gap-3 pt-2.75 shadow h-43",
				isManager && "sm:flex-row sm:gap-0 sm:pt-0 sm:pr-0",
			)}
		>
			<div
				className={cn(
					"flex min-w-0 flex-1 flex-col gap-3",
					isManager && "sm:pt-2.75",
				)}
			>
				<CardHeader className="flex items-center gap-3">
					<CardTitle className="text-base hover:underline hover:text-primary transition-colors">
						<Link to={`/posts/${post.id}`}>{post.title}</Link>
					</CardTitle>
				</CardHeader>

				<CardContent className="-mt-2 space-y-2">
					<Description>
						<Link
							to={`/companies/${post.employer.id}`}
							className="flex items-center gap-1 hover:underline"
						>
							<BuildingIcon />
							{post.employer.company_name}
						</Link>
					</Description>

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

				<CardFooter className={cn("py-3", isManager && "rounded-br-none")}>
					<div className="flex flex-wrap gap-1.5">
						<Badge variant="outline">{JOB_TYPES_MAP[post.job_type]}</Badge>
						<Badge variant="outline">
							{EXPERIENCE_LEVELS_MAP[post.experience_level]}
						</Badge>
					</div>

					<div className="ml-auto flex flex-wrap items-center justify-end gap-x-5 gap-y-2 text-xs text-muted-foreground">
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
			</div>

			{isManager && (
				<ManagerPanel
					post={post}
					onDeleteRequest={onDeleteRequest}
					onCloseRequest={onCloseRequest}
				/>
			)}
		</Card>
	);
}

/** Cột quản lý bên phải, dành riêng cho nhà tuyển dụng: trạng thái + thống kê hồ sơ + thao tác. */
function ManagerPanel({
	post,
	onDeleteRequest,
	onCloseRequest,
}: {
	post: JobPost;
	onDeleteRequest?: (post: JobPost) => void;
	onCloseRequest?: (post: JobPost) => void;
}) {
	const stats = post.application_stats;

	const statRows: {
		label: string;
		value: number;
		valueClassName?: string;
	}[] = [
		{ label: "Hồ sơ", value: stats.total },
		{
			label: "Chờ",
			value: stats.pending,
			valueClassName: "text-amber-600 dark:text-amber-400",
		},
		{
			label: "Đã duyệt",
			value: stats.approved,
			valueClassName: "text-green-700 dark:text-green-400",
		},
		{
			label: "Từ chối",
			value: stats.rejected,
			valueClassName: "text-destructive",
		},
	];

	return (
		<div className="flex flex-col gap-4 border-t bg-muted px-2 py-3 sm:w-56 sm:border-t-0 sm:border-l">
			<Badge variant={STATUS_VARIANT[post.status]} className="w-fit">
				{JOB_POST_STATUS_MAP[post.status]}
			</Badge>

			<div className="grid grid-cols-2 gap-1">
				{statRows.map((row) => (
					<div
						key={row.label}
						className="flex items-center justify-between gap-1 rounded-md bg-background px-2 py-1 border"
					>
						<span className="text-xs text-muted-foreground">{row.label}</span>
						<span className={cn("text-sm font-semibold", row.valueClassName)}>
							{row.value}
						</span>
					</div>
				))}
			</div>

			<div className="mt-auto flex flex-col gap-2">
				<ButtonGroup className="w-full">
					<Button
						variant="outline"
						size="sm"
						className="flex-1"
						render={<Link to={`/manage-posts/${post.id}/applications`} />}
					>
						<UsersIcon /> Xem hồ sơ ứng viên
					</Button>

					<DropdownMenu>
						<DropdownMenuTrigger
							render={
								<Button variant="outline" size="icon-sm">
									<EllipsisIcon />
								</Button>
							}
						></DropdownMenuTrigger>
						<DropdownMenuContent className="w-48" align="end">
							<DropdownMenuGroup>
								<DropdownMenuItem
									render={
										<Link to={`/posts/${post.id}/edit`} state={{ post }} />
									}
								>
									<SquarePenIcon /> Chỉnh sửa
								</DropdownMenuItem>
								{post.status !== "EXPIRED" && (
									<DropdownMenuItem onClick={() => onCloseRequest?.(post)}>
										{post.status === "ACTIVE" ? (
											<LockIcon />
										) : (
											<RotateCcwIcon />
										)}
										{post.status === "ACTIVE"
											? "Đóng bài đăng"
											: "Mở lại tuyển dụng"}
									</DropdownMenuItem>
								)}
							</DropdownMenuGroup>

							<DropdownMenuSeparator />

							<DropdownMenuGroup>
								<DropdownMenuItem
									variant="destructive"
									nativeButton={false}
									onClick={() => onDeleteRequest?.(post)}
								>
									<Trash2Icon /> Xoá
								</DropdownMenuItem>
							</DropdownMenuGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				</ButtonGroup>
			</div>
		</div>
	);
}

export function JobPostSkeletons() {
	return (
		<div className="flex flex-col gap-4">
			{[...Array(15)].map((_, index) => (
				<Card key={index} className="h-43">
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
