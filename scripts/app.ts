import { runAppScript } from "./app-core/runner";

runAppScript(process.argv.slice(2), {
	name: "dashboard",
	defaultApp: "apps/app",
	defaultPort: "5080",
	defaultLocale: "en-US",
}).catch((error) => {
	console.error("Error running dashboard command:", error instanceof Error ? error.message : error);
	process.exit(1);
});
