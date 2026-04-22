/**
 * Polling interval for alerts and dashboard data (auto-refresh without reload).
 * Used by DashboardAlertsViewModel and AlertsViewModel.
 */
export const ALERTS_POLL_INTERVAL_MS = 30_000; // 30 seconds

/**
 * Polling interval for dashboard sensor health list (Sensor Metrics panel).
 * Keeps readings and status in sync with alerts.
 */
export const SENSORS_POLL_INTERVAL_MS = 30_000; // 30 seconds
