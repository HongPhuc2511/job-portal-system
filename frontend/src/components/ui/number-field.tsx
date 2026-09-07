/* eslint-disable react-refresh/only-export-components */
"use client";

import { NumberField as NumberFieldPrimitive } from "@base-ui/react/number-field";
import { MinusIcon, PlusIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function NumberField({ className, ...props }: NumberFieldPrimitive.Root.Props) {
	return (
		<NumberFieldPrimitive.Root
			data-slot="number-field"
			className={cn("group/number-field", className)}
			{...props}
		/>
	);
}

function NumberFieldGroup({
	className,
	...props
}: NumberFieldPrimitive.Group.Props) {
	return (
		<NumberFieldPrimitive.Group
			data-slot="number-field-group"
			className={cn(
				"flex h-8 w-full overflow-hidden rounded-lg border border-input bg-transparent text-sm transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 group-data-[invalid=true]/field:border-destructive group-data-[invalid=true]/field:ring-3 group-data-[invalid=true]/field:ring-destructive/20 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 dark:disabled:bg-input/80 dark:focus-within:border-ring dark:focus-within:ring-ring/40 dark:group-data-[invalid=true]/field:border-destructive/50 dark:group-data-[invalid=true]/field:ring-destructive/40",
				className,
			)}
			{...props}
		/>
	);
}

function NumberFieldInput({
	className,
	...props
}: NumberFieldPrimitive.Input.Props) {
	return (
		<NumberFieldPrimitive.Input
			data-slot="number-field-input"
			className={cn(
				"h-full w-full min-w-0 flex-1 border-0 bg-transparent px-2.5 py-1 text-base outline-none placeholder:text-muted-foreground tabular-nums disabled:cursor-not-allowed disabled:opacity-50 md:text-sm [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
				className,
			)}
			{...props}
		/>
	);
}

function NumberFieldIncrement({
	className,
	...props
}: NumberFieldPrimitive.Increment.Props) {
	return (
		<NumberFieldPrimitive.Increment
			data-slot="number-field-increment"
			className={cn(
				"flex w-7 shrink-0 items-center justify-center border-l border-input text-muted-foreground outline-none transition-colors select-none hover:bg-muted hover:text-foreground hover:not-data-disabled:bg-muted active:not-data-disabled:bg-muted/70 disabled:pointer-events-none disabled:opacity-50 data-disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3.5",
				className,
			)}
			{...props}
		>
			<PlusIcon />
		</NumberFieldPrimitive.Increment>
	);
}

function NumberFieldDecrement({
	className,
	...props
}: NumberFieldPrimitive.Decrement.Props) {
	return (
		<NumberFieldPrimitive.Decrement
			data-slot="number-field-decrement"
			className={cn(
				"flex w-7 shrink-0 items-center justify-center border-r border-input text-muted-foreground outline-none transition-colors select-none hover:bg-muted hover:text-foreground hover:not-data-disabled:bg-muted active:not-data-disabled:bg-muted/70 disabled:pointer-events-none disabled:opacity-50 data-disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3.5",
				className,
			)}
			{...props}
		>
			<MinusIcon />
		</NumberFieldPrimitive.Decrement>
	);
}

export {
	NumberField,
	NumberFieldDecrement,
	NumberFieldGroup,
	NumberFieldIncrement,
	NumberFieldInput,
};
