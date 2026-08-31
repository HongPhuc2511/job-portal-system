import { LogOut } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"

export function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-secondary">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4">
        <Link to="/" className="font-bold text-lg">
          💼 JobPortal
        </Link>

        <nav className="hidden items-center gap-6 text-muted-foreground text-sm md:flex">
          <Link to="/" className="transition-colors hover:text-foreground">
            Trang chủ
          </Link>
          <Link to="/" className="transition-colors hover:text-foreground">
            Tìm việc làm
          </Link>
          <Link to="/" className="transition-colors hover:text-foreground">
            Tuyển dụng
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden text-sm sm:inline">
                Xin chào, <strong>{user.full_name || user.email}</strong>
              </span>
              <Button variant="destructive" size="sm" onClick={handleLogout}>
                <LogOut />
                Đăng xuất
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" render={<Link to="/login" />}>
                Đăng nhập
              </Button>
              <Button size="sm" render={<Link to="/register" />}>
                Đăng ký
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
