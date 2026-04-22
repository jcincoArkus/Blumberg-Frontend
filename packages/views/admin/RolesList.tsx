import { Plus, Shield } from "lucide-react";
import { useMemo } from "react";

import { t } from "~@/i18n/macro";
import {
	Badge,
	Button,
	cn,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~@/ui";

import type { Role, RoleType } from "./types";

export interface RolesListProps {
	roles: Role[];
	getUserCountByRole: (roleId: string) => number;
	onSelectRole?: (role: Role) => void;
	onCreateRole?: () => void;
	selectedRoleId?: string;
}

export function RolesList({
	roles,
	getUserCountByRole,
	onSelectRole,
	onCreateRole,
	selectedRoleId,
}: RolesListProps) {
	const sortedRoles = useMemo(() => {
		return [...roles].sort((a, b) => {
			// Managed roles first, then custom
			if (a.type !== b.type) {
				return a.type === "managed" ? -1 : 1;
			}
			return a.name.localeCompare(b.name);
		});
	}, [roles]);

	const getTypeBadge = (type: RoleType) => {
		const config = {
			managed: {
				label: t`Managed`,
				className:
					"bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
			},
			custom: {
				label: t`Custom`,
				className:
					"bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
			},
		};
		const cfg = config[type];
		return (
			<Badge variant="outline" className={cn("border text-xs", cfg.className)}>
				{cfg.label}
			</Badge>
		);
	};

	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Shield className="size-5 text-muted-foreground" aria-hidden="true" />
					<h3 className="text-lg font-semibold">{t`Roles`}</h3>
				</div>
				{onCreateRole && (
					<Button onClick={onCreateRole} size="sm">
						<Plus className="size-4 mr-2" aria-hidden="true" />
						{t`New Role`}
					</Button>
				)}
			</div>

			{/* Roles Table */}
			<div className="rounded-lg border bg-card">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>{t`Role Name`}</TableHead>
							<TableHead>{t`Type`}</TableHead>
							<TableHead className="text-right">{t`Number of Users`}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{sortedRoles.map((role) => {
							const userCount = getUserCountByRole(role.id);
							const isSelected = selectedRoleId === role.id;

							return (
								<TableRow
									key={role.id}
									className={cn("cursor-pointer transition-colors", isSelected && "bg-accent")}
									onClick={() => onSelectRole?.(role)}
								>
									<TableCell className="font-medium">
										<div className="flex flex-col">
											<span>{role.name}</span>
											{role.description && (
												<span className="text-xs text-muted-foreground">{role.description}</span>
											)}
										</div>
									</TableCell>
									<TableCell>{getTypeBadge(role.type)}</TableCell>
									<TableCell className="text-right tabular-nums">{userCount}</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
