import { Check, CheckCircle2, List, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";

import { t } from "~@/i18n/macro";
import {
	Button,
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	Separator,
} from "~@/ui";

import { AlertSummarySection } from "./AlertSummarySection";
import { EventsHistorySection } from "./EventsHistorySection";
import { NotificationsAuditSection } from "./NotificationsAuditSection";
import { RecommendedActionsSection } from "./RecommendedActionsSection";
import type { AlertDetailsDrawerProps } from "./types";

export type { AlertDetailsDrawerProps } from "./types";

export function AlertDetailsDrawer({
	alert,
	open,
	onOpenChange,
	onAlertUpdate,
	equipmentName = t`Unknown Equipment`,
	sensorName = t`Unknown Sensor`,
	siteName,
	siteLocation,
	isDetailLoading = false,
}: AlertDetailsDrawerProps) {
	const [currentAlert, setCurrentAlert] = useState(alert);

	useEffect(() => {
		setCurrentAlert(alert);
	}, [alert]);

	const events = currentAlert.events ?? [];
	const notifications = currentAlert.notifications ?? [];
	const recommendedActions = currentAlert.recommendedActions ?? [];

	const handleUpdate = (action: "acknowledge" | "resolve") => {
		onAlertUpdate?.(currentAlert.id, action);
	};

	return (
		<Drawer open={open} onOpenChange={onOpenChange} direction="right">
			<DrawerContent className="h-full w-full sm:max-w-2xl">
				<DrawerHeader className="border-b space-y-4">
					<div className="flex items-start justify-between gap-4">
						<DrawerTitle className="text-xl font-semibold shrink-0">{t`Alert Details`}</DrawerTitle>
						<DrawerClose asChild>
							<Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0">
								<X className="h-4 w-4" />
							</Button>
						</DrawerClose>
					</div>
					<DrawerDescription className="text-sm text-muted-foreground">
						{t`Complete information and event history for this alert`}
					</DrawerDescription>
					<div className="flex flex-wrap items-center gap-2">
						<Link to="/alerts">
							<Button
								variant="outline"
								size="sm"
								className="h-8"
								onClick={() => onOpenChange(false)}
							>
								<List className="h-4 w-4 mr-1.5" />
								{t`View All`}
							</Button>
						</Link>
						{currentAlert.status === "active" && onAlertUpdate && (
							<>
								<Button
									variant="outline"
									size="sm"
									onClick={() => handleUpdate("acknowledge")}
									className="h-8"
								>
									<Check className="h-4 w-4 mr-1.5" />
									{t`Acknowledge`}
								</Button>
								<Button
									variant="default"
									size="sm"
									onClick={() => handleUpdate("resolve")}
									className="h-8"
								>
									<CheckCircle2 className="h-4 w-4 mr-1.5" />
									{t`Resolve`}
								</Button>
							</>
						)}
						{currentAlert.status === "acknowledged" && onAlertUpdate && (
							<Button
								variant="default"
								size="sm"
								onClick={() => handleUpdate("resolve")}
								className="h-8"
							>
								<CheckCircle2 className="h-4 w-4 mr-1.5" />
								{t`Resolve`}
							</Button>
						)}
					</div>
				</DrawerHeader>

				<div className="flex-1 overflow-y-auto p-6 space-y-6">
					<AlertSummarySection
						alert={currentAlert}
						equipmentName={equipmentName}
						sensorName={sensorName}
						siteName={siteName}
						siteLocation={siteLocation}
					/>
					{recommendedActions.length > 0 && (
						<>
							<Separator />
							<RecommendedActionsSection actions={recommendedActions} />
						</>
					)}
					<Separator />
					<EventsHistorySection events={events} isLoading={isDetailLoading} />
					<Separator />
					<NotificationsAuditSection notifications={notifications} />
				</div>
			</DrawerContent>
		</Drawer>
	);
}
