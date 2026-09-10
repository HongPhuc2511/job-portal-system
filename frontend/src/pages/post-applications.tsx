import {
	ArrowLeftIcon,
	CalendarIcon,
	CheckIcon,
	EyeIcon,
	FileTextIcon,
	LockIcon,
	MailIcon,
	PhoneIcon,
	RotateCcwIcon,
	UsersIcon,
	XIcon,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
	useGetPostApplications,
	useUpdateApplicationStatus,
	useUpdatePostStatus,
} from "@/api/application-api";
import { useGetJobPost } from "@/api/post-api";
import { ResumePreview } from "@/components/resume-preview";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/context/auth-context";
import { extractBackendErrors } from "@/lib/backend-error";
import { formatDisplayDate } from "@/lib/datetime";
import {
	APPLICATION_STATUS_MAP,
	type ApplicationStatus,
	type JobPostApplication,
} from "@/types/application";
import { JOB_POST_STATUS_MAP, type JobPostStatus } from "@/types/post";

const POST_STATUS_VARIANT: Record<
	JobPostStatus,
	"default" | "secondary" | "outline"
> = {
	ACTIVE: "default",
	CLOSED: "secondary",
	EXPIRED: "outline",
};

const STATUS_FILTERS: { value: ApplicationStatus | null; label: string }[] = [
	{ value: null, label: "Tất cả" },
	{ value: "pending", label: "Đang chờ" },
	{ value: "approved", label: "Đã duyệt" },
	{ value: "rejected", label: "Từ chối" },
];

