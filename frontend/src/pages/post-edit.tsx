import {
	Form,
	getInput,
	type SubmitHandler,
	setInput,
	useForm,
} from "@formisch/react";
import { ChevronLeftIcon } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type * as v from "valibot";
import { useDistricts, useProvinces } from "@/api/location";
import { useUpdatePost } from "@/api/post-api";
import { DatePickerField } from "@/components/field/date-picker-field";
import { InputField } from "@/components/field/input-field";
import { NumberField } from "@/components/field/number-field";
import { SelectField } from "@/components/field/select-field";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/context/auth-context";
import { extractBackendErrors, setFormErrors } from "@/lib/backend-error";
import { formatSalary } from "@/lib/salary";
import PostSchema from "@/schemas/post-schema";
import {
	EXPERIENCE_LEVELS_MAP,
	JOB_TYPES_MAP,
	type JobPost,
	SALARY_PERIODS_MAP,
	WORK_MODELS_MAP,
} from "@/types/post";

/** Bài đăng được truyền từ trang danh sách qua router state (tránh gọi API lại). */
type EditLocationState = { post?: JobPost } | null;

/** Chuyển bài đăng trả về từ backend thành dữ liệu khởi tạo của form. */
function postToFormInput(post: JobPost): v.InferInput<typeof PostSchema> {
	return {
		title: post.title,
		description: post.description,
		head_count: post.head_count,
		experience_level: post.experience_level,
		work_model: post.work_model,
		job_type: post.job_type,
		province_id: post.province_id ?? null,
		district_id: post.district_id ?? null,
		address: post.address ?? "",
		deadline: post.deadline.slice(0, 16),
		salary_min: post.salary_min ?? null,
		salary_max: post.salary_max ?? null,
		salary_period: post.salary_period,
	};
}

export default function PostEditPage() {
	const { user } = useAuth();
	const location = useLocation();

	// Bài đăng được truyền từ trang danh sách qua router state.
	// (Backend chưa có API GET từng bài nên không thể tải lại khi refresh URL.)
	const post = (location.state as EditLocationState | null)?.post;

	if (user?.role !== "employer") {
		return <div>Bạn không có quyền truy cập trang này.</div>;
	}

	return (
		<main className="mx-auto max-w-5xl pt-4">
			<div className="flex items-center justify-between gap-4 pb-4">
				<Button variant="outline" render={<Link to="/manage-posts" />}>
					<ChevronLeftIcon />
					Quay về quản lý bài đăng
				</Button>

				<h3 className="font-bold text-lg">Chỉnh sửa bài đăng</h3>
			</div>

			{post == null && (
				<Alert variant="destructive">
					<AlertTitle>Không thể mở bài đăng</AlertTitle>
					<AlertDescription>
						Thiếu dữ liệu bài đăng cần chỉnh sửa (thường xảy ra khi tải lại
						trang). Vui lòng quay lại trang quản lý và bấm nút "Chỉnh sửa" trên
						bài đăng để tiếp tục.
					</AlertDescription>
				</Alert>
			)}

			{post != null && post.employer_id !== user.id && (
				<Alert variant="destructive">
					<AlertTitle>Không có quyền chỉnh sửa</AlertTitle>
					<AlertDescription>
						Bạn không phải chủ sở hữu bài đăng này nên không thể chỉnh sửa.
					</AlertDescription>
				</Alert>
			)}

			{post != null && post.employer_id === user.id && (
				<PostEditForm key={post.id} post={post} />
			)}
		</main>
	);
}

