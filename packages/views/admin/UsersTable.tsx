import {
	Edit,
	Filter,
	Mail,
	MoreHorizontal,
	Plus,
	Search,
	UserCheck,
	UserX,
	X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { t } from "~@/i18n/macro";
import {
	Badge,
	Button,
	cn,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~@/ui";

import type { User, UserRole, UserStatus } from "./types";
import { UserEditor } from "./UserEditor";

export interface UsersTableProps {
	users: User[];
	currentUserId: string;
	onUsersChange: (users: User[]) => void;
}

export function UsersTable({ users, currentUserId, onUsersChange }: UsersTableProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [roleFilter, setRoleFilter] = useState<string>("all");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [editingUser, setEditingUser] = useState<User | null>(null);
	const [isEditorOpen, setIsEditorOpen] = useState(false);
	const [showFilters, setShowFilters] = useState(false);

	// Filtered users
	const filteredUsers = useMemo(() => {
		return users.filter((user) => {
			// Search filter
			if (searchQuery) {
				const query = searchQuery.toLowerCase();
				const matchesSearch =
					user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query);
				if (!matchesSearch) return false;
			}

			// Role filter
			if (roleFilter !== "all" && user.role !== roleFilter) return false;

			// Status filter
			if (statusFilter !== "all" && user.status !== statusFilter) return false;

			return true;
		});
	}, [users, searchQuery, roleFilter, statusFilter]);

	const handleCreate = () => {
		setEditingUser(null);
		setIsEditorOpen(true);
	};

	const handleEdit = (user: User) => {
		setEditingUser(user);
		setIsEditorOpen(true);
	};

	const handleSave = (user: User) => {
		if (editingUser) {
			// Update existing - Prevent self-lockout
			if (editingUser.id === currentUserId) {
				if (user.role !== "admin" || user.status === "disabled") {
					toast.error(t`You cannot demote yourself or disable your own account`);
					return;
				}
			}
			onUsersChange(users.map((u) => (u.id === user.id ? user : u)));
			toast.success(t`User updated successfully`);
		} else {
			// Create new
			const newUser = { ...user, id: `user-${Date.now()}`, createdAt: new Date().toISOString() };
			onUsersChange([...users, newUser]);
			toast.success(t`User created successfully`);
		}
		setIsEditorOpen(false);
		setEditingUser(null);
	};

	const handleToggleStatus = (user: User) => {
		// Prevent self-disable
		if (user.id === currentUserId) {
			toast.error(t`You cannot disable your own account`);
			return;
		}

		const newStatus: UserStatus = user.status === "active" ? "disabled" : "active";
		onUsersChange(users.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u)));
		toast.success(
			newStatus === "active" ? t`User enabled successfully` : t`User disabled successfully`,
		);
	};

	const formatTimestamp = (dateString?: string) => {
		if (!dateString) return t`Never`;
		const date = new Date(dateString);
		return date.toLocaleString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getRoleBadge = (role: UserRole) => {
		const config = {
			admin: { label: t`Admin`, className: "bg-purple-100 text-purple-700 border-purple-200" },
			operator: { label: t`Operator`, className: "bg-blue-100 text-blue-700 border-blue-200" },
			viewer: { label: t`Viewer`, className: "bg-slate-100 text-slate-700 border-slate-200" },
		};
		const cfg = config[role];
		return (
			<Badge variant="outline" className={cn("border", cfg.className)}>
				{cfg.label}
			</Badge>
		);
	};

	const getStatusBadge = (status: UserStatus) => {
		const config = {
			active: { label: t`Active`, className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
			disabled: { label: t`Disabled`, className: "bg-red-100 text-red-700 border-red-200" },
		};
		const cfg = config[status];
		return (
			<Badge variant="outline" className={cn("border", cfg.className)}>
				{cfg.label}
			</Badge>
		);
	};

	const activeFiltersCount = [roleFilter !== "all", statusFilter !== "all"].filter(Boolean).length;

	return (
		<>
			<div className="space-y-4">
				{/* Search and Filters */}
				<div className="flex flex-col sm:flex-row gap-3">
					<div className="relative flex-1">
						<Search
							className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
							aria-hidden="true"
						/>
						<Input
							placeholder={t`Search by name or email...`}
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-9"
							aria-label={t`Search users`}
						/>
					</div>
					<Button
						variant="outline"
						onClick={() => setShowFilters(!showFilters)}
						className="sm:w-auto"
					>
						<Filter className="size-4 mr-2" aria-hidden="true" />
						{t`Filters`}
						{activeFiltersCount > 0 && (
							<Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1.5 text-xs">
								{activeFiltersCount}
							</Badge>
						)}
					</Button>
					<Button onClick={handleCreate}>
						<Plus className="size-4 mr-2" aria-hidden="true" />
						{t`Create User`}
					</Button>
				</div>

				{/* Filter Panel */}
				{showFilters && (
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 border rounded-lg bg-muted/30">
						<div>
							<label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t`Role`}</label>
							<Select value={roleFilter} onValueChange={setRoleFilter}>
								<SelectTrigger className="h-8">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">{t`All Roles`}</SelectItem>
									<SelectItem value="admin">{t`Admin`}</SelectItem>
									<SelectItem value="operator">{t`Operator`}</SelectItem>
									<SelectItem value="viewer">{t`Viewer`}</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div>
							<label className="text-xs font-medium text-muted-foreground mb-1.5 block">
								{t`Status`}
							</label>
							<Select value={statusFilter} onValueChange={setStatusFilter}>
								<SelectTrigger className="h-8">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">{t`All Status`}</SelectItem>
									<SelectItem value="active">{t`Active`}</SelectItem>
									<SelectItem value="disabled">{t`Disabled`}</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{activeFiltersCount > 0 && (
							<div className="sm:col-span-2 flex justify-end">
								<Button
									variant="ghost"
									size="sm"
									onClick={() => {
										setRoleFilter("all");
										setStatusFilter("all");
									}}
									className="h-8"
								>
									<X className="size-3 mr-1" aria-hidden="true" />
									{t`Clear Filters`}
								</Button>
							</div>
						)}
					</div>
				)}

				{/* Table */}
				{filteredUsers.length === 0 ? (
					<div className="py-12 text-center">
						<p className="text-sm font-medium text-foreground mb-1">{t`No users found`}</p>
						<p className="text-xs text-muted-foreground">
							{searchQuery || activeFiltersCount > 0
								? t`Try adjusting your search or filters`
								: t`Create your first user to get started`}
						</p>
					</div>
				) : (
					<UsersTableContent
						users={filteredUsers}
						currentUserId={currentUserId}
						getRoleBadge={getRoleBadge}
						getStatusBadge={getStatusBadge}
						formatTimestamp={formatTimestamp}
						onEdit={handleEdit}
						onToggleStatus={handleToggleStatus}
					/>
				)}

				{/* Results Count */}
				<div className="text-sm text-muted-foreground">
					{t`Showing ${filteredUsers.length} user(s)`}
				</div>
			</div>

			{/* User Editor */}
			{isEditorOpen && (
				<UserEditor
					user={editingUser}
					open={isEditorOpen}
					onOpenChange={setIsEditorOpen}
					onSave={handleSave}
					currentUserId={currentUserId}
				/>
			)}
		</>
	);
}

