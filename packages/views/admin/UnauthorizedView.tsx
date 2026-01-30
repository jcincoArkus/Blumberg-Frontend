import { AlertCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router";

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "~@/ui";

export function UnauthorizedView() {
	return (
		<div className="flex items-center justify-center min-h-[60vh]">
			<Card className="max-w-md">
				<CardHeader>
					<div className="flex items-center gap-3 mb-2">
						<AlertCircle className="size-8 text-amber-500" aria-hidden="true" />
						<CardTitle>Access Denied</CardTitle>
					</div>
					<CardDescription>You don't have permission to access this page.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-sm text-muted-foreground">
						This page is restricted to administrators only. Please contact your system administrator
						if you believe this is an error.
					</p>
					<Button asChild variant="outline" className="w-full">
						<Link to="/">
							<ArrowLeft className="size-4 mr-2" aria-hidden="true" />
							Back to Dashboard
						</Link>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
