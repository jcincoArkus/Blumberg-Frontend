import { Plus } from "lucide-react";

import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { Button } from "~@/ui";
import { useAlertRulesViewModel } from "~@/view-model";
import { AlertRuleEditor, AlertRulesTable } from "~@/views";

/**
 * Alert Rules Configuration page component.
 * Uses AlertRulesViewModel for all state management and CRUD operations.
 */
const AlertingConfigPage = observer(function AlertingConfigPage() {
	const vm = useAlertRulesViewModel();

	return (
		<div className="container py-6">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">{t`Alert Rules`}</h1>
					<p className="text-muted-foreground text-sm">
						{t`Configure automatic alerts for sensor readings that exceed defined thresholds.`}
					</p>
				</div>
				<Button onClick={() => vm.openEditor(null)}>
					<Plus className="mr-2 h-4 w-4" />
					{t`Create Rule`}
				</Button>
			</div>

			<AlertRulesTable
				rules={vm.rules}
				onEdit={vm.openEditor}
				onDelete={vm.deleteRule}
				onToggle={vm.toggleRule}
				onDuplicate={vm.duplicateRule}
				formatDuration={vm.formatDuration}
				getScopeLabel={vm.getScopeLabel}
				getThresholdsSummary={vm.getThresholdsSummary}
			/>

			<AlertRuleEditor
				open={vm.isEditorOpen}
				onOpenChange={(open) => !open && vm.closeEditor()}
				rule={vm.editingRule}
				onSave={vm.saveRule}
				sensorTypeOptions={vm.sensorTypeOptions}
				sites={vm.sites}
				equipment={vm.equipment}
				timeOptions={vm.timeOptions}
			/>
		</div>
	);
});

export default AlertingConfigPage;
