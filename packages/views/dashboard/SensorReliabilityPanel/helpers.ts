export function getHealthyStats({
	totalSensors,
	offlineCount,
	staleCount,
	flappingCount,
}: {
	totalSensors: number;
	offlineCount: number;
	staleCount: number;
	flappingCount: number;
}) {
	const healthyCount = totalSensors - offlineCount - staleCount - flappingCount;
	const healthyPercentage =
		totalSensors > 0 ? Math.round((healthyCount / totalSensors) * 100) : 100;
	const hasIssues = offlineCount > 0 || staleCount > 0 || flappingCount > 0;

	return { healthyCount, healthyPercentage, hasIssues };
}
