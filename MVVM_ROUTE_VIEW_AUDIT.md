# MVVM Route/View Audit

Este reporte lista todas las rutas y views, indicando si usan ViewModels y si utilizan hooks de estado/derivación (useState/useReducer/useMemo/useCallback).

## Resumen
- Rutas analizadas: 17
- Views analizadas: 58
- Archivos con ViewModel: 6
- Archivos con hooks de estado/derivación: 24

## Tabla de archivos
| Archivo | Tipo | Usa ViewModel | ViewModels | Hooks (useState/useReducer/useMemo/useCallback) |
| --- | --- | --- | --- | --- |
| apps/app/src/routes/_index.tsx | route | Sí | authViewModel | No |
| apps/app/src/routes/_private+/_private.tsx | route | No | - | No |
| apps/app/src/routes/_private+/admin+/users.tsx | route | Sí | useUsersViewModel | No |
| apps/app/src/routes/_private+/alerts.tsx | route | Sí | useAlertsViewModel | No |
| apps/app/src/routes/_private+/config+/alerting.tsx | route | Sí | useAlertRulesViewModel | No |
| apps/app/src/routes/_private+/config+/sensors.tsx | route | Sí | useSensorsConfigViewModel | No |
| apps/app/src/routes/_private+/equipment+/$id+/index.tsx | route | No | - | No |
| apps/app/src/routes/_private+/equipment+/$id+/overview.tsx | route | No | - | No |
| apps/app/src/routes/_private+/equipment-overview.tsx | route | No | - | No |
| apps/app/src/routes/_private+/home.tsx | route | Sí | useDashboardViewModel | No |
| apps/app/src/routes/_private+/ingestion.tsx | route | No | - | Sí |
| apps/app/src/routes/_private+/monitoring+/sensor-health.tsx | route | No | - | Sí |
| apps/app/src/routes/_private+/reports+/history.tsx | route | No | - | Sí |
| apps/app/src/routes/_private+/sensor-health.tsx | route | No | - | Sí |
| apps/app/src/routes/_private+/sites+/$id.tsx | route | No | - | No |
| apps/app/src/routes/_private+/sites+/index.tsx | route | No | - | No |
| apps/app/src/routes/_public+/_public.tsx | route | No | - | No |
| packages/views/admin/RoleEditorDialog.tsx | view | No | - | No |
| packages/views/admin/RolePermissionsEditor.tsx | view | No | - | Sí |
| packages/views/admin/RolesList.tsx | view | No | - | Sí |
| packages/views/admin/RolesPermissionsMatrix.tsx | view | No | - | No |
| packages/views/admin/UnauthorizedView.tsx | view | No | - | No |
| packages/views/admin/UserEditor.tsx | view | No | - | No |
| packages/views/admin/UserEditorNew.tsx | view | No | - | Sí |
| packages/views/admin/UserProfilePanel.tsx | view | No | - | No |
| packages/views/admin/UsersGrid.tsx | view | No | - | Sí |
| packages/views/admin/UsersTable.tsx | view | No | - | Sí |
| packages/views/alerts/AlertDetailsDrawer.tsx | view | No | - | Sí |
| packages/views/alerts/AlertsStatusTabs.tsx | view | No | - | No |
| packages/views/alerts/AlertsWorkQueueTable.tsx | view | No | - | Sí |
| packages/views/config/AlertRuleEditor.tsx | view | No | - | No |
| packages/views/config/AlertRulesTable.tsx | view | No | - | No |
| packages/views/config/SensorDetailsDrawer.tsx | view | No | - | No |
| packages/views/config/SensorEditor.tsx | view | No | - | Sí |
| packages/views/config/SensorsTable.tsx | view | No | - | Sí |
| packages/views/dashboard/AIInsightsPanel.tsx | view | No | - | No |
| packages/views/dashboard/ActiveAlertsPanel.tsx | view | No | - | Sí |
| packages/views/dashboard/DashboardPanel.tsx | view | No | - | No |
| packages/views/dashboard/DashboardShell.tsx | view | No | - | Sí |
| packages/views/dashboard/GlobalStatusBar.tsx | view | No | - | Sí |
| packages/views/dashboard/KPIGauge.tsx | view | No | - | No |
| packages/views/dashboard/KeyMetricsCards.tsx | view | No | - | No |
| packages/views/dashboard/SensorReliabilityPanel.tsx | view | No | - | Sí |
| packages/views/dashboard/TrendsPanel.tsx | view | No | - | No |
| packages/views/dashboard/ZonesOverviewPanel.tsx | view | No | - | No |
| packages/views/equipment/ClimateTab.tsx | view | No | - | No |
| packages/views/equipment/EnergyTab.tsx | view | No | - | No |
| packages/views/equipment/EquipmentAlertsPanel.tsx | view | No | - | No |
| packages/views/equipment/EquipmentDetailsTab.tsx | view | No | - | No |
| packages/views/equipment/EquipmentOverviewHeader.tsx | view | No | - | No |
| packages/views/equipment/HistoricalCharts.tsx | view | No | - | No |
| packages/views/equipment/LimitsComparisonPanel.tsx | view | No | - | No |
| packages/views/equipment/RecentAlerts.tsx | view | No | - | No |
| packages/views/equipment/RefrigerationTab.tsx | view | No | - | No |
| packages/views/equipment/SensorChart.tsx | view | No | - | No |
| packages/views/equipment/SensorReadingsGrid.tsx | view | No | - | No |
| packages/views/equipment/SensorsTable.tsx | view | No | - | No |
| packages/views/ingestion/ApiIngestionTab.tsx | view | No | - | Sí |
| packages/views/ingestion/CsvUploadTab.tsx | view | No | - | No |
| packages/views/ingestion/IngestionHistory.tsx | view | No | - | Sí |
| packages/views/ingestion/IngestionRunDetailsDrawer.tsx | view | No | - | No |
| packages/views/monitoring/SensorHealthDetailsDrawer.tsx | view | No | - | No |
| packages/views/monitoring/SensorHealthKPIs.tsx | view | No | - | No |
| packages/views/monitoring/SensorHealthTable.tsx | view | No | - | Sí |
| packages/views/reports/AlertsHistoryTab.tsx | view | No | - | Sí |
| packages/views/reports/AlertsTrendChart.tsx | view | No | - | No |
| packages/views/reports/HistoricalAlertDetailsDrawer.tsx | view | No | - | No |
| packages/views/reports/HistoricalFilters.tsx | view | No | - | No |
| packages/views/reports/HistoricalTrendChart.tsx | view | No | - | No |
| packages/views/reports/ReadingsHistoryTab.tsx | view | No | - | Sí |
| packages/views/reports/TrendIndicator.tsx | view | No | - | No |
| packages/views/sensor-health/SensorHealthFilters.tsx | view | No | - | No |
| packages/views/sensor-health/SensorHealthStats.tsx | view | No | - | No |
| packages/views/sensor-health/SensorHealthTable.tsx | view | No | - | Sí |
| packages/views/sites/SiteTrendCharts.tsx | view | No | - | Sí |
