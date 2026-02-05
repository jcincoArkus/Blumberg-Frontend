import { ChevronDown, ChevronRight, TrendingUp } from "lucide-react";
import type { FC } from "react";
import { Link } from "react-router";

import { t } from "~@/i18n/macro";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~@/ui";

import type { Sensor } from "./types";

interface FlappingListProps {
	flappingSensors: Sensor[];
	isOpen: boolean;
	onToggle: (open: boolean) => void;
}

export const FlappingList: FC<FlappingListProps> = ({ flappingSensors, isOpen, onToggle }) => {
	if (flappingSensors.length === 0) return null;

	return (
		<Collapsible open={isOpen} onOpenChange={onToggle}>
			<CollapsibleTrigger className="w-full flex items-center justify-between p-1 rounded hover:bg-muted/50 transition-colors">
				<div className="flex items-center gap-1.5">
					<TrendingUp className="size-3 text-orange-600" />
					<p className="text-xs font-medium text-orange-700">
						{t`Flapping`} ({flappingSensors.length})
					</p>
				</div>
				{isOpen ? (
					<ChevronDown className="size-3 text-muted-foreground" />
				) : (
					<ChevronRight className="size-3 text-muted-foreground" />
				)}
			</CollapsibleTrigger>
			<CollapsibleContent>
				<div className="space-y-0.5 pt-1">
					{flappingSensors.slice(0, 3).map((sensor) => (
						<Link
							key={sensor.id}
							to={`/config/sensors?sensor=${sensor.id}`}
							className="block p-1 rounded text-xs border border-orange-200 bg-orange-50/30 hover:bg-orange-100/50 transition-colors"
						>
							<p className="font-medium truncate">{sensor.name}</p>
						</Link>
					))}
					{flappingSensors.length > 3 && (
						<Link
							to="/monitoring/sensor-health"
							className="block text-center text-xs text-primary hover:underline pt-0.5"
						>
							{t`View all →`}
						</Link>
					)}
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
};