function PostEditForm({ post }: { post: JobPost }) {
	const navigate = useNavigate();

	const postForm = useForm({
		schema: PostSchema,
		initialInput: postToFormInput(post),
	});

	const updatePost = useUpdatePost();

	const provinceId = getInput(postForm, { path: ["province_id"] });

	const workModel = getInput(postForm, { path: ["work_model"] });
	const isRemote = workModel === "REMOTE";

	const provincesQuery = useProvinces();
	const districtsQuery = useDistricts(provinceId ?? null);

	// Preview lương theo công thức display_salary của backend.
	const salaryMin = getInput(postForm, { path: ["salary_min"] });
	const salaryMax = getInput(postForm, { path: ["salary_max"] });

	const handleSubmit: SubmitHandler<typeof PostSchema> = async ({
		province_id,
		district_id,
		address,
		...fields
	}) => {
		const payload: v.InferOutput<typeof PostSchema> =
			fields.work_model === "REMOTE"
				? // Remote: cố ý không gửi tỉnh/huyện/địa chỉ (bỏ key khỏi payload).
					(fields as v.InferOutput<typeof PostSchema>)
				: { ...fields, province_id, district_id, address };

		try {
			await updatePost.mutateAsync({ postId: post.id, data: payload });
			toast.add({
				type: "success",
				title: "Cập nhật bài đăng tuyển dụng thành công",
			});
			navigate("/manage-posts");
		} catch (rawError) {
			const error = extractBackendErrors(rawError);
			setFormErrors(postForm, error);
		}
	};

	return (
		<Form of={postForm} onSubmit={handleSubmit}>
			<div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[2fr_1fr] mb-8">
				<div className="flex flex-col gap-6">
					<Card>
						<CardHeader>
							<CardTitle>Thông tin chung</CardTitle>
						</CardHeader>
						<CardContent>
							<FieldGroup>
								<InputField
									of={postForm}
									path={["title"]}
									label="Tiêu đề"
									required
									placeholder="Ví dụ: Thực tập sinh Java Backend"
									autoComplete="off"
								/>
								<FieldGroup className="grid grid-cols-3">
									<NumberField
										of={postForm}
										path={["head_count"]}
										label="Số lượng cần tuyển"
										required
										min={1}
									/>
									<DatePickerField
										of={postForm}
										path={["deadline"]}
										label="Hạn nộp hồ sơ"
										required
										placeholder="Chọn ngày hết hạn"
									/>
								</FieldGroup>
								<InputField
									of={postForm}
									path={["description"]}
									label="Mô tả công việc"
									description="Có hỗ trợ markdown"
									required
									multiline
									placeholder={
										"- Công việc này làm những gì?\n- Yêu cầu kinh nghiệm ra sao?\n- Phúc lợi công việc\n- Địa điểm thời gian\n- ..."
									}
									autoComplete="off"
								/>
							</FieldGroup>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Thông tin công việc</CardTitle>
						</CardHeader>
						<CardContent>
							<FieldGroup>
								<FieldGroup className="grid grid-cols-3">
									<SelectField
										of={postForm}
										path={["experience_level"]}
										label="Cấp độ chuyên môn"
										required
										placeholder="Chọn cấp độ"
										items={EXPERIENCE_LEVELS_MAP}
									/>
									<SelectField
										of={postForm}
										path={["work_model"]}
										label="Mô hình làm việc"
										required
										placeholder="Chọn mô hình"
										items={WORK_MODELS_MAP}
										onValueChange={(value) => {
											if (value === "REMOTE") {
												setInput(postForm, {
													path: ["province_id"],
													input: null,
												});
												setInput(postForm, {
													path: ["district_id"],
													input: null,
												});
												setInput(postForm, {
													path: ["address"],
													input: "",
												});
											}
										}}
										contentClassName="w-3xs"
									/>
									<SelectField
										of={postForm}
										path={["job_type"]}
										label="Loại công việc"
										required
										placeholder="Chọn loại"
										items={JOB_TYPES_MAP}
									/>
								</FieldGroup>
							</FieldGroup>
						</CardContent>
					</Card>

					{!isRemote && (
						<Card>
							<CardHeader>
								<CardTitle>Địa điểm làm việc</CardTitle>
							</CardHeader>
							<CardContent>
								<FieldGroup>
									<FieldGroup className="grid grid-cols-2">
										<SelectField
											of={postForm}
											path={["province_id"]}
											label="Tỉnh/Thành phố"
											required
											placeholder={
												provincesQuery.error
													? "Tải danh sách thất bại"
													: provincesQuery.isPending
														? "Đang tải..."
														: "Chọn tỉnh/thành"
											}
											items={(provincesQuery.data ?? []).map((province) => ({
												value: province.id,
												label: province.name,
											}))}
											disabled={provincesQuery.isPending}
											onValueChange={() => {
												setInput(postForm, {
													path: ["district_id"],
													input: null,
												});
											}}
											contentClassName="max-h-100"
										/>
										<SelectField
											of={postForm}
											path={["district_id"]}
											label="Quận/Huyện"
											required
											placeholder={
												!provinceId
													? "Chọn tỉnh trước"
													: districtsQuery.error
														? "Tải danh sách thất bại"
														: districtsQuery.isPending
															? "Đang tải..."
															: "Chọn quận/huyện"
											}
											items={(districtsQuery.data ?? []).map((district) => ({
												value: district.id,
												label: district.name,
											}))}
											disabled={!provinceId || districtsQuery.isPending}
											contentClassName="max-h-100"
										/>
									</FieldGroup>
									<InputField
										of={postForm}
										path={["address"]}
										label="Địa chỉ chi tiết"
										placeholder="Ví dụ: Tầng 10, số 1 Nguyễn Trãi, Thanh Xuân, Hà Nội"
										autoComplete="off"
									/>
								</FieldGroup>
							</CardContent>
						</Card>
					)}
				</div>

				{/* Cột phải: mức lương, lỗi global, nút lưu thay đổi */}
				<div className="flex flex-col gap-4 lg:sticky top-18">
					<Card>
						<CardHeader>
							<CardTitle>Mức lương</CardTitle>
						</CardHeader>
						<CardContent className="flex flex-col gap-4">
							<p className="text-sm text-muted-foreground">
								Nhập khoảng lương dự kiến theo kỳ hạn đã chọn. Nếu để trống cả
								hai ô, bài đăng sẽ hiển thị "Thương lượng"; chỉ điền một ô sẽ
								hiển thị "Từ …" hoặc "Tới …". Lương tối đa phải lớn hơn hoặc
								bằng lương tối thiểu.
							</p>
							<FieldGroup>
								<NumberField
									of={postForm}
									path={["salary_min"]}
									label="Lương tối thiểu"
									min={0}
									placeholder="0"
								/>
								<NumberField
									of={postForm}
									path={["salary_max"]}
									label="Lương tối đa"
									min={0}
									placeholder="0"
								/>
								<SelectField
									of={postForm}
									path={["salary_period"]}
									label="Kỳ hạn lương"
									required
									placeholder="Chọn kỳ hạn"
									items={SALARY_PERIODS_MAP}
								/>
							</FieldGroup>
							<p className="text-sm text-muted-foreground" aria-live="polite">
								Sẽ hiển thị trên bài đăng: {formatSalary(salaryMin, salaryMax)}
							</p>
						</CardContent>
					</Card>

					{postForm.errors && (
						<Alert variant="destructive">
							<AlertTitle>Có lỗi xảy ra</AlertTitle>
							<AlertDescription>
								<ul className="flex list-disc flex-col gap-1 pl-4">
									{postForm.errors.map((message, index) => (
										<li key={`${index}-${message}`}>{message}</li>
									))}
								</ul>
							</AlertDescription>
						</Alert>
					)}

					<Button
						type="submit"
						size="lg"
						className="w-full"
						disabled={updatePost.isPending || updatePost.isSuccess}
					>
						{updatePost.isPending
							? "Đang lưu..."
							: updatePost.isSuccess
								? "Đã lưu thành công"
								: "Lưu thay đổi"}
					</Button>
				</div>
			</div>
		</Form>
	);
}
