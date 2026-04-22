import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, cn } from "~@/ui";

interface KPICardProps {
	title: string;
	value: number;
	subtitle?: string;
	icon: LucideIcon;
	className: string;
	iconClassName: string;
}

export function KPICard({
	title,
	value,
	subtitle,
	icon: Icon,
	className,
	iconClassName,
}: KPICardProps) {
	return (
		<Card className={cn("border", className)}>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
				<Icon className={cn("h-4 w-4", iconClassName)} />
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold text-foreground">{value}</div>
				{subtitle != null && subtitle !== "" && (
					<p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
				)}
			</CardContent>
		</Card>
	);
}
