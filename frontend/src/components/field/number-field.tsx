import {
	Field as FormischField,
	type FormSchema,
	type FormStore,
	type RequiredPath,
	type ValidPath,
} from "@formisch/react";
import type * as v from "valibot";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
	NumberFieldDecrement,
	NumberFieldGroup,
	NumberFieldIncrement,
	NumberFieldInput,
	NumberField as NumberFieldPrimitive,
} from "@/components/ui/number-field";

type NumberFieldProps<
	TSchema extends FormSchema,
	TFieldPath extends RequiredPath,
> = {
	of: FormStore<TSchema>;
	path: ValidPath<v.InferInput<TSchema>, TFieldPath>;
	label: string;
	id?: string;
	required?: boolean;
	placeholder?: string;
	min?: number;
	max?: number;
};

function NumberField<
	TSchema extends FormSchema,
	TFieldPath extends RequiredPath,
>({
	of,
	path,
	label,
	id,
	required,
	placeholder,
	min,
	max,
}: NumberFieldProps<TSchema, TFieldPath>) {
	const fieldId = id ?? `form-${path.join("-")}`;

	return (
		<FormischField of={of} path={path}>
			{(field) => {
				// Base UI NumberField luôn trả về number | null — đẩy thẳng vào form
				// (null khi người dùng xoá trống; validation sẽ báo lỗi nếu field bắt buộc).
				const inputValue = field.input as number | null;

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
						<NumberFieldPrimitive
							id={fieldId}
							value={inputValue}
							min={min}
							max={max}
							onValueChange={(value) => {
								field.onChange(value as never);
							}}
						>
							<NumberFieldGroup>
								<NumberFieldDecrement />
								<NumberFieldInput
									placeholder={placeholder}
									aria-invalid={field.errors !== null}
								/>
								<NumberFieldIncrement />
							</NumberFieldGroup>
						</NumberFieldPrimitive>
						{field.errors && (
							<FieldError
								errors={field.errors.map((message) => ({ message }))}
							/>
						)}
					</Field>
				);
			}}
		</FormischField>
	);
}

export { NumberField };
