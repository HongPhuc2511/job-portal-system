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

export const viewResumeFile = async (id: number) => {
  const res = await axiosClient.get(`/resumes/${id}/file`, {
    responseType: "blob",
  })
  const url = window.URL.createObjectURL(
    new Blob([res.data], { type: "application/pdf" })
  )
  window.open(url, "_blank")
}

export const createResumeBuilder = (title: string, content: object) => {
  return axiosClient.post("/resumes/builder", { title, content })
}
