import type { JobPost } from "./post";

export type ApplicationStatus =
	| "pending"
	| "reviewed"
	| "shortlisted"
	| "rejected";

export const APPLICATION_STATUS_MAP: Record<
	ApplicationStatus,
	{
		label: string;
		variant: "default" | "secondary" | "outline" | "destructive";
	}
> = {
	pending: { label: "Chờ xét duyệt", variant: "outline" },
	reviewed: { label: "Đã xem hồ sơ", variant: "secondary" },
	shortlisted: { label: "Phù hợp", variant: "default" },
	rejected: { label: "Từ chối", variant: "destructive" },
};

export type Application = {
	id: number;
	status: ApplicationStatus;
	created_at: string;
	cover_letter: string | null;
	job_post: JobPost;
	resume: {
		id: number;
		title: string;
		file_path: string | null;
		resume_type: string;
	};
};
