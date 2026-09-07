import { useQuery } from "@tanstack/react-query";
import type { EmployerPublicProfile } from "@/types/employer";
import axiosClient from "./axiosClient";

export type Role = "seeker" | "employer";

export type User = {
	id: number;
	email: string;
	full_name: string;
	phone?: string;
	role: Role;
	company_name?: string;
	company_website?: string;
};

export type RegisterPayload = {
	email: string;
	full_name: string;
	password: string;
	role: Role;
	phone?: string;
	company_name?: string;
	company_website?: string;
};

export type LoginResponse = {
	access_token: string;
	refresh_token: string;
	user?: User;
};

export const registerUser = (data: RegisterPayload) => {
	return axiosClient.post("/auth/register", data);
};

export const loginUser = (data: { email: string; password: string }) => {
	return axiosClient.post("/auth/login", data);
};

export const logoutUser = () => {
	return axiosClient.post("/auth/logout");
};

export const refreshToken = (refresh_token: string) => {
	return axiosClient.post("/auth/refresh", null, {
		headers: { Authorization: `Bearer ${refresh_token}` },
	});
};

export function useGetEmployerPublicProfile(userId: number) {
	return useQuery({
		queryKey: ["employer-public-profile", userId],
		queryFn: async () => {
			const response = await axiosClient.get<EmployerPublicProfile>(
				`/auth/profile/${userId}`,
			);
			return response.data;
		},
		enabled: Number.isInteger(userId) && userId > 0,
	});
}
