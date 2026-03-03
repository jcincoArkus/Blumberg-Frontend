import { LogOut, Menu, User } from "lucide-react";
import { useNavigate } from "react-router";

import { t } from "~@/i18n/macro";
import {
	Button,
	cn,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~@/ui";
import { authViewModel } from "~@/view-model";

import type { Domain, DomainKey } from "./types";

/** Placeholder until session includes user (e.g. from auth API) */
const DISPLAY_USER = {
	name: t`John Admin`,
	email: "john.admin@blumberg.com",
	role: t`admin`,
};

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
	const navigate = useNavigate();

	const handleLogout = () => {
		authViewModel.clearSession();
		navigate("/login", { replace: true });
	};

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

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="sm"
						className="gap-2 font-normal text-foreground hover:bg-primary hover:text-primary-foreground"
						aria-label={t`User menu`}
					>
						<User className="size-4 shrink-0" />
						<span className="hidden sm:inline">{DISPLAY_USER.name}</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-56 rounded-lg shadow-md">
					<div className="px-3 py-3">
						<p className="text-sm font-bold text-foreground">{DISPLAY_USER.name}</p>
						<p className="text-sm text-muted-foreground">{DISPLAY_USER.email}</p>
						<p className="text-sm text-muted-foreground">
							{t`Role`}: {DISPLAY_USER.role}
						</p>
					</div>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onSelect={handleLogout}
						className="cursor-pointer focus:bg-primary focus:text-primary-foreground data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground"
					>
						<LogOut className="size-4" />
						{t`Logout`}
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</header>
	);
}
