import { type AdminResponse, getAllAdminsV1ObservedQuery } from "~@/api";
import { makeAutoObservable } from "~@/mobx";
import type { PermissionCategory, Role, RolePermissions, User } from "~@/models";
import { getPermissionCategories, getRolePermissions, getRoles } from "~@/models";

import { authViewModel } from "../auth";
import type { Disposable } from "../types";

/** Every account returned by /api/v1/admins is an organization administrator. */
const ADMIN_ROLE_ID = "role-admin";

function toIso(d: Date | string | null | undefined): string {
	if (!d) return new Date().toISOString();
	return (d instanceof Date ? d : new Date(d)).toISOString();
}

function mapAdmin(a: AdminResponse): User {
	const name = [a.firstName, a.lastName].filter(Boolean).join(" ") || (a.email ?? "");
	return {
		id: a.id ?? "",
		name,
		email: a.email ?? "",
		roleIds: [ADMIN_ROLE_ID],
		status: "active",
		createdAt: toIso(a.createdAt),
		modifiedAt: toIso(a.updatedAt ?? a.createdAt),
		loginMethods: ["password"],
		mfaEnabled: false,
	};
}

/**
 * ViewModel for the Admin Users page.
 * Manages users, roles, and permissions CRUD operations.
 */
class UsersViewModel implements Disposable {
	// Real users from GET /api/v1/admins; local edits are layered on top until persisted
	#adminsQuery = getAllAdminsV1ObservedQuery();
	#loaded = false;
	userOverrides: Record<string, User> = {};
	addedUsers: User[] = [];

	// Roles & permissions: no backend roles are configured yet (/api/roles is empty), keep defaults
	roles: Role[];
	rolePermissions: RolePermissions[];
	readonly permissionCategories: PermissionCategory[];

	// Observable state - UI
	selectedUser: User | null = null;
	selectedRole: Role | null = null;
	isUserEditorOpen = false;
	editingUser: User | null = null;
	isRoleEditorOpen = false;
	editingRole: Role | null = null;

	constructor() {
		makeAutoObservable(this);
		this.roles = getRoles();
		this.rolePermissions = getRolePermissions();
		this.permissionCategories = getPermissionCategories();
	}

	load = () => {
		if (this.#loaded) return;
		this.#loaded = true;
		this.#adminsQuery.load({ query: { Page: 1, PageSize: 100 } });
	};

	get isLoading(): boolean {
		return this.#adminsQuery.isLoading;
	}

	/** True until the first users response (or error) arrives; false during refetches. */
	get isInitialLoading(): boolean {
		return this.#adminsQuery.data == null && !this.#adminsQuery.hasError;
	}

	get apiUsers(): User[] {
		const data = this.#adminsQuery.data as { items?: AdminResponse[] | null } | undefined;
		const me = authViewModel.currentUser;
		return (data?.items ?? []).map((a) => {
			const user = mapAdmin(a);
			// The signed-in user's last login is known from the access token
			if (me && (user.id === me.id || user.email === me.email) && me.signedInAt) {
				return { ...user, lastLoginAt: me.signedInAt, lastActiveAt: new Date().toISOString() };
			}
			return user;
		});
	}

	get users(): User[] {
		return [...this.apiUsers.map((u) => this.userOverrides[u.id] ?? u), ...this.addedUsers];
	}

	/** Signed-in user (from the access token); all accounts in this app are admins. */
	get currentUser(): User | null {
		const cu = authViewModel.currentUser;
		if (!cu) return null;
		return (
			this.users.find((u) => u.id === cu.id || u.email === cu.email) ?? {
				id: cu.id ?? "me",
				name: cu.displayName,
				email: cu.email,
				roleIds: [ADMIN_ROLE_ID],
				status: "active",
				createdAt: new Date().toISOString(),
				modifiedAt: new Date().toISOString(),
				loginMethods: ["password"],
				mfaEnabled: false,
			}
		);
	}

	// Computed: check if current user has admin role
	get hasAdminRole(): boolean {
		return this.currentUser?.roleIds.includes(ADMIN_ROLE_ID) ?? false;
	}

	#putUser(user: User) {
		if (this.addedUsers.some((u) => u.id === user.id)) {
			this.addedUsers = this.addedUsers.map((u) => (u.id === user.id ? user : u));
		} else {
			this.userOverrides = { ...this.userOverrides, [user.id]: user };
		}
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
			this.#putUser(user);
			// Update selected user if it was edited
			if (this.selectedUser?.id === user.id) {
				this.selectedUser = user;
			}
		} else {
			// Create new user
			const newUser = { ...user, id: `user-${Date.now()}` };
			this.addedUsers = [...this.addedUsers, newUser];
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
		for (const user of this.users) {
			if (user.roleIds.includes(roleId)) {
				this.#putUser({ ...user, roleIds: user.roleIds.filter((id) => id !== roleId) });
			}
		}
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
	usersViewModel.load();
	return usersViewModel;
}
