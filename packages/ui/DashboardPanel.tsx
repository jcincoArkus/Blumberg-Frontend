import { Card, CardContent, CardDescription, CardHeader, CardTitle, cn } from "~@/ui";

interface DashboardPanelProps {
	title: string;
	description?: string;
	children: React.ReactNode;
	className?: string;
	action?: React.ReactNode;
	noPadding?: boolean;
}

export function DashboardPanel({
	title,
	description,
	children,
	className,
	action,
	noPadding = false,
}: DashboardPanelProps) {
	return (
		<Card className={cn("border-border shadow-sm", className)}>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="text-sm font-semibold text-foreground">{title}</CardTitle>
						{description && (
							<CardDescription className="text-xs mt-0.5">{description}</CardDescription>
						)}
					</div>
					{action && <div>{action}</div>}
				</div>
			</CardHeader>
			<CardContent className={cn(noPadding && "p-0")}>{children}</CardContent>
		</Card>
	);
}
