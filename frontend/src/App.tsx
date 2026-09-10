import { BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "@/components/header";
import ProtectedRoute from "@/components/protected-route";
import { AuthProvider } from "@/context/auth-context";
import EmployerPostsPage from "@/pages/employer-posts";
import { Home } from "@/pages/home";
import Login from "@/pages/login";
import MyApplicationsPage from "@/pages/my-applications";
import PostCreatePage from "@/pages/post-create";
import PostDetailPage from "@/pages/post-detail";
import PostEditPage from "@/pages/post-edit";
import Register from "@/pages/register";
import ResumeBuilder from "@/pages/resume_builder";
import ResumeDetailPage from "@/pages/resume_detail";
import Resumes from "@/pages/resumes";
import CompanyProfilePage from "./pages/company-profile";

export function App() {
	return (
		<BrowserRouter>
			<AuthProvider>
				<Header />
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Register />} />
					<Route path="/resumes" element={<Resumes />} />
					<Route
						path="/resumes/builder"
						element={
							<ProtectedRoute>
								<ResumeBuilder />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/resumes/:id/edit"
						element={
							<ProtectedRoute>
								<ResumeBuilder />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/resumes/:id"
						element={
							<ProtectedRoute>
								<ResumeDetailPage />
							</ProtectedRoute>
						}
					/>

					<Route
						path="/my-applications"
						element={
							<ProtectedRoute>
								<MyApplicationsPage />
							</ProtectedRoute>
						}
					/>

					<Route
						path="/manage-posts"
						element={
							<ProtectedRoute>
								<EmployerPostsPage />
							</ProtectedRoute>
						}
					/>
					<Route path="/manage-posts/create" element={<PostCreatePage />} />
					<Route
						path="/posts/:id/edit"
						element={
							<ProtectedRoute>
								<PostEditPage />
							</ProtectedRoute>
						}
					/>

					<Route path="/companies/:id" element={<CompanyProfilePage />} />
					<Route path="/posts/:id" element={<PostDetailPage />} />
				</Routes>
			</AuthProvider>
		</BrowserRouter>
	);
}

export default App;
