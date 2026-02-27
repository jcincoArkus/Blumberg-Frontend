import { AlertCircle, AlertTriangle, Info } from "lucide-react";

import { t } from "~@/i18n/macro";

export const getSeverityConfig = () => ({
	critical: {
		icon: AlertCircle,
		label: t`Critical`,
		className: "bg-red-100 text-red-700 border-red-300",
		dot: "bg-red-600",
	},
	high: {
		icon: AlertTriangle,
		label: t`Alert`,
		className: "bg-orange-100 text-orange-700 border-orange-300",
		dot: "bg-orange-600",
	},
	medium: {
		icon: AlertTriangle,
		label: t`Warning`,
		className: "bg-amber-100 text-amber-700 border-amber-300",
		dot: "bg-amber-600",
	},
	low: {
		icon: Info,
		label: t`Warning`,
		className: "bg-blue-100 text-blue-700 border-blue-300",
		dot: "bg-blue-600",
	},
});

export const getStatusConfig = () => ({
	active: {
		label: t`Active`,
		className: "bg-red-100 text-red-700 border-red-200",
	},
	acknowledged: {
		label: t`Acknowledged`,
		className: "bg-amber-100 text-amber-700 border-amber-200",
	},
	resolved: {
		label: t`Resolved`,
		className: "bg-emerald-100 text-emerald-700 border-emerald-200",
	},
});
