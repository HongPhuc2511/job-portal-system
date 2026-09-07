import {
	Field as FormischField,
	type FormSchema,
	type FormStore,
	type RequiredPath,
	type ValidPath,
} from "@formisch/react";
import { cn } from "cn";
import type * as v from "valibot";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

type SelectFieldProps<
	TSchema extends FormSchema,
	TFieldPath extends RequiredPath,
> = {
	of: FormStore<TSchema>;
	path: ValidPath<v.InferInput<TSchema>, TFieldPath>;
	label: string;
	id?: string;
	required?: boolean;
	items:
		| Record<string, string>
		| readonly { value: string | number; label: string }[];
	placeholder?: string;
	disabled?: boolean;
	triggerClassName?: string;
	contentClassName?: string;
	onValueChange?: (value: string) => void;
};

export function SelectField<
	TSchema extends FormSchema,
	TFieldPath extends RequiredPath,
>({
	of,
	path,
	label,
	id,
	required,
	items,
	placeholder,
	disabled,
	triggerClassName,
	contentClassName,
	onValueChange,
}: SelectFieldProps<TSchema, TFieldPath>) {
	const fieldId = id ?? `form-${path.join("-")}`;
	const options = Array.isArray(items)
		? items
		: Object.entries(items).map(([value, label]) => ({ value, label }));

	return (
		<FormischField of={of} path={path}>
			{(field) => (
				<Field data-invalid={field.errors !== null}>
					<FieldLabel htmlFor={fieldId}>
						{label}
						{required && (
							<span aria-hidden="true" className="text-destructive">
								*
							</span>
						)}
					</FieldLabel>
					<Select
						{...field.props}
						id={fieldId}
						value={field.input ?? null}
						disabled={disabled}
						onValueChange={(value) => {
							// Select đang ở chế độ controlled nên phải tự đẩy giá trị vào form.
							// items dạng mảng có thể chứa value là số (vd id tỉnh/huyện).
							if (value == null) return;
							field.onChange(value as never);
							onValueChange?.(
								typeof value === "string" ? value : String(value),
							);
						}}
						items={options}
						aria-invalid={field.errors !== null}
					>
						<SelectTrigger className={cn("w-full", triggerClassName)}>
							<SelectValue placeholder={placeholder} />
						</SelectTrigger>
						<SelectContent className={contentClassName}>
							{options.map((option) => (
								<SelectItem key={String(option.value)} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{field.errors && (
						<FieldError errors={field.errors.map((message) => ({ message }))} />
					)}
				</Field>
			)}
		</FormischField>
	);
}
