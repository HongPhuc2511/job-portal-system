import {
	Field as FormischField,
	type FormSchema,
	type FormStore,
	type RequiredPath,
	type ValidPath,
} from "@formisch/react";
import type * as React from "react";
import type * as v from "valibot";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type InputFieldProps<
	TSchema extends FormSchema,
	TFieldPath extends RequiredPath,
> = {
	of: FormStore<TSchema>;
	path: ValidPath<v.InferInput<TSchema>, TFieldPath>;
	label: string;
	description?: string;
	id?: string;
	required?: boolean;
	placeholder?: string;
	autoComplete?: string;
	type?: string;
	inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
	multiline?: boolean;
	className?: string;
};

function InputField<
	TSchema extends FormSchema,
	TFieldPath extends RequiredPath,
>({
	of,
	path,
	label,
	description,
	id,
	required,
	placeholder,
	autoComplete,
	type,
	inputMode,
	multiline,
	className,
}: InputFieldProps<TSchema, TFieldPath>) {
	const fieldId = id ?? `form-${path.join("-")}`;

	return (
		<FormischField of={of} path={path}>
			{(field) => {
				const inputValue = field.input as
					| string
					| number
					| readonly string[]
					| undefined;

				return (
					<Field data-invalid={field.errors !== null} className={className}>
						<FieldLabel htmlFor={fieldId}>
							{label}
							{required && (
								<span aria-hidden="true" className="text-destructive">
									*
								</span>
							)}
						</FieldLabel>
						{description && <FieldDescription>{description}</FieldDescription>}
						{multiline ? (
							<Textarea
								{...field.props}
								id={fieldId}
								value={inputValue}
								aria-invalid={field.errors !== null}
								placeholder={placeholder}
								autoComplete={autoComplete}
							/>
						) : (
							<Input
								{...field.props}
								id={fieldId}
								type={type}
								value={inputValue}
								aria-invalid={field.errors !== null}
								placeholder={placeholder}
								inputMode={inputMode}
								autoComplete={autoComplete}
							/>
						)}
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

export { InputField };
