import {
	Activity,
	ArrowLeftRight,
	Bell,
	Box,
	Building2,
	FileText,
	Gauge,
	Layers,
	LayoutDashboard,
	Server,
	Settings,
	Tag,
	Truck,
	Upload,
	Users,
} from "lucide-react";

import { t } from "~@/i18n/macro";

import type { Domain, DomainKey, NavItem, NavSection } from "./types";

export const domainKeys: DomainKey[] = ["all", "energy", "climate", "refrigeration", "equipment"];

export const domainKeyToValue: Record<DomainKey, Domain> = {
	all: "All",
	energy: "Energy",
	climate: "Climate",
	refrigeration: "Refrigeration",
	equipment: "Equipment",
};

export const domainLabels: Record<DomainKey, string> = {
	all: t`All`,
	energy: t`Energy`,
	climate: t`Climate`,
	refrigeration: t`Refrigeration`,
	equipment: t`Equipment`,
};

export const dashboardItem: NavItem = {
	label: t`Dashboards`,
	href: "/",
	icon: <LayoutDashboard className="size-5" />,
};

export const navSections: NavSection[] = [
	{
		section: t`OPERATIONS`,
		items: [
			{
				label: t`Monitoring`,
				href: "/monitoring/sensor-health",
				icon: <Activity className="size-5" />,
			},
			{ label: t`Alerts`, href: "/alerts", icon: <Bell className="size-5" /> },
			{ label: t`Sites`, href: "/sites", icon: <Building2 className="size-5" /> },
			{ label: t`Equipment`, href: "/equipment", icon: <Server className="size-5" /> },
			{
				label: t`Sensors`,
				href: "/sensors",
				icon: <Activity className="size-5" />,
			},
			{
				label: t`Equipment Overview`,
				href: "/equipment-overview",
				icon: <Server className="size-5" />,
			},
		],
	},
	{
		section: t`INVENTORY`,
		items: [
			{
				label: t`Dashboard`,
				href: "/inventory/dashboard",
				icon: <Gauge className="size-5" />,
			},
			{
				label: t`Inventory`,
				href: "/inventory",
				icon: <Box className="size-5" />,
			},
			{
				label: t`Intake`,
				href: "/inventory/intake",
				icon: <Truck className="size-5" />,
			},
			{
				label: t`Movements`,
				href: "/inventory/movements",
				icon: <ArrowLeftRight className="size-5" />,
			},
			{
				label: t`Products`,
				href: "/inventory/products",
				icon: <Tag className="size-5" />,
			},
			{
				label: t`Lots`,
				href: "/inventory/lots",
				icon: <Layers className="size-5" />,
			},
		],
	},
	{
		section: t`ANALYTICS`,
		items: [
			{
				label: t`Historical Reports`,
				href: "/reports/history",
				icon: <FileText className="size-5" />,
			},
		],
	},
	{
		section: t`PLATFORM`,
		items: [
			{ label: t`Data Ingestion`, href: "/ingestion", icon: <Upload className="size-5" /> },
			{
				label: t`Configuration`,
				href: "/config/sensors",
				icon: <Settings className="size-5" />,
			},
			{ label: t`User Management`, href: "/admin/users", icon: <Users className="size-5" /> },
		],
	},
];
