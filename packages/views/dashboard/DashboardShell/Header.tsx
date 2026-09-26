import { LogOut, Menu, User } from "lucide-react";
import { useNavigate } from "react-router";

import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import {
	Button,
	cn,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	ThemeModeMenu,
	ThemeToggleButton,
} from "~@/ui";
import { authViewModel, themeViewModel } from "~@/view-model";

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

export const DashboardHeader = observer(function DashboardHeader({
	showDomainTabs,
	activeDomain,
	onDomainChange,
	onOpenMobileMenu,
	domainKeys,
	domainKeyToValue,
	domainLabels,
}: DashboardHeaderProps) {
	const navigate = useNavigate();
	// Signed-in user from the access token claims; every account in this app is an organization admin
	const user = authViewModel.currentUser;
	const userName = user?.displayName || t`Signed in`;

	const handleLogout = () => {
		authViewModel.clearSession();
		navigate("/login", { replace: true });
	};

	return (
		<header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
			<div className="flex items-center gap-4">
				<Button
					variant="ghost"
					size="sm"
					className="lg:hidden"
					onClick={onOpenMobileMenu}
					aria-label={t`Open menu`}
				>
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

			<div className="flex items-center gap-1">
				<ThemeToggleButton
					resolvedTheme={themeViewModel.resolvedTheme}
					onToggle={themeViewModel.toggle}
				/>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							className="gap-2 font-normal text-foreground hover:bg-primary hover:text-primary-foreground"
							aria-label={t`User menu`}
						>
							<User className="size-4 shrink-0" />
							<span className="hidden sm:inline">{userName}</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-56 rounded-lg shadow-md">
						<div className="px-3 py-3">
							<p className="text-sm font-bold text-foreground">{userName}</p>
							{user?.email && (
								<p className="truncate text-sm text-muted-foreground">{user.email}</p>
							)}
							<p className="text-sm text-muted-foreground">
								{t`Role`}: {t`Administrator`}
							</p>
						</div>
						<DropdownMenuSeparator />
						<ThemeModeMenu value={themeViewModel.mode} onValueChange={themeViewModel.setMode} />
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
			</div>
		</header>
	);
});