// Extract table content to a separate component for cleaner code
interface UsersTableContentProps {
	users: User[];
	currentUserId: string;
	getRoleBadge: (role: UserRole) => React.ReactNode;
	getStatusBadge: (status: UserStatus) => React.ReactNode;
	formatTimestamp: (dateString?: string) => string;
	onEdit: (user: User) => void;
	onToggleStatus: (user: User) => void;
}

function UsersTableContent({
	users,
	currentUserId,
	getRoleBadge,
	getStatusBadge,
	formatTimestamp,
	onEdit,
	onToggleStatus,
}: UsersTableContentProps) {
	return (
		<div className="rounded-lg border bg-card">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>{t`Name`}</TableHead>
						<TableHead>{t`Email`}</TableHead>
						<TableHead>{t`Role`}</TableHead>
						<TableHead>{t`Status`}</TableHead>
						<TableHead>{t`Last Login`}</TableHead>
						<TableHead className="text-right">{t`Actions`}</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{users.map((user) => (
						<TableRow key={user.id}>
							<TableCell className="font-medium">{user.name}</TableCell>
							<TableCell>
								<div className="flex items-center gap-1.5">
									<Mail className="size-3.5 text-muted-foreground" aria-hidden="true" />
									<span className="text-sm">{user.email}</span>
								</div>
							</TableCell>
							<TableCell>{getRoleBadge(user.role)}</TableCell>
							<TableCell>{getStatusBadge(user.status)}</TableCell>
							<TableCell className="text-sm text-muted-foreground">
								{formatTimestamp(user.lastLoginAt)}
							</TableCell>
							<TableCell className="text-right">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
											<MoreHorizontal className="h-4 w-4" aria-hidden="true" />
											<span className="sr-only">{t`Open menu`}</span>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem onClick={() => onEdit(user)}>
											<Edit className="mr-2 h-4 w-4" aria-hidden="true" />
											{t`Edit`}
										</DropdownMenuItem>
										{user.status === "active" ? (
											<DropdownMenuItem
												onClick={() => onToggleStatus(user)}
												disabled={user.id === currentUserId}
												className="text-amber-600 focus:text-amber-600"
											>
												<UserX className="mr-2 h-4 w-4" aria-hidden="true" />
												{t`Disable`}
											</DropdownMenuItem>
										) : (
											<DropdownMenuItem
												onClick={() => onToggleStatus(user)}
												className="text-emerald-600 focus:text-emerald-600"
											>
												<UserCheck className="mr-2 h-4 w-4" aria-hidden="true" />
												{t`Enable`}
											</DropdownMenuItem>
										)}
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
