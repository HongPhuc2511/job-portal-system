import axiosClient from "./axiosClient"

export const createResumes = (title: string, file: File) => {
  const formData = new FormData()
  formData.append("title", title)
  formData.append("file", file)

  return axiosClient.post("/resumes", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
}

export const getResumes = () => {
  return axiosClient.get("/resumes")
}
