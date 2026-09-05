import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { createResumeBuilder } from "@/api/resume"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Experience {
  id: string
  company: string
  position: string
  duration: string
  description: string
}

interface Education {
  id: string
  school: string
  major: string
  duration: string
}

export default function ResumeBuilder() {
  const navigate = useNavigate()
  const [title, setTitle] = useState("")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [summary, setSummary] = useState("")
  const [skills, setSkills] = useState("")
  const [experience, setExperience] = useState<Experience[]>([])
  const [education, setEducation] = useState<Education[]>([])
  const [message, setMessage] = useState("")

  const addExperience = () => {
    setExperience([
      ...experience,
      {
        id: crypto.randomUUID(),
        company: "",
        position: "",
        duration: "",
        description: "",
      },
    ])
  }

  const updateExperience = (
    id: string,
    field: keyof Experience,
    value: string
  ) => {
    setExperience(
      experience.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    )
  }

  const removeExperience = (id: string) => {
    setExperience(experience.filter((exp) => exp.id !== id))
  }

  const addEducation = () => {
    setEducation([
      ...education,
      { id: crypto.randomUUID(), school: "", major: "", duration: "" },
    ])
  }
  const updateEducation = (
    id: string,
    field: keyof Education,
    value: string
  ) => {
    setEducation(
      education.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu))
    )
  }

  const removeEducation = (id: string) => {
    setEducation(education.filter((edu) => edu.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createResumeBuilder(title, {
        full_name: fullName,
        phone,
        summary,
        experience,
        education,
        skills: skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      })
      setMessage("Tạo CV thành công!")
      navigate("/resumes")
    } catch (_err) {
      setMessage("Có lỗi xảy ra, thử lại sau")
    }
  }

  const textareaClass =
    "border-input flex min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Tạo CV theo mẫu</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <Label htmlFor="title">Tiêu đề CV</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fullName">Họ tên</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="summary">Giới thiệu bản thân</Label>
              <textarea
                id="summary"
                className={textareaClass}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="skills">Kỹ năng (cách nhau bằng dấu phẩy)</Label>
              <Input
                id="skills"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="VD: Python, React, SQL"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Kinh nghiệm làm việc</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addExperience}
                >
                  + Thêm
                </Button>
              </div>
              {experience.map((exp) => (
                <div key={exp.id} className="space-y-2 rounded-md border p-3">
                  <Input
                    placeholder="Công ty"
                    value={exp.company}
                    onChange={(e) =>
                      updateExperience(exp.id, "company", e.target.value)
                    }
                  />
                  <Input
                    placeholder="Vị trí"
                    value={exp.position}
                    onChange={(e) =>
                      updateExperience(exp.id, "position", e.target.value)
                    }
                  />
                  <Input
                    placeholder="Thời gian (VD: 2023 - nay)"
                    value={exp.duration}
                    onChange={(e) =>
                      updateExperience(exp.id, "duration", e.target.value)
                    }
                  />
                  <textarea
                    className={textareaClass}
                    placeholder="Mô tả công việc"
                    value={exp.description}
                    onChange={(e) =>
                      updateExperience(exp.id, "description", e.target.value)
                    }
                    rows={2}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeExperience(exp.id)}
                  >
                    Xoá mục này
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Học vấn</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addEducation}
                >
                  + Thêm
                </Button>
              </div>
              {education.map((edu) => (
                <div key={edu.id} className="space-y-2 rounded-md border p-3">
                  <Input
                    placeholder="Trường"
                    value={edu.school}
                    onChange={(e) =>
                      updateEducation(edu.id, "school", e.target.value)
                    }
                  />
                  <Input
                    placeholder="Chuyên ngành"
                    value={edu.major}
                    onChange={(e) =>
                      updateEducation(edu.id, "major", e.target.value)
                    }
                  />
                  <Input
                    placeholder="Thời gian (VD: 2020 - 2024)"
                    value={edu.duration}
                    onChange={(e) =>
                      updateEducation(edu.id, "duration", e.target.value)
                    }
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeEducation(edu.id)}
                  >
                    Xoá mục này
                  </Button>
                </div>
              ))}
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
    </div>
  )
}
