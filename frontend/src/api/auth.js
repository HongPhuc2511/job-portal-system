import axiosClient from "./axiosClient";

export const registerUser = (data) => {
  return axiosClient.post("/auth/register", data);
};

export const loginUser = (data) => {
  return axiosClient.post("/auth/login", data);
};

export const logoutUser = () => {
  return axiosClient.post("/auth/logout");
};

export const refreshToken = (refresh_token) => {
  return axiosClient.post("/auth/refresh", null, {
    headers: { Authorization: `Bearer ${refresh_token}` },
  });
};