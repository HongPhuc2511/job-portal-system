import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getResumeDetail } from "@/api/resume";
import { ResumePreview } from "@/components/resume-preview";
import { Button } from "@/components/ui/button";
import type { ResumeContent } from "@/types/application";

interface ResumeDetail {
	id: number;
	title: string;
	resume_type: string;
	content: ResumeContent | null;
}

export default function ResumeDetailPage() {
	const { id } = useParams();
	const [resume, setResume] = useState<ResumeDetail | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const load = async () => {
			const res = await getResumeDetail(Number(id));
			setResume(res.data);
			setLoading(false);
		};
		load();
	}, [id]);

	if (loading)
		return (
			<p className="mx-auto max-w-3xl px-4 py-12 text-muted-foreground text-sm">
				Đang tải...
			</p>
		);
	if (!resume?.content)
		return (
			<p className="mx-auto max-w-3xl px-4 py-12 text-muted-foreground text-sm">
				Không tìm thấy CV.
			</p>
		);

	return (
		<div className="mx-auto max-w-3xl space-y-4 px-4 py-12">
			<Button
				variant="ghost"
				size="sm"
				render={<Link to="/resumes" />}
				nativeButton={false}
			>
				← Quay lại danh sách
			</Button>

			<ResumePreview title={resume.title} content={resume.content} />
		</div>
	);
}
