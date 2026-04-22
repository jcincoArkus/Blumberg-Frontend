import { Info, User } from "lucide-react";

import { t } from "~@/i18n/macro";
import { Badge } from "~@/ui";

import type { AlertEvent } from "../types";
import { getEventTypeConfig } from "./constants";
import { formatTimestamp } from "./helpers";

interface EventsHistorySectionProps {
	events: AlertEvent[];
	isLoading: boolean;
}

export function EventsHistorySection({ events, isLoading }: EventsHistorySectionProps) {
	const eventTypeConfig = getEventTypeConfig();

	return (
		<div className="space-y-4">
			<h3 className="text-sm font-semibold text-foreground">{t`Events History`}</h3>
			{isLoading ? (
				<div className="py-4 text-center text-sm text-muted-foreground">{t`Loading…`}</div>
			) : events.length === 0 ? (
				<div className="py-4 text-center text-sm text-muted-foreground">
					{t`No events recorded`}
				</div>
			) : (
				<div className="space-y-4">
					{events.map((event, index) => {
						const eventConfig = eventTypeConfig[event.type];
						const EventIcon = eventConfig?.icon ?? Info;
						const isLast = index === events.length - 1;

						return (
							<div key={event.id} className="relative flex gap-4">
								{!isLast && <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-border" />}
								<div
									className={`relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted ${eventConfig?.color ?? "text-slate-600"}`}
								>
									<EventIcon className="size-3.5" />
								</div>
								<div className="flex-1 space-y-1 pb-4">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<span className="text-sm font-medium text-foreground">
												{eventConfig?.label ?? event.type}
											</span>
											{event.actor && (
												<Badge variant="outline" className="text-xs">
													<User className="size-3 mr-1" />
													{event.actor}
												</Badge>
											)}
										</div>
										<span className="text-xs text-muted-foreground">
											{formatTimestamp(event.timestamp)}
										</span>
									</div>
									<p className="text-sm text-muted-foreground">{event.description}</p>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
