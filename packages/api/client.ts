import axios from "axios";
import { stringify } from "qs";

import type { CreateClientConfig } from "./generated/client.gen";

const client = axios.create({});

export const createClientConfig: CreateClientConfig = () => {
	return {
		axios: client,
		// baseURL: "http://localhost:8000",
		bodySerializer: bodySerializer,
		paramsSerializer: {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			serialize: (params: any): string => {
				return stringify(params, { arrayFormat: "repeat" });
			},
		},
	};
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function bodySerializer(body: any): any {
	return JSON.parse(JSON.stringify(body));
}
