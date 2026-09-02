import { useState } from "react"
import { createResume } from "@/api/resume"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Resume() {
  const [title, setTitle] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return setMessage("Vui lòng chọn file PDF")

    try {
      await createResume(title, file)
      setMessage("Tạo CV thành công!")
      setTitle("")
      setFile(null)
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
    </div>
  )
}
