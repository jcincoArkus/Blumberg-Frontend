import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { Trans, t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import {
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Input,
	Label,
} from "~@/ui";
import { authViewModel, useLoginViewModel } from "~@/view-model";

import type { Route } from "./+types/login";

const DEMO_CREDENTIALS = [
	{ role: "Admin", email: "john.admin@blumberg.com", password: "admin" },
	{ role: "Operator", email: "sarah.operator@blumberg.com", password: "operator" },
	{ role: "Viewer", email: "mike.viewer@blumberg.com", password: "viewer" },
] as const;

function validateDemoCredentials(email: string, password: string): boolean {
	return DEMO_CREDENTIALS.some(
		(c) => c.email.toLowerCase() === email.toLowerCase().trim() && c.password === password,
	);
}

export async function clientLoader() {
	return { isAuthenticated: authViewModel.isAuthenticated };
}

function Login({ loaderData }: Route.ComponentProps) {
	const navigate = useNavigate();
	const loginViewModel = useLoginViewModel();
	const { isAuthenticated } = loaderData;
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	useEffect(() => {
		if (isAuthenticated) {
			navigate("/home", { replace: true });
		}
	}, [isAuthenticated, navigate]);

	useEffect(() => {
		loginViewModel.reset();
	}, [email, password]);

	if (isAuthenticated) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background">
				<p className="text-muted-foreground">{t`Redirecting...`}</p>
			</div>
		);
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const trimmedEmail = email.trim();
		if (!trimmedEmail || !password) {
			toast.error(t`Please enter email and password`);
			return;
		}
		try {
			await loginViewModel.login(trimmedEmail, password);
			navigate("/home", { replace: true });
		} catch {
			// Fallback to demo credentials when API is unavailable (e.g. no backend)
			if (validateDemoCredentials(trimmedEmail, password)) {
				authViewModel.setAuthenticatedSession({
					accessToken: `demo-${trimmedEmail}`,
					refreshToken: "demo-refresh",
				});
				navigate("/home", { replace: true });
			} else {
				const message =
					loginViewModel.error?.message ??
					t`Invalid email or password. Use one of the demo credentials below.`;
				toast.error(message);
			}
		}
	};

	const fillDemo = (cred: (typeof DEMO_CREDENTIALS)[number]) => {
		setEmail(cred.email);
		setPassword(cred.password);
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-background p-4">
			<div className="w-full max-w-md space-y-6">
				<Card className="border-border">
					<CardHeader className="space-y-1 text-center">
						<CardTitle className="text-2xl font-semibold text-foreground">
							<Trans>Sign in</Trans>
						</CardTitle>
						<CardDescription className="text-muted-foreground">
							<Trans>Enter your email and password to access the app</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="email">
									<Trans>Email</Trans>
								</Label>
								<Input
									id="email"
									type="email"
									placeholder="name@example.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									autoComplete="email"
									className="border-input bg-transparent"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="password">
									<Trans>Password</Trans>
								</Label>
								<Input
									id="password"
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									autoComplete="current-password"
									className="border-input bg-transparent"
								/>
							</div>
							<Button
								type="submit"
								className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
								disabled={loginViewModel.isPending}
							>
								{loginViewModel.isPending ? t`Signing in...` : t`Sign in`}
							</Button>
						</form>

						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<span className="w-full border-t border-border" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-card px-2 text-muted-foreground">
									<Trans>Demo credentials (for testing)</Trans>
								</span>
							</div>
						</div>

						<div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
							<p className="text-sm font-medium text-foreground">
								<Trans>Use any of these accounts to sign in:</Trans>
							</p>
							<ul className="space-y-1.5 text-sm text-muted-foreground">
								{DEMO_CREDENTIALS.map((cred) => (
									<li key={cred.email} className="flex flex-wrap items-center gap-2">
										<span className="font-medium text-foreground">{cred.role}:</span>
										<code className="rounded bg-muted px-1.5 py-0.5 text-xs">{cred.email}</code>
										<span>/</span>
										<code className="rounded bg-muted px-1.5 py-0.5 text-xs">{cred.password}</code>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											className="h-6 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10"
											onClick={() => fillDemo(cred)}
										>
											<Trans>Fill</Trans>
										</Button>
									</li>
								))}
							</ul>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

export default observer(Login);
