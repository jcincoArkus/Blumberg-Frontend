import type { TrendPoint } from "./types";

export function formatSparklineData(dataPoints: TrendPoint[]) {
	return dataPoints.map((point, index) => ({
		index,
		value: point.value,
	}));
}

export function getLastValue(dataPoints: TrendPoint[]) {
	return dataPoints[dataPoints.length - 1]?.value ?? 0;
}
