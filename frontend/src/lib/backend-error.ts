import { type FormStore, setErrors } from "@formisch/react";
import type { AxiosError } from "axios";

/**
 * Shape lỗi của backend khi validate thất bại:
 *
 * ```json
 * {
 *   "code": 422,
 *   "errors": {
 *     "json": {
 *       "salary_max": ["Lương tối đa phải lớn hơn hoặc bằng lương tối thiểu"]
 *     }
 *   },
 *   "status": "Unprocessable Entity"
 * }
 * ```
 */
type BackendErrorBody = {
	code?: number;
	status?: string;
	message?: string;
	errors?: Record<string, unknown>;
};

export type BackendErrors = {
	/** Lỗi gắn theo từng field của form (key = tên field). */
	fieldErrors: Record<string, string[]>;
	/** Lỗi chung (không thuộc field nào / lỗi form-level). */
	globalErrors: string[];
};

const POST_FIELDS = [
	"title",
	"description",
	"head_count",
	"experience_level",
	"work_model",
	"job_type",
	"province_id",
	"district_id",
	"address",
	"deadline",
	"salary_min",
	"salary_max",
	"salary_period",
] as const;

function messagesOf(value: unknown): string[] {
	if (Array.isArray(value)) {
		return value.filter((item): item is string => typeof item === "string");
	}
	if (typeof value === "string") {
		return [value];
	}
	return [];
}

/**
 * Chuyển lỗi API (axios error) thành lỗi field + lỗi global để đổ vào Formisch.
 */
export function extractBackendErrors(error: unknown): BackendErrors {
	const fieldErrors: Record<string, string[]> = {};
	const globalErrors: string[] = [];

	const axiosError = error as AxiosError<BackendErrorBody>;
	const data = axiosError?.response?.data;

	if (data?.errors && typeof data.errors === "object") {
		for (const scopedErrors of Object.values(data.errors)) {
			if (typeof scopedErrors !== "object" || scopedErrors === null) {
				globalErrors.push(...messagesOf(scopedErrors));
				continue;
			}

			for (const [key, messages] of Object.entries(
				scopedErrors as Record<string, unknown>,
			)) {
				const list = messagesOf(messages);
				if ((POST_FIELDS as readonly string[]).includes(key)) {
					fieldErrors[key] = list;
				} else {
					// Key không thuộc form (vd "_schema", "json", ...) → lỗi global.
					globalErrors.push(...list);
				}
			}
		}

		return { fieldErrors, globalErrors };
	}

	const message =
		(typeof data?.message === "string" && data.message) ||
		axiosError?.message ||
		"Có lỗi xảy ra. Vui lòng thử lại.";

	return { fieldErrors, globalErrors: [message] };
}

export function setFormErrors(
	form: FormStore,
	{ fieldErrors, globalErrors }: BackendErrors,
): void {
	// Lỗi theo từng field -> hiển thị ngay dưới field tương ứng.
	for (const [field, messages] of Object.entries(fieldErrors)) {
		setErrors(form, {
			path: [field as never],
			errors: messages.length > 0 ? (messages as [string, ...string[]]) : null,
		});
	}

	// Lỗi global -> hiển thị ở form-level (Alert).
	setErrors(form, {
		errors:
			globalErrors.length > 0 ? (globalErrors as [string, ...string[]]) : null,
	});
}
