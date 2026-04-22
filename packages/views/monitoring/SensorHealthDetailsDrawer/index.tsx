import { X } from "lucide-react";

import { t } from "~@/i18n/macro";
import {
	Badge,
	Button,
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	Separator,
} from "~@/ui";

import { DataQualitySection } from "./DataQualitySection";
import { formatFreshnessSeconds } from "./helpers";
import { IngestionErrorsSection } from "./IngestionErrorsSection";
import { SensorHealthSection } from "./SensorHealthSection";
import type { SensorHealthDetailsDrawerProps } from "./types";

export type { SensorHealthDetailsDrawerProps } from "./types";

export function SensorHealthDetailsDrawer({
	data,
	detail,
	detailLoading = false,
	ingestionErrorCount = null,
	open,
	onOpenChange,
	timeWindow,
	onTimeWindowChange,
}: SensorHealthDetailsDrawerProps) {
	const ageFormatted =
		detail?.freshnessSeconds != null && detail.freshnessSeconds >= 0
			? formatFreshnessSeconds(detail.freshnessSeconds)
			: !data.health?.lastReportedAt
				? t`N/A`
				: (() => {
						const now = Date.now();
						const lastReported = new Date(data.health.lastReportedAt).getTime();
						const ageMinutes = Math.floor((now - lastReported) / (60 * 1000));
						if (ageMinutes < 60) return `${ageMinutes}m`;
						if (ageMinutes < 1440) return `${Math.floor(ageMinutes / 60)}h ${ageMinutes % 60}m`;
						return `${Math.floor(ageMinutes / 1440)}d`;
					})();

	return (
		<Drawer open={open} onOpenChange={onOpenChange} direction="right">
			<DrawerContent className="h-full w-full sm:max-w-2xl">
				<DrawerHeader className="border-b">
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<DrawerTitle className="text-xl font-semibold mb-2">
								{t`Sensor Health & Quality Diagnostics`}
							</DrawerTitle>
							<DrawerDescription>
								{data.sensor.name} ({data.sensor.id})
							</DrawerDescription>
						</div>
						<DrawerClose asChild>
							<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
								<X className="h-4 w-4" />
								<span className="sr-only">{t`Close`}</span>
							</Button>
						</DrawerClose>
					</div>
				</DrawerHeader>

				<div className="flex-1 overflow-y-auto p-6 space-y-6">
					<div className="space-y-2">
						<div className="flex items-center gap-2 flex-wrap">
							<Badge variant="outline" className="capitalize">
								{data.sensor.type}
							</Badge>
							<span className="text-sm text-muted-foreground">•</span>
							<span className="text-sm text-muted-foreground">
								{data.sensor.siteName || t`Unknown Site`}
							</span>
							{data.sensor.equipmentName && (
								<>
									<span className="text-sm text-muted-foreground">•</span>
									<span className="text-sm text-muted-foreground">{data.sensor.equipmentName}</span>
								</>
							)}
						</div>
					</div>

					<Separator />

					<SensorHealthSection data={data} ageFormatted={ageFormatted} />

					<Separator />

					<DataQualitySection
						data={data}
						detail={detail}
						detailLoading={detailLoading}
						timeWindow={timeWindow}
						onTimeWindowChange={onTimeWindowChange}
					/>

					<Separator />

					<IngestionErrorsSection data={data} ingestionErrorCount={ingestionErrorCount} />
				</div>
			</DrawerContent>
		</Drawer>
	);
}
