import { useState } from "react";
import { toast } from "sonner";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "~@/ui";
import {
	DashboardPanel,
	DashboardShell,
	type Role,
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
	roles as initialRoles,
	users as initialUsers,
	rolePermissions,
} from "../../../mock-data/users";

export default function AdminUsersPage() {
	const [users, setUsers] = useState<User[]>(initialUsers);
	const [roles] = useState<Role[]>(initialRoles);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [selectedRole, setSelectedRole] = useState<Role | null>(null);
	const [isEditorOpen, setIsEditorOpen] = useState(false);
	const [editingUser, setEditingUser] = useState<User | null>(null);

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

	return (
		<DashboardShell title="User Management" description="Manage users, roles, and permissions">
			<DashboardPanel>
				<Tabs defaultValue="users" className="w-full">
					<TabsList>
						<TabsTrigger value="users">Users</TabsTrigger>
						<TabsTrigger value="roles">Roles &amp; Permissions</TabsTrigger>
					</TabsList>

					<TabsContent value="users" className="mt-6 relative">
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

					<TabsContent value="roles" className="mt-6">
						<div className="flex gap-6">
							<div className="w-140 shrink-0">
								<RolesList
									roles={roles}
									getUserCountByRole={countUsersByRole}
									onSelectRole={handleSelectRole}
									selectedRoleId={selectedRole?.id}
								/>
							</div>
							<div className="flex-1">
								{selectedRole && getSelectedRolePermissions() ? (
									<RolePermissionsEditor
										role={selectedRole}
										rolePermissions={getSelectedRolePermissions()!}
										readOnly={selectedRole.type === "managed"}
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
