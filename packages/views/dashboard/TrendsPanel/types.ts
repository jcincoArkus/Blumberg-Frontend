export interface TrendPoint {
	time: string;
	value: number;
}

export interface TrendsPanelProps {
	data: {
		temperature: TrendPoint[];
		humidity: TrendPoint[];
		co2: TrendPoint[];
	};
}
