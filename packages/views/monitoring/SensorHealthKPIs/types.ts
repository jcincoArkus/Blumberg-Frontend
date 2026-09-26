export interface SensorHealthKPIsProps {
	kpis: {
		total: number;
		healthy: number;
		stale: number;
		silent: number;
		ingestionErrors: number;
		qualityIssues: number;
	};
	/** First load in flight: cards show a spinner instead of 0. */
	isLoading?: boolean;
}
