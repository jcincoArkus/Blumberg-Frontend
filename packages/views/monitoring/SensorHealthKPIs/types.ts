export interface SensorHealthKPIsProps {
	kpis: {
		total: number;
		healthy: number;
		stale: number;
		silent: number;
		ingestionErrors: number;
		qualityIssues: number;
	};
}
