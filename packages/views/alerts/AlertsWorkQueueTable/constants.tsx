import { t } from "~@/i18n/macro";

export const getStatusConfig = () => ({
	active: {
		label: t`Active`,
		className: "bg-red-100 dark:bg-danger-subtle text-danger-foreground border-danger-border",
	},
	acknowledged: {
		label: t`Acknowledged`,
		className: "bg-amber-100 dark:bg-warning-subtle text-warning-foreground border-warning-border",
	},
	resolved: {
		label: t`Resolved`,
		className:
			"bg-emerald-100 dark:bg-success-subtle text-emerald-700 dark:text-success-foreground border-emerald-200 dark:border-success-border",
	},
});
