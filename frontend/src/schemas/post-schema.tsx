import * as v from "valibot";
import {
	EXPERIENCE_LEVELS,
	JOB_TYPES,
	SALARY_PERIODS,
	WORK_MODELS,
} from "@/types/post";

const PostSchema = v.pipe(
	v.object({
		title: v.pipe(
			v.string(),
			v.nonEmpty("Xin vui lòng nhập tiêu đề"),
			v.maxLength(200, "Tiêu đề không được vượt quá 200 ký tự"),
		),
		description: v.pipe(
			v.string(),
			v.nonEmpty("Mô tả bài đăng không được để trống!"),
		),
		head_count: v.pipe(
			v.number("Số lượng phải là số"),
			v.integer("Số lượng phải là số nguyên"),
			v.minValue(1, "Số lượng nhân viên cần tuyển phải lớn hơn 0"),
		),

		experience_level: v.picklist(EXPERIENCE_LEVELS, "Xin vui lòng chọn cấp độ"),
		work_model: v.picklist(WORK_MODELS, "Xin vui lòng chọn mô hình làm việc"),
		job_type: v.picklist(JOB_TYPES, "Xin vui lòng chọn loại làm việc"),

		province_id: v.nullish(
			v.pipe(
				v.number("Vui lòng chọn tỉnh/thành phố hợp lệ"),
				v.integer("Mã tỉnh không hợp lệ"),
				v.minValue(1, "Mã tỉnh không hợp lệ"),
			),
		),
		district_id: v.nullish(
			v.pipe(
				v.number("Vui lòng chọn quận/huyện hợp lệ"),
				v.integer("Mã quận/huyện không hợp lệ"),
				v.minValue(1, "Mã quận/huyện không hợp lệ"),
			),
		),
		address: v.pipe(
			v.string(),
			v.maxLength(255, "Địa chỉ không được vượt quá 255 ký tự"),
		),

		deadline: v.pipe(
			v.string("Hạn nộp hồ sơ phải là chuỗi ngày giờ"),
			v.nonEmpty("Xin vui lòng chọn hạn nộp hồ sơ"),
			v.transform((input) => (input.length === 16 ? `${input}:00` : input)),
			v.isoDateTimeSecond("Hạn nộp hồ sơ phải đúng định dạng ngày giờ"),
			v.check((input) => {
				const time = new Date(input).getTime();
				return !Number.isNaN(time) && time > Date.now();
			}, "Hạn nộp hồ sơ phải là thời điểm hợp lệ trong tương lai"),
		),

		salary_min: v.nullish(
			v.pipe(
				v.number("Lương tối thiểu phải là số"),
				v.integer("Lương tối thiểu phải là số nguyên"),
				v.minValue(0, "Lương tối thiểu không được âm"),
			),
		),
		salary_max: v.nullish(
			v.pipe(
				v.number("Lương tối đa phải là số"),
				v.integer("Lương tối đa phải là số nguyên"),
				v.minValue(0, "Lương tối đa không được âm"),
			),
		),
		salary_period: v.picklist(SALARY_PERIODS, "Xin vui lòng chọn kỳ hạn lương"),
	}),
	v.forward(
		v.partialCheck(
			[["salary_min"], ["salary_max"]],
			(input) =>
				input.salary_min == null ||
				input.salary_max == null ||
				input.salary_max > input.salary_min,
			"Lương tối đa phải lớn hơn lương tối thiểu",
		),
		["salary_max"],
	),
	v.forward(
		v.check(
			(input) =>
				input.work_model === "REMOTE" ||
				(input.province_id != null && input.district_id != null),
			"Vui lòng chọn đầy đủ tỉnh/thành và quận/huyện",
		),
		["province_id"],
	),
);

export default PostSchema;
