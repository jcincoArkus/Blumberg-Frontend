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

export function formatInsightText(insight: AgentInsight): { finding: string; context: string } {
	const finding = insight.description;
	const timeHorizon = insight.timeHorizon;
	const context = timeHorizon ? t`Expected within ${timeHorizon}` : t`Based on recent patterns`;

	return { finding, context };
}
