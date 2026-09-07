function formatNumber(value: number): string {
	return value.toLocaleString("en-US").replace(/,/g, ".");
}

/**
 * Định dạng mức lương theo cùng logic với `display_salary` của backend.
 *
 * - min = max       -> "8.000.000"
 * - min < max       -> "8.000.000 - 15.000.000"
 * - chỉ có min      -> "Từ 8.000.000"
 * - chỉ có max      -> "Tới 15.000.000"
 * - cả hai đều null -> "Thương lượng"
 */
export function formatSalary(
	min: number | null | undefined,
	max: number | null | undefined,
): string {
	if (min == null && max == null) {
		return "Thương lượng";
	}

	if (min != null && max != null) {
		if (min === max) {
			return formatNumber(min);
		}
		return `${formatNumber(min)} - ${formatNumber(max)}`;
	}

	if (min != null) {
		return `Từ ${formatNumber(min)}`;
	}

	if (max != null) {
		return `Tới ${formatNumber(max)}`;
	}

	return "Lỗi?! Sao có thể xảy ra trường hợp này được";
}
