import { Copy, Edit, MoreHorizontal, ShieldAlert, Trash2 } from "lucide-react";
import { useState } from "react";

import { t } from "~@/i18n/macro";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	Badge,
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	Switch,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~@/ui";

import type { AlertRule, AlertRuleScope, AlertRuleThresholds } from "./types";

interface AlertRulesTableProps {
	rules: AlertRule[];
	onEdit: (rule: AlertRule) => void;
	onDelete: (ruleId: string) => void;
	onToggle: (ruleId: string, enabled: boolean) => void;
	onDuplicate: (rule: AlertRule) => void;
	formatDuration: (seconds: number) => string;
	getScopeLabel: (scope: AlertRuleScope) => string;
	getThresholdsSummary: (thresholds: AlertRuleThresholds) => string;
}

export function AlertRulesTable({
	rules,
	onEdit,
	onDelete,
	onToggle,
	onDuplicate,
	formatDuration,
	getScopeLabel,
	getThresholdsSummary,
}: AlertRulesTableProps) {
	const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

	const handleDeleteConfirm = () => {
		if (deleteConfirmId) {
			onDelete(deleteConfirmId);
			setDeleteConfirmId(null);
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	if (rules.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12 text-center">
				<ShieldAlert className="text-muted-foreground mb-4 h-12 w-12" />
				<h3 className="text-lg font-medium">{t`No Alert Rules`}</h3>
				<p className="text-muted-foreground mt-1 text-sm">
					{t`Create your first alert rule to start monitoring your sensors.`}
				</p>
			</div>
		);
	}

	return (
		<>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-20">{t`Status`}</TableHead>
						<TableHead>{t`Rule Name`}</TableHead>
						<TableHead>{t`Sensor Types`}</TableHead>
						<TableHead>{t`Scope`}</TableHead>
						<TableHead>{t`Severity`}</TableHead>
						<TableHead>{t`Thresholds`}</TableHead>
						<TableHead>{t`Time`}</TableHead>
						<TableHead>{t`Recipients`}</TableHead>
						<TableHead>{t`Updated`}</TableHead>
						<TableHead className="w-17.5">{t`Actions`}</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{rules.map((rule) => (
						<TableRow key={rule.id}>
							<TableCell>
								<Switch
									checked={rule.enabled}
									onCheckedChange={(checked) => onToggle(rule.id, checked)}
									aria-label={rule.enabled ? t`Disable rule` : t`Enable rule`}
								/>
							</TableCell>
							<TableCell className="font-medium">
								<div>
									<div>{rule.name}</div>
									{rule.description && (
										<div className="text-muted-foreground text-xs">{rule.description}</div>
									)}
								</div>
							</TableCell>
							<TableCell>
								<div className="flex flex-wrap gap-1">
									{rule.sensorTypes.map((type) => (
										<Badge key={type} variant="secondary" className="text-xs">
											{type}
										</Badge>
									))}
								</div>
							</TableCell>
							<TableCell className="max-w-50 truncate" title={getScopeLabel(rule.scope)}>
								{getScopeLabel(rule.scope)}
							</TableCell>
							<TableCell>
								<Badge
									variant="outline"
									className={
										rule.severity === "alert"
											? "border-red-300 bg-red-50 text-red-700"
											: "border-amber-300 bg-amber-50 text-amber-700"
									}
								>
									{rule.severity}
								</Badge>
							</TableCell>
							<TableCell>{getThresholdsSummary(rule.thresholds)}</TableCell>
							<TableCell>{formatDuration(rule.minOutOfRangeSeconds)}</TableCell>
							<TableCell>
								<Badge variant="outline">{rule.notifications.length}</Badge>
							</TableCell>
							<TableCell className="text-muted-foreground text-sm">
								{formatDate(rule.updatedAt)}
							</TableCell>
							<TableCell>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon-sm" aria-label={t`Actions`}>
											<MoreHorizontal className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem onClick={() => onEdit(rule)}>
											<Edit className="mr-2 h-4 w-4" />
											{t`Edit`}
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => onDuplicate(rule)}>
											<Copy className="mr-2 h-4 w-4" />
											{t`Duplicate`}
										</DropdownMenuItem>
										<DropdownMenuItem
											variant="destructive"
											onClick={() => setDeleteConfirmId(rule.id)}
										>
											<Trash2 className="mr-2 h-4 w-4" />
											{t`Delete`}
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			<AlertDialog
				open={!!deleteConfirmId}
				onOpenChange={(open) => !open && setDeleteConfirmId(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t`Delete Alert Rule`}</AlertDialogTitle>
						<AlertDialogDescription>
							{t`Are you sure you want to delete this alert rule? This action cannot be undone.`}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{t`Cancel`}</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteConfirm}
							className="bg-destructive text-white hover:bg-destructive/90"
						>
							{t`Delete`}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
