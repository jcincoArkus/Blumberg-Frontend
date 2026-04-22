import { makeAutoObservable } from "~@/mobx";
import { agentInsights } from "~@/mock-data";
import type { AgentInsight } from "~@/views";

/**
 * Singleton ViewModel for Dashboard AI Insights data.
 * Will use hey-api ObservedQuery when endpoints are ready.
 * Currently uses mock data.
 */
class DashboardInsightsViewModel {
	// TODO: Replace with ObservedQuery when hey-api endpoint is ready
	// insightsQuery = new ObservedQuery(getInsightsQuery, {});
	private readonly _insights: AgentInsight[];

	constructor() {
		makeAutoObservable(this);
		this._insights = agentInsights;
	}

	/**
	 * Get all insights
	 */
	get insights(): AgentInsight[] {
		// return this.insightsQuery.data ?? [];
		return this._insights;
	}

	/**
	 * Get sorted and limited insights for display (first 4)
	 */
	get displayInsights(): AgentInsight[] {
		return [...this.insights]
			.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
			.slice(0, 4);
	}

	/**
	 * Load insights from API
	 * TODO: Uncomment when hey-api endpoint is ready
	 */
	// load = () => {
	// 	this.insightsQuery.load();
	// };

	/**
	 * Dispose of resources
	 * TODO: Uncomment when hey-api endpoint is ready
	 */
	// dispose = () => {
	// 	this.insightsQuery.dispose();
	// };
}

// Export singleton instance
export const dashboardInsightsViewModel = new DashboardInsightsViewModel();

export function useDashboardInsightsViewModel() {
	return dashboardInsightsViewModel;
}
