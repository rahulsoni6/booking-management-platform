import axiosClient from "./axiosClient";

export async function loginUser(credentials) {
  const response = await axiosClient.post(
    "/login",
    credentials
  );

  return response.data;
}