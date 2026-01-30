import {
	Activity,
	AlertCircle,
	AlertTriangle,
	Check,
	CheckCircle2,
	Clock,
	Info,
	List,
	Mail,
	Server,
	User,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";

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

import type { Alert, AlertEvent, AlertNotification } from "./types";

interface AlertDetailsDrawerProps {
	alert: Alert;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onAlertUpdate?: (alertId: string, action: "acknowledge" | "resolve") => void;
	equipmentName?: string;
	sensorName?: string;
	siteName?: string;
	siteLocation?: string;
}

const getSeverityConfig = () => ({
	critical: {
		icon: AlertCircle,
		label: t`Critical`,
		className: "bg-red-100 text-red-700 border-red-300",
		dot: "bg-red-600",
	},
	high: {
		icon: AlertTriangle,
		label: t`Alert`,
		className: "bg-orange-100 text-orange-700 border-orange-300",
		dot: "bg-orange-600",
	},
	medium: {
		icon: AlertTriangle,
		label: t`Warning`,
		className: "bg-amber-100 text-amber-700 border-amber-300",
		dot: "bg-amber-600",
	},
	low: {
		icon: Info,
		label: t`Warning`,
		className: "bg-blue-100 text-blue-700 border-blue-300",
		dot: "bg-blue-600",
	},
});

const getEventTypeConfig = () => ({
	triggered: { icon: Activity, label: t`Triggered`, color: "text-red-600" },
	escalated: { icon: AlertTriangle, label: t`Escalated`, color: "text-orange-600" },
	acknowledged: { icon: CheckCircle2, label: t`Acknowledged`, color: "text-amber-600" },
	resolved: { icon: CheckCircle2, label: t`Resolved`, color: "text-emerald-600" },
	note: { icon: Info, label: t`Note`, color: "text-blue-600" },
	system_update: { icon: Server, label: t`System Update`, color: "text-slate-600" },
});

const getNotificationReasonLabels = (): Record<string, string> => ({
	escalation_rule: t`Escalation Rule`,
	severity_threshold: t`Severity Threshold`,
	on_call_rotation: t`On-Call Rotation`,
	manual_notify: t`Manual Notification`,
	system_alert: t`System Alert`,
});

function formatTimestamp(dateString: string) {
	const date = new Date(dateString);
	return date.toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function formatTimeOnly(dateString: string) {
	const date = new Date(dateString);
	return date.toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
	});
}

function calculateDuration(createdAt: string, resolvedAt?: string): string {
	const start = new Date(createdAt);
	const end = resolvedAt ? new Date(resolvedAt) : new Date();
	const diffMs = end.getTime() - start.getTime();
	const diffMins = Math.floor(diffMs / 60000);
	const diffHours = Math.floor(diffMins / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffDays > 0) return `${diffDays}d ${diffHours % 24}h`;
	if (diffHours > 0) return `${diffHours}h ${diffMins % 60}m`;
	return `${diffMins}m`;
}

