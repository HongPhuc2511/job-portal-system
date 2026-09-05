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
 *
 * Quy ước: mọi lỗi của từng field đều nằm dưới `errors.json.<Tên field>`.
 * Các scope khác ("query", "path", ...) hoặc key "_schema" là lỗi form-level.
 */
type BackendErrorBody = {
	code?: number;
	status?: string;
	message?: string;
	errors?: Record<string, unknown>;
};

export type BackendErrors = {
	/** Lỗi gắn theo từng field của form (key = tên field trong schema). */
	fieldErrors: Record<string, string[]>;
	/** Lỗi chung (form-level). */
	globalErrors: string[];
};

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
 * Generic với mọi schema — không hardcode danh sách field.
 */
export function extractBackendErrors(error: unknown): BackendErrors {
	const fieldErrors: Record<string, string[]> = {};
	const globalErrors: string[] = [];

	const axiosError = error as AxiosError<BackendErrorBody>;
	const data = axiosError?.response?.data;

	if (data?.errors && typeof data.errors === "object") {
		for (const [scope, scopedErrors] of Object.entries(data.errors)) {
			// Scope trực tiếp là chuỗi message (vd errors: { "json": "Lỗi méo" }).
			if (typeof scopedErrors !== "object" || scopedErrors === null) {
				globalErrors.push(...messagesOf(scopedErrors));
				continue;
			}

			if (scope === "json") {
				// Mỗi key trong errors.json là tên field tương ứng của schema.
				for (const [field, messages] of Object.entries(
					scopedErrors as Record<string, unknown>,
				)) {
					if (field === "_schema") {
						// "_schema" (quy ước marshmallow) = lỗi form-level.
						globalErrors.push(...messagesOf(messages));
					} else {
						fieldErrors[field] = messagesOf(messages);
					}
				}
				continue;
			}

			// Các scope khác ("query", "path", ...) không map được vào field form →
			// gộp toàn bộ message vào lỗi global.
			for (const messages of Object.values(
				scopedErrors as Record<string, unknown>,
			)) {
				globalErrors.push(...messagesOf(messages));
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
