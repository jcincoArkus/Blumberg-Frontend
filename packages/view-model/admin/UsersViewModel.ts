import { makeAutoObservable } from "~@/mobx";
import type { PermissionCategory, Role, RolePermissions, User } from "~@/models";
import {
	getCurrentUser,
	getPermissionCategories,
	getRolePermissions,
	getRoles,
	getUsers,
} from "~@/models";

import type { Disposable } from "../types";

/**
 * ViewModel for the Admin Users page.
 * Manages users, roles, and permissions CRUD operations.
 */
class UsersViewModel implements Disposable {
	// Observable state - data
	users: User[];
	roles: Role[];
	rolePermissions: RolePermissions[];
	readonly permissionCategories: PermissionCategory[];
	readonly currentUser: User;

	// Observable state - UI
	selectedUser: User | null = null;
	selectedRole: Role | null = null;
	isUserEditorOpen = false;
	editingUser: User | null = null;
	isRoleEditorOpen = false;
	editingRole: Role | null = null;

	constructor() {
		makeAutoObservable(this);
		this.users = getUsers();
		this.roles = getRoles();
		this.rolePermissions = getRolePermissions();
		this.permissionCategories = getPermissionCategories();
		this.currentUser = getCurrentUser();
	}

	// Computed: check if current user has admin role
	get hasAdminRole(): boolean {
		return this.currentUser.roleIds.includes("role-admin");
	}

	// Computed: get permissions for selected role
	get selectedRolePermissions(): RolePermissions | null {
		if (!this.selectedRole) return null;
		const selectedRoleId = this.selectedRole.id;
		return this.rolePermissions.find((rp) => rp.roleId === selectedRoleId) ?? null;
	}

	// Computed: get permissions for editing role
	get editingRolePermissions(): RolePermissions | null {
		if (!this.editingRole) return null;
		const editingRoleId = this.editingRole.id;
		return this.rolePermissions.find((rp) => rp.roleId === editingRoleId) ?? null;
	}

	// User actions
	selectUser = (user: User | null) => {
		this.selectedUser = user;
	};

	openUserEditor = (user: User | null = null) => {
		this.editingUser = user;
		this.isUserEditorOpen = true;
	};

	closeUserEditor = () => {
		this.isUserEditorOpen = false;
		this.editingUser = null;
	};

	saveUser = (user: User) => {
		if (this.editingUser) {
			// Update existing user
			this.users = this.users.map((u) => (u.id === user.id ? user : u));
			// Update selected user if it was edited
			if (this.selectedUser?.id === user.id) {
				this.selectedUser = user;
			}
		} else {
			// Create new user
			const newUser = { ...user, id: `user-${Date.now()}` };
			this.users = [...this.users, newUser];
		}
		this.closeUserEditor();
	};

	// Role actions
	selectRole = (role: Role | null) => {
		this.selectedRole = role;
	};

	openRoleEditor = (role: Role | null = null) => {
		this.editingRole = role;
		this.isRoleEditorOpen = true;
	};

	closeRoleEditor = () => {
		this.isRoleEditorOpen = false;
		this.editingRole = null;
	};

	saveRole = (role: Role, permissions: RolePermissions) => {
		if (this.editingRole) {
			// Update existing role
			this.roles = this.roles.map((r) => (r.id === role.id ? role : r));
			this.rolePermissions = this.rolePermissions.map((rp) =>
				rp.roleId === role.id ? permissions : rp,
			);
			// Update selected role if it was edited
			if (this.selectedRole?.id === role.id) {
				this.selectedRole = role;
			}
		} else {
			// Create new role
			this.roles = [...this.roles, role];
			this.rolePermissions = [...this.rolePermissions, permissions];
		}
		this.closeRoleEditor();
	};

	deleteRole = (roleId: string) => {
		// Remove role from users first
		this.users = this.users.map((user) => ({
			...user,
			roleIds: user.roleIds.filter((id) => id !== roleId),
		}));
		// Remove role and its permissions
		this.roles = this.roles.filter((r) => r.id !== roleId);
		this.rolePermissions = this.rolePermissions.filter((rp) => rp.roleId !== roleId);
		// Clear selection if deleted role was selected
		if (this.selectedRole?.id === roleId) {
			this.selectedRole = null;
		}
	};

	// Helper: count users by role
	countUsersByRole = (roleId: string): number => {
		return this.users.filter((u) => u.roleIds.includes(roleId)).length;
	};

	dispose() {
		// No subscriptions to clean up currently
	}
}

export const usersViewModel = new UsersViewModel();

export function useUsersViewModel() {
	return usersViewModel;
}
