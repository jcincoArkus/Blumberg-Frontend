import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";

import type { NavSection } from "./types";

interface UseDashboardShellStateProps {
	navSections: NavSection[];
}

export function useDashboardShellState({ navSections }: UseDashboardShellStateProps) {
	const location = useLocation();
	const pathname = location.pathname;

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

	const isItemActive = useCallback(
		(itemHref: string): boolean => {
			if (itemHref === "/") return pathname === "/" || pathname.startsWith("/home");
			if (itemHref === "/sites") return pathname === "/sites" || pathname.startsWith("/sites/");
			if (itemHref === "/equipment")
				return pathname === "/equipment" || pathname.startsWith("/equipment/");
			if (itemHref === "/sensors")
				return pathname === "/sensors" || pathname.startsWith("/sensors/");
			if (itemHref === "/monitoring/sensor-health") return pathname.startsWith("/monitoring");
			if (itemHref.startsWith("/config")) return pathname.startsWith("/config");
			if (itemHref === "/ingestion") return pathname.startsWith("/ingestion");
			if (itemHref.startsWith("/admin")) return pathname.startsWith("/admin");
			if (itemHref.startsWith("/reports")) return pathname.startsWith("/reports");
			return pathname === itemHref;
		},
		[pathname],
	);

	const hasActiveItem = useCallback(
		(section: NavSection) => section.items.some((item) => isItemActive(item.href)),
		[isItemActive],
	);

	const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
		const initial: Record<string, boolean> = {};
		for (const section of navSections) {
			initial[section.section] = true;
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
	}, [pathname, hasActiveItem, navSections]);

	const toggleSection = (section: string) => {
		setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
	};

	const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

	return useMemo(
		() => ({
			pathname,
			mobileMenuOpen,
			sidebarCollapsed,
			expandedSections,
			setMobileMenuOpen,
			toggleSidebar,
			toggleSection,
			isItemActive,
			hasActiveItem,
		}),
		[pathname, mobileMenuOpen, sidebarCollapsed, expandedSections, isItemActive, hasActiveItem],
	);
}