export function AlertDetailsDrawer({
	alert,
	open,
	onOpenChange,
	onAlertUpdate,
	equipmentName = t`Unknown Equipment`,
	sensorName = t`Unknown Sensor`,
	siteName,
	siteLocation,
}: AlertDetailsDrawerProps) {
	const [currentAlert, setCurrentAlert] = useState(alert);

	useEffect(() => {
		setCurrentAlert(alert);
	}, [alert]);

	const severityConfig = getSeverityConfig();
	const severityInfo = severityConfig[currentAlert.severity];
	const SeverityIcon = severityInfo.icon;
	const duration = calculateDuration(currentAlert.createdAt, currentAlert.resolvedAt);
	const events: AlertEvent[] = currentAlert.events || [];
	const notifications: AlertNotification[] = currentAlert.notifications || [];
	const eventTypeConfig = getEventTypeConfig();
	const notificationReasonLabels = getNotificationReasonLabels();

	const handleUpdate = (action: "acknowledge" | "resolve") => {
		onAlertUpdate?.(currentAlert.id, action);
	};

	return (
		<Drawer open={open} onOpenChange={onOpenChange} direction="right">
			<DrawerContent className="h-full w-full sm:max-w-2xl">
				<DrawerHeader className="border-b">
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<DrawerTitle className="text-xl font-semibold mb-2">{t`Alert Details`}</DrawerTitle>
							<DrawerDescription>
								{t`Complete information and event history for this alert`}
							</DrawerDescription>
						</div>
						<div className="flex items-center gap-2">
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
							<DrawerClose asChild>
								<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
									<X className="h-4 w-4" />
								</Button>
							</DrawerClose>
						</div>
					</div>
				</DrawerHeader>

				<div className="flex-1 overflow-y-auto p-6 space-y-6">
					{/* Alert Summary */}
					<div className="space-y-4">
						<h3 className="text-sm font-semibold text-foreground">{t`Alert Summary`}</h3>
						<div className="space-y-3">
							<div className="flex items-center gap-3">
								<Badge
									variant="outline"
									className={`${severityInfo.className} border-2 font-semibold`}
								>
									<span className={`size-2 rounded-full ${severityInfo.dot} mr-1.5`} />
									<SeverityIcon className="mr-1 h-3 w-3" />
									{severityInfo.label}
								</Badge>
								<Badge
									variant="outline"
									className={
										currentAlert.status === "active"
											? "bg-red-100 text-red-700 border-red-200"
											: currentAlert.status === "acknowledged"
												? "bg-amber-100 text-amber-700 border-amber-200"
												: "bg-emerald-100 text-emerald-700 border-emerald-200"
									}
								>
									{currentAlert.status}
								</Badge>
							</div>

							<div>
								<h4 className="font-semibold text-foreground mb-1">{currentAlert.name}</h4>
								<p className="text-sm text-muted-foreground">{currentAlert.description}</p>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-xs text-muted-foreground mb-1">{t`Equipment`}</p>
									<Link
										to={`/equipment/${currentAlert.equipmentId}`}
										className="text-sm font-medium text-primary hover:underline"
									>
										{equipmentName}
									</Link>
								</div>
								<div>
									<p className="text-xs text-muted-foreground mb-1">{t`Sensor`}</p>
									<p className="text-sm font-medium text-foreground">{sensorName}</p>
								</div>
							</div>

							{siteName && (
								<div>
									<p className="text-xs text-muted-foreground mb-1">{t`Site`}</p>
									<Link
										to={`/site/${currentAlert.siteId}`}
										className="text-sm font-medium text-primary hover:underline"
									>
										{siteName}
									</Link>
									{siteLocation && <p className="text-xs text-muted-foreground">{siteLocation}</p>}
								</div>
							)}

							<div className="grid grid-cols-2 gap-4 pt-2 border-t">
								<div>
									<p className="text-xs text-muted-foreground mb-1">{t`Created`}</p>
									<div className="flex items-center gap-1.5 text-sm">
										<Clock className="size-3.5 text-muted-foreground" />
										<span>{formatTimestamp(currentAlert.createdAt)}</span>
									</div>
								</div>
								<div>
									<p className="text-xs text-muted-foreground mb-1">{t`Duration`}</p>
									<div className="flex items-center gap-1.5 text-sm font-medium">
										<Clock className="size-3.5 text-muted-foreground" />
										<span>{duration}</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					<Separator />

					{/* Events History */}
					<div className="space-y-4">
						<h3 className="text-sm font-semibold text-foreground">{t`Events History`}</h3>
						{events.length === 0 ? (
							<div className="py-4 text-center text-sm text-muted-foreground">
								{t`No events recorded`}
							</div>
						) : (
							<div className="space-y-4">
								{events.map((event, index) => {
									const eventConfig = eventTypeConfig[event.type];
									const EventIcon = eventConfig.icon;
									const isLast = index === events.length - 1;

									return (
										<div key={event.id} className="relative flex gap-4">
											{!isLast && (
												<div className="absolute left-3 top-8 bottom-0 w-0.5 bg-border" />
											)}
											<div
												className={`relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted ${eventConfig.color}`}
											>
												<EventIcon className="size-3.5" />
											</div>
											<div className="flex-1 space-y-1 pb-4">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-2">
														<span className="text-sm font-medium text-foreground">
															{eventConfig.label}
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

					<Separator />

					{/* Notifications Audit */}
					<div className="space-y-4">
						<h3 className="text-sm font-semibold text-foreground">{t`Notifications Audit`}</h3>
						{notifications.length === 0 ? (
							<div className="py-4 text-center text-sm text-muted-foreground">
								{t`No notifications sent`}
							</div>
						) : (
							<div className="space-y-3">
								{notifications.map((notification) => (
									<div
										key={notification.id}
										className="flex items-start gap-3 p-3 rounded-lg border bg-card"
									>
										<div className="mt-0.5">
											<Mail className="size-4 text-muted-foreground" />
										</div>
										<div className="flex-1 space-y-1">
											<div className="flex items-center justify-between">
												<div>
													<p className="text-sm font-medium text-foreground">
														{notification.recipientName || notification.recipientEmail}
													</p>
													{notification.recipientName && (
														<p className="text-xs text-muted-foreground">
															{notification.recipientEmail}
														</p>
													)}
												</div>
												<Badge
													variant="outline"
													className={
														notification.deliveryStatus === "sent" ||
														notification.deliveryStatus === "delivered"
															? "bg-emerald-50 text-emerald-700 border-emerald-200"
															: notification.deliveryStatus === "failed"
																? "bg-red-50 text-red-700 border-red-200"
																: "bg-amber-50 text-amber-700 border-amber-200"
													}
												>
													{notification.deliveryStatus || "sent"}
												</Badge>
											</div>
											<div className="flex items-center gap-3 text-xs text-muted-foreground">
												<span className="capitalize">{notification.channel}</span>
												<span>•</span>
												<span>
													{notificationReasonLabels[notification.reason] || notification.reason}
												</span>
												<span>•</span>
												<span>{formatTimeOnly(notification.timestamp)}</span>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
