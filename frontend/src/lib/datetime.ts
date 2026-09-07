// Định dạng ngày giờ "YYYY-MM-DDTHH:mm" theo giờ địa phương
export function formatLocalDateTime(date: Date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	const hour = String(date.getHours()).padStart(2, "0");
	const minute = String(date.getMinutes()).padStart(2, "0");
	return `${year}-${month}-${day}T${hour}:${minute}`;
}

export function formatDisplayDate(date?: Date | string | null) {
	if (!date) return "-";
	return new Date(date).toLocaleDateString("vi-VN");
}

export function calculateRemainingDays(targetDate: Date | string): number {
	const now = new Date();
	const timeDiff = new Date(targetDate).getTime() - now.getTime();
	return Math.ceil(timeDiff / (1000 * 3600 * 24));
}
