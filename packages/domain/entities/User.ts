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
