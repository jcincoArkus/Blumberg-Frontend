import { currentUser, permissionCategories, rolePermissions, roles, users } from "~@/mock-data";

import type { PermissionCategory, Role, RolePermissions, User } from "../types/admin";

export const getUsers = (): User[] => users;
export const getRoles = (): Role[] => roles;
export const getRolePermissions = (): RolePermissions[] => rolePermissions;
export const getPermissionCategories = (): PermissionCategory[] => permissionCategories;
export const getCurrentUser = (): User => currentUser;
