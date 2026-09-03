import axiosClient from "./axiosClient"

export type Job = {
  id: string | number
  title: string
  company_name?: string
  location?: string
  salary?: string | number
  created_at?: string
}

export type LatestJobsResponse = Job[] | { jobs?: Job[]; data?: Job[] }

const getLatestJobs = async (): Promise<LatestJobsResponse> => {
  const response = await axiosClient.get("/jobs/latest")
  return response.data
}

export const searchJobs = async (
  keyword: string
): Promise<LatestJobsResponse> => {
  const response = await axiosClient.get("/jobs/search", {
    params: {
      q: keyword,
    },
  })
  return response.data
}

export { getLatestJobs }
export default getLatestJobs
