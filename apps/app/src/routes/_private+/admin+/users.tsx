import { useState } from "react";
import { toast } from "sonner";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "~@/ui";
import {
	DashboardPanel,
	DashboardShell,
	type Role,
	RoleEditorDialog,
	type RolePermissions,
	RolePermissionsEditor,
	RolesList,
	UnauthorizedView,
	type User,
	UserEditorNew,
	UserProfilePanel,
	UsersGrid,
} from "~@/views";

import {
	countUsersByRole,
	currentUser,
	rolePermissions as initialRolePermissions,
	roles as initialRoles,
	users as initialUsers,
	permissionCategories,
} from "../../../mock-data/users";

export default function AdminUsersPage() {
	const [users, setUsers] = useState<User[]>(initialUsers);
	const [roles, setRoles] = useState<Role[]>(initialRoles);
	const [rolePermissions, setRolePermissions] = useState<RolePermissions[]>(initialRolePermissions);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [selectedRole, setSelectedRole] = useState<Role | null>(null);
	const [isEditorOpen, setIsEditorOpen] = useState(false);
	const [editingUser, setEditingUser] = useState<User | null>(null);
	const [isRoleEditorOpen, setIsRoleEditorOpen] = useState(false);
	const [editingRole, setEditingRole] = useState<Role | null>(null);

	// Check if current user has admin role
	const hasAdminRole = currentUser.roleIds.includes("role-admin");

	if (!hasAdminRole) {
		return (
			<DashboardShell title="User Management" description="Manage users, roles, and permissions">
				<DashboardPanel>
					<UnauthorizedView />
				</DashboardPanel>
			</DashboardShell>
		);
	}

	const handleUserClick = (user: User) => {
		setSelectedUser(user);
	};

	const handleEditUser = (user: User) => {
		setEditingUser(user);
		setIsEditorOpen(true);
	};

	const handleCreateUser = () => {
		setEditingUser(null);
		setIsEditorOpen(true);
	};

	const handleSaveUser = (user: User) => {
		if (editingUser) {
			setUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)));
			toast.success("User updated successfully");
		} else {
			const newUser = { ...user, id: `user-${Date.now()}` };
			setUsers((prev) => [...prev, newUser]);
			toast.success("User created successfully");
		}
		setIsEditorOpen(false);
		setEditingUser(null);
		if (selectedUser?.id === user.id) {
			setSelectedUser(user);
		}
	};

	const handleSelectRole = (role: Role) => {
		setSelectedRole(role);
	};

	const getSelectedRolePermissions = () => {
		if (!selectedRole) return null;
		return rolePermissions.find((rp) => rp.roleId === selectedRole.id) || null;
	};

	// Role CRUD handlers
	const handleCreateRole = () => {
		setEditingRole(null);
		setIsRoleEditorOpen(true);
	};

	const handleEditRole = (role: Role) => {
		setEditingRole(role);
		setIsRoleEditorOpen(true);
	};

	const handleSaveRole = (role: Role, permissions: RolePermissions) => {
		if (editingRole) {
			// Update existing role
			setRoles((prev) => prev.map((r) => (r.id === role.id ? role : r)));
			setRolePermissions((prev) => prev.map((rp) => (rp.roleId === role.id ? permissions : rp)));
			toast.success("Role updated successfully");
		} else {
			// Create new role
			setRoles((prev) => [...prev, role]);
			setRolePermissions((prev) => [...prev, permissions]);
			toast.success("Role created successfully");
		}
		setIsRoleEditorOpen(false);
		setEditingRole(null);
		// Update selected role if it was edited
		if (selectedRole?.id === role.id) {
			setSelectedRole(role);
		}
	};

	const handleDeleteRole = (roleId: string) => {
		// Remove role from users first
		setUsers((prev) =>
			prev.map((user) => ({
				...user,
				roleIds: user.roleIds.filter((id) => id !== roleId),
			})),
		);
		// Remove role and its permissions
		setRoles((prev) => prev.filter((r) => r.id !== roleId));
		setRolePermissions((prev) => prev.filter((rp) => rp.roleId !== roleId));
		// Clear selection if deleted role was selected
		if (selectedRole?.id === roleId) {
			setSelectedRole(null);
		}
		toast.success("Role deleted successfully");
	};

	const getEditingRolePermissions = () => {
		if (!editingRole) return null;
		return rolePermissions.find((rp) => rp.roleId === editingRole.id) || null;
	};

	const handleCancelRoleEditor = () => {
		setIsRoleEditorOpen(false);
		setEditingRole(null);
	};

	return (
		<DashboardShell>
			<DashboardPanel title="User Management" description="Manage users, roles, and permissions">
				<Tabs defaultValue="users" className="w-full">
					<TabsList>
						<TabsTrigger value="users">Users</TabsTrigger>
						<TabsTrigger value="roles">Roles &amp; Permissions</TabsTrigger>
					</TabsList>

					<TabsContent value="users" className="mt-4 relative">
						<div className="w-full">
							<UsersGrid
								users={users}
								roles={roles}
								onUserClick={handleUserClick}
								onInviteUsers={handleCreateUser}
								selectedUserId={selectedUser?.id}
							/>
						</div>
						{selectedUser && (
							<div className="fixed top-0 right-0 h-full w-90 bg-background border-l shadow-lg z-50 overflow-y-auto">
								<UserProfilePanel
									user={selectedUser}
									roles={roles}
									onClose={() => setSelectedUser(null)}
									onEdit={handleEditUser}
								/>
							</div>
						)}
					</TabsContent>

					<TabsContent value="roles" className="mt-4">
						<div className="flex gap-6 h-[calc(100vh-200px)]">
							<div className="w-140 shrink-0">
								<RolesList
									roles={roles}
									getUserCountByRole={countUsersByRole}
									onSelectRole={handleSelectRole}
									onCreateRole={handleCreateRole}
									selectedRoleId={isRoleEditorOpen ? undefined : selectedRole?.id}
								/>
							</div>
							<div className="flex-1 min-h-0">
								{isRoleEditorOpen ? (
									<RoleEditorDialog
										role={editingRole}
										rolePermissions={getEditingRolePermissions()}
										defaultCategories={permissionCategories}
										onCancel={handleCancelRoleEditor}
										onSave={handleSaveRole}
									/>
								) : selectedRole && getSelectedRolePermissions() ? (
									<RolePermissionsEditor
										role={selectedRole}
										rolePermissions={getSelectedRolePermissions()!}
										readOnly={selectedRole.type === "managed"}
										onEditRole={handleEditRole}
										onDeleteRole={handleDeleteRole}
									/>
								) : (
									<div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
										Select a role to view its permissions
									</div>
								)}
							</div>
						</div>
					</TabsContent>
				</Tabs>
			</DashboardPanel>

			{isEditorOpen && (
				<UserEditorNew
					user={editingUser}
					roles={roles}
					open={isEditorOpen}
					onOpenChange={setIsEditorOpen}
					onSave={handleSaveUser}
					currentUserId={currentUser.id}
				/>
			)}
		</DashboardShell>
	);
}
