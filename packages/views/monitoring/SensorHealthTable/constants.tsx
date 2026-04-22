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
	healthy: { label: t`Healthy`, className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
	stale: { label: t`Stale`, className: "bg-amber-100 text-amber-700 border-amber-200" },
	silent: { label: t`Silent`, className: "bg-red-100 text-red-700 border-red-200" },
	offline: { label: t`Offline`, className: "bg-red-100 text-red-700 border-red-200" },
	warning: { label: t`Warning`, className: "bg-amber-100 text-amber-700 border-amber-200" },
	critical: { label: t`Critical`, className: "bg-red-100 text-red-700 border-red-200" },
} as const;

export const QUALITY_BADGE_CONFIG = {
	good: { label: t`Good`, className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
	missing: { label: t`Missing`, className: "bg-amber-100 text-amber-700 border-amber-200" },
	inconsistent: { label: t`Inconsistent`, className: "bg-red-100 text-red-700 border-red-200" },
} as const;

export const INGESTION_BADGE_CONFIG = {
	api: { label: t`API`, className: "bg-sky-100 text-sky-700 border-sky-200" },
	csv: { label: t`CSV`, className: "bg-violet-100 text-violet-700 border-violet-200" },
} as const;
