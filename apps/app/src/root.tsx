import { Compass, Home, TriangleAlert } from "lucide-react";
import { useLayoutEffect } from "react";
import {
	isRouteErrorResponse,
	Link,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "react-router";

import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { buttonVariants, Toaster } from "~@/ui";
import { THEME_INIT_SCRIPT, themeViewModel } from "~@/view-model/theme";

import "./app.css";

import type { Route } from "./+types/root";

export const links: Route.LinksFunction = () => [
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
	},
];

export function Layout({ children }: { children: React.ReactNode }) {
	// React resets <html> attributes when it takes over the document; restore the theme before first paint
	useLayoutEffect(() => themeViewModel.syncDocument(), []);

	return (
		// The inline theme script mutates <html> class/style before React hydrates, hence suppressHydrationWarning
		<html lang="en" suppressHydrationWarning>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				{/* Render-blocking on purpose: applies the saved theme before first paint (no light flash in dark mode) */}
				{/* biome-ignore lint/security/noDangerouslySetInnerHtml: static, first-party theme boot script */}
				<script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
				<Meta />
				<Links />
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

// Toaster lives in the root route component: in SPA mode the Layout body is not re-rendered on the client,
// so a Toaster placed there never mounts and toasts are silently dropped.
export default observer(function App() {
	return (
		<>
			<Outlet />
			<Toaster richColors closeButton position="top-right" theme={themeViewModel.resolvedTheme} />
		</>
	);
});

export function HydrateFallback() {
	return null;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	const isNotFound = isRouteErrorResponse(error) && error.status === 404;
	let title = t`Something went wrong`;
	let details = t`An unexpected error occurred. Please try again, or head back to the dashboard.`;
	let code: string | null = null;
	let stack: string | undefined;

	if (isNotFound) {
		code = "404";
		title = t`Page not found`;
		details = t`The page you're looking for doesn't exist or may have been moved.`;
	} else if (isRouteErrorResponse(error)) {
		code = String(error.status);
		details = error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main className="flex min-h-screen items-center justify-center bg-background p-4">
			<div className="w-full max-w-md text-center">
				<div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-full bg-muted">
					{isNotFound ? (
						<Compass className="size-7 text-muted-foreground" aria-hidden />
					) : (
						<TriangleAlert className="size-7 text-amber-600 dark:text-warning" aria-hidden />
					)}
				</div>
				{code && (
					<p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
						{t`Error ${code}`}
					</p>
				)}
				<h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
				<p className="mt-2 text-sm text-muted-foreground">{details}</p>
				<div className="mt-6 flex flex-wrap items-center justify-center gap-3">
					<Link to="/home" className={buttonVariants({})}>
						<Home className="size-4" aria-hidden /> {t`Back to dashboard`}
					</Link>
					{!isNotFound && (
						<button
							type="button"
							className={buttonVariants({ variant: "outline" })}
							onClick={() => window.location.reload()}
						>
							{t`Reload page`}
						</button>
					)}
				</div>
				{stack && (
					<pre className="mt-8 w-full overflow-x-auto rounded-md bg-muted p-4 text-left text-xs">
						<code>{stack}</code>
					</pre>
				)}
			</div>
		</main>
	);
}
