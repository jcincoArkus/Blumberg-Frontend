import L from "leaflet";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";

import type { MapLocation } from "./types";

import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon in bundler (Vite/webpack)
if (typeof window !== "undefined") {
	delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
	L.Icon.Default.mergeOptions({
		iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
		iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
		shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
	});
}

interface RealMapProps {
	locations: MapLocation[];
	selectedLocation?: string | null;
	onLocationSelect?: (locationId: string) => void;
}

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
	const map = useMap();
	useEffect(() => {
		map.setView(center, zoom, { animate: true, duration: 0.5 });
	}, [center, zoom, map]);
	return null;
}

function createCustomIcon(status: MapLocation["status"], isSelected: boolean): L.DivIcon {
	const size = isSelected ? 32 : 24;
	const color = status === "alert" ? "#dc2626" : status === "warning" ? "#f59e0b" : "#10b981";
	return L.divIcon({
		className: "custom-marker",
		html: `
      <div style="
        width: ${size}px; height: ${size}px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        transform: ${isSelected ? "scale(1.2)" : "scale(1)"};
      "></div>
      <div style="
        position: absolute; left: 50%; top: 100%;
        transform: translateX(-50%);
        width: 0; height: 0;
        border-left: ${size / 3}px solid transparent;
        border-right: ${size / 3}px solid transparent;
        border-top: ${size / 2}px solid ${color};
      "></div>
    `,
		iconSize: [size, size + size / 2],
		iconAnchor: [size / 2, size + size / 2],
		popupAnchor: [0, -(size + size / 2)],
	});
}

export function RealMap({ locations, selectedLocation, onLocationSelect }: RealMapProps) {
	const [selectedPin, setSelectedPin] = useState<string | null>(selectedLocation ?? null);
	const [mapType, setMapType] = useState<"map" | "satellite">("map");
	const [zoom, setZoom] = useState(4);

	useEffect(() => {
		if (selectedLocation !== undefined) {
			setSelectedPin(selectedLocation);
		}
	}, [selectedLocation]);

	// Default center so zoom 4 shows US + Mexico (mockup-style)
	const defaultCenter: [number, number] = [40, -98];
	const mapCenter = useMemo((): [number, number] => {
		if (locations.length === 0) return defaultCenter;
		return defaultCenter;
	}, [locations]);

	const selectedLocationData = useMemo(
		() => locations.find((l) => l.id === selectedPin) ?? null,
		[locations, selectedPin],
	);

	const selectedCenter = useMemo((): [number, number] => {
		if (selectedLocationData) return [selectedLocationData.lat, selectedLocationData.lng];
		return mapCenter;
	}, [selectedLocationData, mapCenter]);

	const handleMarkerClick = (locationId: string) => {
		const isCurrentlySelected = locationId === selectedPin;
		const newSelected = isCurrentlySelected ? null : locationId;
		setSelectedPin(newSelected);
		onLocationSelect?.(isCurrentlySelected ? "" : locationId);
		// Keep zoom wide (like mockup) so map shows US + Mexico instead of zooming in to city
		if (newSelected) setZoom(4);
	};

	const handleClosePopup = () => {
		setSelectedPin(null);
		onLocationSelect?.("");
	};

	const tileUrl =
		mapType === "satellite"
			? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
			: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

	const attribution =
		mapType === "satellite"
			? "&copy; Esri"
			: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

	return (
		<div className="relative w-full h-full min-h-0 flex flex-col">
			<div className="flex-1 min-h-0 w-full relative" style={{ zIndex: 0 }}>
				<MapContainer
					center={selectedCenter}
					zoom={zoom}
					className="!h-full !w-full"
					style={{ height: "100%", width: "100%", zIndex: 0 }}
					zoomControl={false}
				>
					<MapController center={selectedCenter} zoom={zoom} />
					<TileLayer url={tileUrl} attribution={attribution} />
					{locations.map((location) => (
						<Marker
							key={location.id}
							position={[location.lat, location.lng]}
							icon={createCustomIcon(location.status, selectedPin === location.id)}
							eventHandlers={{
								click: () => handleMarkerClick(location.id),
							}}
						/>
					))}
				</MapContainer>
			</div>

			{selectedLocationData && (
				<div
					className="absolute left-1/2 top-[20%] -translate-x-1/2 bg-card border border-border shadow-lg rounded-xl p-4 min-w-[220px] max-w-[300px] z-[1000] pointer-events-auto"
					role="dialog"
					aria-label="Location details"
				>
					<button
						type="button"
						onClick={handleClosePopup}
						className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
						aria-label="Close"
					>
						<X className="w-4 h-4" strokeWidth={2.5} />
					</button>
					<div className="space-y-3 pr-8">
						<div>
							<h3 className="font-bold text-base text-foreground leading-tight">
								{selectedLocationData.name}
							</h3>
							<p className="text-sm text-muted-foreground mt-0.5">{selectedLocationData.city}</p>
						</div>
						<div className="flex items-center gap-2 pt-1 border-t border-border">
							<div
								className="w-2.5 h-2.5 rounded-full flex-shrink-0"
								style={{
									backgroundColor:
										selectedLocationData.status === "alert"
											? "#dc2626"
											: selectedLocationData.status === "warning"
												? "#f59e0b"
												: "#10b981",
								}}
							/>
							<span className="text-xs font-medium text-foreground capitalize">
								{selectedLocationData.status}
							</span>
						</div>
						<p className="text-xs text-muted-foreground pt-1">Click to view details</p>
					</div>
				</div>
			)}

			<div className="absolute bottom-3 right-3 flex flex-col gap-0.5 bg-card rounded-lg shadow-lg border border-border overflow-hidden z-[500]">
				<button
					type="button"
					onClick={() => setZoom((z) => Math.min(z + 1, 18))}
					className="p-2 hover:bg-muted transition-colors border-b border-border"
					aria-label="Zoom in"
				>
					<svg
						className="w-5 h-5 text-foreground"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 6v6m0 0v6m0-6h6m-6 0H6"
						/>
					</svg>
				</button>
				<button
					type="button"
					onClick={() => setZoom((z) => Math.max(z - 1, 2))}
					className="p-2 hover:bg-muted transition-colors"
					aria-label="Zoom out"
				>
					<svg
						className="w-5 h-5 text-foreground"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
					</svg>
				</button>
			</div>

			<div className="absolute bottom-3 left-3 z-[500] bg-card rounded-lg shadow-lg border border-border overflow-hidden">
				<button
					type="button"
					onClick={() => setMapType("map")}
					className={`px-3 py-1.5 text-xs font-medium transition-colors border-r border-border ${
						mapType === "map" ? "text-foreground bg-muted" : "text-muted-foreground hover:bg-muted"
					}`}
				>
					Map
				</button>
				<button
					type="button"
					onClick={() => setMapType("satellite")}
					className={`px-3 py-1.5 text-xs font-medium transition-colors ${
						mapType === "satellite"
							? "text-foreground bg-muted"
							: "text-muted-foreground hover:bg-muted"
					}`}
				>
					Satellite
				</button>
			</div>
		</div>
	);
}
