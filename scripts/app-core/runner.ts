import { existsSync } from "node:fs";
import { parseArgs } from "node:util";

import { spawn } from "bun";
import concurrently from "concurrently";

type AppCommand = "build" | "start";

interface SharedOptions {
	app: string;
	mode?: string;
}

interface StartOptions extends SharedOptions {
	port: string;
	locale: string;
}

interface AppScriptConfig {
	name: string;
	defaultApp: string;
	defaultPort?: string;
	defaultLocale?: string;
}

function parseBuildOptions(args: string[], defaults: AppScriptConfig): SharedOptions {
	const { values } = parseArgs({
		args,
		options: {
			app: { type: "string", default: defaults.defaultApp },
			mode: { type: "string" },
		},
		allowPositionals: false,
	});

	return {
		app: values.app,
		mode: values.mode,
	};
}

function parseStartOptions(args: string[], defaults: AppScriptConfig): StartOptions {
	const { values } = parseArgs({
		args,
		options: {
			app: { type: "string", default: defaults.defaultApp },
			mode: { type: "string" },
			port: { type: "string", default: defaults.defaultPort ?? "4080" },
			locale: { type: "string", default: defaults.defaultLocale ?? "en-US" },
		},
		allowPositionals: false,
	});

	return {
		app: values.app,
		mode: values.mode,
		port: values.port,
		locale: values.locale,
	};
}

function modeFlag(mode?: string): string[] {
	return mode ? ["--mode", mode] : [];
}

async function run(cmd: string[], opts?: { cwd?: string }) {
	const proc = spawn(cmd, { stdio: ["inherit", "inherit", "inherit"], ...opts });
	const code = await proc.exited;
	if (code !== 0) process.exit(code);
}

function printUsage(config: AppScriptConfig): void {
	console.log(`Usage: bun scripts/${config.name}.ts <build|start> [options]`);
	console.log(`Build options: --app <apps/path> [--mode <mode>]`);
	console.log(
		`Start options: --app <apps/path> [--mode <mode>] [--port <port>] [--locale <locale>]`,
	);
}

async function runBuild(args: string[], config: AppScriptConfig): Promise<void> {
	const { app, mode } = parseBuildOptions(args, config);
	if (!existsSync(app)) {
		console.error(`App path does not exist: ${app}`);
		process.exit(1);
	}
	await run(["bun", "run", "i18n:messages:extract"]);
	await run(["bun", "run", "i18n:messages:replace"]);
	await run(["bunx", "react-router", "build", ...modeFlag(mode)], { cwd: app });
}

async function runStart(args: string[], config: AppScriptConfig): Promise<void> {
	const { app, mode, port, locale } = parseStartOptions(args, config);
	if (!existsSync(app)) {
		console.error(`App path does not exist: ${app}`);
		process.exit(1);
	}
	const modeArg = mode ? ` --mode ${mode}` : "";

	const commands = [
		{
			command: `VITE_DEFAULT_LOCALE="${locale}" bunx --bun react-router dev ./${app} --config ./${app}/vite.config.ts --strictPort --port ${port}${modeArg}`,
			name: config.name,
			prefixColor: "yellow",
		},
		{
			command: "bun run i18n:watch",
			name: "i18n",
			prefixColor: "cyan",
		},
	];

	const { result } = concurrently(commands, {
		prefix: "name",
		killOthersOn: ["failure"],
		restartTries: 3,
		raw: true,
	});

	await result;
}

export async function runAppScript(argv: string[], config: AppScriptConfig): Promise<void> {
	const command = argv[0];
	const args = argv.slice(1);

	if (!command || !["build", "start"].includes(command)) {
		printUsage(config);
		process.exit(1);
	}

	switch (command as AppCommand) {
		case "build":
			await runBuild(args, config);
			return;
		case "start":
			await runStart(args, config);
			return;
	}
}
