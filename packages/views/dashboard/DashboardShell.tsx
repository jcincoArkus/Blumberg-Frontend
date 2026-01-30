import {
	Activity,
	Bell,
	Building2,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	FileText,
	Gauge,
	LayoutDashboard,
	Menu,
	Server,
	Settings,
	Upload,
	Users,
	X,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";

import { Button, Collapsible, CollapsibleContent, CollapsibleTrigger, cn } from "~@/ui";

export type Domain = "All" | "Energy" | "Climate" | "Refrigeration" | "Equipment";

interface NavItem {
	label: string;
	href: string;
	icon: ReactNode;
}

interface NavSection {
	section: string;
	items: NavItem[];
}

const dashboardItem: NavItem = {
	label: "Dashboards",
	href: "/",
	icon: <LayoutDashboard className="size-5" />,
};

const navSections: NavSection[] = [
	{
		section: "OPERATIONS",
		items: [
			{
				label: "Monitoring",
				href: "/monitoring/sensor-health",
				icon: <Activity className="size-5" />,
			},
			{ label: "Alerts", href: "/alerts", icon: <Bell className="size-5" /> },
			{ label: "Sites", href: "/sites", icon: <Building2 className="size-5" /> },
			{
				label: "Equipment Overview",
				href: "/equipment-overview",
				icon: <Server className="size-5" />,
			},
		],
	},
	{
		section: "ANALYTICS",
		items: [
			{
				label: "Historical Reports",
				href: "/reports/history",
				icon: <FileText className="size-5" />,
			},
		],
	},
	{
		section: "PLATFORM",
		items: [
			{ label: "Data Ingestion", href: "/ingestion", icon: <Upload className="size-5" /> },
			{ label: "Configuration", href: "/config/sensors", icon: <Settings className="size-5" /> },
			{ label: "User Management", href: "/admin/users", icon: <Users className="size-5" /> },
		],
	},
];

const domainTabs: Domain[] = ["All", "Energy", "Climate", "Refrigeration", "Equipment"];

interface DashboardShellProps {
	children: ReactNode;
	/** Active domain filter - will be controlled by MobX ViewModel */
	activeDomain?: Domain;
	/** Callback when domain changes - will be controlled by MobX ViewModel */
	onDomainChange?: (domain: Domain) => void;
	/** Whether to show domain tabs in header */
	showDomainTabs?: boolean;
}

export function DashboardShell({
	children,
	activeDomain: controlledDomain,
	onDomainChange,
	showDomainTabs = true,
}: DashboardShellProps) {
	const location = useLocation();
	const pathname = location.pathname;
	// Local state for uncontrolled mode (temporary until MobX integration)
	const [localDomain, setLocalDomain] = useState<Domain>("All");
	const activeDomain = controlledDomain ?? localDomain;
	const setActiveDomain = onDomainChange ?? setLocalDomain;
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
		if (typeof window !== "undefined") {
			return localStorage.getItem("sidebarCollapsed") === "true";
		}
		return false;
	});

	useEffect(() => {
		if (typeof window !== "undefined") {
			localStorage.setItem("sidebarCollapsed", String(sidebarCollapsed));
		}
	}, [sidebarCollapsed]);

	const isItemActive = (itemHref: string): boolean => {
		if (itemHref === "/") return pathname === "/" || pathname.startsWith("/equipment/");
		if (itemHref === "/sites") return pathname === "/sites" || pathname.startsWith("/site/");
		if (itemHref === "/monitoring/sensor-health") return pathname.startsWith("/monitoring");
		if (itemHref.startsWith("/config")) return pathname.startsWith("/config");
		if (itemHref === "/ingestion") return pathname.startsWith("/ingestion");
		if (itemHref.startsWith("/admin")) return pathname.startsWith("/admin");
		if (itemHref.startsWith("/reports")) return pathname.startsWith("/reports");
		return pathname === itemHref;
	};

	const hasActiveItem = (section: NavSection) =>
		section.items.some((item) => isItemActive(item.href));

	const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
		const initial: Record<string, boolean> = {};
		for (const section of navSections) {
			initial[section.section] = true; // All sections expanded by default
		}
		return initial;
	});

	useEffect(() => {
		setExpandedSections((prev) => {
			const updated = { ...prev };
			for (const section of navSections) {
				if (hasActiveItem(section)) updated[section.section] = true;
			}
			return updated;
		});
	}, [pathname]);

	const toggleSection = (section: string) => {
		setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
	};

	const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

	return (
		<div className="flex h-screen bg-background">
			{/* Left Sidebar */}
			<aside
				className={cn(
					"fixed inset-y-0 left-0 z-50 flex-col border-r border-border bg-card transition-all duration-300 lg:relative lg:translate-x-0",
					sidebarCollapsed ? "w-16" : "w-56",
					mobileMenuOpen
						? "flex translate-x-0"
						: "hidden lg:flex -translate-x-full lg:translate-x-0",
				)}
			>
				{/* Logo */}
				<div className="flex h-14 items-center justify-between border-b border-border px-3 gap-2">
					<Link
						to="/"
						className={cn(
							"flex items-center gap-2 transition-opacity flex-1 min-w-0",
							sidebarCollapsed ? "justify-center flex-1" : "",
						)}
						title={sidebarCollapsed ? "Blumberg Supply Chain" : undefined}
					>
						<div className="flex size-8 items-center justify-center rounded-md bg-primary flex-shrink-0">
							<Gauge className="size-5 text-primary-foreground" />
						</div>
						{!sidebarCollapsed && (
							<div className="flex flex-col min-w-0">
								<span className="text-sm font-semibold text-foreground truncate">Blumberg</span>
								<span className="text-[10px] text-muted-foreground leading-tight truncate">
									Supply Chain
								</span>
							</div>
						)}
					</Link>
					<div className="flex items-center gap-0.5 flex-shrink-0">
						<Button
							variant="ghost"
							size="sm"
							className="hidden lg:flex h-8 w-8 p-0 hover:bg-muted -mr-1"
							onClick={toggleSidebar}
							title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
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
							onClick={() => setMobileMenuOpen(false)}
						>
							<X className="size-5" />
						</Button>
					</div>
				</div>

				{/* Navigation */}
				<nav className="flex-1 p-3 overflow-y-auto">
					<ul className="space-y-2">
						{/* Dashboard Item */}
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
								onClick={() => setMobileMenuOpen(false)}
								aria-current={isItemActive(dashboardItem.href) ? "page" : undefined}
								title={sidebarCollapsed ? dashboardItem.label : undefined}
							>
								<span className="flex-shrink-0">{dashboardItem.icon}</span>
								{!sidebarCollapsed && <span>{dashboardItem.label}</span>}
							</Link>
						</li>

						{/* Collapsible Sections */}
						{navSections.map((navSection) => {
							const isExpanded = expandedSections[navSection.section] || false;
							const sectionHasActiveItem = hasActiveItem(navSection);

							return (
								<li key={navSection.section}>
									<Collapsible
										open={sidebarCollapsed ? true : isExpanded}
										onOpenChange={() => !sidebarCollapsed && toggleSection(navSection.section)}
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
																	onClick={() => setMobileMenuOpen(false)}
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
															onClick={() => setMobileMenuOpen(false)}
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

				{/* Bottom Section */}
				{!sidebarCollapsed && (
					<div className="border-t border-border p-3">
						<div className="rounded-md bg-muted p-3">
							<p className="text-xs font-medium text-foreground">System Status</p>
							<p className="mt-1 text-xs text-muted-foreground">All systems operational</p>
							<div className="mt-2 flex items-center gap-1.5">
								<span className="size-2 rounded-full bg-emerald-500" />
								<span className="text-xs text-muted-foreground">34 sensors active</span>
							</div>
						</div>
					</div>
				)}
				{sidebarCollapsed && (
					<div className="border-t border-border p-2">
						<div className="flex items-center justify-center">
							<span
								className="size-2 rounded-full bg-emerald-500"
								title="All systems operational"
							/>
						</div>
					</div>
				)}
			</aside>

			{/* Main Content Area */}
			<div
				className={cn(
					"flex flex-1 flex-col overflow-hidden transition-all duration-300",
					sidebarCollapsed ? "lg:ml-0" : "",
				)}
			>
				{/* Top Header */}
				<header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
					<div className="flex items-center gap-4">
						<Button
							variant="ghost"
							size="sm"
							className="lg:hidden"
							onClick={() => setMobileMenuOpen(true)}
						>
							<Menu className="size-5" />
						</Button>

						{/* Domain Tabs */}
						{showDomainTabs && (
							<div className="hidden md:flex items-center gap-1">
								{domainTabs.map((tab) => (
									<button
										key={tab}
										type="button"
										onClick={() => setActiveDomain(tab)}
										className={cn(
											"px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
											activeDomain === tab
												? "bg-primary text-primary-foreground"
												: "text-muted-foreground hover:bg-muted hover:text-foreground",
										)}
									>
										{tab}
									</button>
								))}
							</div>
						)}
					</div>
				</header>

				{/* Page Content */}
				<main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
			</div>

			{/* Mobile Menu Overlay */}
			{mobileMenuOpen && (
				<div
					className="fixed inset-0 z-40 bg-black/50 lg:hidden"
					onClick={() => setMobileMenuOpen(false)}
					onKeyDown={(e) => e.key === "Escape" && setMobileMenuOpen(false)}
					role="button"
					tabIndex={0}
					aria-label="Close menu"
				/>
			)}
		</div>
	);
}
