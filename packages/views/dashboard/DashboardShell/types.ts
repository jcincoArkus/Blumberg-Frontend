import type { ReactNode } from "react";

export type Domain = "All" | "Energy" | "Climate" | "Refrigeration" | "Equipment";

export interface NavItem {
	label: string;
	href: string;
	icon: ReactNode;
}

export interface NavSection {
	section: string;
	items: NavItem[];
}

/** Domain tab labels - keys for i18n lookup */
export type DomainKey = "all" | "energy" | "climate" | "refrigeration" | "equipment";

export interface DashboardShellProps {
	children: ReactNode;
	/** Active domain filter - will be controlled by MobX ViewModel */
	activeDomain?: Domain;
	/** Callback when domain changes - will be controlled by MobX ViewModel */
	onDomainChange?: (domain: Domain) => void;
	/** Whether to show domain tabs in header */
	showDomainTabs?: boolean;
}