export default function PostApplicationsPage() {
	const { postId: postIdParam } = useParams();
	const postId = Number(postIdParam);

	const { user } = useAuth();
	const [statusFilter, setStatusFilter] = useState<ApplicationStatus | null>(
		null,
	);
	const [previewApplication, setPreviewApplication] =
		useState<JobPostApplication | null>(null);
	const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);

	const postQuery = useGetJobPost(postId);
	const applicationsQuery = useGetPostApplications(postId, statusFilter);
	const updateStatus = useUpdateApplicationStatus();
	const updatePostStatus = useUpdatePostStatus();

	if (user?.role !== "employer") {
		return <div>Bạn không có quyền truy cập trang này.</div>;
	}

	const post = postQuery.data;
	const isClosed = post?.status === "CLOSED";
	const applications = applicationsQuery.data ?? [];

	const handleChangeStatus = async (
		application: JobPostApplication,
		status: ApplicationStatus,
	) => {
		try {
			await updateStatus.mutateAsync({
				postId,
				applicationId: application.id,
				status,
			});
			toast.add({
				type: "success",
				title: `Đã chuyển hồ sơ của ${application.candidate.full_name} sang “${APPLICATION_STATUS_MAP[status].label}”`,
			});
		} catch (rawError) {
			const error = extractBackendErrors(rawError);
			toast.add({
				type: "error",
				title:
					error.globalErrors[0] ??
					"Cập nhật trạng thái hồ sơ thất bại. Vui lòng thử lại.",
			});
		}
	};

	const handleTogglePostStatus = async () => {
		const nextStatus = isClosed ? "ACTIVE" : "CLOSED";
		try {
			await updatePostStatus.mutateAsync({ postId, status: nextStatus });
			setIsCloseDialogOpen(false);
			toast.add({
				type: "success",
				title: isClosed
					? "Đã mở lại bài đăng tuyển dụng"
					: "Đã đóng bài đăng tuyển dụng",
			});
		} catch (rawError) {
			const error = extractBackendErrors(rawError);
			toast.add({
				type: "error",
				title:
					error.globalErrors[0] ?? "Thao tác thất bại. Vui lòng thử lại sau.",
			});
		}
	};

	return (
		<main className="mx-auto max-w-4xl space-y-6 pt-8 px-4 pb-12">
			<div>
				<Button
					variant="outline"
					render={<Link to="/manage-posts" />}
					nativeButton={false}
					className="mb-4"
				>
					<ArrowLeftIcon />
					Quay lại quản lý bài đăng
				</Button>

				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="flex min-w-0 items-center gap-3">
						{postQuery.isPending ? (
							<Skeleton className="h-7 w-64" />
						) : post ? (
							<>
								<h1 className="min-w-0 truncate font-bold text-xl">
									{post.title}
								</h1>
								<Badge variant={POST_STATUS_VARIANT[post.status]}>
									{JOB_POST_STATUS_MAP[post.status]}
								</Badge>
							</>
						) : null}
					</div>

					{post && (
						<Button
							variant="outline"
							onClick={() => setIsCloseDialogOpen(true)}
							disabled={updatePostStatus.isPending}
						>
							{isClosed ? <RotateCcwIcon /> : <LockIcon />}
							{isClosed ? "Mở lại tuyển dụng" : "Đóng bài đăng"}
						</Button>
					)}
				</div>
			</div>

			{postQuery.isError && (
				<Alert variant="destructive">
					<AlertTitle>Không tìm thấy bài đăng</AlertTitle>
					<AlertDescription>
						Bài đăng này không tồn tại hoặc đã bị xoá. Vui lòng quay lại trang
						quản lý bài đăng.
					</AlertDescription>
				</Alert>
			)}

			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex flex-wrap gap-2">
					{STATUS_FILTERS.map((filter) => (
						<Button
							key={filter.label}
							size="sm"
							variant={statusFilter === filter.value ? "default" : "outline"}
							onClick={() => setStatusFilter(filter.value)}
						>
							{filter.label}
						</Button>
					))}
				</div>

				{applicationsQuery.data && (
					<p className="text-sm text-muted-foreground">
						{applicationsQuery.data.length} hồ sơ
					</p>
				)}
			</div>

			{applicationsQuery.isPending ? (
				<div className="flex flex-col gap-4">
					{[...Array(3)].map((_, index) => (
						<Skeleton key={index} className="h-40 w-full" />
					))}
				</div>
			) : applicationsQuery.isError ? (
				<Alert variant="destructive">
					<AlertTitle>Có lỗi xảy ra</AlertTitle>
					<AlertDescription>
						Không thể tải danh sách hồ sơ ứng tuyển. Vui lòng thử lại sau.
					</AlertDescription>
				</Alert>
			) : applications.length === 0 ? (
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<UsersIcon />
						</EmptyMedia>
						<EmptyTitle>
							{statusFilter === null
								? "Chưa có hồ sơ nào"
								: `Không có hồ sơ ${APPLICATION_STATUS_MAP[statusFilter].label.toLowerCase()}`}
						</EmptyTitle>
						<EmptyDescription>
							{statusFilter === null
								? "Ứng viên gửi hồ sơ tới bài đăng này sẽ xuất hiện tại đây."
								: "Bạn có thể chuyển tab khác để xem các hồ sơ còn lại."}
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			) : (
				<div className="flex flex-col gap-4">
					{applications.map((application) => (
						<ApplicationCard
							key={application.id}
							application={application}
							isUpdating={updateStatus.isPending}
							onPreview={setPreviewApplication}
							onChangeStatus={handleChangeStatus}
						/>
					))}
				</div>
			)}

			{/* Xem trước CV (CV builder — nội dung nằm sẵn trong resume.content). */}
			<Dialog
				open={previewApplication != null}
				onOpenChange={(open) => {
					if (!open) setPreviewApplication(null);
				}}
			>
				<DialogContent size="lg" className="px-6 py-6">
					<DialogHeader>
						<DialogTitle>
							CV của {previewApplication?.candidate.full_name}
						</DialogTitle>
					</DialogHeader>
					<DialogClose />
					{previewApplication?.resume.content && (
						<ResumePreview
							title={previewApplication.resume.title}
							content={previewApplication.resume.content}
						/>
					)}
				</DialogContent>
			</Dialog>

			{/* Xác nhận đóng / mở lại bài đăng. */}
			<AlertDialog
				open={isCloseDialogOpen}
				onOpenChange={(open) => {
					if (!updatePostStatus.isPending) setIsCloseDialogOpen(open);
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogMedia>
							{isClosed ? (
								<RotateCcwIcon />
							) : (
								<LockIcon className="text-destructive" />
							)}
						</AlertDialogMedia>
						<AlertDialogTitle>
							{isClosed ? "Mở lại tuyển dụng?" : "Đóng bài đăng?"}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{isClosed
								? "Bài đăng sẽ xuất hiện trở lại trong danh sách tuyển dụng và ứng viên có thể nộp hồ sơ."
								: "Đóng bài đăng sẽ tự động chuyển toàn bộ hồ sơ đang chờ sang trạng thái “Từ chối”. Bạn có chắc chắn muốn đóng?"}
						</AlertDialogDescription>
					</AlertDialogHeader>

					<AlertDialogFooter>
						<AlertDialogCancel disabled={updatePostStatus.isPending}>
							Huỷ bỏ
						</AlertDialogCancel>
						<AlertDialogAction
							variant={isClosed ? "default" : "destructive"}
							disabled={updatePostStatus.isPending}
							onClick={handleTogglePostStatus}
						>
							{updatePostStatus.isPending
								? "Đang xử lý..."
								: isClosed
									? "Mở lại bài đăng"
									: "Đóng bài đăng"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</main>
	);
}

function ApplicationCard({
	application,
	isUpdating,
	onPreview,
	onChangeStatus,
}: {
	application: JobPostApplication;
	isUpdating: boolean;
	onPreview: (application: JobPostApplication) => void;
	onChangeStatus: (
		application: JobPostApplication,
		status: ApplicationStatus,
	) => void;
}) {
	const statusInfo = APPLICATION_STATUS_MAP[application.status];
	// CV dạng upload (PDF) chưa có API cho employer tải file — chỉ xem được CV builder.
	const canPreview =
		application.resume.resume_type === "builder" &&
		application.resume.content != null;

	return (
		<Card>
			<CardContent className="space-y-4 p-5">
				<div className="flex flex-wrap items-start justify-between gap-3">
					<div className="min-w-0">
						<p className="font-semibold">{application.candidate.full_name}</p>
						<div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
							<span className="flex items-center gap-1.5">
								<MailIcon className="size-4" />
								{application.candidate.email}
							</span>
							{application.candidate.phone && (
								<span className="flex items-center gap-1.5">
									<PhoneIcon className="size-4" />
									{application.candidate.phone}
								</span>
							)}
						</div>
					</div>
					<Badge variant={statusInfo.variant} className="shrink-0">
						{statusInfo.label}
					</Badge>
				</div>

				<Separator />

				<div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
					<span className="flex min-w-0 items-center gap-1.5">
						<FileTextIcon className="size-4 shrink-0" />
						<span className="truncate">
							CV:{" "}
							<span className="font-medium text-foreground">
								{application.resume.title}
							</span>
						</span>
					</span>
					<span className="flex items-center gap-1.5">
						<CalendarIcon className="size-4" />
						Nộp ngày:{" "}
						<span className="font-medium text-foreground">
							{formatDisplayDate(application.created_at)}
						</span>
					</span>
				</div>

				{application.cover_letter && (
					<div className="rounded-lg bg-muted/50 p-3">
						<p className="mb-1 text-xs font-medium text-muted-foreground">
							Thư giới thiệu
						</p>
						<p className="text-sm whitespace-pre-wrap">
							{application.cover_letter}
						</p>
					</div>
				)}

				<div className="flex flex-wrap items-center gap-2">
					<Button
						size="sm"
						variant="outline"
						onClick={() => onPreview(application)}
						disabled={!canPreview}
						title={
							canPreview
								? undefined
								: "CV dạng file PDF hiện chưa xem trước được"
						}
					>
						<EyeIcon />
						Xem CV
					</Button>

					{application.status === "pending" && (
						<Button
							size="sm"
							className="ml-auto"
							onClick={() => onChangeStatus(application, "approved")}
							disabled={isUpdating}
						>
							<CheckIcon />
							Duyệt
						</Button>
					)}
					{application.status !== "rejected" && (
						<Button
							size="sm"
							variant="destructive"
							onClick={() => onChangeStatus(application, "rejected")}
							disabled={isUpdating}
						>
							<XIcon />
							Từ chối
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
