import { GraduationCapIcon, PhoneIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getResumeDetail } from "@/api/resume";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Experience {
	company: string;
	position: string;
	duration: string;
	description: string;
}

interface Education {
	school: string;
	major: string;
	duration: string;
}

interface ResumeContent {
	full_name?: string;
	phone?: string;
	summary?: string;
	experience?: Experience[];
	education?: Education[];
	skills?: string[];
}

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

	const c = resume.content;
	const initials = (c.full_name || resume.title)
		.split(" ")
		.slice(-2)
		.map((w) => w[0])
		.join("")
		.toUpperCase();

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

			<Card className="overflow-hidden">
				<div className="flex items-center gap-4 border-b bg-secondary/40 px-8 py-8">
					<div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground text-xl">
						{initials}
					</div>
					<div className="min-w-0">
						<h1 className="truncate font-semibold text-2xl tracking-tight">
							{c.full_name || resume.title}
						</h1>
						<p className="text-muted-foreground text-sm">{resume.title}</p>
						{c.phone && (
							<div className="mt-2 flex items-center gap-1.5 text-muted-foreground text-sm">
								<PhoneIcon className="size-3.5" />
								{c.phone}
							</div>
						)}
					</div>
				</div>

				<CardContent className="space-y-8 px-8 py-8">
					{c.summary && (
						<section>
							<h2 className="mb-2 font-semibold text-sm uppercase tracking-wide">
								Giới thiệu bản thân
							</h2>
							<p className="text-sm leading-relaxed">{c.summary}</p>
						</section>
					)}

					{c.experience && c.experience.length > 0 && (
						<section>
							<h2 className="mb-4 font-semibold text-sm uppercase tracking-wide">
								Kinh nghiệm làm việc
							</h2>
							<div className="space-y-6">
								{c.experience.map((exp) => (
									<div
										key={`${exp.company}-${exp.position}-${exp.duration}`}
										className="relative border-l-2 pl-5"
									>
										<div className="-left-[5px] absolute top-1 size-2 rounded-full bg-primary" />
										<div className="flex flex-wrap items-baseline justify-between gap-x-3">
											<p className="font-medium text-sm">{exp.position}</p>
											<p className="text-muted-foreground text-xs">
												{exp.duration}
											</p>
										</div>
										<p className="text-muted-foreground text-sm">
											{exp.company}
										</p>
										{exp.description && (
											<p className="mt-1.5 text-sm leading-relaxed">
												{exp.description}
											</p>
										)}
									</div>
								))}
							</div>
						</section>
					)}

					{c.education && c.education.length > 0 && (
						<section>
							<h2 className="mb-4 font-semibold text-sm uppercase tracking-wide">
								Học vấn
							</h2>
							<div className="space-y-4">
								{c.education.map((edu) => (
									<div
										key={`${edu.school}-${edu.major}-${edu.duration}`}
										className="flex items-start gap-3"
									>
										<div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary">
											<GraduationCapIcon className="size-4" />
										</div>
										<div className="min-w-0">
											<div className="flex flex-wrap items-baseline justify-between gap-x-3">
												<p className="font-medium text-sm">{edu.school}</p>
												<p className="text-muted-foreground text-xs">
													{edu.duration}
												</p>
											</div>
											<p className="text-muted-foreground text-sm">
												{edu.major}
											</p>
										</div>
									</div>
								))}
							</div>
						</section>
					)}

					{c.skills && c.skills.length > 0 && (
						<section>
							<h2 className="mb-3 font-semibold text-sm uppercase tracking-wide">
								Kỹ năng
							</h2>
							<div className="flex flex-wrap gap-2">
								{c.skills.map((skill) => (
									<Badge key={skill} variant="secondary">
										{skill}
									</Badge>
								))}
							</div>
						</section>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
