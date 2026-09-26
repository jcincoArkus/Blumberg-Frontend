import type { LucideIcon } from "lucide-react";

import { t } from "~@/i18n/macro";
import { Card, CardContent, CardHeader, CardTitle, cn, Spinner } from "~@/ui";

interface KPICardProps {
	title: string;
	value: number;
	subtitle?: string;
	icon: LucideIcon;
	className: string;
	iconClassName: string;
	/** First load in flight: show a spinner instead of a misleading 0. */
	isLoading?: boolean;
}

export function KPICard({
	title,
	value,
	subtitle,
	icon: Icon,
	className,
	iconClassName,
	isLoading = false,
}: KPICardProps) {
	return (
		<Card className={cn("border", className)}>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
				<Icon className={cn("h-4 w-4", iconClassName)} />
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<div className="flex h-8 items-center">
						<Spinner aria-label={t`Loading…`} className="size-5 text-primary" />
					</div>
				) : (
					<div className="text-2xl font-bold text-foreground">{value}</div>
				)}
				{!isLoading && subtitle != null && subtitle !== "" && (
					<p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
				)}
			</CardContent>
		</Card>
	);
}
