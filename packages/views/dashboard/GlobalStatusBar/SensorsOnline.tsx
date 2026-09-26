import { Radio } from "lucide-react";
import type { FC } from "react";
import { Link } from "react-router";

import { t } from "~@/i18n/macro";
import { Spinner } from "~@/ui";

interface SensorsOnlineProps {
	sensorsOnline: number;
	totalSensors: number;
	isLoading?: boolean;
}

export const SensorsOnline: FC<SensorsOnlineProps> = ({
	sensorsOnline,
	totalSensors,
	isLoading = false,
}) => {
	return (
		<Link
			to="/monitoring/sensor-health"
			className="flex items-center gap-2 hover:text-foreground transition-colors cursor-pointer"
			title={t`View sensor health details`}
		>
			{isLoading ? (
				<Spinner aria-hidden="true" className="text-primary" />
			) : (
				<Radio className="size-4 text-muted-foreground" />
			)}
			<span className="text-muted-foreground hover:text-foreground">
				{isLoading
					? t`Loading sensor status…`
					: t`${sensorsOnline} / ${totalSensors} sensors online`}
			</span>
		</Link>
	);
};
