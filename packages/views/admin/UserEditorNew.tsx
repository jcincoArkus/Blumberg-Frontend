import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, ChevronDown, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { t } from "~@/i18n/macro";
import {
	Alert,
	AlertDescription,
	Badge,
	Button,
	Checkbox,
	cn,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	Input,
	Popover,
	PopoverContent,
	PopoverTrigger,
	ScrollArea,
	Switch,
	Textarea,
} from "~@/ui";

import type { Role, User, UserStatus } from "./types";

const getFormSchema = () =>
	z.object({
		name: z.string().min(2, { message: t`Name must be at least 2 characters.` }),
		email: z.string().email({ message: t`Invalid email address.` }),
		roleIds: z.array(z.string()).min(1, { message: t`At least one role is required.` }),
		isActive: z.boolean(),
		notes: z.string().optional(),
	});

type FormValues = z.infer<typeof formSchema>;

export interface UserEditorNewProps {
	user: User | null;
	roles: Role[];
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (user: User) => void;
	currentUserId: string;
}

export function UserEditorNew({
	user,
	roles,
	open,
	onOpenChange,
	onSave,
	currentUserId,
}: UserEditorNewProps) {
	const formSchema = getFormSchema();
	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			email: "",
			roleIds: [],
			isActive: true,
			notes: "",
		},
	});

	useEffect(() => {
		if (user) {
			form.reset({
				name: user.name,
				email: user.email,
				roleIds: user.roleIds,
				isActive: user.status === "active",
				notes: user.notes || "",
			});
		} else {
			form.reset({
				name: "",
				email: "",
				roleIds: [],
				isActive: true,
				notes: "",
			});
		}
	}, [user, form]);

	const onSubmit = (values: FormValues) => {
		const hasAdminRole = values.roleIds.includes("role-admin");

		// Prevent self-lockout
		if (user && user.id === currentUserId) {
			const hadAdminRole = user.roleIds.includes("role-admin");
			if (hadAdminRole && !hasAdminRole) {
				form.setError("roleIds", { message: t`You cannot remove your own admin role` });
				return;
			}
			if (!values.isActive) {
				form.setError("isActive", { message: t`You cannot deactivate your own account` });
				return;
			}
		}

		const status: UserStatus = values.isActive ? "active" : "deactivated";
		const now = new Date().toISOString();

		const updatedUser: User = {
			id: user?.id || "",
			name: values.name,
			email: values.email,
			roleIds: values.roleIds,
			status: user?.status === "pending" ? "pending" : status,
			createdAt: user?.createdAt || now,
			modifiedAt: now,
			lastActiveAt: user?.lastActiveAt,
			lastLoginAt: user?.lastLoginAt,
			loginMethods: user?.loginMethods || [],
			mfaEnabled: user?.mfaEnabled ?? false,
			notes: values.notes || undefined,
		};

		onSave(updatedUser);
	};

	const isSelfEdit = user && user.id === currentUserId;
	const selectedRoleIds = form.watch("roleIds");
	const [roleSearchQuery, setRoleSearchQuery] = useState("");
	const [isRolePopoverOpen, setIsRolePopoverOpen] = useState(false);

	const filteredRoles = useMemo(() => {
		if (!roleSearchQuery.trim()) return roles;
		const query = roleSearchQuery.toLowerCase();
		return roles.filter(
			(role) =>
				role.name.toLowerCase().includes(query) || role.description?.toLowerCase().includes(query),
		);
	}, [roles, roleSearchQuery]);

	const toggleRole = (roleId: string) => {
		const current = form.getValues("roleIds");
		if (current.includes(roleId)) {
			form.setValue(
				"roleIds",
				current.filter((id) => id !== roleId),
				{ shouldValidate: true },
			);
		} else {
			form.setValue("roleIds", [...current, roleId], { shouldValidate: true });
		}
	};

	const removeRole = (roleId: string) => {
		const current = form.getValues("roleIds");
		form.setValue(
			"roleIds",
			current.filter((id) => id !== roleId),
			{ shouldValidate: true },
		);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-125">
				<DialogHeader>
					<DialogTitle>{user ? t`Edit User` : t`Create User`}</DialogTitle>
					<DialogDescription>
						{user ? t`Update user information and roles` : t`Add a new user to the system`}
					</DialogDescription>
				</DialogHeader>

				{isSelfEdit && (
					<Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
						<AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden="true" />
						<AlertDescription className="text-amber-800 dark:text-amber-200">
							{t`You are editing your own account. Some options may be restricted.`}
						</AlertDescription>
					</Alert>
				)}

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						{/* Status Toggle */}
						{user && user.status !== "pending" && (
							<FormField
								control={form.control}
								name="isActive"
								render={({ field }) => (
									<FormItem className="flex items-center justify-between rounded-lg border p-3">
										<div className="space-y-0.5">
											<FormLabel className="text-base">{t`Status`}</FormLabel>
											<FormDescription>
												{field.value ? t`User is active` : t`User is deactivated`}
											</FormDescription>
										</div>
										<FormControl>
											<Switch
												checked={field.value}
												onCheckedChange={field.onChange}
												disabled={isSelfEdit}
												aria-label={t`Toggle user status`}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
						)}

						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t`Name`} *</FormLabel>
									<FormControl>
										<Input placeholder={t`John Doe`} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t`Email`} *</FormLabel>
									<FormControl>
										<Input type="email" placeholder={t`john.doe@example.com`} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Roles Multi-Select with Search */}
						<FormField
							control={form.control}
							name="roleIds"
							render={() => (
								<FormItem>
									<FormLabel>{t`Roles`} *</FormLabel>
									{/* Selected Roles as Chips */}
									{selectedRoleIds.length > 0 && (
										<div className="flex flex-wrap gap-2 mb-2">
											{selectedRoleIds.map((roleId) => {
												const role = roles.find((r) => r.id === roleId);
												if (!role) return null;
												const isAdminRole = role.id === "role-admin";
												const cannotRemove = isSelfEdit && isAdminRole;
												return (
													<Badge
														key={roleId}
														variant="secondary"
														className="pl-2 pr-1 py-1 flex items-center gap-1"
													>
														{role.name}
														{!cannotRemove && (
															<button
																type="button"
																onClick={() => removeRole(roleId)}
																className="ml-1 rounded-full p-0.5 hover:bg-muted"
																aria-label={t`Remove ${role.name}`}
															>
																<X className="size-3" />
															</button>
														)}
													</Badge>
												);
											})}
										</div>
									)}
									{/* Searchable Role Dropdown */}
									<Popover open={isRolePopoverOpen} onOpenChange={setIsRolePopoverOpen}>
										<PopoverTrigger asChild>
											<Button
												type="button"
												variant="outline"
												role="combobox"
												aria-expanded={isRolePopoverOpen}
												className="w-full justify-between font-normal"
											>
												<span className="text-muted-foreground">
													{selectedRoleIds.length === 0
														? t`Select roles...`
														: t`${selectedRoleIds.length} role(s) selected`}
												</span>
												<ChevronDown className="ml-2 size-4 shrink-0 opacity-50" />
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
											{/* Search Input */}
											<div className="flex items-center border-b px-3 py-2">
												<Search className="mr-2 size-4 shrink-0 opacity-50" aria-hidden="true" />
												<input
													type="text"
													placeholder={t`Search roles...`}
													value={roleSearchQuery}
													onChange={(e) => setRoleSearchQuery(e.target.value)}
													className="flex h-8 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
													aria-label={t`Search roles`}
												/>
												{roleSearchQuery && (
													<button
														type="button"
														onClick={() => setRoleSearchQuery("")}
														className="ml-2 rounded-full p-0.5 hover:bg-muted"
														aria-label={t`Clear search`}
													>
														<X className="size-3" />
													</button>
												)}
											</div>
											{/* Role List */}
											<ScrollArea className="max-h-60">
												<div className="p-1">
													{filteredRoles.length === 0 ? (
														<div className="py-6 text-center text-sm text-muted-foreground">
															{t`No roles found`}
														</div>
													) : (
														filteredRoles.map((role) => {
															const isChecked = selectedRoleIds.includes(role.id);
															const isAdminRole = role.id === "role-admin";
															const isDisabled = isSelfEdit && isAdminRole && isChecked;

															return (
																<label
																	key={role.id}
																	className={cn(
																		"flex items-center gap-3 px-2 py-2 rounded-sm cursor-pointer hover:bg-accent",
																		isDisabled && "opacity-50 cursor-not-allowed",
																	)}
																>
																	<Checkbox
																		checked={isChecked}
																		onCheckedChange={() => !isDisabled && toggleRole(role.id)}
																		disabled={isDisabled}
																		aria-label={role.name}
																	/>
																	<div className="flex-1 min-w-0">
																		<span className="text-sm font-medium">{role.name}</span>
																		{role.description && (
																			<p className="text-xs text-muted-foreground truncate">
																				{role.description}
																			</p>
																		)}
																	</div>
																	<Badge
																		variant="outline"
																		className={cn(
																			"text-[10px] shrink-0",
																			role.type === "managed"
																				? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
																				: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
																		)}
																	>
																		{role.type === "managed" ? t`managed` : t`custom`}
																	</Badge>
																</label>
															);
														})
													)}
												</div>
											</ScrollArea>
										</PopoverContent>
									</Popover>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="notes"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t`Notes`}</FormLabel>
									<FormControl>
										<Textarea
											placeholder={t`Optional notes about this user...`}
											rows={2}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
								{t`Cancel`}
							</Button>
							<Button type="submit">{user ? t`Save Changes` : t`Create User`}</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
