import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { Link, Outlet, useLocation, useParams } from "react-router";

import { SensorStatus } from "~@/api";
import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { Button, Card, CardContent } from "~@/ui";
import { useSensorViewModel } from "~@/view-model";

function statusLabel(status: SensorStatus | undefined): string {
	switch (status) {
		case SensorStatus._0:
			return t`Active`;
		case SensorStatus._1:
			return t`Inactive`;
		case SensorStatus._2:
			return t`Maintenance`;
		case SensorStatus._3:
			return t`Offline`;
		default:
			return "—";
	}
}

export default observer(function SensorDetailPage() {
	const { id } = useParams();
	const location = useLocation();
	const vm = useSensorViewModel();

	useEffect(() => {
		if (id) vm.loadSensor(id);
		return () => vm.dispose();
	}, [id, vm]);

	if (vm.isLoading && !vm.sensor) {
		return (
			<div className="flex items-center justify-center min-h-[200px]">
				<p className="text-muted-foreground">{t`Loading...`}</p>
			</div>
		);
	}

	if (vm.hasError || !vm.sensor) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
				<h1 className="text-2xl font-bold text-foreground">{t`Sensor Not Found`}</h1>
				<p className="text-muted-foreground">{t`The sensor you're looking for doesn't exist.`}</p>
				<Button asChild>
					<Link to="/sensors">
						<ArrowLeft className="size-4 mr-2" />
						{t`Back to Sensors`}
					</Link>
				</Button>
			</div>
		);
	}

	const sensor = vm.sensor;

	// When on a child route (e.g. edit), show only the child — full page
	if (id && location.pathname !== `/sensors/${id}`) {
		return <Outlet />;
	}

	return (
		<div className="space-y-6">
			<div className="flex items-start justify-between">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="sm" asChild>
						<Link to={sensor.equipmentId ? `/equipment/${sensor.equipmentId}/sensors` : "/sensors"}>
							<ArrowLeft className="size-4 mr-2" />
							{t`Back`}
						</Link>
					</Button>
					<div>
						<h1 className="text-2xl font-bold text-foreground">{sensor.serial ?? t`Sensor`}</h1>
						<p className="text-muted-foreground">{statusLabel(sensor.status)}</p>
					</div>
				</div>
				<Button variant="outline" size="sm" asChild>
					<Link to={`/sensors/${sensor.id}/edit`}>{t`Edit`}</Link>
				</Button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Card>
					<CardContent className="p-4">
						<p className="text-sm text-muted-foreground">{t`Equipment`}</p>
						{sensor.equipmentId ? (
							<Link
								to={`/equipment/${sensor.equipmentId}`}
								className="font-medium text-primary hover:underline"
							>
								{sensor.equipmentName ?? sensor.equipmentId}
							</Link>
						) : (
							<p className="font-medium">—</p>
						)}
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<p className="text-sm text-muted-foreground">{t`Sensor Type`}</p>
						<p className="font-medium">{sensor.sensorTypeName ?? sensor.sensorTypeId ?? "—"}</p>
					</CardContent>
				</Card>
			</div>

			<Outlet />
		</div>
	);
});
