import { AlertCircle, CheckCircle2 } from "lucide-react";

import { t } from "~@/i18n/macro";
import { Button, Card, CardContent } from "~@/ui";

import type { IngestionErrorsSectionProps } from "./types";

export function IngestionErrorsSection({
	data,
	ingestionErrorCount = null,
}: IngestionErrorsSectionProps) {
	const count = ingestionErrorCount ?? data.ingestionErrors.length;
	const hasErrors =
		typeof ingestionErrorCount === "number"
			? ingestionErrorCount > 0
			: data.ingestionErrors.length > 0;
	const isLoading = ingestionErrorCount === null && data.ingestionErrors.length === 0;

	return (
		<div className="space-y-4">
			<h3 className="text-sm font-semibold text-foreground">{t`Ingestion Errors`}</h3>

			{isLoading ? (
				<Card>
					<CardContent className="py-6 text-center">
						<p className="text-sm text-muted-foreground">{t`Loading…`}</p>
					</CardContent>
				</Card>
			) : hasErrors ? (
				<>
					<Card>
						<CardContent className="py-4">
							<p className="text-sm text-foreground">
								{count === 1
									? t`1 rejected reading in the last 24 hours.`
									: t`${count} rejected readings in the last 24 hours.`}
							</p>
							<p className="text-xs text-muted-foreground mt-1">
								{t`Rejections can be due to invalid sensor id, invalid unit, or other validation errors.`}
							</p>
						</CardContent>
					</Card>
					<div className="flex gap-2">
						<Button variant="outline" size="sm" className="flex-1">
							<AlertCircle className="size-4 mr-2" />
							{t`View ingestion runs`}
						</Button>
					</div>
				</>
			) : (
				<Card>
					<CardContent className="py-6 text-center">
						<CheckCircle2 className="size-8 mx-auto mb-2 text-emerald-500" />
						<p className="text-sm text-muted-foreground">
							{t`No ingestion errors in the last 24 hours.`}
						</p>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
