import { Mail, Search, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";

import { t } from "~@/i18n/macro";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
	Badge,
	Button,
	Card,
	CardContent,
	Checkbox,
	cn,
	Input,
} from "~@/ui";

import type { Role, User, UserStatus } from "./types";

export interface UsersGridProps {
	users: User[];
	roles: Role[];
	onUserClick?: (user: User) => void;
	onInviteUsers?: () => void;
	selectedUserId?: string;
}

export function UsersGrid({
	users,
	roles,
	onUserClick,
	onInviteUsers,
	selectedUserId,
}: UsersGridProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilters, setStatusFilters] = useState<Set<UserStatus>>(
		new Set(["active", "pending", "deactivated"]),
	);

	const toggleStatusFilter = (status: UserStatus) => {
		setStatusFilters((prev) => {
			const next = new Set(prev);
			if (next.has(status)) {
				next.delete(status);
			} else {
				next.add(status);
			}
			return next;
		});
	};

	const filteredUsers = useMemo(() => {
		return users.filter((user) => {
			// Status filter
			if (!statusFilters.has(user.status)) return false;

			// Search filter
			if (searchQuery) {
				const query = searchQuery.toLowerCase();
				const matchesSearch =
					user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query);
				if (!matchesSearch) return false;
			}

			return true;
		});
	}, [users, searchQuery, statusFilters]);

	const getRoleNames = (user: User): string[] => {
		return user.roleIds
			.map((id) => roles.find((r) => r.id === id)?.name)
			.filter((name): name is string => name !== undefined);
	};

	const getInitials = (name: string): string => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	const getStatusConfig = (status: UserStatus) => {
		const configs = {
			active: {
				label: t`Active`,
				className:
					"bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400",
			},
			pending: {
				label: t`Invite Pending`,
				className:
					"bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400",
			},
			deactivated: {
				label: t`Deactivated`,
				className:
					"bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400",
			},
		};
		return configs[status];
	};

	const statusCounts = useMemo(() => {
		const counts = { active: 0, pending: 0, deactivated: 0 };
		for (const user of users) {
			counts[user.status]++;
		}
		return counts;
	}, [users]);

	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="flex flex-col sm:flex-row gap-3">
				<div className="relative flex-1">
					<Search
						className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
						aria-hidden="true"
					/>
					<Input
						placeholder={t`Filter by name or email...`}
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9"
						aria-label={t`Search users`}
					/>
				</div>
				{onInviteUsers && (
					<Button onClick={onInviteUsers}>
						<UserPlus className="size-4 mr-2" aria-hidden="true" />
						{t`Invite Users`}
					</Button>
				)}
			</div>

			{/* Status Filters */}
			<div className="flex flex-wrap gap-4 py-2">
				{(["active", "pending", "deactivated"] as const).map((status) => {
					const config = getStatusConfig(status);
					const isChecked = statusFilters.has(status);
					return (
						<label key={status} className="flex items-center gap-2 cursor-pointer">
							<Checkbox
								checked={isChecked}
								onCheckedChange={() => toggleStatusFilter(status)}
								aria-label={t`Filter ${config.label}`}
							/>
							<span className="text-sm">
								{config.label} ({statusCounts[status]})
							</span>
						</label>
					);
				})}
			</div>

			{/* Users Grid */}
			{filteredUsers.length === 0 ? (
				<div className="py-12 text-center">
					<p className="text-sm font-medium text-foreground mb-1">{t`No users found`}</p>
					<p className="text-xs text-muted-foreground">{t`Try adjusting your search or filters`}</p>
				</div>
			) : (
				<UserCardsGrid
					users={filteredUsers}
					getRoleNames={getRoleNames}
					getInitials={getInitials}
					getStatusConfig={getStatusConfig}
					onUserClick={onUserClick}
					selectedUserId={selectedUserId}
				/>
			)}
		</div>
	);
}

// User Cards Grid Component
interface UserCardsGridProps {
	users: User[];
	getRoleNames: (user: User) => string[];
	getInitials: (name: string) => string;
	getStatusConfig: (status: UserStatus) => { label: string; className: string };
	onUserClick?: (user: User) => void;
	selectedUserId?: string;
}

function UserCardsGrid({
	users,
	getRoleNames,
	getInitials,
	getStatusConfig,
	onUserClick,
	selectedUserId,
}: UserCardsGridProps) {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
			{users.map((user) => {
				const roleNames = getRoleNames(user);
				const statusConfig = getStatusConfig(user.status);
				const isSelected = selectedUserId === user.id;

				return (
					<Card
						key={user.id}
						className={cn(
							"cursor-pointer transition-all hover:shadow-md",
							isSelected && "ring-2 ring-primary",
							user.status === "deactivated" && "opacity-60",
						)}
						onClick={() => onUserClick?.(user)}
					>
						<CardContent className="p-4">
							<div className="flex items-start gap-3">
								<Avatar className="size-10">
									{user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
									<AvatarFallback className="text-sm">{getInitials(user.name)}</AvatarFallback>
								</Avatar>
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2">
										<span className="font-medium truncate">{user.name}</span>
										<Badge
											variant="outline"
											className={cn("text-[10px] px-1.5 py-0 shrink-0", statusConfig.className)}
										>
											{user.status === "pending" ? t`Pending` : ""}
										</Badge>
									</div>
									<div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
										<Mail className="size-3" aria-hidden="true" />
										<span className="truncate">{user.email}</span>
									</div>
									{roleNames.length > 0 && (
										<div className="flex flex-wrap gap-1 mt-2">
											{roleNames.slice(0, 2).map((name) => (
												<Badge key={name} variant="secondary" className="text-[10px] px-1.5 py-0">
													{name}
												</Badge>
											))}
											{roleNames.length > 2 && (
												<Badge variant="secondary" className="text-[10px] px-1.5 py-0">
													+{roleNames.length - 2}
												</Badge>
											)}
										</div>
									)}
								</div>
							</div>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}
