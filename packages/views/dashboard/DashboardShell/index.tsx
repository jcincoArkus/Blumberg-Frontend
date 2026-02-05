import { useState } from "react";

import { cn } from "~@/ui";

import {
	dashboardItem,
	domainKeys,
	domainKeyToValue,
	domainLabels,
	navSections,
} from "./constants";
import { DashboardHeader } from "./Header";
import { useDashboardShellState } from "./hooks";
import { MobileOverlay } from "./MobileOverlay";
import { Sidebar } from "./Sidebar";
import type { DashboardShellProps, Domain } from "./types";

export type { DashboardShellProps, Domain } from "./types";

export function DashboardShell({
	children,
	activeDomain: controlledDomain,
	onDomainChange,
	showDomainTabs = true,
}: DashboardShellProps) {
	const [localDomain, setLocalDomain] = useState<Domain>("All");
	const activeDomain = controlledDomain ?? localDomain;
	const setActiveDomain = onDomainChange ?? setLocalDomain;

	const shellState = useDashboardShellState({ navSections });

	return (
		<div className="flex h-screen bg-background">
			<Sidebar
				dashboardItem={dashboardItem}
				navSections={navSections}
				mobileMenuOpen={shellState.mobileMenuOpen}
				sidebarCollapsed={shellState.sidebarCollapsed}
				expandedSections={shellState.expandedSections}
				onToggleSidebar={shellState.toggleSidebar}
				onCloseMobileMenu={() => shellState.setMobileMenuOpen(false)}
				onToggleSection={shellState.toggleSection}
				isItemActive={shellState.isItemActive}
				hasActiveItem={shellState.hasActiveItem}
			/>

			<div
				className={cn(
					"flex flex-1 flex-col overflow-hidden transition-all duration-300",
					shellState.sidebarCollapsed ? "lg:ml-0" : "",
				)}
			>
				<DashboardHeader
					showDomainTabs={showDomainTabs}
					activeDomain={activeDomain}
					onDomainChange={setActiveDomain}
					onOpenMobileMenu={() => shellState.setMobileMenuOpen(true)}
					domainKeys={domainKeys}
					domainKeyToValue={domainKeyToValue}
					domainLabels={domainLabels}
				/>

				<main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
			</div>

			<MobileOverlay
				open={shellState.mobileMenuOpen}
				onClose={() => shellState.setMobileMenuOpen(false)}
			/>
		</div>
	);
}
