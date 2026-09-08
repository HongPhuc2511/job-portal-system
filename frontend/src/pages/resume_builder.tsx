import {
	BriefcaseIcon,
	GraduationCapIcon,
	PlusIcon,
	Trash2Icon,
	UserIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
	createResumeBuilder,
	getResumeDetail,
	updateResume,
} from "@/api/resume";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface Experience {
	id: string;
	company: string;
	position: string;
	duration: string;
	description: string;
}

interface Education {
	id: string;
	school: string;
	major: string;
	duration: string;
}

export default function ResumeBuilder() {
	const navigate = useNavigate();
	const { id } = useParams();
	const isEditing = Boolean(id);

	const [title, setTitle] = useState("");
	const [fullName, setFullName] = useState("");
	const [phone, setPhone] = useState("");
	const [summary, setSummary] = useState("");
	const [skills, setSkills] = useState("");
	const [experience, setExperience] = useState<Experience[]>([]);
	const [education, setEducation] = useState<Education[]>([]);
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(isEditing);

	useEffect(() => {
		if (!isEditing) return;

		const load = async () => {
			const res = await getResumeDetail(Number(id));
			const resume = res.data;
			setTitle(resume.title);
			const c = resume.content || {};
			setFullName(c.full_name || "");
			setPhone(c.phone || "");
			setSummary(c.summary || "");
			setSkills((c.skills || []).join(", "));
			setExperience(
				(c.experience || []).map((exp: Omit<Experience, "id">) => ({
					id: crypto.randomUUID(),
					...exp,
				})),
			);
			setEducation(
				(c.education || []).map((edu: Omit<Education, "id">) => ({
					id: crypto.randomUUID(),
					...edu,
				})),
			);
			setLoading(false);
		};
		load();
	}, [id, isEditing]);

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
		]);
	};

	const updateExperience = (
		expId: string,
		field: keyof Experience,
		value: string,
	) => {
		setExperience(
			experience.map((exp) =>
				exp.id === expId ? { ...exp, [field]: value } : exp,
			),
		);
	};

	const removeExperience = (expId: string) => {
		setExperience(experience.filter((exp) => exp.id !== expId));
	};

	const addEducation = () => {
		setEducation([
			...education,
			{ id: crypto.randomUUID(), school: "", major: "", duration: "" },
		]);
	};

	const updateEducation = (
		eduId: string,
		field: keyof Education,
		value: string,
	) => {
		setEducation(
			education.map((edu) =>
				edu.id === eduId ? { ...edu, [field]: value } : edu,
			),
		);
	};

	const removeEducation = (eduId: string) => {
		setEducation(education.filter((edu) => edu.id !== eduId));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const content = {
			full_name: fullName,
			phone,
			summary,
			experience: experience.map(({ id: _id, ...rest }) => rest),
			education: education.map(({ id: _id, ...rest }) => rest),
			skills: skills
				.split(",")
				.map((s) => s.trim())
				.filter(Boolean),
		};

		try {
			if (isEditing) {
				await updateResume(Number(id), title, content);
				setMessage("Cập nhật CV thành công!");
			} else {
				await createResumeBuilder(title, content);
				setMessage("Tạo CV thành công!");
			}
			navigate("/resumes");
		} catch (_err) {
			setMessage("Có lỗi xảy ra, thử lại sau");
		}
	};

	const textareaClass =
		"border-input flex min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

	if (loading)
		return (
			<p className="mx-auto max-w-3xl px-4 py-12 text-muted-foreground text-sm">
				Đang tải...
			</p>
		);

	return (
		<div className="mx-auto max-w-3xl space-y-8 px-4 py-12">
			<div>
				<h1 className="font-semibold text-2xl tracking-tight">
					{isEditing ? "Sửa CV" : "Tạo CV theo mẫu"}
				</h1>
				<p className="mt-1 text-muted-foreground text-sm">
					Điền thông tin bên dưới, hệ thống tự dựng bố cục CV cho bạn.
				</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Thông tin cá nhân */}
				<Card>
					<CardHeader className="pb-4">
						<div className="flex items-center gap-3">
							<div className="flex size-9 items-center justify-center rounded-full bg-secondary">
								<UserIcon className="size-4" />
							</div>
							<CardTitle className="text-base">Thông tin cá nhân</CardTitle>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-1.5">
							<Label htmlFor="title">Tiêu đề CV</Label>
							<Input
								id="title"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="VD: CV Frontend Developer"
								required
							/>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
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
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="flex size-9 items-center justify-center rounded-full bg-secondary">
									<BriefcaseIcon className="size-4" />
								</div>
								<CardTitle className="text-base">
									Kinh nghiệm làm việc
								</CardTitle>
							</div>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={addExperience}
							>
								<PlusIcon className="size-4" />
								Thêm
							</Button>
						</div>
					</CardHeader>
					{experience.length > 0 && (
						<CardContent className="space-y-4">
							{experience.map((exp, i) => (
								<div key={exp.id}>
									{i > 0 && <Separator className="mb-4" />}
									<div className="space-y-3">
										<div className="flex items-center justify-between">
											<span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
												Kinh nghiệm #{i + 1}
											</span>
											<Button
												type="button"
												variant="ghost"
												size="icon"
												onClick={() => removeExperience(exp.id)}
												aria-label="Xoá kinh nghiệm này"
												className="size-7 text-destructive hover:text-destructive"
											>
												<Trash2Icon className="size-4" />
											</Button>
										</div>
										<div className="grid gap-3 sm:grid-cols-2">
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
										</div>
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
									</div>
								</div>
							))}
						</CardContent>
					)}
				</Card>

				<Card>
					<CardHeader className="pb-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="flex size-9 items-center justify-center rounded-full bg-secondary">
									<GraduationCapIcon className="size-4" />
								</div>
								<CardTitle className="text-base">Học vấn</CardTitle>
							</div>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={addEducation}
							>
								<PlusIcon className="size-4" />
								Thêm
							</Button>
						</div>
					</CardHeader>
					{education.length > 0 && (
						<CardContent className="space-y-4">
							{education.map((edu, i) => (
								<div key={edu.id}>
									{i > 0 && <Separator className="mb-4" />}
									<div className="space-y-3">
										<div className="flex items-center justify-between">
											<span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
												Học vấn #{i + 1}
											</span>
											<Button
												type="button"
												variant="ghost"
												size="icon"
												onClick={() => removeEducation(edu.id)}
												aria-label="Xoá học vấn này"
												className="size-7 text-destructive hover:text-destructive"
											>
												<Trash2Icon className="size-4" />
											</Button>
										</div>
										<div className="grid gap-3 sm:grid-cols-2">
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
										</div>
										<Input
											placeholder="Thời gian (VD: 2020 - 2024)"
											value={edu.duration}
											onChange={(e) =>
												updateEducation(edu.id, "duration", e.target.value)
											}
										/>
									</div>
								</div>
							))}
						</CardContent>
					)}
				</Card>

				{message && <p className="text-muted-foreground text-sm">{message}</p>}
				<Button type="submit" className="h-11 w-full">
					{isEditing ? "Lưu thay đổi" : "Tạo CV"}
				</Button>
			</form>
		</div>
	);
}
