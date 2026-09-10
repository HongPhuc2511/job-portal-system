import {
	type UseQueryResult,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import type {
	Application,
	ApplicationStatus,
	JobPostApplication,
} from "@/types/application";
import type { JobPost } from "@/types/post";
import axiosClient from "./axiosClient";

/** Ứng viên: danh sách công việc đã ứng tuyển (GET /api/applications). */
export function useGetMyApplications(): UseQueryResult<Application[]> {
	return useQuery({
		queryKey: ["my-applications"],
		queryFn: async () => {
			const response = await axiosClient.get<Application[]>("/applications");
			return response.data;
		},
	});
}

/** Nhà tuyển dụng: hồ sơ của một bài đăng, lọc theo trạng thái (null = tất cả). */
export function useGetPostApplications(
	postId: number,
	status: ApplicationStatus | null,
): UseQueryResult<JobPostApplication[]> {
	return useQuery({
		queryKey: ["post-applications", postId, status],
		queryFn: async () => {
			const response = await axiosClient.get<JobPostApplication[]>(
				`/posts/${postId}/applications`,
				{ params: status ? { status } : undefined },
			);
			return response.data;
		},
		enabled: Number.isInteger(postId) && postId > 0,
	});
}

/** Nhà tuyển dụng: duyệt / từ chối một hồ sơ (approved | rejected | pending). */
export function useUpdateApplicationStatus() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			applicationId,
			status,
		}: {
			postId: number;
			applicationId: number;
			status: ApplicationStatus;
		}) => {
			const response = await axiosClient.patch<JobPostApplication>(
				`/applications/${applicationId}/status`,
				{ status },
			);
			return response.data;
		},
		onSuccess: (_, variables) => {
			// Refetch mọi tab của bài đăng để hồ sơ chuyển đúng tab theo trạng thái mới.
			queryClient.invalidateQueries({
				queryKey: ["post-applications", variables.postId],
			});
		},
	});
}

/** Nhà tuyển dụng: đóng / mở lại bài đăng (đóng sẽ tự chuyển hồ sơ chờ -> từ chối). */
export function useUpdatePostStatus() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			postId,
			status,
		}: {
			postId: number;
			status: "ACTIVE" | "CLOSED";
		}) => {
			const response = await axiosClient.patch<JobPost>(
				`/posts/${postId}/status`,
				{ status },
			);
			return response.data;
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["job-post", variables.postId],
			});
			queryClient.invalidateQueries({
				queryKey: ["post-applications", variables.postId],
			});
			queryClient.invalidateQueries({ queryKey: ["employer-posts"] });
			queryClient.invalidateQueries({ queryKey: ["employer-dashboard"] });
		},
	});
}
