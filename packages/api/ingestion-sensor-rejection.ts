import { client } from "./generated/client.gen";

/**
 * Per-sensor ingestion rejection count.
 * Matches backend GET /api/v1/ingestion/sensors/{sensorId}/rejection-count response.
 * Use this until the endpoint is added to OpenAPI and api:gen is run.
 */
export interface SensorRejectionCountResponse {
	sensorId: string;
	count: number;
}

/**
 * Fetches the number of rejected readings for a sensor in the given time range.
 * Backend defaults to last 24h if From/To are omitted.
 */
export async function getSensorRejectionCount(
	sensorId: string,
	options?: { from?: Date; to?: Date },
): Promise<SensorRejectionCountResponse> {
	const query: Record<string, string> = {};
	if (options?.from) query.From = options.from.toISOString();
	if (options?.to) query.To = options.to.toISOString();
	const response = await client.get({
		url: "/api/v1/ingestion/sensors/{sensorId}/rejection-count",
		path: { sensorId },
		query: Object.keys(query).length > 0 ? query : undefined,
		responseType: "json",
		security: [{ scheme: "bearer", type: "http" }],
	});
	const raw = (response as { data?: Record<string, unknown> }).data ?? {};
	const count =
		typeof raw.count === "number" ? raw.count : typeof raw.Count === "number" ? raw.Count : 0;
	const sid =
		typeof raw.sensorId === "string"
			? raw.sensorId
			: typeof raw.SensorId === "string"
				? raw.SensorId
				: sensorId;
	return { sensorId: sid, count };
}
