import {
	Activity,
	ArrowRight,
	CheckCircle2,
	Clock,
	Edit,
	MapPin,
	Server,
	SlidersHorizontal,
	X,
	XCircle,
} from "lucide-react";
import { Link } from "react-router";

import { t } from "~@/i18n/macro";
import {
	Badge,
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	cn,
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	Separator,
	Switch,
} from "~@/ui";

import type { Sensor } from "./types";

interface SensorDetailsDrawerProps {
	sensor: Sensor;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onEdit: (sensor: Sensor) => void;
	onSetThreshold: (sensor: Sensor) => void;
	onToggleStatus: (id: string, status: string) => void;
}

function formatTimestamp(dateString?: string): string {
	if (!dateString) return t`Never`;
	const date = new Date(dateString);
	return date.toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

const getStatusConfig = () =>
	({
		active: {
			label: t`Active`,
			className: "bg-emerald-50 text-emerald-700 border-emerald-200",
			Icon: CheckCircle2,
		},
		inactive: {
			label: t`Inactive`,
			className: "bg-slate-100 text-slate-700 border-slate-200",
			Icon: XCircle,
		},
		warning: {
			label: t`Warning`,
			className: "bg-amber-50 text-amber-700 border-amber-200",
			Icon: Activity,
		},
		stale: {
			label: t`Stale`,
			className: "bg-orange-50 text-orange-700 border-orange-200",
			Icon: Clock,
		},
		offline: {
			label: t`Offline`,
			className: "bg-red-50 text-red-700 border-red-200",
			Icon: XCircle,
		},
		error: { label: t`Error`, className: "bg-red-50 text-red-700 border-red-200", Icon: XCircle },
	}) as Record<string, { label: string; className: string; Icon: typeof CheckCircle2 }>;

function getStatusBadge(status: string): React.ReactNode {
	const config = getStatusConfig();
	const cfg = config[status] || config.inactive;
	const Icon = cfg.Icon;
	return (
		<Badge variant="outline" className={cn("border", cfg.className)}>
			<Icon className="size-3 mr-1" />
			{cfg.label}
		</Badge>
	);
}

export function SensorDetailsDrawer({
	sensor,
	open,
	onOpenChange,
	onEdit,
	onSetThreshold,
	onToggleStatus,
}: SensorDetailsDrawerProps) {
	const isMapped = sensor.dataMapping && sensor.dataMapping.length > 0;

	return (
		<Drawer open={open} onOpenChange={onOpenChange} direction="right">
			<DrawerContent className="h-full w-full sm:max-w-2xl">
				<DrawerHeader className="border-b">
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<DrawerTitle className="text-xl font-semibold mb-2">{t`Sensor Details`}</DrawerTitle>
							<DrawerDescription>{t`Complete information about this sensor`}</DrawerDescription>
						</div>
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									onSetThreshold(sensor);
									onOpenChange(false);
								}}
								className="h-8"
							>
								<SlidersHorizontal className="h-4 w-4 mr-1.5" />
								{t`Set Threshold`}
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									onEdit(sensor);
									onOpenChange(false);
								}}
								className="h-8"
							>
								<Edit className="h-4 w-4 mr-1.5" />
								{t`Edit`}
							</Button>
							<DrawerClose asChild>
								<Button
									variant="ghost"
									size="sm"
									className="h-8 w-8 p-0"
									aria-label={t`Close drawer`}
								>
									<X className="h-4 w-4" />
								</Button>
							</DrawerClose>
						</div>
					</div>
				</DrawerHeader>

				<div className="flex-1 overflow-y-auto p-6 space-y-6">
					{/* Identification */}
					<div className="space-y-4">
						<h3 className="text-sm font-semibold text-foreground">{t`Identification`}</h3>
						<div className="space-y-3">
							<div>
								<p className="text-xs text-muted-foreground mb-1">{t`Sensor ID`}</p>
								<p className="text-sm font-mono font-medium text-foreground">{sensor.id}</p>
							</div>
							<div>
								<p className="text-xs text-muted-foreground mb-1">{t`Display Name`}</p>
								<p className="text-sm font-medium text-foreground">{sensor.name}</p>
							</div>
							{sensor.description && (
								<div>
									<p className="text-xs text-muted-foreground mb-1">{t`Description`}</p>
									<p className="text-sm text-foreground">{sensor.description}</p>
								</div>
							)}
						</div>
					</div>

					<Separator />

					{/* Measurement */}
					<div className="space-y-4">
						<h3 className="text-sm font-semibold text-foreground">{t`Measurement`}</h3>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<p className="text-xs text-muted-foreground mb-1">{t`Sensor Type`}</p>
								<Badge variant="outline" className="capitalize">
									{sensor.type}
								</Badge>
							</div>
							<div>
								<p className="text-xs text-muted-foreground mb-1">{t`Unit`}</p>
								<p className="text-sm font-medium text-foreground">{sensor.unit}</p>
							</div>
							{sensor.value !== undefined && (
								<div>
									<p className="text-xs text-muted-foreground mb-1">{t`Current Value`}</p>
									<p className="text-sm font-medium text-foreground">
										{sensor.value} {sensor.unit}
									</p>
								</div>
							)}
						</div>
					</div>

					<Separator />

					{/* Installation Context */}
					<div className="space-y-4">
						<h3 className="text-sm font-semibold text-foreground">{t`Installation Context`}</h3>
						<div className="space-y-3">
							<div>
								<p className="text-xs text-muted-foreground mb-1">{t`Site`}</p>
								<Link
									to={`/sites/${sensor.siteId}`}
									className="text-sm font-medium text-primary hover:underline flex items-center gap-1.5"
								>
									<MapPin className="size-4" />
									{sensor.siteName || t`Unknown Site`}
								</Link>
							</div>
							<div>
								<p className="text-xs text-muted-foreground mb-1">{t`Equipment`}</p>
								{sensor.equipmentId ? (
									<Link
										to={`/equipment/${sensor.equipmentId}`}
										className="text-sm font-medium text-primary hover:underline flex items-center gap-1.5"
									>
										<Server className="size-4" />
										{sensor.equipmentName || t`Unknown Equipment`}
									</Link>
								) : (
									<p className="text-sm text-muted-foreground">{t`Unassigned`}</p>
								)}
							</div>
							{sensor.physicalLocation && (
								<div>
									<p className="text-xs text-muted-foreground mb-1">{t`Physical Location`}</p>
									<p className="text-sm text-foreground">{sensor.physicalLocation}</p>
								</div>
							)}
						</div>
					</div>

					<Separator />

					{/* Status */}
					<div className="space-y-4">
						<h3 className="text-sm font-semibold text-foreground">{t`Status`}</h3>
						<div className="space-y-3">
							<div className="flex items-center justify-between p-3 rounded-lg border bg-card">
								<div>
									<p className="text-xs text-muted-foreground mb-1">{t`Status`}</p>
									{getStatusBadge(sensor.status)}
								</div>
								<Switch
									checked={sensor.status === "active"}
									onCheckedChange={(checked) =>
										onToggleStatus(sensor.id, checked ? "active" : "inactive")
									}
									aria-label={t`Toggle sensor status`}
								/>
							</div>
							<div>
								<p className="text-xs text-muted-foreground mb-1">{t`Last Seen`}</p>
								<div className="flex items-center gap-1.5 text-sm">
									<Clock className="size-3.5 text-muted-foreground" />
									<span>{formatTimestamp(sensor.lastSeen)}</span>
								</div>
							</div>
							{sensor.lastSeen && (
								<div>
									<p className="text-xs text-muted-foreground mb-1">{t`Health`}</p>
									<Badge
										variant="outline"
										className={
											sensor.status === "active"
												? "bg-emerald-50 text-emerald-700 border-emerald-200"
												: "bg-amber-50 text-amber-700 border-amber-200"
										}
									>
										{sensor.status === "active" ? t`OK` : t`Warning`}
									</Badge>
								</div>
							)}
						</div>
					</div>

					<Separator />

					{/* Data Mapping */}
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-sm font-semibold text-foreground">{t`Data Field Mapping`}</h3>
							{isMapped ? (
								<Badge
									variant="outline"
									className="bg-emerald-50 text-emerald-700 border-emerald-200"
								>
									<CheckCircle2 className="size-3 mr-1" />
									{t`Mapped`}
								</Badge>
							) : (
								<Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
									<XCircle className="size-3 mr-1" />
									{t`Unmapped`}
								</Badge>
							)}
						</div>

						{isMapped && sensor.dataMapping ? (
							<div className="space-y-3">
								{sensor.dataMapping.map((mapping) => (
									<Card key={mapping.id}>
										<CardHeader className="pb-3">
											<CardTitle className="text-sm">{t`Field Mapping`}</CardTitle>
										</CardHeader>
										<CardContent className="space-y-2">
											<div className="grid grid-cols-2 gap-3">
												<div>
													<p className="text-xs text-muted-foreground mb-1">{t`Incoming Field`}</p>
													<p className="text-sm font-mono font-medium">{mapping.incomingField}</p>
												</div>
												<div className="flex items-center gap-2">
													<ArrowRight className="size-4 text-muted-foreground" />
													<div>
														<p className="text-xs text-muted-foreground mb-1">{t`Maps To`}</p>
														<Badge variant="outline" className="capitalize">
															{mapping.mapsTo}
														</Badge>
													</div>
												</div>
											</div>
											{mapping.unitOverride && (
												<div>
													<p className="text-xs text-muted-foreground mb-1">{t`Unit Override`}</p>
													<p className="text-sm">{mapping.unitOverride}</p>
												</div>
											)}
											{mapping.transform && mapping.transform.type !== "none" && (
												<div>
													<p className="text-xs text-muted-foreground mb-1">{t`Transform`}</p>
													<p className="text-sm">
														{mapping.transform.type === "scale" && mapping.transform.factor
															? t`Scale by ${mapping.transform.factor}`
															: mapping.transform.type === "offset" && mapping.transform.offset
																? t`Offset by ${mapping.transform.offset}`
																: t`None`}
													</p>
												</div>
											)}
										</CardContent>
									</Card>
								))}
							</div>
						) : (
							<Card>
								<CardContent className="py-6 text-center">
									<XCircle className="size-8 mx-auto mb-2 text-muted-foreground" />
									<p className="text-sm text-muted-foreground">
										{t`This sensor has no data field mappings configured.`}
									</p>
									<p className="text-xs text-muted-foreground mt-1">
										{t`Edit the sensor to configure data mapping.`}
									</p>
								</CardContent>
							</Card>
						)}
					</div>

					{/* Mapping Preview */}
					{isMapped && sensor.dataMapping && (
						<>
							<Separator />
							<Card>
								<CardHeader>
									<CardTitle className="text-sm">{t`Mapping Preview`}</CardTitle>
									<CardDescription>
										{t`How incoming payload fields map to system schema`}
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-2 text-sm">
										{sensor.dataMapping.map((mapping) => (
											<div
												key={mapping.id}
												className="flex items-center gap-2 p-2 rounded border bg-muted/30"
											>
												<code className="text-xs bg-background px-2 py-1 rounded">
													{mapping.incomingField}
												</code>
												<ArrowRight className="size-4 text-muted-foreground" />
												<Badge variant="outline" className="capitalize">
													{mapping.mapsTo}
												</Badge>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						</>
					)}
				</div>
			</DrawerContent>
		</Drawer>
	);
}
