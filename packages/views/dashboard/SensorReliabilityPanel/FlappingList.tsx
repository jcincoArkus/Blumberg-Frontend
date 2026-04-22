import { Activity, ChevronDown, ChevronRight } from "lucide-react";
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
			<CollapsibleTrigger className="w-full flex items-center justify-between py-1.5 px-1 rounded hover:bg-muted/50 transition-colors text-left">
				<div className="flex items-center gap-1.5">
					<Activity className="size-3.5 text-purple-600 shrink-0" aria-hidden />
					<p className="text-xs font-medium text-purple-600">
						{t`Unstable`} ({flappingSensors.length})
					</p>
				</div>
				{isOpen ? (
					<ChevronDown className="size-3 text-muted-foreground shrink-0" />
				) : (
					<ChevronRight className="size-3 text-muted-foreground shrink-0" />
				)}
			</CollapsibleTrigger>
			<CollapsibleContent>
				<div className="space-y-0.5 pt-1">
					{flappingSensors.slice(0, 5).map((sensor) => (
						<Link
							key={sensor.id}
							to={`/config/sensors?sensor=${sensor.id}`}
							className="block py-2 px-2 rounded-md text-xs border border-purple-100 bg-white dark:bg-card hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-colors"
						>
							<p className="font-medium text-foreground truncate">{sensor.name}</p>
						</Link>
					))}
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
};
