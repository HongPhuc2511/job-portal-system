import {
	FilePenLineIcon,
	FilePlusIcon,
	FileTextIcon,
	FileUserIcon,
	Trash2Icon,
	UploadIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
	createResumes,
	deleteResume,
	getResumes,
	updateResume,
	viewResumeFile,
} from "@/api/resume";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Resume {
	id: number;
	title: string;
	resume_type: string;
	file_path: string | null;
	created_at: string;
}

export default function Resumes() {
	const [title, setTitle] = useState("");
	const [file, setFile] = useState<File | null>(null);
	const [message, setMessage] = useState("");
	const [resumes, setResumes] = useState<Resume[]>([]);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [editTitle, setEditTitle] = useState("");

	const loadResumes = useCallback(async () => {
		const res = await getResumes();
		setResumes(res.data);
	}, []);

	useEffect(() => {
		loadResumes();
	}, [loadResumes]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!file) return setMessage("Vui lòng chọn file PDF");

		try {
			await createResumes(title, file);
			setMessage("Tạo CV thành công!");
			setTitle("");
			setFile(null);
			loadResumes();
		} catch (_err) {
			setMessage("Có lỗi xảy ra, thử lại sau");
		}
	};

	const handleDelete = async (id: number) => {
		if (!confirm("Bạn có chắc muốn xoá CV này?")) return;
		try {
			await deleteResume(id);
			setMessage("Xoá CV thành công!");
			loadResumes();
		} catch (_err) {
			setMessage("Xoá CV thất bại, thử lại sau");
		}
	};

	const startEdit = (r: Resume) => {
		setEditingId(r.id);
		setEditTitle(r.title);
	};

	const cancelEdit = () => {
		setEditingId(null);
		setEditTitle("");
	};

	const saveEdit = async (id: number) => {
		if (!editTitle.trim()) return;
		try {
			await updateResume(id, editTitle);
			setMessage("Cập nhật CV thành công!");
			setEditingId(null);
			loadResumes();
		} catch (_err) {
			setMessage("Cập nhật thất bại, thử lại sau");
		}
	};

	return (
		<div className="mx-auto max-w-3xl space-y-8 px-4 py-12">
			<div>
				<h1 className="font-semibold text-2xl tracking-tight">Quản lý CV</h1>
				<p className="mt-1 text-muted-foreground text-sm">
					Tạo, chỉnh sửa và quản lý các CV bạn dùng để ứng tuyển.
				</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<Card>
					<CardHeader>
						<div className="flex items-center gap-2">
							<div className="flex size-9 items-center justify-center rounded-full bg-secondary">
								<UploadIcon className="size-4" />
							</div>
							<CardTitle className="text-base">Tải lên file PDF</CardTitle>
						</div>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-3">
							<Input
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="Tiêu đề CV, VD: CV Frontend Developer"
							/>
							<Input
								type="file"
								accept="application/pdf"
								onChange={(e) => setFile(e.target.files?.[0] ?? null)}
							/>
							<Button type="submit" size="sm" className="w-full">
								Tải lên
							</Button>
						</form>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<div className="flex items-center gap-2">
							<div className="flex size-9 items-center justify-center rounded-full bg-secondary">
								<FilePlusIcon className="size-4" />
							</div>
							<CardTitle className="text-base">Tạo theo mẫu</CardTitle>
						</div>
					</CardHeader>
					<CardContent className="flex h-[calc(100%-3.5rem)] flex-col justify-between gap-3">
						<p className="text-muted-foreground text-sm">
							Nhập thông tin theo form có sẵn — hệ thống tự dựng bố cục CV cho
							bạn.
						</p>
						<Button
							variant="outline"
							size="sm"
							className="w-full"
							render={<Link to="/resumes/builder" />}
							nativeButton={false}
						>
							Bắt đầu nhập thông tin
						</Button>
					</CardContent>
				</Card>
			</div>

			{message && <p className="text-muted-foreground text-sm">{message}</p>}

			<div className="space-y-3">
				<h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
					CV của tôi ({resumes.length})
				</h2>

				{resumes.length === 0 && (
					<Card className="border-dashed">
						<CardContent className="flex flex-col items-center gap-2 py-10 text-center">
							<FileUserIcon className="size-8 text-muted-foreground" />
							<p className="text-muted-foreground text-sm">
								Bạn chưa có CV nào. Tạo CV đầu tiên ở phía trên.
							</p>
						</CardContent>
					</Card>
				)}

				{resumes.map((r) => (
					<Card key={r.id}>
						<CardContent className="flex items-center gap-4 py-4">
							<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
								<FileTextIcon className="size-5" />
							</div>

							<div className="min-w-0 flex-1">
								{editingId === r.id ? (
									<Input
										value={editTitle}
										onChange={(e) => setEditTitle(e.target.value)}
										className="h-8"
									/>
								) : (
									<div className="flex items-center gap-2">
										<span className="truncate font-medium text-sm">
											{r.title}
										</span>
										<span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground">
											{r.resume_type === "upload" ? "File PDF" : "Theo mẫu"}
										</span>
									</div>
								)}
								<p className="mt-0.5 text-muted-foreground text-xs">
									{new Date(r.created_at).toLocaleDateString("vi-VN")}
								</p>
							</div>

							<div className="flex shrink-0 items-center gap-2">
								{editingId === r.id ? (
									<>
										<Button size="sm" onClick={() => saveEdit(r.id)}>
											Lưu
										</Button>
										<Button variant="outline" size="sm" onClick={cancelEdit}>
											Huỷ
										</Button>
									</>
								) : (
									<>
										{r.resume_type === "upload" ? (
											<Button
												variant="outline"
												size="sm"
												onClick={() => viewResumeFile(r.id)}
											>
												Xem
											</Button>
										) : (
											<Button
												variant="outline"
												size="sm"
												render={<Link to={`/resumes/${r.id}`} />}
												nativeButton={false}
											>
												Xem
											</Button>
										)}

										{r.resume_type === "upload" ? (
											<Button
												variant="ghost"
												size="icon"
												onClick={() => startEdit(r)}
												aria-label="Sửa tiêu đề"
											>
												<FilePenLineIcon className="size-4" />
											</Button>
										) : (
											<Button
												variant="ghost"
												size="icon"
												render={<Link to={`/resumes/${r.id}/edit`} />}
												nativeButton={false}
												aria-label="Sửa CV"
											>
												<FilePenLineIcon className="size-4" />
											</Button>
										)}

										<Button
											variant="ghost"
											size="icon"
											onClick={() => handleDelete(r.id)}
											aria-label="Xoá CV"
											className="text-destructive hover:text-destructive"
										>
											<Trash2Icon className="size-4" />
										</Button>
									</>
								)}
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
