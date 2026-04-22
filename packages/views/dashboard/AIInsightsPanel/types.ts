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
