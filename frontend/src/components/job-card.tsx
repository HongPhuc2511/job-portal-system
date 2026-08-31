import { Building2, MapPin, Wallet } from "lucide-react"
import type { Job } from "@/api/job"
import { Card, CardContent } from "@/components/ui/card"

export function JobCard({ job }: { job: Job }) {
  return (
    <Card>
      <CardContent className="space-y-2 py-4">
        <h3 className="font-medium text-primary">{job.title}</h3>
        <p className="flex items-center gap-1.5 font-medium text-foreground text-sm">
          <Building2 className="size-4 text-muted-foreground" />
          {job.company_name || "Công ty Tuyển dụng"}
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground text-sm">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-4" />
            {job.location || "Hồ Chí Minh"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Wallet className="size-4" />
            {job.salary ? `${job.salary} VNĐ` : "Thỏa thuận"}
          </span>
        </div>
        <p className="text-muted-foreground text-xs">
          Đăng ngày:{" "}
          {job.created_at
            ? new Date(job.created_at).toLocaleDateString("vi-VN")
            : "Vừa xong"}
        </p>
      </CardContent>
    </Card>
  )
}

export default JobCard
