import { Radio } from "lucide-react";
import type { FC } from "react";
import { Link } from "react-router";

import { t } from "~@/i18n/macro";

interface SensorsOnlineProps {
	sensorsOnline: number;
	totalSensors: number;
}

export const SensorsOnline: FC<SensorsOnlineProps> = ({ sensorsOnline, totalSensors }) => {
	return (
		<Link
			to="/monitoring/sensor-health"
			className="flex items-center gap-2 hover:text-foreground transition-colors cursor-pointer"
			title={t`View sensor health details`}
		>
			<Radio className="size-4 text-muted-foreground" />
			<span className="text-muted-foreground hover:text-foreground">
				{t`${sensorsOnline} / ${totalSensors} sensors online`}
			</span>
		</Link>
	);
};
