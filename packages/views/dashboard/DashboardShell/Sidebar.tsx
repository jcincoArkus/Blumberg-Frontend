import { ChevronDown, ChevronLeft, ChevronRight, Gauge, X } from "lucide-react";
import { Link } from "react-router";

import { t } from "~@/i18n/macro";
import { Button, Collapsible, CollapsibleContent, CollapsibleTrigger, cn } from "~@/ui";

import type { NavItem, NavSection } from "./types";

interface SidebarProps {
	dashboardItem: NavItem;
	navSections: NavSection[];
	mobileMenuOpen: boolean;
	sidebarCollapsed: boolean;
	expandedSections: Record<string, boolean>;
	onToggleSidebar: () => void;
	onCloseMobileMenu: () => void;
	onToggleSection: (section: string) => void;
	isItemActive: (href: string) => boolean;
	hasActiveItem: (section: NavSection) => boolean;
}

export function Sidebar({
	dashboardItem,
	navSections,
	mobileMenuOpen,
	sidebarCollapsed,
	expandedSections,
	onToggleSidebar,
	onCloseMobileMenu,
	onToggleSection,
	isItemActive,
	hasActiveItem,
}: SidebarProps) {
	return (
		<aside
			className={cn(
				"fixed inset-y-0 left-0 z-50 flex-col border-r border-border bg-card transition-all duration-300 lg:relative lg:translate-x-0",
				sidebarCollapsed ? "w-16" : "w-56",
				mobileMenuOpen ? "flex translate-x-0" : "hidden lg:flex -translate-x-full lg:translate-x-0",
			)}
		>
			<div className="flex h-14 items-center justify-between border-b border-border px-3 gap-2">
				<Link
					to="/"
					className={cn(
						"flex items-center gap-2 transition-opacity flex-1 min-w-0",
						sidebarCollapsed ? "justify-center flex-1" : "",
					)}
					title={sidebarCollapsed ? t`Blumberg Supply Chain` : undefined}
				>
					<div className="flex size-8 items-center justify-center rounded-md bg-primary shrink-0">
						<Gauge className="size-5 text-primary-foreground" />
					</div>
					{!sidebarCollapsed && (
						<div className="flex flex-col min-w-0">
							<span className="text-sm font-semibold text-foreground truncate">Blumberg</span>
							<span className="text-[10px] text-muted-foreground leading-tight truncate">
								{t`Supply Chain`}
							</span>
						</div>
					)}
				</Link>
				<div className="flex items-center gap-0.5 shrink-0">
					<Button
						variant="ghost"
						size="sm"
						className="hidden lg:flex h-8 w-8 p-0 hover:bg-muted -mr-1"
						onClick={onToggleSidebar}
						title={sidebarCollapsed ? t`Expand sidebar` : t`Collapse sidebar`}
					>
						{sidebarCollapsed ? (
							<ChevronRight className="size-4" />
						) : (
							<ChevronLeft className="size-4" />
						)}
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className="lg:hidden h-8 w-8 p-0"
						onClick={onCloseMobileMenu}
						aria-label={t`Close menu`}
					>
						<X className="size-5" />
					</Button>
				</div>
			</div>

			<nav className="flex-1 p-3 overflow-y-auto">
				<ul className="space-y-2">
					<li>
						<Link
							to={dashboardItem.href}
							className={cn(
								"flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
								sidebarCollapsed ? "justify-center" : "gap-3",
								isItemActive(dashboardItem.href)
									? "bg-primary text-primary-foreground"
									: "text-muted-foreground hover:bg-muted hover:text-foreground",
							)}
							onClick={onCloseMobileMenu}
							aria-current={isItemActive(dashboardItem.href) ? "page" : undefined}
							title={sidebarCollapsed ? dashboardItem.label : undefined}
						>
							<span className="shrink-0">{dashboardItem.icon}</span>
							{!sidebarCollapsed && <span>{dashboardItem.label}</span>}
						</Link>
					</li>

					{navSections.map((navSection) => {
						const isExpanded = expandedSections[navSection.section] || false;
						const sectionHasActiveItem = hasActiveItem(navSection);

						return (
							<li key={navSection.section}>
								<Collapsible
									open={sidebarCollapsed ? true : isExpanded}
									onOpenChange={() => !sidebarCollapsed && onToggleSection(navSection.section)}
								>
									{!sidebarCollapsed ? (
										<CollapsibleTrigger asChild>
											<Button
												variant="ghost"
												className={cn(
													"w-full justify-between px-3 py-2 h-auto font-normal hover:bg-muted",
													sectionHasActiveItem && "bg-muted/50",
												)}
											>
												<h2
													className={cn(
														"text-[10px] font-semibold uppercase tracking-wider",
														sectionHasActiveItem ? "text-foreground" : "text-muted-foreground",
													)}
												>
													{navSection.section}
												</h2>
												{isExpanded ? (
													<ChevronDown className="size-3 text-muted-foreground" />
												) : (
													<ChevronRight className="size-3 text-muted-foreground" />
												)}
											</Button>
										</CollapsibleTrigger>
									) : (
										<div className="px-3 py-2">
											<div
												className={cn(
													"size-1 rounded-full mx-auto",
													sectionHasActiveItem ? "bg-foreground" : "bg-muted-foreground/30",
												)}
											/>
										</div>
									)}

									{!sidebarCollapsed && (
										<CollapsibleContent>
											<ul className="space-y-1 mt-1">
												{navSection.items.map((item) => {
													const isActive = isItemActive(item.href);
													return (
														<li key={item.label}>
															<Link
																to={item.href}
																className={cn(
																	"flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
																	isActive
																		? "bg-primary text-primary-foreground"
																		: "text-muted-foreground hover:bg-muted hover:text-foreground",
																)}
																onClick={onCloseMobileMenu}
																aria-current={isActive ? "page" : undefined}
															>
																{item.icon}
																{item.label}
															</Link>
														</li>
													);
												})}
											</ul>
										</CollapsibleContent>
									)}

									{sidebarCollapsed && isExpanded && (
										<div className="space-y-1 mt-1">
											{navSection.items.map((item) => {
												const isActive = isItemActive(item.href);
												return (
													<Link
														key={item.label}
														to={item.href}
														className={cn(
															"flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors relative group",
															isActive
																? "bg-primary text-primary-foreground"
																: "text-muted-foreground hover:bg-muted hover:text-foreground",
														)}
														onClick={onCloseMobileMenu}
														aria-current={isActive ? "page" : undefined}
														title={item.label}
													>
														{item.icon}
														<span className="absolute left-full ml-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
															{item.label}
														</span>
													</Link>
												);
											})}
										</div>
									)}
								</Collapsible>
							</li>
						);
					})}
				</ul>
			</nav>

			{!sidebarCollapsed ? (
				<SidebarStatus />
			) : (
				<div className="border-t border-border p-2">
					<div className="flex items-center justify-center">
						<span
							className="size-2 rounded-full bg-emerald-500"
							title={t`All systems operational`}
						/>
					</div>
				</div>
			)}
		</aside>
	);
}

function SidebarStatus() {
	return (
		<div className="border-t border-border p-3">
			<div className="rounded-md bg-muted p-3">
				<p className="text-xs font-medium text-foreground">{t`System Status`}</p>
				<p className="mt-1 text-xs text-muted-foreground">{t`All systems operational`}</p>
				<div className="mt-2 flex items-center gap-1.5">
					<span className="size-2 rounded-full bg-emerald-500" />
					<span className="text-xs text-muted-foreground">{t`34 sensors active`}</span>
				</div>
			</div>
		</div>
	);
}
