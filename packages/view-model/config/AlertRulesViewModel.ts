import { makeAutoObservable } from "~@/mobx";

import type { Disposable } from "../types";

/**
 * AlertRule type from mock data.
 * This mirrors the AlertRule interface from the alerting mock data.
 */
export interface AlertRule {
	id: string;
	name: string;
	description: string;
	enabled: boolean;
	sensorType: string;
	scope: {
		type: "all" | "site" | "equipment" | "sensor";
		siteIds?: string[];
		equipmentIds?: string[];
		sensorIds?: string[];
	};
	thresholds: {
		warning?: { min?: number; max?: number };
		critical?: { min?: number; max?: number };
	};
	timeWindow: number;
	consecutiveReadings: number;
	notifications: {
		channels: string[];
		escalation: boolean;
		escalationDelay?: number;
	};
	createdAt: string;
	updatedAt: string;
}

interface AlertRulesViewModelData {
	rules: AlertRule[];
}

/**
 * ViewModel for managing alert rules configuration.
 *
 * Encapsulates all CRUD operations and UI state for alert rules management.
 * Used by the alerting.tsx route to separate business logic from presentation.
 *
 * @example
 * ```tsx
 * const vm = useAlertRulesViewModel({ rules: initialRules });
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
export class AlertRulesViewModel implements Disposable {
	// Observable state
	rules: AlertRule[];
	editingRule: AlertRule | null = null;
	isEditorOpen = false;

	constructor(data: AlertRulesViewModelData) {
		makeAutoObservable(this);
		this.rules = data.rules;
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
