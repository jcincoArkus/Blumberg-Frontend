import { ChevronDown, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { t } from "~@/i18n/macro";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
	Button,
	Checkbox,
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "~@/ui";

import type { PermissionAccess, PermissionCategory, Role, RolePermissions } from "./types";

export interface RolePermissionsEditorProps {
	role: Role;
	rolePermissions: RolePermissions;
	onPermissionsChange?: (roleId: string, categories: PermissionCategory[]) => void;
	onEditRole?: (role: Role) => void;
	onDeleteRole?: (roleId: string) => void;
	readOnly?: boolean;
}

export function RolePermissionsEditor({
	role,
	rolePermissions,
	onPermissionsChange,
	onEditRole,
	onDeleteRole,
	readOnly = false,
}: RolePermissionsEditorProps) {
	const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

	const isManaged = role.type === "managed";
	const isEditable = !isManaged && !readOnly;

	const toggleCategory = (categoryId: string) => {
		setExpandedCategories((prev) => {
			const next = new Set(prev);
			if (next.has(categoryId)) {
				next.delete(categoryId);
			} else {
				next.add(categoryId);
			}
			return next;
		});
	};

	const getCategoryCounts = (category: PermissionCategory) => {
		const readCount = category.permissions.filter(
			(p) => p.access === "read" || p.access === "write",
		).length;
		const writeCount = category.permissions.filter((p) => p.access === "write").length;
		return { readCount, writeCount };
	};

	const handlePermissionChange = (
		categoryId: string,
		permissionId: string,
		newAccess: PermissionAccess,
	) => {
		if (!isEditable || !onPermissionsChange) return;

		const updatedCategories = rolePermissions.categories.map((cat) => {
			if (cat.id !== categoryId) return cat;
			return {
				...cat,
				permissions: cat.permissions.map((perm) => {
					if (perm.id !== permissionId) return perm;
					return { ...perm, access: newAccess };
				}),
			};
		});

		onPermissionsChange(role.id, updatedCategories);
	};

	const totalCounts = useMemo(() => {
		let read = 0;
		let write = 0;
		for (const cat of rolePermissions.categories) {
			const counts = getCategoryCounts(cat);
			read += counts.readCount;
			write += counts.writeCount;
		}
		return { read, write };
	}, [rolePermissions]);

	const isCustomRole = role.type === "custom";

	return (
		<div className="space-y-3">
			{/* Header */}
			<div className="flex items-center justify-between border-b pb-3">
				<div>
					<h3 className="text-base font-semibold">{role.name}</h3>
					{role.description && <p className="text-xs text-muted-foreground">{role.description}</p>}
				</div>
				<div className="flex items-center gap-3">
					<div className="flex items-center gap-2 text-xs text-muted-foreground">
						<span>{t`${totalCounts.read} Read`}</span>
						<span>{t`${totalCounts.write} Write`}</span>
					</div>
					{isCustomRole && (
						<div className="flex items-center gap-1 ml-2">
							{onEditRole && (
								<Button
									variant="ghost"
									size="icon-sm"
									onClick={() => onEditRole(role)}
									aria-label={t`Edit role`}
								>
									<Pencil className="size-4" />
								</Button>
							)}
							{onDeleteRole && (
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<Button
											variant="ghost"
											size="icon-sm"
											className="text-destructive hover:text-destructive"
											aria-label={t`Delete role`}
										>
											<Trash2 className="size-4" />
										</Button>
									</AlertDialogTrigger>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>{t`Delete Role`}</AlertDialogTitle>
											<AlertDialogDescription>
												{t`Are you sure you want to delete "${role.name}"? This action cannot be undone. Users with this role will lose these permissions.`}
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel>{t`Cancel`}</AlertDialogCancel>
											<AlertDialogAction
												onClick={() => onDeleteRole(role.id)}
												className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
											>
												{t`Delete`}
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							)}
						</div>
					)}
				</div>
			</div>

			{/* Permission Categories */}
			<div className="space-y-1">
				{rolePermissions.categories.map((category) => {
					const isExpanded = expandedCategories.has(category.id);
					const counts = getCategoryCounts(category);

					return (
						<Collapsible
							key={category.id}
							open={isExpanded}
							onOpenChange={() => toggleCategory(category.id)}
						>
							<CollapsibleTrigger asChild>
								<Button
									variant="ghost"
									className="w-full justify-between h-auto py-2 px-3 hover:bg-accent"
								>
									<div className="flex items-center gap-2">
										{isExpanded ? (
											<ChevronDown className="size-3.5 text-muted-foreground" />
										) : (
											<ChevronRight className="size-3.5 text-muted-foreground" />
										)}
										<span className="text-sm font-medium">{category.name}</span>
									</div>
									<div className="flex items-center gap-2 text-xs text-muted-foreground">
										<span>{t`${counts.readCount} Read`}</span>
										<span>-</span>
										<span>{t`${counts.writeCount} Write`}</span>
									</div>
								</Button>
							</CollapsibleTrigger>
							<CollapsibleContent>
								<div className="ml-6 border-l pl-3 py-1 space-y-0.5">
									{category.permissions.map((permission) => (
										<PermissionRow
											key={permission.id}
											permission={permission}
											isEditable={isEditable}
											onAccessChange={(access) =>
												handlePermissionChange(category.id, permission.id, access)
											}
										/>
									))}
								</div>
							</CollapsibleContent>
						</Collapsible>
					);
				})}
			</div>
		</div>
	);
}

// Permission Row Component
interface PermissionRowProps {
	permission: {
		id: string;
		name: string;
		description?: string;
		access: PermissionAccess;
	};
	isEditable: boolean;
	onAccessChange: (access: PermissionAccess) => void;
}

function PermissionRow({ permission, isEditable, onAccessChange }: PermissionRowProps) {
	const isRead = permission.access === "read" || permission.access === "write";
	const isWrite = permission.access === "write";

	const handleReadChange = (checked: boolean) => {
		if (!isEditable) return;
		if (checked) {
			onAccessChange("read");
		} else {
			onAccessChange("none");
		}
	};

	const handleWriteChange = (checked: boolean) => {
		if (!isEditable) return;
		if (checked) {
			onAccessChange("write");
		} else if (isRead) {
			onAccessChange("read");
		} else {
			onAccessChange("none");
		}
	};

	return (
		<div className="flex items-center justify-between py-1 px-2 rounded hover:bg-muted/50">
			<span className="text-xs">{permission.name}</span>
			<div className="flex items-center gap-3">
				<label className="flex items-center gap-1.5 cursor-pointer">
					<Checkbox
						checked={isRead}
						onCheckedChange={handleReadChange}
						disabled={!isEditable}
						className="size-3.5"
						aria-label={t`${permission.name} Read access`}
					/>
					<span className="text-[11px] text-muted-foreground">{t`Read`}</span>
				</label>
				<label className="flex items-center gap-1.5 cursor-pointer">
					<Checkbox
						checked={isWrite}
						onCheckedChange={handleWriteChange}
						disabled={!isEditable}
						className="size-3.5"
						aria-label={t`${permission.name} Write access`}
					/>
					<span className="text-[11px] text-muted-foreground">{t`Write`}</span>
				</label>
			</div>
		</div>
	);
}
