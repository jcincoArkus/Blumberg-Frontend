import { t } from "~@/i18n/macro";

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
