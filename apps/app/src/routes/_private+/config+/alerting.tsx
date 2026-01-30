import { Plus } from "lucide-react";

import { observer } from "~@/mobx";
import { Button } from "~@/ui";
import { useAlertRulesViewModel } from "~@/view-model";
import { AlertRuleEditor, AlertRulesTable } from "~@/views";

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

/**
 * Alert Rules Configuration page component.
 * Uses AlertRulesViewModel for all state management and CRUD operations.
 */
const AlertingConfigPage = observer(function AlertingConfigPage() {
	const vm = useAlertRulesViewModel({ rules: initialRules });

	return (
		<div className="container py-6">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Alert Rules</h1>
					<p className="text-muted-foreground text-sm">
						Configure automatic alerts for sensor readings that exceed defined thresholds.
					</p>
				</div>
				<Button onClick={() => vm.openEditor(null)}>
					<Plus className="mr-2 h-4 w-4" />
					Create Rule
				</Button>
			</div>

			<AlertRulesTable
				rules={vm.rules}
				onEdit={vm.openEditor}
				onDelete={vm.deleteRule}
				onToggle={vm.toggleRule}
				onDuplicate={vm.duplicateRule}
				formatDuration={formatDuration}
				getScopeLabel={getScopeLabel}
				getThresholdsSummary={getThresholdsSummary}
			/>

			<AlertRuleEditor
				open={vm.isEditorOpen}
				onOpenChange={(open) => !open && vm.closeEditor()}
				rule={vm.editingRule}
				onSave={vm.saveRule}
				sensorTypeOptions={sensorTypeOptions}
				sites={sites}
				equipment={equipment}
				timeOptions={timeOptions}
			/>
		</div>
	);
});

export default AlertingConfigPage;
