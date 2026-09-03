import { useCallback, useEffect, useState } from "react"
<<<<<<< HEAD
import { createResumes, getResumes, viewResumeFile } from "@/api/resume"
=======
import { createResumes, deleteResume, getResumes } from "@/api/resume"
>>>>>>> 5559c10 (feat:thêm chức năng xóa CV bên frontend và sửa lại file resumes bằng tailwind css)
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Resume {
  id: number
  title: string
  file_path: string
  created_at: string
}

export default function Resumes() {
  const [title, setTitle] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState("")
  const [resumes, setResumes] = useState<Resume[]>([])

  const loadResumes = useCallback(async () => {
    const res = await getResumes()
    setResumes(res.data)
  }, [])

  useEffect(() => {
    loadResumes()
  }, [loadResumes])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return setMessage("Vui lòng chọn file PDF")

    try {
      await createResumes(title, file)
      setMessage("Tạo CV thành công!")
      setTitle("")
      setFile(null)
      loadResumes()
    } catch (_err) {
      setMessage("Có lỗi xảy ra, thử lại sau")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xoá CV này?")) return
    try {
      await deleteResume(id)
      setMessage("Xoá CV thành công!")
      loadResumes()
    } catch (_err) {
      setMessage("Xoá CV thất bại, thử lại sau")
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Tạo CV mới</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Tiêu đề CV</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: CV Frontend Developer"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="file">File PDF</Label>
              <Input
                id="file"
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
            {message && (
              <p className="text-muted-foreground text-sm">{message}</p>
            )}
            <Button type="submit" className="w-full">
              Tạo CV
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>CV của tôi</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {resumes.length === 0 && (
            <p className="text-muted-foreground text-sm">Chưa có CV nào.</p>
          )}
          {resumes.map((r) => (
<<<<<<< HEAD
            <div
              key={r.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 0",
                borderBottom: "1px solid #333",
              }}
            >
              <span>{r.title}</span>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>
                {new Date(r.created_at).toLocaleDateString("vi-VN")}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => viewResumeFile(r.id)}
              >
                Xem
              </Button>
=======
            <div key={r.id} className="flex items-center justify-between py-3">
              <span className="font-medium text-sm">{r.title}</span>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground text-xs">
                  {new Date(r.created_at).toLocaleDateString("vi-VN")}
                </span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(r.id)}
                >
                  Xoá
                </Button>
              </div>
>>>>>>> 5559c10 (feat:thêm chức năng xóa CV bên frontend và sửa lại file resumes bằng tailwind css)
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
