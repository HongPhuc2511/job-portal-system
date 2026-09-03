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

<<<<<<< HEAD
export const viewResumeFile = async (id: number) => {
  const res = await axiosClient.get(`/resumes/${id}/file`, {
    responseType: "blob",
  })
  const url = window.URL.createObjectURL(
    new Blob([res.data], { type: "application/pdf" })
  )
  window.open(url, "_blank")
=======
export const deleteResume = (id: number) => {
  return axiosClient.delete(`/resumes/${id}`)
>>>>>>> 5559c10 (feat:thêm chức năng xóa CV bên frontend và sửa lại file resumes bằng tailwind css)
}
