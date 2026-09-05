import { type SubmitEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";

export function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const { login } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError("");
		setSubmitting(true);
		try {
			await login(email, password);
			navigate("/");
		} catch {
			setError("Email hoặc mật khẩu không đúng");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<main className="mx-auto w-full max-w-sm px-4 py-16">
			<Card>
				<CardHeader>
					<CardTitle>Đăng nhập</CardTitle>
					<CardDescription>
						Đăng nhập để theo dõi tin tuyển dụng và hồ sơ của bạn.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-1.5">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="Email"
								autoComplete="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="password">Mật khẩu</Label>
							<Input
								id="password"
								type="password"
								placeholder="Mật khẩu"
								autoComplete="current-password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>
						{error && <p className="text-destructive text-sm">{error}</p>}
						<Button type="submit" className="w-full" disabled={submitting}>
							{submitting ? "Đang đăng nhập..." : "Đăng nhập"}
						</Button>
					</form>
					<p className="mt-4 text-muted-foreground text-sm">
						Chưa có tài khoản?{" "}
						<Link to="/register" className="text-primary hover:underline">
							Đăng ký
						</Link>
					</p>
				</CardContent>
			</Card>
		</main>
	);
}

export default Login;
