import path from "node:path";
import { fileURLToPath } from "node:url";

import { remixRoutesOptionAdapter } from "@react-router/remix-routes-option-adapter";
import { flatRoutes } from "remix-flat-routes";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default remixRoutesOptionAdapter((defineRoutes) => {
	return flatRoutes("routes", defineRoutes, {
		appDir: __dirname, // Absolute path to src/ directory
		ignoredRouteFiles: ["**/.*"],
	});
});
