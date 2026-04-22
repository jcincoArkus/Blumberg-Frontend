import { Mail } from "lucide-react";

import { t } from "~@/i18n/macro";
import { Badge } from "~@/ui";

import type { AlertNotification } from "../types";
import { getNotificationReasonLabels } from "./constants";
import { formatTimeOnly } from "./helpers";

interface NotificationsAuditSectionProps {
	notifications: AlertNotification[];
}

export function NotificationsAuditSection({ notifications }: NotificationsAuditSectionProps) {
	const notificationReasonLabels = getNotificationReasonLabels();

	return (
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
											<p className="text-xs text-muted-foreground">{notification.recipientEmail}</p>
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
	);
}
