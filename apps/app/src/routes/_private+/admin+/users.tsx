import { toast } from "sonner";

import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { DashboardPanel, Tabs, TabsContent, TabsList, TabsTrigger } from "~@/ui";
import { useUsersViewModel } from "~@/view-model";
import type { Role, RolePermissions, User } from "~@/views";
import {
	RoleEditorDialog,
	RolePermissionsEditor,
	RolesList,
	UnauthorizedView,
	UserEditorNew,
	UserProfilePanel,
	UsersGrid,
} from "~@/views";

/**
 * Admin Users page component.
 * Uses UsersViewModel for all state management and CRUD operations.
 */
const AdminUsersPage = observer(function AdminUsersPage() {
	const vm = useUsersViewModel();

	// Check if current user has admin role
	if (!vm.hasAdminRole) {
		return (
			<DashboardPanel
				title={t`User Management`}
				description={t`Manage users, roles, and permissions`}
			>
				<UnauthorizedView />
			</DashboardPanel>
		);
	}

	// Handlers with toast notifications (presentation concern)
	const handleSaveUser = (user: User) => {
		const isUpdate = vm.editingUser !== null;
		vm.saveUser(user);
		toast.success(isUpdate ? t`User updated successfully` : t`User created successfully`);
	};

	const handleSaveRole = (role: Role, permissions: RolePermissions) => {
		const isUpdate = vm.editingRole !== null;
		vm.saveRole(role, permissions);
		toast.success(isUpdate ? t`Role updated successfully` : t`Role created successfully`);
	};

	const handleDeleteRole = (roleId: string) => {
		vm.deleteRole(roleId);
		toast.success(t`Role deleted successfully`);
	};

	return (
		<>
			<DashboardPanel
				title={t`User Management`}
				description={t`Manage users, roles, and permissions`}
			>
				<Tabs defaultValue="users" className="w-full">
					<TabsList>
						<TabsTrigger value="users">{t`Users`}</TabsTrigger>
						<TabsTrigger value="roles">{t`Roles & Permissions`}</TabsTrigger>
					</TabsList>

					<TabsContent value="users" className="mt-4 relative">
						<div className="w-full">
							<UsersGrid
								users={vm.users}
								roles={vm.roles}
								onUserClick={vm.selectUser}
								onInviteUsers={() => vm.openUserEditor(null)}
								selectedUserId={vm.selectedUser?.id}
							/>
						</div>
						{vm.selectedUser && (
							<div className="fixed top-0 right-0 h-full w-90 bg-background border-l shadow-lg z-50 overflow-y-auto">
								<UserProfilePanel
									user={vm.selectedUser}
									roles={vm.roles}
									onClose={() => vm.selectUser(null)}
									onEdit={vm.openUserEditor}
								/>
							</div>
						)}
					</TabsContent>

					<TabsContent value="roles" className="mt-4">
						<div className="flex gap-6 h-[calc(100vh-200px)]">
							<div className="w-140 shrink-0">
								<RolesList
									roles={vm.roles}
									getUserCountByRole={vm.countUsersByRole}
									onSelectRole={vm.selectRole}
									onCreateRole={() => vm.openRoleEditor(null)}
									selectedRoleId={vm.isRoleEditorOpen ? undefined : vm.selectedRole?.id}
								/>
							</div>
							<div className="flex-1 min-h-0">
								{vm.isRoleEditorOpen ? (
									<RoleEditorDialog
										role={vm.editingRole}
										rolePermissions={vm.editingRolePermissions}
										defaultCategories={vm.permissionCategories}
										onCancel={vm.closeRoleEditor}
										onSave={handleSaveRole}
									/>
								) : vm.selectedRole && vm.selectedRolePermissions ? (
									<RolePermissionsEditor
										role={vm.selectedRole}
										rolePermissions={vm.selectedRolePermissions}
										readOnly={vm.selectedRole.type === "managed"}
										onEditRole={vm.openRoleEditor}
										onDeleteRole={handleDeleteRole}
									/>
								) : (
									<div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
										{t`Select a role to view its permissions`}
									</div>
								)}
							</div>
						</div>
					</TabsContent>
				</Tabs>
			</DashboardPanel>

			{vm.isUserEditorOpen && (
				<UserEditorNew
					user={vm.editingUser}
					roles={vm.roles}
					open={vm.isUserEditorOpen}
					onOpenChange={(open) => !open && vm.closeUserEditor()}
					onSave={handleSaveUser}
					currentUserId={vm.currentUser.id}
				/>
			)}
		</>
	);
});

export default AdminUsersPage;
