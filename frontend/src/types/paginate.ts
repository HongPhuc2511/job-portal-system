export type PaginationMeta = {
	total: number;
	total_pages: number;
	first_page: number;
	last_page: number;
	page: number;
	previous_page?: number;
	next_page?: number;
};

export type Page<T> = {
	items: T[];
	pagination: PaginationMeta;
};
