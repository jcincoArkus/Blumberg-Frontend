import { useEffect, useState } from "react";

import type { PermissionCategory, Role, RolePermissions, User } from "~@/views";

import { UsersViewModel } from "./UsersViewModel";

interface UsersViewModelData {
	users: User[];
	roles: Role[];
	rolePermissions: RolePermissions[];
	permissionCategories: PermissionCategory[];
	currentUser: User;
}

/**
 * Factory hook that creates and manages a UsersViewModel instance.
 * Handles cleanup on unmount via the dispose method.
 *
 * @param data - Users data (users, roles, rolePermissions, permissionCategories, currentUser)
 * @returns UsersViewModel instance
 *
 * @example
 * ```tsx
 * const vm = useUsersViewModel({
 *   users: initialUsers,
 *   roles: initialRoles,
 *   rolePermissions: initialRolePermissions,
 *   permissionCategories,
 *   currentUser,
 * });
 *
 * if (!vm.hasAdminRole) {
 *   return <UnauthorizedView />;
 * }
 *
 * return <UsersGrid users={vm.users} onUserClick={vm.selectUser} />;
 * ```
 */
export function useUsersViewModel(data: UsersViewModelData): UsersViewModel {
	const [vm] = useState(() => new UsersViewModel(data));

	useEffect(() => {
		return () => vm.dispose();
	}, [vm]);

	return vm;
}
