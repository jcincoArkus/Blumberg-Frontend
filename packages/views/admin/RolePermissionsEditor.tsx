import { ChevronDown, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import {
	Badge,
	Button,
	Checkbox,
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
	cn,
} from "~@/ui";

import type { PermissionAccess, PermissionCategory, Role, RolePermissions } from "./types";

export interface RolePermissionsEditorProps {
	role: Role;
	rolePermissions: RolePermissions;
	onPermissionsChange?: (roleId: string, categories: PermissionCategory[]) => void;
	readOnly?: boolean;
}

export function RolePermissionsEditor({
	role,
	rolePermissions,
	onPermissionsChange,
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

	return (
		<div className="space-y-3">
			{/* Header */}
			<div className="flex items-center justify-between border-b pb-3">
				<div>
					<h3 className="text-base font-semibold">{role.name}</h3>
					{role.description && <p className="text-xs text-muted-foreground">{role.description}</p>}
				</div>
				<div className="flex items-center gap-3 text-xs text-muted-foreground">
					<span>{totalCounts.read} Read</span>
					<span>{totalCounts.write} Write</span>
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
										<span>{counts.readCount} Read</span>
										<span>-</span>
										<span>{counts.writeCount} Write</span>
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
						aria-label={`${permission.name} Read access`}
					/>
					<span className="text-[11px] text-muted-foreground">Read</span>
				</label>
				<label className="flex items-center gap-1.5 cursor-pointer">
					<Checkbox
						checked={isWrite}
						onCheckedChange={handleWriteChange}
						disabled={!isEditable}
						className="size-3.5"
						aria-label={`${permission.name} Write access`}
					/>
					<span className="text-[11px] text-muted-foreground">Write</span>
				</label>
			</div>
		</div>
	);
}
