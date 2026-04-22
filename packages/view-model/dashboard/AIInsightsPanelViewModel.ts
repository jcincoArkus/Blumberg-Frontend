import { makeAutoObservable } from "~@/mobx";

import { dashboardInsightsViewModel } from "./DashboardInsightsViewModel";

/**
 * Singleton ViewModel for the AIInsightsPanel component.
 * Provides sorted and limited AI insights for display.
 */
class AIInsightsPanelViewModel {
	constructor() {
		makeAutoObservable(this);
	}

	// Get display insights from DashboardInsightsViewModel
	get insights() {
		return dashboardInsightsViewModel.displayInsights;
	}
}

// Export singleton instance
export const aiInsightsPanelViewModel = new AIInsightsPanelViewModel();

/**
 * Hook to access the AIInsightsPanelViewModel singleton.
 * @returns The singleton instance of AIInsightsPanelViewModel
 */
export function useAIInsightsPanelViewModel() {
	return aiInsightsPanelViewModel;
}
