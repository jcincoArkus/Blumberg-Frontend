import { Check } from "lucide-react";

import { Badge, cn, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~@/ui";

import type { LegacyRolePermissions, ModuleName, PermissionAction, UserRole } from "./types";

const moduleLabels: Record<ModuleName, string> = {
	system_overview: "System Overview",
	site_overview: "Site / Facility Overview",
	equipment_overview: "Equipment Overview",
	alerts_events: "Alerts & Events",
	alerting_config: "Alerting Configuration",
	sensor_management: "Sensor Management",
	sensor_health: "Sensor Health & Data Quality",
	data_ingestion: "Data Ingestion",
	user_management: "User & Role Management",
	historical_reports: "Historical Reports",
};

const actionLabels: Record<PermissionAction, string> = {
	view: "View",
	create: "Create",
	edit: "Edit",
	delete: "Delete",
	configure: "Configure",
	ack_resolve: "Ack/Resolve",
};

export interface RolesPermissionsMatrixProps {
	rolePermissions: LegacyRolePermissions[];
}

export function RolesPermissionsMatrix({ rolePermissions }: RolesPermissionsMatrixProps) {
	const roles: UserRole[] = ["admin", "operator", "viewer"];

	const getActionsForRoleAndModule = (role: UserRole, module: ModuleName): PermissionAction[] => {
		const rolePerms = rolePermissions.find((rp) => rp.role === role);
		const modulePerms = rolePerms?.permissions.find((p) => p.module === module);
		return modulePerms?.actions || [];
	};

	const getRoleBadge = (role: UserRole) => {
		const config = {
			admin: { label: "Admin", className: "bg-purple-100 text-purple-700 border-purple-200" },
			operator: { label: "Operator", className: "bg-blue-100 text-blue-700 border-blue-200" },
			viewer: { label: "Viewer", className: "bg-slate-100 text-slate-700 border-slate-200" },
		};
		const cfg = config[role];
		return (
			<Badge variant="outline" className={cn("border", cfg.className)}>
				{cfg.label}
			</Badge>
		);
	};

	return (
		<div className="space-y-4">
			<div className="rounded-lg border bg-card overflow-x-auto">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[200px]">Module</TableHead>
							{roles.map((role) => (
								<TableHead key={role} className="text-center min-w-[200px]">
									{getRoleBadge(role)}
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{(Object.keys(moduleLabels) as ModuleName[]).map((module) => (
							<TableRow key={module}>
								<TableCell className="font-medium">{moduleLabels[module]}</TableCell>
								{roles.map((role) => {
									const actions = getActionsForRoleAndModule(role, module);
									return (
										<TableCell key={role} className="text-center">
											{actions.length > 0 ? (
												<div className="flex flex-wrap gap-1 justify-center">
													{actions.map((action) => (
														<Badge
															key={action}
															variant="outline"
															className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200"
														>
															<Check className="size-3 mr-0.5" aria-hidden="true" />
															{actionLabels[action]}
														</Badge>
													))}
												</div>
											) : (
												<span className="text-xs text-muted-foreground">No access</span>
											)}
										</TableCell>
									);
								})}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			<div className="text-sm text-muted-foreground">
				<p className="font-medium mb-2">Permission Actions:</p>
				<ul className="list-disc list-inside space-y-1">
					<li>
						<strong>View:</strong> Read-only access to view module content
					</li>
					<li>
						<strong>Create:</strong> Ability to create new records
					</li>
					<li>
						<strong>Edit:</strong> Ability to modify existing records
					</li>
					<li>
						<strong>Delete:</strong> Ability to remove records
					</li>
					<li>
						<strong>Configure:</strong> Ability to change module settings
					</li>
					<li>
						<strong>Ack/Resolve:</strong> Ability to acknowledge or resolve alerts
					</li>
				</ul>
			</div>
		</div>
	);
}
