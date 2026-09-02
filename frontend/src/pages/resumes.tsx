import { useCallback, useEffect, useState } from "react"
import { createResumes, getResumes } from "@/api/resume"
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

  return (
    <div style={{ maxWidth: 480, margin: "60px auto" }}>
      <Card>
        <CardHeader>
          <CardTitle>Tạo CV mới</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Tiêu đề CV</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: CV Frontend Developer"
              />
            </div>
            <div>
              <Label htmlFor="file">File PDF</Label>
              <Input
                id="file"
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
            {message && <p>{message}</p>}
            <Button type="submit">Tạo CV</Button>
          </form>
        </CardContent>
      </Card>
      <Card style={{ marginTop: 24 }}>
        <CardHeader>
          <CardTitle>CV của tôi</CardTitle>
        </CardHeader>
        <CardContent>
          {resumes.length === 0 && <p>Chưa có CV nào.</p>}
          {resumes.map((r) => (
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
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
