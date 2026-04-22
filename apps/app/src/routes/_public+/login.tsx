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
import { authViewModel, useLoginViewModel } from "~@/view-model/auth";

import type { Route } from "./+types/login";

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
		if (!email.trim() || !password) {
			toast.error(t`Please enter email and password`);
			return;
		}
		try {
			await loginViewModel.login(email, password);
			navigate("/home", { replace: true });
		} catch {
			const message = loginViewModel.error?.message ?? t`Invalid email or password`;
			toast.error(message);
		}
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
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

export default observer(Login);
