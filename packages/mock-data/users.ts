import type { PermissionCategory, Role, RolePermissions, User } from "~@/models";

// Mock Roles
export const roles: Role[] = [
	{
		id: "role-admin",
		name: "Admin Role",
		type: "managed",
		description: "Full access to all features and settings",
		createdAt: "2024-01-01T00:00:00Z",
		modifiedAt: "2024-01-01T00:00:00Z",
	},
	{
		id: "role-standard",
		name: "Standard Role",
		type: "managed",
		description: "Standard access for regular users",
		createdAt: "2024-01-01T00:00:00Z",
		modifiedAt: "2024-01-01T00:00:00Z",
	},
	{
		id: "role-readonly",
		name: "Read Only Role",
		type: "managed",
		description: "Read-only access to view data",
		createdAt: "2024-01-01T00:00:00Z",
		modifiedAt: "2024-01-01T00:00:00Z",
	},
];

// Mock Users with new model
export const users: User[] = [
	{
		id: "user-1",
		name: "John Admin",
		email: "john.admin@blumberg.com",
		roleIds: ["role-admin"],
		status: "active",
		createdAt: "2024-01-01T00:00:00Z",
		modifiedAt: "2024-11-27T00:00:00Z",
		lastActiveAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
		lastLoginAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
		loginMethods: ["google", "password"],
		mfaEnabled: true,
	},
	{
		id: "user-2",
		name: "Sarah Operator",
		email: "sarah.operator@blumberg.com",
		roleIds: ["role-standard"],
		status: "active",
		createdAt: "2024-01-05T10:00:00Z",
		modifiedAt: "2024-11-20T00:00:00Z",
		lastActiveAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
		lastLoginAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
		loginMethods: ["password"],
		mfaEnabled: false,
	},
	{
		id: "user-3",
		name: "Mike Viewer",
		email: "mike.viewer@blumberg.com",
		roleIds: ["role-readonly"],
		status: "active",
		createdAt: "2024-01-08T14:00:00Z",
		modifiedAt: "2024-10-15T00:00:00Z",
		lastActiveAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
		lastLoginAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
		loginMethods: ["google"],
		mfaEnabled: false,
	},
	{
		id: "user-4",
		name: "Emily Admin",
		email: "emily.admin@blumberg.com",
		roleIds: ["role-admin", "role-standard"],
		status: "active",
		createdAt: "2024-01-02T08:00:00Z",
		modifiedAt: "2024-11-25T00:00:00Z",
		lastActiveAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
		lastLoginAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
		loginMethods: ["google", "password"],
		mfaEnabled: true,
	},
	{
		id: "user-5",
		name: "David Operator",
		email: "david.operator@blumberg.com",
		roleIds: ["role-standard"],
		status: "active",
		createdAt: "2024-01-06T12:00:00Z",
		modifiedAt: "2024-09-10T00:00:00Z",
		lastActiveAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
		lastLoginAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
		loginMethods: ["password"],
		mfaEnabled: false,
	},
	{
		id: "user-6",
		name: "Lisa Viewer",
		email: "lisa.viewer@blumberg.com",
		roleIds: ["role-readonly"],
		status: "pending",
		createdAt: "2024-01-09T16:00:00Z",
		modifiedAt: "2024-01-09T16:00:00Z",
		loginMethods: [],
		mfaEnabled: false,
	},
	{
		id: "user-7",
		name: "Tom Disabled",
		email: "tom.disabled@blumberg.com",
		roleIds: ["role-standard"],
		status: "deactivated",
		createdAt: "2024-01-03T15:00:00Z",
		modifiedAt: "2024-12-01T00:00:00Z",
		lastActiveAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
		lastLoginAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
		loginMethods: ["password"],
		mfaEnabled: false,
		notes: "Account deactivated due to inactivity",
	},
];

// Mock current user (first admin)
export const currentUser: User = users[0];

