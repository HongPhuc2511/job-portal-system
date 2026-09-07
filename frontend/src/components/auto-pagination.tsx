import { getPageItems } from "@/lib/paginate";
import type { PaginationMeta } from "@/types/paginate";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "./ui/pagination";

export function AutoPagination({
	pagination,
	goToPage,
}: {
	pagination: PaginationMeta;
	goToPage: (page: number) => void;
}) {
	const {
		page,
		total_pages: totalPages,
		previous_page: previousPage,
		next_page: nextPage,
	} = pagination;

	return (
		<Pagination>
			<PaginationContent>
				{previousPage != null && (
					<PaginationItem>
						<PaginationPrevious
							text="Trước"
							onClick={() => goToPage(previousPage)}
						/>
					</PaginationItem>
				)}

				{getPageItems(page, totalPages).map((item, index) =>
					item === "..." ? (
						<PaginationItem key={`ellipsis-${index}`}>
							<PaginationEllipsis />
						</PaginationItem>
					) : (
						<PaginationItem key={item}>
							<PaginationLink
								isActive={item === page}
								onClick={() => goToPage(item)}
							>
								{item}
							</PaginationLink>
						</PaginationItem>
					),
				)}

				{nextPage != null && (
					<PaginationItem>
						<PaginationNext text="Sau" onClick={() => goToPage(nextPage)} />
					</PaginationItem>
				)}
			</PaginationContent>
		</Pagination>
	);
}
