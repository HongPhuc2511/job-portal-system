import {
	ChevronDownIcon,
	FilePlusIcon,
	FileTextIcon,
	FileUserIcon,
	LogOutIcon,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Separator } from "./ui/separator";

export function Header() {
	return (
		<header className="sticky top-0 z-40 border-b bg-background">
			<div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-4 px-4">
				<Link to="/" className="font-bold text-lg">
					💼 JobPortal
				</Link>

				<nav className="ml-2 hidden items-center gap-4 text-secondary-foreground text-sm md:flex">
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

				<div className="ml-auto flex items-center gap-2">
					<EmployerTooltip />
					<UserButton />
				</div>
			</div>
		</header>
	);
}

function EmployerTooltip() {
	const { user } = useAuth();

	if (user?.role !== "employer") return null;

	return (
		<>
			<Button
				variant="outline"
				size="sm"
				render={<Link to="/posts/create" />}
				nativeButton={false}
			>
				<FilePlusIcon />
				Tạo bài đăng mới
			</Button>
			<Separator className="ml-1.5 h-6" orientation="vertical" />
		</>
	);
}

function UserButton() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	const handleLogout = async () => {
		await logout();
		navigate("/login");
	};

	if (!user)
		return (
			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					render={<Link to="/login" />}
					nativeButton={false}
				>
					Đăng nhập
				</Button>
				<Button size="sm" render={<Link to="/register" />} nativeButton={false}>
					Đăng ký
				</Button>
			</div>
		);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button variant="ghost" size="lg" className="h-10 px-1.5">
						<Avatar size="default">
							<AvatarFallback className="text-sm uppercase">
								{user.email[0]}
							</AvatarFallback>
						</Avatar>

						<ChevronDownIcon />
					</Button>
				}
			/>

			<DropdownMenuContent className="w-2xs" align="end">
				<DropdownMenuGroup>
					<div className="flex items-center gap-2 p-1">
						<Avatar size="lg">
							<AvatarFallback className="text-sm uppercase">
								{user.email[0]}
							</AvatarFallback>
						</Avatar>
						<div className="min-w-0 overflow-hidden">
							<p className="truncate text-sm font-medium">{user.full_name}</p>
							<p className="truncate text-[13px] text-secondary-foreground">
								{user.email}
							</p>
						</div>
					</div>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />

				{user.role === "seeker" && (
					<>
						<DropdownMenuGroup>
							<DropdownMenuItem render={<Link to="/resumes" />}>
								<FileUserIcon /> Quản lý CV
							</DropdownMenuItem>
						</DropdownMenuGroup>

						<DropdownMenuSeparator />
					</>
				)}

				{user.role === "employer" && (
					<>
						<DropdownMenuGroup>
							<DropdownMenuItem>
								<FileTextIcon />
								Quản lý bài đăng
							</DropdownMenuItem>
						</DropdownMenuGroup>

						<DropdownMenuSeparator />
					</>
				)}

				<DropdownMenuGroup>
					<DropdownMenuItem onClick={handleLogout} variant="destructive">
						<LogOutIcon />
						Đăng xuất
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export default Header;
