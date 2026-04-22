import { Check, CheckCircle2, ExternalLink } from "lucide-react";

import { t } from "~@/i18n/macro";
import { Button } from "~@/ui";

import type { AlertActionButtonsProps } from "./types";

export function AlertActionButtons({
	alert,
	onAlertUpdate,
	onViewDetails,
}: AlertActionButtonsProps) {
	return (
		<div className="flex items-center justify-end gap-1">
			{alert.status === "active" && onAlertUpdate && (
				<>
					<Button
						variant="ghost"
						size="sm"
						className="h-7 px-2 text-xs"
						onClick={(e) => {
							e.stopPropagation();
							onAlertUpdate(alert.id, "acknowledge");
						}}
						title={t`Acknowledge alert`}
					>
						<Check className="h-3.5 w-3.5 mr-1" />
						{t`Ack`}
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className="h-7 px-2 text-xs"
						onClick={(e) => {
							e.stopPropagation();
							onAlertUpdate(alert.id, "resolve");
						}}
						title={t`Resolve alert`}
					>
						<CheckCircle2 className="h-3.5 w-3.5 mr-1" />
						{t`Resolve`}
					</Button>
				</>
			)}
			{alert.status === "acknowledged" && onAlertUpdate && (
				<Button
					variant="ghost"
					size="sm"
					className="h-7 px-2 text-xs"
					onClick={(e) => {
						e.stopPropagation();
						onAlertUpdate(alert.id, "resolve");
					}}
					title={t`Resolve alert`}
				>
					<CheckCircle2 className="h-3.5 w-3.5 mr-1" />
					{t`Resolve`}
				</Button>
			)}
			<Button
				variant="ghost"
				size="sm"
				className="h-7 w-7 p-0"
				onClick={(e) => {
					e.stopPropagation();
					onViewDetails();
				}}
				title={t`View details`}
			>
				<ExternalLink className="h-4 w-4" />
			</Button>
		</div>
	);
}
