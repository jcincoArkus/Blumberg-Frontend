import { Menu } from "lucide-react";

import { Button, cn } from "~@/ui";

import type { Domain, DomainKey } from "./types";

interface DashboardHeaderProps {
	showDomainTabs: boolean;
	activeDomain: Domain;
	onDomainChange: (domain: Domain) => void;
	onOpenMobileMenu: () => void;
	domainKeys: DomainKey[];
	domainKeyToValue: Record<DomainKey, Domain>;
	domainLabels: Record<DomainKey, string>;
}

export function DashboardHeader({
	showDomainTabs,
	activeDomain,
	onDomainChange,
	onOpenMobileMenu,
	domainKeys,
	domainKeyToValue,
	domainLabels,
}: DashboardHeaderProps) {
	return (
		<header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="sm" className="lg:hidden" onClick={onOpenMobileMenu}>
					<Menu className="size-5" />
				</Button>

				{showDomainTabs && (
					<div className="hidden md:flex items-center gap-1">
						{domainKeys.map((key) => {
							const domainValue = domainKeyToValue[key];
							return (
								<button
									key={key}
									type="button"
									onClick={() => onDomainChange(domainValue)}
									className={cn(
										"px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
										activeDomain === domainValue
											? "bg-primary text-primary-foreground"
											: "text-muted-foreground hover:bg-muted hover:text-foreground",
									)}
								>
									{domainLabels[key]}
								</button>
							);
						})}
					</div>
				)}
			</div>
		</header>
	);
}
