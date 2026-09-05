export type JobPostStatus = "ACTIVE" | "CLOSED" | "EXPIRED";

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
