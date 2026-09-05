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

export const getResumeDetail = (id: number) => {
  return axiosClient.get(`/resumes/${id}`)
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

export const deleteResume = (id: number) => {
  return axiosClient.delete(`/resumes/${id}`)
}

export const createResumeBuilder = (title: string, content: object) => {
  return axiosClient.post("/resumes/builder", { title, content })
}

export const updateResume = (id: number, title: string, content?: object) => {
  return axiosClient.put(
    `/resumes/${id}`,
    content ? { title, content } : { title }
  )
export const getResumeDetail = (id: number) => {
  return axiosClient.get(`/resumes/${id}`)
}