// Permission Categories with granular permissions
export const permissionCategories: PermissionCategory[] = [
	{
		id: "cat-overview",
		name: "Overview",
		icon: "LayoutDashboard",
		permissions: [
			{ id: "perm-system-overview-read", name: "System Overview Read", access: "read" },
			{ id: "perm-system-overview-write", name: "System Overview Write", access: "write" },
			{ id: "perm-site-overview-read", name: "Site Overview Read", access: "read" },
			{ id: "perm-site-overview-write", name: "Site Overview Write", access: "write" },
		],
	},
	{
		id: "cat-equipment",
		name: "Equipment",
		icon: "Server",
		permissions: [
			{ id: "perm-equipment-read", name: "Equipment Read", access: "read" },
			{ id: "perm-equipment-write", name: "Equipment Write", access: "write" },
			{ id: "perm-equipment-config-read", name: "Equipment Config Read", access: "read" },
			{ id: "perm-equipment-config-write", name: "Equipment Config Write", access: "write" },
		],
	},
	{
		id: "cat-alerts",
		name: "Alerts & Events",
		icon: "Bell",
		permissions: [
			{ id: "perm-alerts-read", name: "Alerts Read", access: "read" },
			{ id: "perm-alerts-write", name: "Alerts Write", access: "write" },
			{ id: "perm-alerts-ack", name: "Alerts Acknowledge", access: "write" },
			{ id: "perm-alerts-config-read", name: "Alerting Config Read", access: "read" },
			{ id: "perm-alerts-config-write", name: "Alerting Config Write", access: "write" },
		],
	},
	{
		id: "cat-sensors",
		name: "Sensors",
		icon: "Activity",
		permissions: [
			{ id: "perm-sensors-read", name: "Sensors Read", access: "read" },
			{ id: "perm-sensors-write", name: "Sensors Write", access: "write" },
			{ id: "perm-sensor-health-read", name: "Sensor Health Read", access: "read" },
			{ id: "perm-sensor-health-write", name: "Sensor Health Write", access: "write" },
		],
	},
	{
		id: "cat-data",
		name: "Data Management",
		icon: "Database",
		permissions: [
			{ id: "perm-ingestion-read", name: "Data Ingestion Read", access: "read" },
			{ id: "perm-ingestion-write", name: "Data Ingestion Write", access: "write" },
			{ id: "perm-reports-read", name: "Historical Reports Read", access: "read" },
			{ id: "perm-reports-write", name: "Historical Reports Write", access: "write" },
		],
	},
	{
		id: "cat-admin",
		name: "Administration",
		icon: "Settings",
		permissions: [
			{ id: "perm-users-read", name: "User Management Read", access: "read" },
			{ id: "perm-users-write", name: "User Management Write", access: "write" },
			{ id: "perm-roles-read", name: "Roles Read", access: "read" },
			{ id: "perm-roles-write", name: "Roles Write", access: "write" },
		],
	},
];

// Role Permissions (new model with categories)
export const rolePermissions: RolePermissions[] = [
	{
		roleId: "role-admin",
		categories: permissionCategories.map((cat) => ({
			...cat,
			permissions: cat.permissions.map((p) => ({ ...p, access: "write" as const })),
		})),
	},
	{
		roleId: "role-standard",
		categories: permissionCategories.map((cat) => ({
			...cat,
			permissions: cat.permissions.map((p) => ({
				...p,
				access: p.access === "write" ? ("read" as const) : p.access,
			})),
		})),
	},
	{
		roleId: "role-readonly",
		categories: permissionCategories.map((cat) => ({
			...cat,
			permissions: cat.permissions.map((p) => ({
				...p,
				access: p.id.includes("-write") ? ("none" as const) : ("read" as const),
			})),
		})),
	},
];

// Helper functions for User & Role Management
export function getUserById(id: string): User | undefined {
	return users.find((u) => u.id === id);
}

export function getRoleById(id: string): Role | undefined {
	return roles.find((r) => r.id === id);
}

export function getUsersByRoleId(roleId: string): User[] {
	return users.filter((u) => u.roleIds.includes(roleId));
}

export function getActiveUsers(): User[] {
	return users.filter((u) => u.status === "active");
}

export function getUserRoles(user: User): Role[] {
	return user.roleIds.map((id) => getRoleById(id)).filter((r): r is Role => r !== undefined);
}

export function getPermissionsForRoleId(roleId: string): RolePermissions | undefined {
	return rolePermissions.find((rp) => rp.roleId === roleId);
}

export function countUsersByRole(roleId: string): number {
	return users.filter((u) => u.roleIds.includes(roleId)).length;
}
