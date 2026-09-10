import type { EmployerPublicProfile } from "./employer";
import type { District, Province } from "./location";
import type {
	ExperienceLevel,
	JobPostStatus,
	JobType,
	WorkModel,
} from "./post";

export type ApplicationStatus = "pending" | "approved" | "rejected";

export const APPLICATION_STATUS_MAP: Record<
	ApplicationStatus,
	{
		label: string;
		variant: "default" | "secondary" | "outline" | "destructive";
	}
> = {
	pending: { label: "Đang chờ", variant: "outline" },
	approved: { label: "Đã duyệt", variant: "default" },
	rejected: { label: "Từ chối", variant: "destructive" },
};

/** Bài đăng dạng tối giản trong response của hồ sơ ứng tuyển (mục A.3). */
export type JobPostMinimal = {
	id: number;
	title: string;
	status: JobPostStatus;
	head_count: number;
	experience_level: ExperienceLevel;
	work_model: WorkModel;
	job_type: JobType;
	display_salary: string;
	province: Province;
	district: District;
	employer: EmployerPublicProfile;
};

export type ResumeExperience = {
	company: string;
	position: string;
	duration: string;
	description?: string;
};

export type ResumeEducation = {
	school: string;
	major: string;
	duration: string;
};

/** Nội dung CV builder — đúng shape mà form tạo CV (resume_builder) lưu. */
export type ResumeContent = {
	full_name?: string;
	phone?: string;
	summary?: string;
	skills?: string[];
	experience?: ResumeExperience[];
	education?: ResumeEducation[];
};

export type ApplicationResume = {
	id: number;
	title: string;
	resume_type: "upload" | "builder";
	file_path: string | null;
	content: ResumeContent | null;
	created_at: string;
	updated_at: string;
};

/** Hồ sơ ứng tuyển của ứng viên (GET /api/applications). */
export type Application = {
	id: number;
	status: ApplicationStatus;
	created_at: string;
	cover_letter: string | null;
	candidate: ApplicationCandidate;
	job_post: JobPostMinimal;
	resume: ApplicationResume;
};

export type ApplicationCandidate = {
	id: number;
	full_name: string;
	email: string;
	phone: string | null;
};

/** Hồ sơ trong danh sách của nhà tuyển dụng (GET /api/posts/<id>/applications). */
export type JobPostApplication = {
	id: number;
	created_at: string;
	updated_at: string;
	status: ApplicationStatus;
	cover_letter: string | null;
	candidate: ApplicationCandidate;
	resume: ApplicationResume;
};
