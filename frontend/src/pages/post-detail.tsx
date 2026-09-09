import {
	BadgeDollarSignIcon,
	BriefcaseIcon,
	BuildingIcon,
	CalendarClockIcon,
	ChevronLeftIcon,
	Loader2Icon,
	MapPinIcon,
	Users2Icon,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useApplyToPost, useGetJobPost } from "@/api/post-api";
import { useGetResumesQuery } from "@/api/resume";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Description } from "@/components/ui/description";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/context/auth-context";
import { extractBackendErrors } from "@/lib/backend-error";
import { calculateRemainingDays, formatDisplayDate } from "@/lib/datetime";
import { formatSalary } from "@/lib/salary";
import {
	EXPERIENCE_LEVELS_MAP,
	JOB_TYPES_MAP,
	WORK_MODELS_MAP,
} from "@/types/post";

export default function PostDetailPage() {
	const { id } = useParams();
	const postId = Number(id);

	const { user } = useAuth();

	const [isApplying, setIsApplying] = useState(false);
	const [selectedResumeId, setSelectedResumeId] = useState<string>("");
	const [coverLetter, setCoverLetter] = useState("");

	const { data: post, isPending, isError } = useGetJobPost(postId);
	const { data: resumes, isLoading: isLoadingResumes } = useGetResumesQuery();
	const applyMutation = useApplyToPost();

	const handleApply = async () => {
		if (!selectedResumeId) {
			toast.add({ type: "error", title: "Vui lòng chọn CV để ứng tuyển" });
			return;
		}
		try {
			await applyMutation.mutateAsync({
				postId,
				data: {
					resume_id: Number(selectedResumeId),
					cover_letter: coverLetter.trim() || undefined,
				},
			});
			toast.add({ type: "success", title: "Nộp hồ sơ thành công!" });
			setIsApplying(false);
		} catch (err) {
			const errors = extractBackendErrors(err);
			toast.add({
				type: "error",
				title: errors.globalErrors[0] || "Có lỗi xảy ra khi nộp hồ sơ",
			});
		}
	};

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

	const isRemote = post.work_model === "REMOTE";

	return (
		<main className="mx-auto max-w-4xl space-y-6 pt-6 pb-12 px-4">
			<Button variant="outline" render={<Link to="/" />}>
				<ChevronLeftIcon />
				Quay lại danh sách
			</Button>

			<div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="text-2xl text-primary leading-tight">
								{post.title}
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<Description className="text-base text-foreground font-medium">
								<Link
									to={`/companies/${post.employer.id}`}
									className="flex items-center gap-1.5 hover:underline hover:text-primary"
								>
									<BuildingIcon className="size-5 text-muted-foreground" />
									{post.employer.company_name || post.employer.full_name}
								</Link>
							</Description>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
								<Description className="font-medium text-green-700">
									<BadgeDollarSignIcon className="size-5" />
									{formatSalary(post.salary_min, post.salary_max)}
								</Description>
								<Description>
									<MapPinIcon className="size-5" />
									{isRemote
										? "Toàn Quốc"
										: `${post.district.name}, ${post.province.name}`}
								</Description>
								<Description>
									<BriefcaseIcon className="size-5" />
									{JOB_TYPES_MAP[post.job_type]} -{" "}
									{WORK_MODELS_MAP[post.work_model]}
								</Description>
								<Description>
									<CalendarClockIcon className="size-5" />
									Hạn nộp: {formatDisplayDate(post.deadline)} (Còn{" "}
									{calculateRemainingDays(post.deadline)} ngày)
								</Description>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Chi tiết tin tuyển dụng</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="whitespace-pre-wrap text-sm/relaxed">
								{post.description}
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="space-y-6 lg:sticky lg:top-18 self-start">
					<Card>
						<CardContent className="p-4 space-y-4">
							{!user ? (
								<Button
									size="lg"
									className="w-full text-base font-semibold"
									render={<Link to="/login" />}
									nativeButton={false}
								>
									Đăng nhập để ứng tuyển
								</Button>
							) : user.role === "employer" ? (
								<Button
									size="lg"
									className="w-full text-base font-semibold"
									disabled
								>
									Tài khoản Tuyển dụng
								</Button>
							) : isApplying ? (
								<div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
									<div className="space-y-1.5">
										<Label>
											Chọn CV của bạn{" "}
											<span className="text-destructive">*</span>
										</Label>
										{isLoadingResumes ? (
											<div className="h-8 flex items-center text-sm text-muted-foreground">
												<Loader2Icon className="mr-2 size-4 animate-spin" />{" "}
												Đang tải CV...
											</div>
										) : resumes?.length === 0 ? (
											<p className="text-sm text-destructive mt-1">
												Bạn chưa có CV nào.{" "}
												<Link
													to="/resumes"
													className="underline font-medium hover:text-primary"
												>
													Tạo CV ngay
												</Link>
											</p>
										) : (
											<Select
												value={selectedResumeId}
												onValueChange={(val) => setSelectedResumeId(val ?? "")}
											>
												<SelectTrigger className="w-full">
													<SelectValue placeholder="-- Vui lòng chọn CV --" />
												</SelectTrigger>
												<SelectContent>
													{resumes?.map((r) => (
														<SelectItem key={r.id} value={String(r.id)}>
															{r.title}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										)}
									</div>
									<div className="space-y-1.5">
										<Label>Thư giới thiệu (Tùy chọn)</Label>
										<Textarea
											placeholder="Kỹ năng, kinh nghiệm nổi bật giúp bạn ghi điểm..."
											rows={4}
											value={coverLetter}
											onChange={(e) => setCoverLetter(e.target.value)}
										/>
									</div>
									<div className="flex gap-2">
										<Button
											variant="outline"
											className="flex-1"
											onClick={() => setIsApplying(false)}
										>
											Hủy
										</Button>
										<Button
											className="flex-1"
											disabled={!selectedResumeId || applyMutation.isPending}
											onClick={handleApply}
										>
											{applyMutation.isPending ? "Đang gửi..." : "Gửi hồ sơ"}
										</Button>
									</div>
								</div>
							) : (
								<>
									<Button
										size="lg"
										className="w-full text-base font-semibold"
										onClick={() => setIsApplying(true)}
									>
										Ứng tuyển ngay
									</Button>
									<p className="text-center text-xs text-muted-foreground">
										Hồ sơ của bạn sẽ được gửi trực tiếp đến nhà tuyển dụng.
									</p>
								</>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-base">Yêu cầu chung</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4 text-sm">
							<div>
								<p className="text-muted-foreground mb-1">Cấp độ</p>
								<p className="font-medium">
									{EXPERIENCE_LEVELS_MAP[post.experience_level]}
								</p>
							</div>
							<Separator />
							<div>
								<p className="text-muted-foreground mb-1">Số lượng tuyển</p>
								<p className="font-medium flex items-center gap-1.5">
									<Users2Icon className="size-4" />
									{post.head_count} người
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</main>
	);
}
