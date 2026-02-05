import type { FC } from "react";
import { Link } from "react-router";

import { cn } from "~@/ui";

import { getStatusColor } from "./helpers";
import type { Site } from "./types";

interface SiteTileProps {
	site: Site;
}

export const SiteTile: FC<SiteTileProps> = ({ site }) => {
	return (
		<Link
			to={`/site/${site.id}`}
			className="flex items-center gap-1.5 p-1.5 rounded-lg border hover:bg-muted/50 transition-colors"
		>
			<div className={cn("size-2 rounded-full flex-shrink-0", getStatusColor(site.status))} />
			<div className="flex-1 min-w-0">
				<p className="text-xs font-medium truncate">{site.name}</p>
				<p className="text-[11px] text-muted-foreground truncate">{site.location}</p>
			</div>
		</Link>
	);
};
