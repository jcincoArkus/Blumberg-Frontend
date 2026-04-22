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

/** Y-axis domain that includes data range and optional ideal band, with padding */
export function getSparklineDomain(
	values: number[],
	idealMin?: number,
	idealMax?: number,
): [number, number] {
	const dataMin = values.length ? Math.min(...values) : 0;
	const dataMax = values.length ? Math.max(...values) : 0;
	const min = idealMin !== undefined ? Math.min(dataMin, idealMin) : dataMin;
	const max = idealMax !== undefined ? Math.max(dataMax, idealMax) : dataMax;
	const padding = (max - min) * 0.15 || 1;
	return [Math.floor(min - padding), Math.ceil(max + padding)];
}
