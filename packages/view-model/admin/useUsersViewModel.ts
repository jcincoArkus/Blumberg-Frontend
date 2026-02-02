import { useEffect, useState } from "react";

import { UsersViewModel } from "./UsersViewModel";

/**
 * Factory hook that creates and manages a UsersViewModel instance.
 * Handles cleanup on unmount via the dispose method.
 *
 * @returns UsersViewModel instance
 *
 * @example
 * ```tsx
 * const vm = useUsersViewModel();
 *
 * if (!vm.hasAdminRole) {
 *   return <UnauthorizedView />;
 * }
 *
 * return <UsersGrid users={vm.users} onUserClick={vm.selectUser} />;
 * ```
 */
export function useUsersViewModel(): UsersViewModel {
	const [vm] = useState(() => new UsersViewModel());

	useEffect(() => {
		return () => vm.dispose();
	}, [vm]);

	return vm;
}
