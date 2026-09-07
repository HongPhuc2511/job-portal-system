/**
 * Trả về danh sách các trang để hiển thị trong phân trang.
 *
 * Ví dụ: Trang hiện tại là 5, tổng số trang là 10, kết quả là `[1, "...", 4, 5, 6, "...", 10]`
 */
export function getPageItems(
	current: number,
	totalPages: number,
): (number | "...")[] {
	if (totalPages <= 7) {
		return Array.from({ length: totalPages }, (_, i) => i + 1);
	}

	const candidates = new Set([
		1,
		current - 1,
		current,
		current + 1,
		totalPages,
	]);
	const pages = [...candidates]
		.filter((page) => page >= 1 && page <= totalPages)
		.sort((a, b) => a - b);

	const result: (number | "...")[] = [];
	let previous = 0;
	for (const page of pages) {
		if (page - previous > 1) result.push("...");
		result.push(page);
		previous = page;
	}
	return result;
}
