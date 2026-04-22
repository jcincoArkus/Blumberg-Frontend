import { makeAutoObservable } from "~@/mobx";
import type {
	AlertingEquipment,
	AlertingSite,
	AlertRule,
	SensorTypeOption,
	TimeOption,
} from "~@/models";
import {
	getAlertDuration,
	getAlertingEquipment,
	getAlertingSensorTypeOptions,
	getAlertingSites,
	getAlertingTimeOptions,
	getAlertRules,
	getAlertScopeLabel,
	getAlertThresholdsSummary,
} from "~@/models";

import type { Disposable } from "../types";

/**
 * ViewModel for managing alert rules configuration.
 *
 * Encapsulates all CRUD operations and UI state for alert rules management.
 * Used by the alerting.tsx route to separate business logic from presentation.
 *
 * @example
 * ```tsx
 * const vm = useAlertRulesViewModel();
 *
 * return (
 *   <AlertRulesTable
 *     rules={vm.rules}
 *     onEdit={vm.openEditor}
 *     onDelete={vm.deleteRule}
 *     onToggle={vm.toggleRule}
 *     onDuplicate={vm.duplicateRule}
 *   />
 * );
 * ```
 */
class AlertRulesViewModel implements Disposable {
	// Observable state
	rules: AlertRule[];
	readonly sensorTypeOptions: SensorTypeOption[];
	readonly sites: AlertingSite[];
	readonly equipment: AlertingEquipment[];
	readonly timeOptions: TimeOption[];
	readonly formatDuration = getAlertDuration;
	readonly getScopeLabel = getAlertScopeLabel;
	readonly getThresholdsSummary = getAlertThresholdsSummary;
	editingRule: AlertRule | null = null;
	isEditorOpen = false;

	constructor() {
		makeAutoObservable(this);
		this.rules = getAlertRules();
		this.sensorTypeOptions = getAlertingSensorTypeOptions();
		this.sites = getAlertingSites();
		this.equipment = getAlertingEquipment();
		this.timeOptions = getAlertingTimeOptions();
	}

	// Editor actions
	openEditor = (rule: AlertRule | null) => {
		this.editingRule = rule;
		this.isEditorOpen = true;
	};

	closeEditor = () => {
		this.isEditorOpen = false;
		this.editingRule = null;
	};

	// CRUD actions
	saveRule = (rule: AlertRule) => {
		if (this.editingRule) {
			// Update existing rule
			this.rules = this.rules.map((r) => (r.id === rule.id ? rule : r));
		} else {
			// Create new rule
			this.rules = [...this.rules, rule];
		}
		this.closeEditor();
	};

	deleteRule = (ruleId: string) => {
		this.rules = this.rules.filter((r) => r.id !== ruleId);
	};

	toggleRule = (ruleId: string, enabled: boolean) => {
		this.rules = this.rules.map((r) =>
			r.id === ruleId ? { ...r, enabled, updatedAt: new Date().toISOString() } : r,
		);
	};

	duplicateRule = (rule: AlertRule) => {
		const duplicatedRule: AlertRule = {
			...rule,
			id: `rule-${Date.now()}`,
			name: `${rule.name} (Copy)`,
			enabled: false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		this.rules = [...this.rules, duplicatedRule];
	};

	dispose() {
		// No subscriptions to clean up currently
	}
}

export const alertRulesViewModel = new AlertRulesViewModel();

export function useAlertRulesViewModel() {
	return alertRulesViewModel;
}
