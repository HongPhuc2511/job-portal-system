import type * as v from "valibot";
import type PostSchema from "@/schemas/post-schema";
import axiosClient from "./axiosClient";

export type Job = {
	id: string | number;
	title: string;
	company_name?: string;
	location?: string;
	salary?: string | number;
	display_salary?: string;
	created_at?: string;
};

export type JobFilterParams = {
	province_id?: number | null;
	job_type?: string | null;
	salary?: number | null;
};

export type LatestJobsResponse = Job[] | { jobs?: Job[]; data?: Job[] };

const getLatestJobs = async (): Promise<LatestJobsResponse> => {
	const response = await axiosClient.get("/jobs/latest");
	return response.data;
};

export type CreatePostPayload = v.InferOutput<typeof PostSchema>;

// TODO: đổi endpoint nếu backend dùng đường dẫn khác (ví dụ `/jobs`).
const createPost = (payload: CreatePostPayload) => {
	return axiosClient.post("/posts", payload);
};

export { createPost, getLatestJobs };
export default getLatestJobs;
