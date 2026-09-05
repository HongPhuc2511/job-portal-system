import {
	Form,
	getInput,
	type SubmitHandler,
	setInput,
	useForm,
} from "@formisch/react";
import { ChevronLeftIcon } from "lucide-react";
import type * as v from "valibot";
import { useDistricts, useProvinces } from "@/api/address";
import { useCreatePost } from "@/api/post-api";
import {
	DatePickerField,
	InputField,
	NumberField,
	SelectField,
} from "@/components/field";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { extractBackendErrors, setFormErrors } from "@/lib/backend-error";
import { formatSalary } from "@/lib/salary";
import PostSchema from "@/schemas/post-schema";
import {
	EXPERIENCE_LEVELS_MAP,
	JOB_TYPES_MAP,
	SALARY_PERIODS_MAP,
	WORK_MODELS_MAP,
} from "@/types/post";

export default function PostCreatePage() {
	const postForm = useForm({
		schema: PostSchema,
		initialInput: {
			title: "",
			description: "",
			head_count: 1,
			salary_period: "MONTHLY",
		},
	});

	const createPost = useCreatePost();

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
			await createPost.mutateAsync(payload);
			// TODO: toast thông báo thành công + chuyển hướng về trang quản lý bài đăng
		} catch (rawError) {
			const error = extractBackendErrors(rawError);
			setFormErrors(postForm, error);
		}
	};

	return (
		<main className="mx-auto max-w-5xl pt-4">
			<div className="flex items-center justify-between gap-4 pb-4">
				<Button variant="outline">
					<ChevronLeftIcon />
					Quay về quản lý bài đăng
				</Button>

				<h3 className="font-bold text-lg">Tạo bài đăng mới</h3>
			</div>

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

					{/* Cột phải: mức lương, lỗi global, nút tạo bài đăng */}
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
									Sẽ hiển thị trên bài đăng:{" "}
									{formatSalary(salaryMin, salaryMax)}
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
							disabled={postForm.isSubmitting}
						>
							{postForm.isSubmitting ? "Đang tạo..." : "Tạo bài đăng"}
						</Button>
					</div>
				</div>
			</Form>
		</main>
	);
}
