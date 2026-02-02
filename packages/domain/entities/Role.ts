export type RoleType = "managed" | "custom";

export interface Role {
	id: string;
	name: string;
	type: RoleType;
	description?: string;
	createdAt: string;
	modifiedAt: string;
}
