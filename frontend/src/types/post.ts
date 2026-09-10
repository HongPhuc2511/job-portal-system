import type { EmployerPublicProfile } from "./employer";
import type { District, Province } from "./location";

export type JobPostStatus = "ACTIVE" | "CLOSED" | "EXPIRED";

export const JOB_POST_STATUS_MAP: Record<JobPostStatus, string> = {
	ACTIVE: "Đang tuyển",
	CLOSED: "Đã đóng",
	EXPIRED: "Hết hạn",
};

export const EXPERIENCE_LEVELS = [
	"INTERN",
	"FRESHER",
	"JUNIOR",
	"MIDDLE",
	"SENIOR",
	"LEAD",
] as const;
export const EXPERIENCE_LEVELS_MAP = {
	INTERN: "Intern",
	FRESHER: "Fresher",
	JUNIOR: "Junior",
	MIDDLE: "Middle",
	SENIOR: "Senior",
	LEAD: "Lead",
};
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

export const JOB_TYPES = [
	"FULL_TIME",
	"PART_TIME",
	"CONTRACT",
	"FREELANCE",
] as const;
export const JOB_TYPES_MAP = {
	FULL_TIME: "Full-time",
	PART_TIME: "Part-time",
	CONTRACT: "Theo hợp đồng",
	FREELANCE: "Freelance",
};
export type JobType = (typeof JOB_TYPES)[number];

export const SALARY_PERIODS = [
	"HOURLY",
	"WEEKLY",
	"MONTHLY",
	"ANNUAL",
] as const;
export const SALARY_PERIODS_MAP: Record<SalaryPeriod, string> = {
	HOURLY: "Theo giờ",
	WEEKLY: "Theo tuần",
	MONTHLY: "Theo tháng",
	ANNUAL: "Theo năm",
};
export type SalaryPeriod = (typeof SALARY_PERIODS)[number];

export const WORK_MODELS = ["ON_SITE", "REMOTE", "HYBRID"] as const;
export const WORK_MODELS_MAP = {
	ON_SITE: "Làm tại văn phòng",
	REMOTE: "Làm từ xa",
	HYBRID: "Làm từ xa và tại văn phòng",
};
export type WorkModel = (typeof WORK_MODELS)[number];

/** Số lượng hồ sơ ứng tuyển của một bài đăng (total = pending + approved + rejected). */
export type ApplicationStats = {
	total: number;
	pending: number;
	approved: number;
	rejected: number;
};

export type JobPost = {
	id: number;
	created_at: string;
	updated_at: string;
	status: JobPostStatus;
	published_at: string;
	deadline: string;
	title: string;
	description: string;
	head_count: number;
	experience_level: ExperienceLevel;
	work_model: WorkModel;
	job_type: JobType;
	salary_min: number;
	salary_max: number;
	salary_period: SalaryPeriod;
	province_id: number;
	district_id: number;
	province: Province;
	district: District;
	address: string;
	employer_id: number;
	employer: EmployerPublicProfile;
	display_salary: string;
	application_stats: ApplicationStats;
};
