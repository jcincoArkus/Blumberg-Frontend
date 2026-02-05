import { makeAutoObservable } from "~@/mobx";

interface TrendPoint {
	time: string;
	value: number;
}

interface TrendData {
	aqi: TrendPoint[];
	co2: TrendPoint[];
	temperature: TrendPoint[];
}

/**
 * Singleton ViewModel for Dashboard Trends data.
 * Will use hey-api ObservedQuery when endpoints are ready.
 * Currently generates mock trend data.
 */
class DashboardTrendsViewModel {
	// TODO: Replace with ObservedQuery when hey-api endpoint is ready
	// trendsQuery = new ObservedQuery(getTrendsQuery, {});

	constructor() {
		makeAutoObservable(this);
	}

	/**
	 * Get trend data for charts
	 */
	get trendData(): TrendData {
		// return this.trendsQuery.data ?? this.defaultTrendData;
		return {
			aqi: this.generateTrendPoints(42, 15, 24),
			co2: this.generateTrendPoints(580, 50, 24),
			temperature: this.generateTrendPoints(21.5, 2, 24),
		};
	}

	/**
	 * Generate mock trend points
	 * TODO: Remove when using real API data
	 */
	private generateTrendPoints(baseValue: number, variance: number, count: number): TrendPoint[] {
		const points: TrendPoint[] = [];
		const now = new Date();
		for (let i = count - 1; i >= 0; i--) {
			const time = new Date(now.getTime() - i * 60 * 60 * 1000);
			const value = baseValue + (Math.random() - 0.5) * variance;
			points.push({ time: time.toISOString(), value: Math.max(0, value) });
		}
		return points;
	}

	/**
	 * Load trends from API
	 * TODO: Uncomment when hey-api endpoint is ready
	 */
	// load = () => {
	// 	this.trendsQuery.load();
	// };

	/**
	 * Dispose of resources
	 * TODO: Uncomment when hey-api endpoint is ready
	 */
	// dispose = () => {
	// 	this.trendsQuery.dispose();
	// };
}

// Export singleton instance
export const dashboardTrendsViewModel = new DashboardTrendsViewModel();

export function useDashboardTrendsViewModel() {
	return dashboardTrendsViewModel;
}
