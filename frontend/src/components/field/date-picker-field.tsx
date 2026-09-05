import {
	type FormSchema,
	type FormStore,
	type RequiredPath,
	useField,
	type ValidPath,
} from "@formisch/react";
import { CalendarIcon, Clock3Icon, XIcon } from "lucide-react";
import * as React from "react";
import type * as v from "valibot";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

type DatePickerFieldProps<
	TSchema extends FormSchema,
	TFieldPath extends RequiredPath,
> = {
	of: FormStore<TSchema>;
	path: ValidPath<v.InferInput<TSchema>, TFieldPath>;
	label: string;
	id?: string;
	required?: boolean;
	placeholder?: string;
};

function formatISODate(date: Date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

// Chuyển input dạng "2026-12-31T23:59:59" thành { date, time } để hiển thị trên picker.
function parseStoredValue(value: string | undefined) {
	if (!value) {
		return { date: undefined, time: "18:00" };
	}

	const [datePart, timePart] = value.split("T");
	const date = new Date(`${datePart}T00:00:00`);
	return {
		date: Number.isNaN(date.getTime()) ? undefined : date,
		time: timePart?.slice(0, 5) || "18:00",
	};
}

function formatDisplayValue(value: string | undefined) {
	if (!value) return undefined;
	const { date, time } = parseStoredValue(value);
	if (!date) return undefined;
	const fullTime = time.length === 5 ? `${time}:00` : time;
	return `${date.toLocaleDateString("vi-VN")} ${fullTime}`;
}

function DatePickerField<
	TSchema extends FormSchema,
	TFieldPath extends RequiredPath,
>({
	of,
	path,
	label,
	id,
	required,
	placeholder,
}: DatePickerFieldProps<TSchema, TFieldPath>) {
	const field = useField(of, { path });
	const fieldId = id ?? `form-${path.join("-")}`;

	const initial = React.useMemo(
		() => parseStoredValue(field.input as string | undefined),
		// Chỉ đọc một lần lúc mount để khởi tạo state hiển thị.
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	);
	const [date, setDate] = React.useState<Date | undefined>(initial.date);
	const [time, setTime] = React.useState(initial.time);
	const [open, setOpen] = React.useState(false);

	const commit = (nextDate: Date | null, nextTime: string | null) => {
		if (nextDate && nextTime) {
			const normalizedTime =
				nextTime.length === 5 ? `${nextTime}:00` : nextTime;
			field.onChange(`${formatISODate(nextDate)}T${normalizedTime}` as never);
		} else {
			field.onChange("" as never);
		}
	};

	// Chặn chọn ngày trong quá khứ trên lịch.
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const displayedValue = formatDisplayValue(field.input as string | undefined);

	return (
		<Field data-invalid={field.errors !== null}>
			<FieldLabel htmlFor={fieldId}>
				{label}
				{required && (
					<span aria-hidden="true" className="text-destructive">
						*
					</span>
				)}
			</FieldLabel>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger
					render={
						<Button
							variant="outline"
							id={fieldId}
							className="w-full justify-start px-2.5 font-normal"
							aria-invalid={field.errors !== null}
						/>
					}
				>
					<CalendarIcon
						data-icon="inline-start"
						className="text-muted-foreground"
					/>
					{displayedValue ? (
						<span className="tabular-nums">{displayedValue}</span>
					) : (
						<span className="text-muted-foreground">
							{placeholder ?? "Chọn ngày hết hạn"}
						</span>
					)}
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="single"
						selected={date}
						onSelect={(next) => {
							const nextDate = next ?? null;
							setDate(nextDate ?? undefined);
							commit(nextDate, time);
						}}
						disabled={(day) => day < today}
						captionLayout="dropdown"
						className="w-full"
					/>
					<div className="flex items-center gap-2 border-t p-2.5">
						<Clock3Icon className="size-4 shrink-0 text-muted-foreground" />
						<Input
							type="time"
							value={time}
							aria-label="Giờ hết hạn"
							className="w-32 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
							onChange={(event) => {
								const nextTime = event.target.value;
								setTime(nextTime);
								commit(date ?? null, nextTime);
							}}
						/>
						<Button
							variant="outline"
							size="sm"
							className="ml-auto"
							onClick={() => {
								setDate(undefined);
								setTime("18:00");
								commit(null, null);
							}}
						>
							<XIcon data-icon="inline-start" />
							Xoá
						</Button>
						<Button size="sm" onClick={() => setOpen(false)}>
							Xong
						</Button>
					</div>
				</PopoverContent>
			</Popover>
			{field.errors && (
				<FieldError errors={field.errors.map((message) => ({ message }))} />
			)}
		</Field>
	);
}

export { DatePickerField };
