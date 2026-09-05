import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { getResumeDetail } from "@/api/resume"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Experience {
  company: string
  position: string
  duration: string
  description: string
}

interface Education {
  school: string
  major: string
  duration: string
}

interface ResumeContent {
  full_name?: string
  phone?: string
  summary?: string
  experience?: Experience[]
  education?: Education[]
  skills?: string[]
}

interface ResumeDetail {
  id: number
  title: string
  resume_type: string
  content: ResumeContent | null
}

export default function ResumeDetailPage() {
  const { id } = useParams()
  const [resume, setResume] = useState<ResumeDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const res = await getResumeDetail(Number(id))
      setResume(res.data)
      setLoading(false)
    }
    load()
  }, [id])

  if (loading)
    return <p className="mx-auto max-w-2xl px-4 py-12">Đang tải...</p>
  if (!resume?.content)
    return <p className="mx-auto max-w-2xl px-4 py-12">Không tìm thấy CV.</p>

  const c = resume.content

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-12">
      <Button
        variant="outline"
        size="sm"
        render={<Link to="/resumes" />}
        nativeButton={false}
      >
        ← Quay lại danh sách
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {c.full_name || resume.title}
          </CardTitle>
          {c.phone && (
            <p className="text-muted-foreground text-sm">{c.phone}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {c.summary && (
            <section>
              <h3 className="mb-1 font-semibold">Giới thiệu bản thân</h3>
              <p className="text-sm">{c.summary}</p>
            </section>
          )}

          {c.experience && c.experience.length > 0 && (
            <section>
              <h3 className="mb-2 font-semibold">Kinh nghiệm làm việc</h3>
              <div className="space-y-3">
                {c.experience.map((exp) => (
                  <div
                    key={`${exp.company}-${exp.position}-${exp.duration}`}
                    className="border-l-2 pl-3"
                  >
                    <p className="font-medium">
                      {exp.position} — {exp.company}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {exp.duration}
                    </p>
                    <p className="mt-1 text-sm">{exp.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {c.education && c.education.length > 0 && (
            <section>
              <h3 className="mb-2 font-semibold">Học vấn</h3>
              <div className="space-y-3">
                {c.education.map((edu) => (
                  <div
                    key={`${edu.school}-${edu.major}-${edu.duration}`}
                    className="border-l-2 pl-3"
                  >
                    <p className="font-medium">{edu.school}</p>
                    <p className="text-sm">{edu.major}</p>
                    <p className="text-muted-foreground text-xs">
                      {edu.duration}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {c.skills && c.skills.length > 0 && (
            <section>
              <h3 className="mb-2 font-semibold">Kỹ năng</h3>
              <div className="flex flex-wrap gap-2">
                {c.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-secondary px-3 py-1 text-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
