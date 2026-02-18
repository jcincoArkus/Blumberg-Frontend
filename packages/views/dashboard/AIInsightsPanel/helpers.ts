import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

import { t } from "~@/i18n/macro";

import type { AgentInsight } from "./types";

export function getInsightIcon(severity: string) {
	switch (severity) {
		case "critical":
		case "high":
			return AlertTriangle;
		case "medium":
			return Info;
		default:
			return CheckCircle2;
	}
}

/** Mockup: circular icon background and text color by severity */
export function getInsightIconStyle(severity: string): { bg: string; text: string } {
	switch (severity) {
		case "critical":
		case "high":
			return {
				bg: "bg-amber-100 dark:bg-amber-950/50",
				text: "text-amber-600 dark:text-amber-400",
			};
		case "medium":
			return { bg: "bg-blue-100 dark:bg-blue-950/50", text: "text-blue-600 dark:text-blue-400" };
		default:
			return { bg: "bg-primary/10", text: "text-primary" };
	}
}

export function formatInsightText(insight: AgentInsight): { finding: string; context: string } {
	const finding = insight.description;
	const timeHorizon = insight.timeHorizon;
	const context = timeHorizon ? t`Expected within ${timeHorizon}` : t`Based on recent patterns`;

	return { finding, context };
}
