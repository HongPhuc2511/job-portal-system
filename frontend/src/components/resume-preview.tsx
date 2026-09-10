import { GraduationCapIcon, PhoneIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ResumeContent } from "@/types/application";

/** Render nội dung CV builder — dùng chung cho trang CV của ứng viên và bản xem trước của nhà tuyển dụng. */
export function ResumePreview({
	title,
	content,
}: {
	title: string;
	content: ResumeContent;
}) {
	const initials = (content.full_name || title)
		.split(" ")
		.slice(-2)
		.map((w) => w[0])
		.join("")
		.toUpperCase();

	return (
		<Card className="overflow-hidden">
			<div className="flex items-center gap-4 border-b bg-secondary/40 px-8 py-8">
				<div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground text-xl">
					{initials}
				</div>
				<div className="min-w-0">
					<h1 className="truncate font-semibold text-2xl tracking-tight">
						{content.full_name || title}
					</h1>
					<p className="text-muted-foreground text-sm">{title}</p>
					{content.phone && (
						<div className="mt-2 flex items-center gap-1.5 text-muted-foreground text-sm">
							<PhoneIcon className="size-3.5" />
							{content.phone}
						</div>
					)}
				</div>
			</div>

			<CardContent className="space-y-8 px-8 py-8">
				{content.summary && (
					<section>
						<h2 className="mb-2 font-semibold text-sm uppercase tracking-wide">
							Giới thiệu bản thân
						</h2>
						<p className="text-sm leading-relaxed">{content.summary}</p>
					</section>
				)}

				{content.experience && content.experience.length > 0 && (
					<section>
						<h2 className="mb-4 font-semibold text-sm uppercase tracking-wide">
							Kinh nghiệm làm việc
						</h2>
						<div className="space-y-6">
							{content.experience.map((exp) => (
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
									<p className="text-muted-foreground text-sm">{exp.company}</p>
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

				{content.education && content.education.length > 0 && (
					<section>
						<h2 className="mb-4 font-semibold text-sm uppercase tracking-wide">
							Học vấn
						</h2>
						<div className="space-y-4">
							{content.education.map((edu) => (
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
										<p className="text-muted-foreground text-sm">{edu.major}</p>
									</div>
								</div>
							))}
						</div>
					</section>
				)}

				{content.skills && content.skills.length > 0 && (
					<section>
						<h2 className="mb-3 font-semibold text-sm uppercase tracking-wide">
							Kỹ năng
						</h2>
						<div className="flex flex-wrap gap-2">
							{content.skills.map((skill) => (
								<Badge key={skill} variant="secondary">
									{skill}
								</Badge>
							))}
						</div>
					</section>
				)}
			</CardContent>
		</Card>
	);
}
