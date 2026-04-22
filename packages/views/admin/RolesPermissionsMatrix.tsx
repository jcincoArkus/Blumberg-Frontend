import { Check } from "lucide-react";

import { t } from "~@/i18n/macro";
import { Badge, cn, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~@/ui";

import type { LegacyRolePermissions, ModuleName, PermissionAction, UserRole } from "./types";

const getModuleLabels = (): Record<ModuleName, string> => ({
	system_overview: t`System Overview`,
	site_overview: t`Site / Facility Overview`,
	equipment_overview: t`Equipment Overview`,
	alerts_events: t`Alerts & Events`,
	alerting_config: t`Alerting Configuration`,
	sensor_management: t`Sensor Management`,
	sensor_health: t`Sensor Health & Data Quality`,
	data_ingestion: t`Data Ingestion`,
	user_management: t`User & Role Management`,
	historical_reports: t`Historical Reports`,
});

const getActionLabels = (): Record<PermissionAction, string> => ({
	view: t`View`,
	create: t`Create`,
	edit: t`Edit`,
	delete: t`Delete`,
	configure: t`Configure`,
	ack_resolve: t`Ack/Resolve`,
});

export interface RolesPermissionsMatrixProps {
	rolePermissions: LegacyRolePermissions[];
}

export function RolesPermissionsMatrix({ rolePermissions }: RolesPermissionsMatrixProps) {
	const roles: UserRole[] = ["admin", "operator", "viewer"];
	const moduleLabels = getModuleLabels();
	const actionLabels = getActionLabels();

	const getActionsForRoleAndModule = (role: UserRole, module: ModuleName): PermissionAction[] => {
		const rolePerms = rolePermissions.find((rp) => rp.role === role);
		const modulePerms = rolePerms?.permissions.find((p) => p.module === module);
		return modulePerms?.actions || [];
	};

	const getRoleBadge = (role: UserRole) => {
		const config = {
			admin: { label: t`Admin`, className: "bg-purple-100 text-purple-700 border-purple-200" },
			operator: { label: t`Operator`, className: "bg-blue-100 text-blue-700 border-blue-200" },
			viewer: { label: t`Viewer`, className: "bg-slate-100 text-slate-700 border-slate-200" },
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
							<TableHead className="w-50">{t`Module`}</TableHead>
							{roles.map((role) => (
								<TableHead key={role} className="text-center min-w-50">
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
												<span className="text-xs text-muted-foreground">{t`No access`}</span>
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
				<p className="font-medium mb-2">{t`Permission Actions:`}</p>
				<ul className="list-disc list-inside space-y-1">
					<li>
						<strong>{t`View`}:</strong> {t`Read-only access to view module content`}
					</li>
					<li>
						<strong>{t`Create`}:</strong> {t`Ability to create new records`}
					</li>
					<li>
						<strong>{t`Edit`}:</strong> {t`Ability to modify existing records`}
					</li>
					<li>
						<strong>{t`Delete`}:</strong> {t`Ability to remove records`}
					</li>
					<li>
						<strong>{t`Configure`}:</strong> {t`Ability to change module settings`}
					</li>
					<li>
						<strong>{t`Ack/Resolve`}:</strong> {t`Ability to acknowledge or resolve alerts`}
					</li>
				</ul>
			</div>
		</div>
	);
}
