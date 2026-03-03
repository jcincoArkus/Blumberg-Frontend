import type { AlertStatus } from "../types";

export interface AlertsStatusTabsProps {
	activeTab: AlertStatus | "all";
	onTabChange: (tab: AlertStatus | "all") => void;
	counts: {
		all: number;
		active: number;
		acknowledged: number;
		resolved: number;
	};
}
