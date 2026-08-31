import { type ChangeEvent, type SubmitEvent, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import type { RegisterPayload, Role } from "@/api/auth"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/context/auth-context"

const initialForm: RegisterPayload = {
  email: "",
  full_name: "",
  password: "",
  role: "seeker",
  phone: "",
  company_name: "",
  company_website: "",
}

export function Register() {
  const [form, setForm] = useState<RegisterPayload>(initialForm)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)
    try {
      await register(form)
      navigate("/login")
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Đăng ký thất bại"
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-sm px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Đăng ký</CardTitle>
          <CardDescription>
            Tạo tài khoản mới để bắt đầu tìm việc hoặc tuyển dụng.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Họ tên</Label>
              <Input
                id="full_name"
                name="full_name"
                placeholder="Họ tên"
                autoComplete="name"
                value={form.full_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Mật khẩu"
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Số điện thoại (tùy chọn)</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="Số điện thoại (tùy chọn)"
                autoComplete="tel"
                value={form.phone}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="role">Bạn là</Label>
              <Select
                value={form.role}
                onValueChange={(value) =>
                  setForm({
                    ...form,
                    role: (value ?? "seeker") as Role,
                  })
                }
              >
                <SelectTrigger id="role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seeker">Ứng viên</SelectItem>
                  <SelectItem value="employer">Nhà tuyển dụng</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.role === "employer" && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="company_name">Tên công ty</Label>
                  <Input
                    id="company_name"
                    name="company_name"
                    placeholder="Tên công ty"
                    value={form.company_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="company_website">
                    Website công ty (tùy chọn)
                  </Label>
                  <Input
                    id="company_website"
                    name="company_website"
                    placeholder="Website công ty (tùy chọn)"
                    value={form.company_website}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Đang đăng ký..." : "Đăng ký"}
            </Button>
          </form>
          <p className="mt-4 text-muted-foreground text-sm">
            Đã có tài khoản?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Đăng nhập
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}

export default Register
