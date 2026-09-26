import { i18n } from "@lingui/core";

/** Active UI locale (falls back to the browser default when Lingui isn't activated yet). */
function currentLocale(): string | undefined {
	return i18n.locale || undefined;
}

const formatterCache = new Map<string, Intl.NumberFormat>();

function getFormatter(maxDecimals: number, minDecimals: number): Intl.NumberFormat {
	const locale = currentLocale();
	const key = `${locale ?? ""}|${minDecimals}|${maxDecimals}`;
	let f = formatterCache.get(key);
	if (!f) {
		f = new Intl.NumberFormat(locale, {
			minimumFractionDigits: minDecimals,
			maximumFractionDigits: maxDecimals,
		});
		formatterCache.set(key, f);
	}
	return f;
}

export interface FormatNumberOptions {
	/** Max fraction digits. Defaults to "auto": 0 for |n| >= 100, otherwise 1. */
	maxDecimals?: number;
	/** Min fraction digits (default 0). */
	minDecimals?: number;
	/** Text used for null/undefined/NaN (default "—"). */
	fallback?: string;
}

function toNumber(value: unknown): number | null {
	if (value === null || value === undefined || value === "") return null;
	const n = typeof value === "number" ? value : Number(value);
	return Number.isFinite(n) ? n : null;
}

/**
 * Locale-aware number formatting for sensor readings and metrics.
 * `formatNumber(21.519990926728457)` → "21.5", `formatNumber(594.49)` → "594".
 * Non-numeric input (null / undefined / NaN / "abc") renders as the fallback ("—").
 */
export function formatNumber(value: unknown, options: FormatNumberOptions = {}): string {
	const n = toNumber(value);
	if (n === null) return options.fallback ?? "—";
	const maxDecimals = options.maxDecimals ?? (Math.abs(n) >= 100 ? 0 : 1);
	const minDecimals = Math.min(options.minDecimals ?? 0, maxDecimals);
	// Avoid "-0"
	const out = getFormatter(maxDecimals, minDecimals).format(n);
	return out === "-0" ? "0" : out;
}

const UNIT_SYMBOLS: Record<string, string> = {
	celsius: "°C",
	fahrenheit: "°F",
	percent: "%",
	ppm: "ppm",
	psi: "psi",
	bar: "bar",
	kw: "kW",
	kwh: "kWh",
	custom: "",
};

/** Numeric API `Unit` enum (Celsius, Fahrenheit, Percent, Ppm, Psi, Bar, Kw, Kwh, Custom). */
const UNIT_BY_INDEX = ["°C", "°F", "%", "ppm", "psi", "bar", "kW", "kWh", ""];

/**
 * Maps API unit names ("Celsius", "Percent", "Kw", 0…8) to display symbols ("°C", "%", "kW").
 * Unknown strings are returned unchanged, so already-formatted units ("°C") pass through.
 */
export function unitSymbol(unit: string | number | null | undefined): string {
	if (unit === null || unit === undefined) return "";
	if (typeof unit === "number") return UNIT_BY_INDEX[unit] ?? "";
	return UNIT_SYMBOLS[unit.trim().toLowerCase()] ?? unit;
}

/**
 * Formats a reading with its unit: `formatReading(21.52, "°C")` → "21.5 °C".
 * Units that attach directly ("%", "°", "°C", "°F") are rendered without a space
 * only when `compact` is true.
 */
export function formatReading(
	value: unknown,
	unit?: string | number | null,
	options: FormatNumberOptions & { compact?: boolean } = {},
): string {
	const num = formatNumber(value, options);
	const symbol = unitSymbol(unit);
	if (!symbol || num === (options.fallback ?? "—")) return num;
	const sep = options.compact || symbol === "%" ? "" : " ";
	return `${num}${sep}${symbol}`;
}
