import { useQuery } from "@tanstack/react-query";
import type { District, Province } from "@/types/address";
import axiosClient from "./axiosClient";

export function useProvinces() {
	return useQuery({
		queryKey: ["provinces"],
		queryFn: async () => {
			const response = await axiosClient.get<Province[]>("/location/provinces");
			return response.data;
		},
	});
}

export function useDistricts(provinceId: number | null) {
	return useQuery({
		queryKey: ["districts", provinceId],
		queryFn: async () => {
			const response = await axiosClient.get<District[]>(
				`/location/provinces/${provinceId}/districts`,
			);
			return response.data;
		},
		enabled: provinceId != null,
	});
}
