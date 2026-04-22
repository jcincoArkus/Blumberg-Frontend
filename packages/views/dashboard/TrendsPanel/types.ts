export interface TrendPoint {
	time: string;
	value: number;
}

export interface TrendsPanelProps {
	data: {
		aqi: TrendPoint[];
		co2: TrendPoint[];
		temperature: TrendPoint[];
	};
}
