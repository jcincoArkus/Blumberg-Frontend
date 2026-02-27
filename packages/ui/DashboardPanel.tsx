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
		<Card className={cn("border-border shadow-sm flex flex-col", className)}>
			<CardHeader className="pb-2 flex-shrink-0">
				<div className="flex items-center justify-between">
					<div className={cn("flex-1", !action && "text-center")}>
						<CardTitle className="text-sm font-semibold text-foreground">{title}</CardTitle>
						{description && (
							<CardDescription className="text-xs mt-0.5">{description}</CardDescription>
						)}
					</div>
					{action && <div>{action}</div>}
				</div>
			</CardHeader>
			<CardContent className={cn(noPadding && "p-0", "flex-1 flex flex-col min-h-0")}>
				{children}
			</CardContent>
		</Card>
	);
}
