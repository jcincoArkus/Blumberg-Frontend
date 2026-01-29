import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "~@/ui";
import { type AlertRule, AlertRuleEditor, AlertRulesTable } from "~@/views";

import {
	equipment,
	formatDuration,
	getScopeLabel,
	getThresholdsSummary,
	alertRules as initialRules,
	sensorTypeOptions,
	sites,
	timeOptions,
} from "../../../mock-data/alerting";

export default function AlertingConfigPage() {
	const [rules, setRules] = useState<AlertRule[]>(initialRules);
	const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
	const [isEditorOpen, setIsEditorOpen] = useState(false);

	const handleCreate = () => {
		setEditingRule(null);
		setIsEditorOpen(true);
	};

	const handleEdit = (rule: AlertRule) => {
		setEditingRule(rule);
		setIsEditorOpen(true);
	};

	const handleSave = (rule: AlertRule) => {
		if (editingRule) {
			setRules((prev) => prev.map((r) => (r.id === rule.id ? rule : r)));
		} else {
			setRules((prev) => [...prev, rule]);
		}
		setIsEditorOpen(false);
		setEditingRule(null);
	};

	const handleDelete = (ruleId: string) => {
		setRules((prev) => prev.filter((r) => r.id !== ruleId));
	};

	const handleToggle = (ruleId: string, enabled: boolean) => {
		setRules((prev) =>
			prev.map((r) =>
				r.id === ruleId ? { ...r, enabled, updatedAt: new Date().toISOString() } : r,
			),
		);
	};

	const handleDuplicate = (rule: AlertRule) => {
		const duplicatedRule: AlertRule = {
			...rule,
			id: `rule-${Date.now()}`,
			name: `${rule.name} (Copy)`,
			enabled: false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		setRules((prev) => [...prev, duplicatedRule]);
	};

	return (
		<div className="container py-6">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Alert Rules</h1>
					<p className="text-muted-foreground text-sm">
						Configure automatic alerts for sensor readings that exceed defined thresholds.
					</p>
				</div>
				<Button onClick={handleCreate}>
					<Plus className="mr-2 h-4 w-4" />
					Create Rule
				</Button>
			</div>

			<AlertRulesTable
				rules={rules}
				onEdit={handleEdit}
				onDelete={handleDelete}
				onToggle={handleToggle}
				onDuplicate={handleDuplicate}
				formatDuration={formatDuration}
				getScopeLabel={getScopeLabel}
				getThresholdsSummary={getThresholdsSummary}
			/>

			<AlertRuleEditor
				open={isEditorOpen}
				onOpenChange={setIsEditorOpen}
				rule={editingRule}
				onSave={handleSave}
				sensorTypeOptions={sensorTypeOptions}
				sites={sites}
				equipment={equipment}
				timeOptions={timeOptions}
			/>
		</div>
	);
}
