export type RoleType = "managed" | "custom";

export interface Role {
	id: string;
	name: string;
	type: RoleType;
	description?: string;
	createdAt: string;
	modifiedAt: string;
}

export type UserStatus = "active" | "pending" | "deactivated";
export type LoginMethod = "google" | "password" | "saml" | "sso";

export interface User {
	id: string;
	name: string;
	email: string;
	avatarUrl?: string;
	roleIds: string[];
	status: UserStatus;
	createdAt: string;
	modifiedAt: string;
	lastActiveAt?: string;
	lastLoginAt?: string;
	loginMethods: LoginMethod[];
	mfaEnabled: boolean;
	teamIds?: string[];
	notes?: string;
}

export type PermissionAccess = "none" | "read" | "write";

export interface PermissionItem {
	id: string;
	name: string;
	description?: string;
	access: PermissionAccess;
}

export interface PermissionCategory {
	id: string;
	name: string;
	icon?: string;
	permissions: PermissionItem[];
}

export interface RolePermissions {
	roleId: string;
	categories: PermissionCategory[];
}

export interface Team {
	id: string;
	name: string;
	description?: string;
	memberCount: number;
}

export type UserRole = "admin" | "operator" | "viewer";
export type PermissionAction = "view" | "create" | "edit" | "delete" | "configure" | "ack_resolve";
export type ModuleName =
	| "system_overview"
	| "site_overview"
	| "equipment_overview"
	| "alerts_events"
	| "alerting_config"
	| "sensor_management"
	| "sensor_health"
	| "data_ingestion"
	| "user_management"
	| "historical_reports";

export interface Permission {
	module: ModuleName;
	actions: PermissionAction[];
}

export interface LegacyRolePermissions {
	role: UserRole;
	permissions: Permission[];
}
