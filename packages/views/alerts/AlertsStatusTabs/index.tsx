import { t } from "~@/i18n/macro";
import { Badge, Tabs, TabsList, TabsTrigger } from "~@/ui";

import type { AlertsStatusTabsProps } from "./types";

export type { AlertsStatusTabsProps } from "./types";

export function AlertsStatusTabs({ activeTab, onTabChange, counts }: AlertsStatusTabsProps) {
	return (
		<Tabs
			value={activeTab}
			onValueChange={(value) => onTabChange(value as AlertsStatusTabsProps["activeTab"])}
		>
			<TabsList className="bg-muted/50 p-1">
				<TabsTrigger
					value="all"
					className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
				>
					{t`All`}
					{counts.all > 0 && (
						<Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1.5 text-xs">
							{counts.all}
						</Badge>
					)}
				</TabsTrigger>
				<TabsTrigger
					value="active"
					className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
				>
					{t`Active`}
					{counts.active > 0 && (
						<Badge
							variant="secondary"
							className="ml-2 h-5 min-w-5 px-1.5 text-xs bg-red-100 text-red-700"
						>
							{counts.active}
						</Badge>
					)}
				</TabsTrigger>
				<TabsTrigger
					value="acknowledged"
					className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
				>
					{t`Acknowledged`}
					{counts.acknowledged > 0 && (
						<Badge
							variant="secondary"
							className="ml-2 h-5 min-w-5 px-1.5 text-xs bg-amber-100 text-amber-700"
						>
							{counts.acknowledged}
						</Badge>
					)}
				</TabsTrigger>
				<TabsTrigger
					value="resolved"
					className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
				>
					{t`Resolved`}
					{counts.resolved > 0 && (
						<Badge
							variant="secondary"
							className="ml-2 h-5 min-w-5 px-1.5 text-xs bg-emerald-100 text-emerald-700"
						>
							{counts.resolved}
						</Badge>
					)}
				</TabsTrigger>
			</TabsList>
		</Tabs>
	);
}
