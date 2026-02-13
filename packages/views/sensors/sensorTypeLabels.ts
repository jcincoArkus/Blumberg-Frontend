import { SensorTypeKind } from "~@/api";
import { t } from "~@/i18n/macro";

const SENSOR_TYPE_NAMES: Record<SensorTypeKind, string> = {
	[SensorTypeKind._0]: t`Temperature`,
	[SensorTypeKind._1]: t`Humidity`,
	[SensorTypeKind._2]: t`CO2`,
	[SensorTypeKind._3]: t`Pressure`,
	[SensorTypeKind._4]: t`Energy`,
	[SensorTypeKind._5]: t`O2`,
	[SensorTypeKind._6]: t`Other`,
};

export function getSensorTypeKindDisplayName(type: SensorTypeKind | undefined): string {
	if (type === undefined || type === null) return "";
	return SENSOR_TYPE_NAMES[type as SensorTypeKind] ?? String(type);
}
