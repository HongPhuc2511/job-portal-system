/** Thông tin công khai của nhà tuyển dụng — trả về từ GET /auth/profile/:id. */
export type EmployerPublicProfile = {
	id: number;
	full_name: string | null;
	company_name: string | null;
	company_website: string | null;
	phone: string | null;
};

export type EmployerStats = {
	total_posts: number;
	active_posts: number;
	total_applications: number;
	pending_applications: number;
};
