import {
	Calendar,
	Clock,
	Edit,
	Key,
	LogIn,
	Mail,
	Shield,
	ShieldCheck,
	User as UserIcon,
	Users,
	X,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage, Badge, Button, cn, Separator } from "~@/ui";

import type { LoginMethod, Role, User, UserStatus } from "./types";

export interface UserProfilePanelProps {
	user: User;
	roles: Role[];
	onClose?: () => void;
	onEdit?: (user: User) => void;
}

export function UserProfilePanel({ user, roles, onClose, onEdit }: UserProfilePanelProps) {
	const getInitials = (name: string): string => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	const getUserRoles = (): Role[] => {
		return user.roleIds
			.map((id) => roles.find((r) => r.id === id))
			.filter((r): r is Role => r !== undefined);
	};

	const getStatusConfig = (status: UserStatus) => {
		const configs = {
			active: {
				label: "Active",
				className:
					"bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400",
			},
			pending: {
				label: "Invite Pending",
				className:
					"bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400",
			},
			deactivated: {
				label: "Deactivated",
				className:
					"bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400",
			},
		};
		return configs[status];
	};

	const getLoginMethodLabel = (method: LoginMethod): string => {
		const labels: Record<LoginMethod, string> = {
			google: "Google",
			password: "Password",
			saml: "SAML",
			sso: "SSO",
		};
		return labels[method];
	};

	const formatDateTime = (dateString?: string): string => {
		if (!dateString) return "Never";
		const date = new Date(dateString);
		return date.toLocaleString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const formatRelativeTime = (dateString?: string): string => {
		if (!dateString) return "Never";
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 60) return `${diffMins} min ago`;
		if (diffHours < 24) return `${diffHours} hours ago`;
		if (diffDays < 30) return `${diffDays} days ago`;
		return formatDateTime(dateString);
	};

	const statusConfig = getStatusConfig(user.status);
	const userRoles = getUserRoles();

	return (
		<div className="w-full h-full flex flex-col bg-background border-l">
			{/* Header */}
			<div className="flex items-center justify-between p-4 border-b">
				<h3 className="font-semibold">User Details</h3>
				<div className="flex items-center gap-2">
					{onEdit && (
						<Button variant="ghost" size="sm" onClick={() => onEdit(user)}>
							<Edit className="size-4 mr-1" aria-hidden="true" />
							Edit
						</Button>
					)}
					{onClose && (
						<Button variant="ghost" size="icon" className="size-8" onClick={onClose}>
							<X className="size-4" aria-hidden="true" />
							<span className="sr-only">Close</span>
						</Button>
					)}
				</div>
			</div>

			{/* Content */}
			<div className="flex-1 overflow-y-auto p-4 space-y-6">
				{/* User Header */}
				<div className="flex items-center gap-4">
					<Avatar className="size-16">
						{user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
						<AvatarFallback className="text-lg">{getInitials(user.name)}</AvatarFallback>
					</Avatar>
					<div>
						<h4 className="text-lg font-semibold">{user.name}</h4>
						<Badge variant="outline" className={cn("mt-1", statusConfig.className)}>
							{statusConfig.label}
						</Badge>
					</div>
				</div>

				{/* Contact Section */}
				<Section title="Contact" icon={<Mail className="size-4" />}>
					<InfoRow label="Email" value={user.email} />
				</Section>

				{/* Roles Section */}
				<Section title="Roles" icon={<Shield className="size-4" />}>
					<div className="flex flex-wrap gap-2">
						{userRoles.map((role) => (
							<Badge key={role.id} variant="secondary">
								{role.name}
							</Badge>
						))}
						{userRoles.length === 0 && (
							<span className="text-sm text-muted-foreground">No roles assigned</span>
						)}
					</div>
				</Section>

				{/* Activity and Login Section */}
				<Section title="Activity and Login" icon={<LogIn className="size-4" />}>
					<InfoRow label="Status" value={statusConfig.label} />
					<InfoRow label="Last Active" value={formatRelativeTime(user.lastActiveAt)} />
					<InfoRow label="Last Login" value={formatDateTime(user.lastLoginAt)} />
					<InfoRow
						label="Login Methods"
						value={
							user.loginMethods.length > 0
								? user.loginMethods.map(getLoginMethodLabel).join(", ")
								: "None"
						}
					/>
					<InfoRow
						label="MFA"
						value={
							<span className={user.mfaEnabled ? "text-emerald-600" : "text-muted-foreground"}>
								{user.mfaEnabled ? "Enabled" : "Disabled"}
							</span>
						}
					/>
					<InfoRow label="Created" value={formatDateTime(user.createdAt)} />
					<InfoRow label="Modified" value={formatDateTime(user.modifiedAt)} />
				</Section>

				{/* Notes Section */}
				{user.notes && (
					<Section title="Notes" icon={<UserIcon className="size-4" />}>
						<p className="text-sm text-muted-foreground">{user.notes}</p>
					</Section>
				)}
			</div>
		</div>
	);
}

// Section Component
interface SectionProps {
	title: string;
	icon: React.ReactNode;
	children: React.ReactNode;
}

function Section({ title, icon, children }: SectionProps) {
	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2 text-muted-foreground">
				{icon}
				<span className="text-xs font-medium uppercase tracking-wider">{title}</span>
			</div>
			<div className="space-y-2">{children}</div>
		</div>
	);
}

// Info Row Component
interface InfoRowProps {
	label: string;
	value: React.ReactNode;
}

function InfoRow({ label, value }: InfoRowProps) {
	return (
		<div className="flex items-start justify-between gap-4">
			<span className="text-sm text-muted-foreground shrink-0">{label}</span>
			<span className="text-sm text-right">{value}</span>
		</div>
	);
}
