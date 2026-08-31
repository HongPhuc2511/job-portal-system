import axiosClient from "./axiosClient";

const getLatestJobs = async () => {
  const response = await axiosClient.get("/jobs/latest");
  return response.data;
};

export { getLatestJobs };
export default getLatestJobs;