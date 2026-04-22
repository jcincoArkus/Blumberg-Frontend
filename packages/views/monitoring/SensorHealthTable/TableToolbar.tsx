import { Filter, Search } from "lucide-react";

import { t } from "~@/i18n/macro";
import {
	Badge,
	Button,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~@/ui";

import type { QualityWindow } from "../types";

interface TableToolbarProps {
	searchQuery: string;
	onSearchChange: (query: string) => void;
	timeWindow: QualityWindow;
	onTimeWindowChange: (window: QualityWindow) => void;
	onToggleFilters: () => void;
	activeFiltersCount: number;
}

export function TableToolbar({
	searchQuery,
	onSearchChange,
	timeWindow,
	onTimeWindowChange,
	onToggleFilters,
	activeFiltersCount,
}: TableToolbarProps) {
	return (
		<div className="flex flex-col sm:flex-row gap-3">
			<div className="relative flex-1">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
				<Input
					placeholder={t`Search by sensor ID, name, site, equipment, or type...`}
					value={searchQuery}
					onChange={(e) => onSearchChange(e.target.value)}
					className="pl-9"
				/>
			</div>
			<div className="flex gap-2">
				<Select
					value={timeWindow}
					onValueChange={(value) => onTimeWindowChange(value as QualityWindow)}
				>
					<SelectTrigger className="w-35">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="1h">{t`Last 1h`}</SelectItem>
						<SelectItem value="24h">{t`Last 24h`}</SelectItem>
						<SelectItem value="7d">{t`Last 7d`}</SelectItem>
					</SelectContent>
				</Select>
				<Button variant="outline" onClick={onToggleFilters} className="sm:w-auto">
					<Filter className="size-4 mr-2" />
					{t`Filters`}
					{activeFiltersCount > 0 && (
						<Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1.5 text-xs">
							{activeFiltersCount}
						</Badge>
					)}
				</Button>
			</div>
		</div>
	);
}
