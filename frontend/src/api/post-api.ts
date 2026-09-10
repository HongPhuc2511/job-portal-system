import {
	type UseQueryResult,
	useMutation,
	useQuery,
} from "@tanstack/react-query";
import type { InferOutput } from "valibot";
import type PostSchema from "@/schemas/post-schema";
import type { Application } from "@/types/application";
import type { EmployerStats } from "@/types/employer";
import type { Page } from "@/types/paginate";
import type { JobPost } from "@/types/post";
import axiosClient from "./axiosClient";

export function useGetJobPosts({
	filter,
	page,
	pageSize = 10,
}: {
	filter?: {
		provinceId: number | null;
		jobType: string | null;
		salary: number | null;
		keyword: string | null;
	};
	page: number;
	pageSize: number;
}): UseQueryResult<Page<JobPost>> {
	return useQuery({
		queryKey: [`job-posts`, { page, pageSize, filter }],
		queryFn: async () => {
			const response = await axiosClient.get(`/posts/`, {
				params: {
					page,
					page_size: pageSize,
					province_id: filter?.provinceId,
					job_type: filter?.jobType,
					salary: filter?.salary,
					keyword: filter?.keyword,
				},
			});

			return {
				items: response.data,
				pagination: JSON.parse(response.headers["x-pagination"]),
			};
		},
	});
}

export function useGetEmployerPosts(
	employerId: number,
	page: number,
	pageSize: number = 10,
): UseQueryResult<Page<JobPost>> {
	return useQuery({
		queryKey: [`employer-posts`, { employerId, page, pageSize }],
		queryFn: async () => {
			const response = await axiosClient.get(`/posts/employer/${employerId}`, {
				params: { page, page_size: pageSize },
			});

			return {
				items: response.data,
				pagination: JSON.parse(response.headers["x-pagination"]),
			};
		},
	});
}

export function useCreatePost() {
	return useMutation({
		mutationFn: async (data: InferOutput<typeof PostSchema>) => {
			const response = await axiosClient.post<JobPost>("/posts/", data);
			return response.data;
		},
	});
}

export function useUpdatePost() {
	return useMutation({
		mutationFn: async ({
			postId,
			data,
		}: {
			postId: number;
			data: InferOutput<typeof PostSchema>;
		}) => {
			const response = await axiosClient.put<JobPost>(`/posts/${postId}`, data);
			return response.data;
		},
	});
}

export function useDeletePost() {
	return useMutation({
		mutationFn: async (postId: number) => {
			const response = await axiosClient.delete<void>(`/posts/${postId}`);
			return response.data;
		},
	});
}

export function useGetJobPost(postId: number) {
	return useQuery({
		queryKey: ["job-post", postId],
		queryFn: async () => {
			const response = await axiosClient.get<JobPost>(`/posts/${postId}`);
			return response.data;
		},
		enabled: Number.isInteger(postId) && postId > 0,
	});
}

export function useGetEmployerStats(): UseQueryResult<EmployerStats> {
	return useQuery({
		queryKey: ["employer-dashboard"],
		queryFn: async () => {
			const response = await axiosClient.get<EmployerStats>("/posts/dashboard");
			return response.data;
		},
	});
}

export function useApplyToPost() {
	return useMutation({
		mutationFn: async ({
			postId,
			data,
		}: {
			postId: number;
			data: { resume_id: number; cover_letter?: string };
		}) => {
			const response = await axiosClient.post(`/posts/${postId}/apply`, data);
			return response.data;
		},
	});
}

export function useGetAppliedJobs() {
	return useQuery({
		queryKey: ["applied-jobs"],
		queryFn: async () => {
			const response = await axiosClient.get<Application[]>("/posts/applied");
			return response.data;
		},
	});
}
