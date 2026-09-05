import { useMutation } from "@tanstack/react-query";
import type { InferOutput } from "valibot";
import type PostSchema from "@/schemas/post-schema";
import axiosClient from "./axiosClient";

export function useCreatePost() {
	return useMutation({
		mutationFn: async (data: InferOutput<typeof PostSchema>) => {
			const response = await axiosClient.post("/posts/", data);
			return response.data;
		},
	});
}
