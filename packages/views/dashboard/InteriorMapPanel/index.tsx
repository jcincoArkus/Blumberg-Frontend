import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { Card, CardContent, CardHeader, CardTitle } from "~@/ui";
import { useInteriorMapPanelViewModel } from "~@/view-model";

import { AlertBeacon } from "./AlertBeacon";
import { WAREHOUSE_ZONES, ZONE_COLORS } from "./constants";
import { getZoneStatusStyle } from "./helpers";
import { WarningIcon } from "./WarningIcon";

interface InteriorMapPanelProps {
	selectedLocation?: string | null;
}

export const InteriorMapPanel = observer(function InteriorMapPanel({
	selectedLocation = null,
}: InteriorMapPanelProps) {
	const vm = useInteriorMapPanelViewModel();
	const locationName = vm.getLocationName(selectedLocation);

	return (
		<Card className="w-full flex flex-col h-full">
			<CardHeader className="pb-1.5 px-4 pt-4 flex-shrink-0">
				<CardTitle className="text-base font-semibold">
					{t`Interior Map`}: {locationName}
				</CardTitle>
			</CardHeader>
			<CardContent className="p-3 flex-1 flex flex-col min-h-0">
				<div className="relative w-full flex-1 min-h-[360px] overflow-hidden">
					<div className="absolute inset-0 bg-muted/30 rounded-lg border border-border">
						<svg
							viewBox="-22 -22 144 144"
							className="w-full h-full block"
							preserveAspectRatio="xMidYMid meet"
						>
							<defs>
								<pattern id="interior-map-grid" width="5" height="5" patternUnits="userSpaceOnUse">
									<path d="M 5 0 L 0 0 0 5" fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
								</pattern>
							</defs>
							{/* Scale zone content from center so warehouse rectangles appear larger (mockup-style) */}
							<g transform="translate(50,50) scale(1.44) translate(-50,-50)">
								<rect
									width="100"
									height="100"
									fill="url(#interior-map-grid)"
									className="text-muted-foreground/30"
								/>
								{WAREHOUSE_ZONES.map((zone) => {
									const status = vm.getZoneStatus(zone.id, selectedLocation);
									const colors = ZONE_COLORS[zone.id] ?? {
										fill: "#f3f4f6",
										stroke: "#9ca3af",
										textFill: "#6b7280",
									};
									const statusStyle = getZoneStatusStyle(status);
									const strokeColor = status !== "ok" ? statusStyle.borderColor : colors.stroke;
									const strokeWidth = status !== "ok" ? statusStyle.strokeWidth : 0.3;
									const textX = zone.svgX + 2;
									const textY = zone.svgY + 3.5;

									return (
										<g key={zone.id}>
											<rect
												x={zone.svgX}
												y={zone.svgY}
												width={zone.svgWidth}
												height={zone.svgHeight}
												fill={colors.fill}
												stroke={strokeColor}
												strokeWidth={strokeWidth}
												rx={zone.id.includes("aisle") ? 0.5 : 1}
												className={status === "alert" ? "animate-pulse" : ""}
												style={
													status === "alert"
														? {
																filter: "drop-shadow(0 0 4px rgba(220, 38, 38, 0.5))",
															}
														: undefined
												}
											/>
											<text
												x={textX}
												y={textY}
												fontSize="2"
												fill={colors.textFill}
												textAnchor="start"
												fontWeight="400"
												opacity="0.5"
												style={{ fontFamily: "system-ui, sans-serif" }}
											>
												{zone.name}
											</text>
										</g>
									);
								})}
								{/* Icons in SVG viewBox so they stay centered in zones (no aspect-ratio mismatch) */}
								{WAREHOUSE_ZONES.map((zone) => {
									const status = vm.getZoneStatus(zone.id, selectedLocation);
									if (status === "ok") return null;

									const size = 10; /* viewBox units; icon scales with map */
									const cx = zone.svgX + zone.svgWidth / 2;
									const cy = zone.svgY + zone.svgHeight / 2;
									const x = cx - size / 2;
									const y = cy - size / 2;

									return (
										<foreignObject
											key={`icon-${zone.id}`}
											x={x}
											y={y}
											width={size}
											height={size}
											className="overflow-visible"
											style={{ pointerEvents: "none" }}
										>
											{/* xmlns required for SVG foreignObject; div is XHTML content */}
											<div
												{...({
													xmlns: "http://www.w3.org/1999/xhtml",
												} as React.HTMLAttributes<HTMLDivElement>)}
												className="flex items-center justify-center w-full h-full"
												style={{ width: "100%", height: "100%" }}
											>
												{status === "alert" && <AlertBeacon fillContainer />}
												{status === "warning" && <WarningIcon fillContainer />}
											</div>
										</foreignObject>
									);
								})}
							</g>
						</svg>
					</div>
				</div>
			</CardContent>
		</Card>
	);
});
