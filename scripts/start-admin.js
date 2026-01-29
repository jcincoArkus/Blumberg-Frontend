import concurrently from "concurrently";

const args = process.argv.slice(2);
const modeArg = args.find((arg) => arg.startsWith("--mode"));
const mode = modeArg ? modeArg.split("=")[1] || args[args.indexOf(modeArg) + 1] : undefined;

const commands = [
	{
		command: `VITE_DEFAULT_LOCALE="en-XA" react-router dev ./apps/app --config ./apps/app/vite.config.ts --port 5080 --strictPort --mode ${mode}`,
		name: "admin",
		prefixColor: "yellow",
	},
	{
		command: "pnpm i18n:watch",
		name: "i18n",
		prefixColor: "cyan",
	},
];

concurrently(commands, {
	prefix: "name",
	killOthersOn: ["failure"],
	restartTries: 3,
	raw: true,
});
