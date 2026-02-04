import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { t } from "~@/i18n/macro";
import {
	Button,
	Checkbox,
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	Input,
	Textarea,
} from "~@/ui";

import type { PermissionAccess, PermissionCategory, Role, RolePermissions } from "./types";

const getFormSchema = () =>
	z.object({
		name: z.string().min(2, { message: t`Name must be at least 2 characters.` }),
		description: z.string().optional(),
	});

type FormValues = z.infer<typeof formSchema>;

export interface RoleEditorDialogProps {
	role: Role | null;
	rolePermissions: RolePermissions | null;
	defaultCategories: PermissionCategory[];
	onCancel: () => void;
	onSave: (role: Role, permissions: RolePermissions) => void;
}

export function RoleEditorDialog({
	role,
	rolePermissions,
	defaultCategories,
	onCancel,
	onSave,
}: RoleEditorDialogProps) {
	const isEditing = role !== null;
	const formSchema = getFormSchema();

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			description: "",
		},
	});

	// Local state for permissions
	const [categories, setCategories] = useState<PermissionCategory[]>([]);
	// All categories expanded by default
	const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

	useEffect(() => {
		if (role && rolePermissions) {
			form.reset({
				name: role.name,
				description: role.description || "",
			});
			setCategories(rolePermissions.categories);
			// Expand all categories
			setExpandedCategories(new Set(rolePermissions.categories.map((c) => c.id)));
		} else {
			form.reset({
				name: "",
				description: "",
			});
			// Initialize with all permissions set to "none"
			const initialCategories = defaultCategories.map((cat) => ({
				...cat,
				permissions: cat.permissions.map((p) => ({ ...p, access: "none" as PermissionAccess })),
			}));
			setCategories(initialCategories);
			// Expand all categories by default
			setExpandedCategories(new Set(defaultCategories.map((c) => c.id)));
		}
	}, [role, rolePermissions, defaultCategories, form]);

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

	const handlePermissionChange = (
		categoryId: string,
		permissionId: string,
		newAccess: PermissionAccess,
	) => {
		setCategories((prev) =>
			prev.map((cat) => {
				if (cat.id !== categoryId) return cat;
				return {
					...cat,
					permissions: cat.permissions.map((perm) => {
						if (perm.id !== permissionId) return perm;
						return { ...perm, access: newAccess };
					}),
				};
			}),
		);
	};

	const handleSelectAllCategory = (categoryId: string, selectAll: boolean) => {
		setCategories((prev) =>
			prev.map((cat) => {
				if (cat.id !== categoryId) return cat;
				return {
					...cat,
					permissions: cat.permissions.map((perm) => ({
						...perm,
						access: selectAll ? "write" : ("none" as PermissionAccess),
					})),
				};
			}),
		);
	};

	const onSubmit = (values: FormValues) => {
		const now = new Date().toISOString();
		const savedRole: Role = {
			id: role?.id || `role-custom-${Date.now()}`,
			name: values.name,
			type: "custom",
			description: values.description || undefined,
			createdAt: role?.createdAt || now,
			modifiedAt: now,
		};

		const savedPermissions: RolePermissions = {
			roleId: savedRole.id,
			categories,
		};

		onSave(savedRole, savedPermissions);
	};

	const getCategoryCounts = (category: PermissionCategory) => {
		const readCount = category.permissions.filter(
			(p) => p.access === "read" || p.access === "write",
		).length;
		const writeCount = category.permissions.filter((p) => p.access === "write").length;
		return { readCount, writeCount, total: category.permissions.length };
	};

	const isAllSelected = (category: PermissionCategory) => {
		return category.permissions.every((p) => p.access === "write");
	};

	const isSomeSelected = (category: PermissionCategory) => {
		return category.permissions.some((p) => p.access !== "none") && !isAllSelected(category);
	};

	return (
		<div className="flex flex-col h-full">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
					{/* Fixed Header */}
					<div className="shrink-0 space-y-4 pb-4">
						<div className="border-b pb-3">
							<h3 className="text-base font-semibold">
								{isEditing ? t`Edit Role` : t`Create Role`}
							</h3>
							<p className="text-xs text-muted-foreground">
								{isEditing
									? t`Update role information and permissions`
									: t`Create a new custom role`}
							</p>
						</div>

						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t`Role Name`} *</FormLabel>
									<FormControl>
										<Input placeholder={t`e.g., APM Editor`} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t`Description`}</FormLabel>
									<FormControl>
										<Textarea
											placeholder={t`Describe what this role is for...`}
											rows={2}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormLabel className="block">{t`Permissions`}</FormLabel>
					</div>

					{/* Scrollable Permissions */}
					<div className="flex-1 min-h-0 overflow-y-auto rounded-md border">
						<div className="p-2 space-y-1">
							{categories.map((category) => {
								const isExpanded = expandedCategories.has(category.id);
								const counts = getCategoryCounts(category);
								const allSelected = isAllSelected(category);
								const someSelected = isSomeSelected(category);

								return (
									<Collapsible
										key={category.id}
										open={isExpanded}
										onOpenChange={() => toggleCategory(category.id)}
									>
										<div className="flex items-center gap-2">
											<CollapsibleTrigger asChild>
												<Button
													type="button"
													variant="ghost"
													className="flex-1 justify-between h-auto py-2 px-3 hover:bg-accent"
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
										</div>
										<CollapsibleContent>
											<div className="ml-6 border-l pl-3 py-1 space-y-0.5">
												{/* Select All row */}
												<div className="flex items-center justify-between py-1 px-2 rounded bg-muted/30">
													<span className="text-xs font-medium">{t`Select All`}</span>
													<label className="flex items-center gap-1.5 cursor-pointer">
														<Checkbox
															checked={allSelected}
															ref={(el) => {
																if (el) {
																	(
																		el as HTMLButtonElement & { indeterminate?: boolean }
																	).indeterminate = someSelected;
																}
															}}
															onCheckedChange={(checked) =>
																handleSelectAllCategory(category.id, checked === true)
															}
															className="size-3.5"
															aria-label={t`Select all permissions in ${category.name}`}
														/>
													</label>
												</div>
												{category.permissions.map((permission) => (
													<PermissionRow
														key={permission.id}
														permission={permission}
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

					{/* Fixed Footer */}
					<div className="shrink-0 flex justify-end gap-2 pt-4 border-t mt-4">
						<Button type="button" variant="outline" onClick={onCancel}>
							{t`Cancel`}
						</Button>
						<Button type="submit">{isEditing ? t`Save Changes` : t`Create Role`}</Button>
					</div>
				</form>
			</Form>
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
	onAccessChange: (access: PermissionAccess) => void;
}

function PermissionRow({ permission, onAccessChange }: PermissionRowProps) {
	const isRead = permission.access === "read" || permission.access === "write";
	const isWrite = permission.access === "write";

	const handleReadChange = (checked: boolean) => {
		if (checked) {
			onAccessChange("read");
		} else {
			onAccessChange("none");
		}
	};

	const handleWriteChange = (checked: boolean) => {
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
						className="size-3.5"
						aria-label={t`${permission.name} Read access`}
					/>
					<span className="text-[11px] text-muted-foreground">{t`Read`}</span>
				</label>
				<label className="flex items-center gap-1.5 cursor-pointer">
					<Checkbox
						checked={isWrite}
						onCheckedChange={handleWriteChange}
						className="size-3.5"
						aria-label={t`${permission.name} Write access`}
					/>
					<span className="text-[11px] text-muted-foreground">{t`Write`}</span>
				</label>
			</div>
		</div>
	);
}
