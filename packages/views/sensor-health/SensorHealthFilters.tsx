import { RotateCcw } from "lucide-react";

import { t } from "~@/i18n/macro";
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~@/ui";

interface Site {
	id: string;
	name: string;
}

interface SensorHealthFiltersProps {
	statusFilter: string;
	setStatusFilter: (value: string) => void;
	siteFilter: string;
	setSiteFilter: (value: string) => void;
	typeFilter: string;
	setTypeFilter: (value: string) => void;
	sites: Site[];
	sensorTypes: string[];
}

export function SensorHealthFilters({
	statusFilter,
	setStatusFilter,
	siteFilter,
	setSiteFilter,
	typeFilter,
	setTypeFilter,
	sites,
	sensorTypes,
}: SensorHealthFiltersProps) {
	const resetFilters = () => {
		setStatusFilter("all");
		setSiteFilter("all");
		setTypeFilter("all");
	};

	return (
		<div className="flex flex-wrap items-center gap-4" role="group" aria-label={t`Sensor filters`}>
			<div className="flex items-center gap-2">
				<label htmlFor="status-filter" className="text-sm font-medium text-muted-foreground">
					{t`Status:`}
				</label>
				<Select value={statusFilter} onValueChange={setStatusFilter}>
					<SelectTrigger id="status-filter" className="w-35">
						<SelectValue placeholder={t`All Status`} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">{t`All Status`}</SelectItem>
						<SelectItem value="healthy">{t`Healthy`}</SelectItem>
						<SelectItem value="stale">{t`Stale`}</SelectItem>
						<SelectItem value="offline">{t`Offline`}</SelectItem>
						<SelectItem value="warning">{t`Warning`}</SelectItem>
						<SelectItem value="critical">{t`Critical`}</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="flex items-center gap-2">
				<label htmlFor="site-filter" className="text-sm font-medium text-muted-foreground">
					{t`Site:`}
				</label>
				<Select value={siteFilter} onValueChange={setSiteFilter}>
					<SelectTrigger id="site-filter" className="w-45">
						<SelectValue placeholder={t`All Sites`} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">{t`All Sites`}</SelectItem>
						{sites.map((site) => (
							<SelectItem key={site.id} value={site.id}>
								{site.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="flex items-center gap-2">
				<label htmlFor="type-filter" className="text-sm font-medium text-muted-foreground">
					{t`Type:`}
				</label>
				<Select value={typeFilter} onValueChange={setTypeFilter}>
					<SelectTrigger id="type-filter" className="w-40">
						<SelectValue placeholder={t`All Types`} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">{t`All Types`}</SelectItem>
						{sensorTypes.map((type) => (
							<SelectItem key={type} value={type}>
								{type.charAt(0).toUpperCase() + type.slice(1)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<Button variant="outline" size="sm" onClick={resetFilters}>
				<RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
				{t`Reset Filters`}
			</Button>
		</div>
	);
}
