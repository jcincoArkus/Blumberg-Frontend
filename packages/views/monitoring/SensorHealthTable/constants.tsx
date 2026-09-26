import { t } from "~@/i18n/macro";

export const SENSOR_TYPE_OPTIONS = [
	{ value: "temperature", label: t`Temperature` },
	{ value: "humidity", label: t`Humidity` },
	{ value: "co2", label: t`CO2` },
	{ value: "o2", label: t`O2` },
	{ value: "pressure", label: t`Pressure` },
	{ value: "energy", label: t`Energy` },
] as const;

export const HEALTH_BADGE_CONFIG = {
	healthy: {
		label: t`Healthy`,
		className:
			"bg-emerald-100 dark:bg-success-subtle text-emerald-700 dark:text-success-foreground border-emerald-200 dark:border-success-border",
	},
	stale: {
		label: t`Stale`,
		className: "bg-amber-100 dark:bg-warning-subtle text-warning-foreground border-warning-border",
	},
	silent: {
		label: t`Silent`,
		className: "bg-red-100 dark:bg-danger-subtle text-danger-foreground border-danger-border",
	},
	offline: {
		label: t`Offline`,
		className: "bg-red-100 dark:bg-danger-subtle text-danger-foreground border-danger-border",
	},
	warning: {
		label: t`Warning`,
		className: "bg-amber-100 dark:bg-warning-subtle text-warning-foreground border-warning-border",
	},
	critical: {
		label: t`Critical`,
		className: "bg-red-100 dark:bg-danger-subtle text-danger-foreground border-danger-border",
	},
} as const;

export const QUALITY_BADGE_CONFIG = {
	good: {
		label: t`Good`,
		className:
			"bg-emerald-100 dark:bg-success-subtle text-emerald-700 dark:text-success-foreground border-emerald-200 dark:border-success-border",
	},
	missing: {
		label: t`Missing`,
		className: "bg-amber-100 dark:bg-warning-subtle text-warning-foreground border-warning-border",
	},
	inconsistent: {
		label: t`Inconsistent`,
		className: "bg-red-100 dark:bg-danger-subtle text-danger-foreground border-danger-border",
	},
} as const;

export const INGESTION_BADGE_CONFIG = {
	api: {
		label: t`API`,
		className:
			"bg-sky-100 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-500/30",
	},
	csv: {
		label: t`CSV`,
		className:
			"bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-500/30",
	},
} as const;
