# MVVM Architecture Migration Tasks

> Migrate codebase from scattered React hooks to proper MVVM architecture using MobX ViewModels

## Overview

| Phase | Route | Complexity | Hooks to Replace |
|-------|-------|------------|------------------|
| 0 | Infrastructure | - | Set up base patterns |
| 1 | `alerts.tsx` | MEDIUM | 2 useState, 1 useCallback |
| 2 | `home.tsx` | HIGH | 1 useState, 9 useMemo |
| 3 | `admin+/users.tsx` | HIGH | 8 useState |
| 4 | `config+/sensors.tsx` | HIGH | 7 useState, 1 useMemo |
| 5 | `config+/alerting.tsx` | MEDIUM | 3 useState |

**Skipped routes** (presentational, no ViewModels needed):
- `sites+/index.tsx`
- `sites+/$id.tsx`

---

## Phase 0: Infrastructure Setup

- [ ] **0.1** Create ViewModel base patterns documentation
  - Document singleton vs instance patterns
  - Factory hook pattern
  - Integration with ObservedQuery/ObservedMutation

- [ ] **0.2** Create packages/view-model directory structure
  - `alerts/`, `dashboard/`, `admin/`, `config/`
  - Each with `index.ts` exports

- [ ] **0.3** Create base ViewModel types
  - `Disposable` interface
  - Common patterns

- [ ] **0.4** Update packages/view-model/index.ts exports

---

## Phase 1: AlertsViewModel (`alerts.tsx`)

**Current state**: 2 `useState`, 1 `useCallback`  
**Target**: `AlertsViewModel` with observable state and computed properties

- [ ] **1.1** Create `AlertsViewModel` class
  - Observable: `alerts`, `activeTab`
  - Computed: `filteredAlerts`, `statusCounts`, `activeAlerts`, `criticalAlerts`, `highAlerts`, `resolvedToday`
  - Actions: `setActiveTab`, `acknowledgeAlert`, `resolveAlert`, `updateAlert`
  - Method: `dispose()`

- [ ] **1.2** Create `useAlertsViewModel` factory hook
  - Creates ViewModel instance
  - Handles cleanup on unmount

- [ ] **1.3** Create alerts ViewModel types (if needed)

- [ ] **1.4** Create alerts index exports

- [ ] **1.5** Refactor `alerts.tsx` route
  - Wrap with `observer()`
  - Use `useAlertsViewModel` hook
  - Replace state with vm properties
  - Replace handlers with vm actions

---

## Phase 2: DashboardViewModel (`home.tsx`)

**Current state**: 1 `useState`, 9 `useMemo`  
**Target**: `DashboardViewModel` with domain filtering and derived metrics

- [ ] **2.1** Create `DashboardViewModel` class
  - Observable: `activeDomain`
  - Computed: `domainSensors`, `domainAlerts`, `systemStatus`, `activeAlerts`, `alertsBySeverity`, `keyMetrics`, `trendData`, `sensorReliability`, `sensorsOnline`, `displayInsights`
  - Actions: `setActiveDomain`

- [ ] **2.2** Create `useDashboardViewModel` factory hook

- [ ] **2.3** Extract domain filtering helpers to ViewModel
  - `filterSensorsByDomain()`
  - `filterAlertsByDomain()`

- [ ] **2.4** Create dashboard index exports

- [ ] **2.5** Refactor `home.tsx` route

---

## Phase 3: UsersViewModel (`admin+/users.tsx`)

**Current state**: 8 `useState`  
**Target**: `UsersViewModel` with user/role CRUD

- [ ] **3.1** Create `UsersViewModel` class
  - Observable: `users`, `roles`, `rolePermissions`, `selectedUser`, `selectedRole`, `editingUser`, `editingRole`, `isEditorOpen`, `isRoleEditorOpen`
  - Computed: `hasAdminRole`, `selectedRolePermissions`, `editingRolePermissions`
  - User actions: `createUser`, `updateUser`, `selectUser`, `openUserEditor`, `closeUserEditor`
  - Role actions: `createRole`, `updateRole`, `deleteRole`, `selectRole`, `openRoleEditor`, `closeRoleEditor`

- [ ] **3.2** Create `useUsersViewModel` factory hook

- [ ] **3.3** Create admin index exports

- [ ] **3.4** Refactor `users.tsx` route

---

## Phase 4: SensorsConfigViewModel (`config+/sensors.tsx`)

**Current state**: 7 `useState`, 1 `useMemo`  
**Target**: `SensorsConfigViewModel` with filtering + CRUD

- [ ] **4.1** Create `SensorsConfigViewModel` class
  - Observable: `sensors`, `selectedSensor`, `editingSensor`, `isEditorOpen`, `isDetailsOpen`, `searchQuery`, `statusFilter`, `typeFilter`, `siteFilter`, `equipmentFilter`
  - Computed: `filteredSensors`, `hasActiveFilters`
  - Filter actions: `setSearchQuery`, `setStatusFilter`, `setTypeFilter`, `setSiteFilter`, `setEquipmentFilter`, `clearFilters`
  - CRUD actions: `createSensor`, `updateSensor`, `toggleSensorStatus`, `viewDetails`, `openEditor`, `closeEditor`, `closeDetails`

- [ ] **4.2** Create `useSensorsConfigViewModel` factory hook

- [ ] **4.3** Create config index exports

- [ ] **4.4** Refactor `sensors.tsx` route

---

## Phase 5: AlertRulesViewModel (`config+/alerting.tsx`)

**Current state**: 3 `useState`  
**Target**: `AlertRulesViewModel` with CRUD

- [ ] **5.1** Create `AlertRulesViewModel` class
  - Observable: `rules`, `editingRule`, `isEditorOpen`
  - Actions: `createRule`, `updateRule`, `deleteRule`, `toggleRule`, `duplicateRule`, `openEditor`, `closeEditor`

- [ ] **5.2** Create `useAlertRulesViewModel` factory hook

- [ ] **5.3** Update config index exports

- [ ] **5.4** Refactor `alerting.tsx` route

