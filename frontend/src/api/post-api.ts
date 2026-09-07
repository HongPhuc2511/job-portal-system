import {
	type UseQueryResult,
	useMutation,
	useQuery,
} from "@tanstack/react-query";
import type { InferOutput } from "valibot";
import type PostSchema from "@/schemas/post-schema";
import type { Page } from "@/types/paginate";
import type { JobPost } from "@/types/post";
import axiosClient from "./axiosClient";

export function useCreatePost() {
	return useMutation({
		mutationFn: async (data: InferOutput<typeof PostSchema>) => {
			const response = await axiosClient.post("/posts/", data);
			return response.data;
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

			console.log(response.headers);

			return {
				items: response.data,
				pagination: JSON.parse(response.headers["x-pagination"]),
			};
		},
	});
}
