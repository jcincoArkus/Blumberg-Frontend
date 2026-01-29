import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

import { cn } from "~@/ui";

export interface AgentInsight {
	id: string;
	description: string;
	severity: "critical" | "high" | "medium" | "low";
	timeHorizon?: string;
	createdAt: string;
}

export interface AIInsightsPanelProps {
	insights: AgentInsight[];
}

function getInsightIcon(severity: string) {
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

function formatInsightText(insight: AgentInsight): { finding: string; context: string } {
	const finding = insight.description;
	const context = insight.timeHorizon
		? `Expected within ${insight.timeHorizon}`
		: "Based on recent patterns";

	return { finding, context };
}

export function AIInsightsPanel({ insights }: AIInsightsPanelProps) {
	const displayInsights = insights.slice(0, 4);

	return (
		<div className="h-full flex flex-col bg-card text-card-foreground rounded-xl border shadow-sm overflow-hidden">
			<div className="px-3 pt-3 pb-0.5">
				<h3 className="text-base font-semibold leading-tight">AI Insights</h3>
			</div>
			<div className="flex-1 divide-y overflow-y-auto">
				{displayInsights.length === 0 ? (
					<div className="p-3 text-center text-xs text-muted-foreground">No insights available</div>
				) : (
					displayInsights.map((insight) => {
						const Icon = getInsightIcon(insight.severity);
						const { finding, context } = formatInsightText(insight);

						return (
							<div key={insight.id} className="px-3 py-2">
								<div className="flex items-start gap-2">
									<Icon
										className={cn(
											"size-4 mt-0.5 flex-shrink-0",
											insight.severity === "critical" || insight.severity === "high"
												? "text-amber-600"
												: "text-slate-600",
										)}
									/>
									<div className="flex-1 space-y-0.5 min-w-0">
										<p className="text-sm leading-snug">{finding}</p>
										<p className="text-xs text-muted-foreground">{context}</p>
									</div>
								</div>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
}
