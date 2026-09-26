import { cva, type VariantProps } from "class-variance-authority";
import { type ReactNode, useEffect, useState } from "react";

import { t } from "~@/i18n/macro";

import { Spinner } from "./Spinner";
import { cn } from "./utils";

const spinnerSizes = {
	sm: "size-4",
	md: "size-6",
	lg: "size-8",
} as const;

type SpinnerSize = keyof typeof spinnerSizes;

const loadingStateVariants = cva("flex items-center justify-center text-muted-foreground", {
	variants: {
		variant: {
			/** Fills the route content area (whole-page initial loads). */
			page: "min-h-[60vh] w-full flex-col gap-3 text-center",
			/** For panels, cards, drawers and tabs. */
			section: "min-h-48 w-full flex-col gap-2 p-6 text-center",
			/** Compact row for small lists and inline regions. */
			inline: "gap-2 py-4 text-sm",
		},
	},
	defaultVariants: {
		variant: "section",
	},
});

const defaultSpinnerSize: Record<NonNullable<LoadingStateProps["variant"]>, SpinnerSize> = {
	page: "lg",
	section: "md",
	inline: "sm",
};

export interface LoadingStateProps
	extends Omit<React.ComponentProps<"div">, "children">,
		VariantProps<typeof loadingStateVariants> {
	/** Visible label under/next to the spinner. Defaults to "Loading…". Pass `null` to hide it. */
	label?: ReactNode | null;
	/** Secondary hint, e.g. "The server may take a moment to wake up". Ignored for `inline`. */
	sublabel?: ReactNode;
	/** Spinner size; defaults to lg (page), md (section), sm (inline). */
	size?: SpinnerSize;
}

/**
 * Standard loading placeholder: a centered spinner with an optional label.
 * Announces itself to screen readers via `role="status"`.
 */
function LoadingState({
	variant = "section",
	label,
	sublabel,
	size,
	className,
	...props
}: LoadingStateProps) {
	const resolvedVariant = variant ?? "section";
	const text = label === undefined ? t`Loading…` : label;
	const srText = typeof text === "string" && text ? text : t`Loading…`;

	return (
		<div
			data-slot="loading-state"
			role="status"
			aria-live="polite"
			aria-busy="true"
			className={cn(loadingStateVariants({ variant: resolvedVariant }), className)}
			{...props}
		>
			<Spinner
				aria-hidden="true"
				role={undefined}
				aria-label={undefined}
				className={cn(
					spinnerSizes[size ?? defaultSpinnerSize[resolvedVariant]],
					"shrink-0 text-primary",
				)}
			/>
			{text ? (
				<span
					aria-hidden="true"
					className={cn(resolvedVariant === "page" ? "text-sm font-medium" : "text-sm")}
				>
					{text}
				</span>
			) : null}
			{sublabel && resolvedVariant !== "inline" ? (
				<span aria-hidden="true" className="max-w-sm text-xs text-muted-foreground/80">
					{sublabel}
				</span>
			) : null}
			<span className="sr-only">{srText}</span>
		</div>
	);
}

export interface SpinnerOverlayProps extends React.ComponentProps<"div"> {
	size?: SpinnerSize;
	/** Screen-reader text. Defaults to "Loading…". */
	label?: string;
}

/**
 * Translucent overlay with a centered spinner, for refetching over content that is already on screen.
 * The parent must be `relative`.
 */
function SpinnerOverlay({ size = "lg", label, className, ...props }: SpinnerOverlayProps) {
	return (
		<div
			data-slot="spinner-overlay"
			role="status"
			aria-live="polite"
			aria-busy="true"
			className={cn(
				"absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[1px]",
				className,
			)}
			{...props}
		>
			<Spinner
				aria-hidden="true"
				role={undefined}
				aria-label={undefined}
				className={cn(spinnerSizes[size], "text-primary")}
			/>
			<span className="sr-only">{label ?? t`Loading…`}</span>
		</div>
	);
}

export interface TopProgressBarProps {
	/** Whether a navigation / background task is in progress. */
	active: boolean;
	/** Delay (ms) before showing, so near-instant transitions don't flash. */
	delay?: number;
	className?: string;
}

/**
 * Slim indeterminate progress bar pinned to the top of the viewport (NProgress-style),
 * used for route transitions.
 */
function TopProgressBar({ active, delay = 150, className }: TopProgressBarProps) {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		if (!active) {
			setVisible(false);
			return;
		}
		const id = window.setTimeout(() => setVisible(true), delay);
		return () => window.clearTimeout(id);
	}, [active, delay]);

	if (!visible) return null;

	return (
		<div
			data-slot="top-progress-bar"
			role="progressbar"
			aria-label={t`Loading page`}
			aria-busy="true"
			className={cn(
				"pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden bg-primary/15",
				className,
			)}
		>
			<div className="animate-progress-indeterminate h-full w-1/3 rounded-full bg-primary" />
		</div>
	);
}

export { LoadingState, SpinnerOverlay, TopProgressBar, loadingStateVariants };
