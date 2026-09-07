import { cn } from "cn";

export function Description({
	children,
	className,
}: {
	children?: React.ReactNode;
	className?: string;
}) {
	return (
		<p
			className={cn(
				"flex items-center gap-1 text-sm text-secondary-foreground",
				"[&_svg]:size-4",
				className,
			)}
		>
			{children}
		</p>
	);
}
