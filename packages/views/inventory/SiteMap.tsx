import { Loader2, MapPin, Truck } from "lucide-react";
import { useCallback, useState } from "react";
import Map, { type MapMouseEvent, Marker, NavigationControl } from "react-map-gl/mapbox";

import { config } from "~@/config";
import { useResolvedTheme } from "~@/view-model/theme";

export interface SiteCoords {
	lat: number;
	lng: number;
}

interface GeocodingFeature {
	text?: string;
	context?: Array<{ id: string; text: string }>;
}

interface SiteMapProps {
	/** Called once reverse-geocoding settles. suggestedName may be undefined if geocoding fails. */
	onLocationPick: (coords: SiteCoords, suggestedName?: string) => void;
	/** Markers for existing sites that already have coordinates. */
	markers?: Array<{ id: string; name: string; coords: SiteCoords }>;
	/** Markers for existing suppliers that have coordinates. */
	supplierMarkers?: Array<{ id: string; name: string; coords: SiteCoords }>;
	/** Controlled pending marker driven by parent state. */
	pendingMarker?: SiteCoords | null;
	/** Hint text shown in the bottom-left overlay. */
	hint?: string;
	className?: string;
}

const DEFAULT_VIEW = {
	longitude: -102.5,
	latitude: 23.6,
	zoom: 4.5,
} as const;

const MAP_STYLE = {
	light: "mapbox://styles/mapbox/light-v11",
	dark: "mapbox://styles/mapbox/dark-v11",
} as const;

async function reverseGeocode(
	lng: number,
	lat: number,
	token: string,
): Promise<string | undefined> {
	const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&types=place&limit=1`;
	const res = await fetch(url);
	if (!res.ok) return undefined;
	const data = (await res.json()) as { features?: GeocodingFeature[] };
	const feature = data.features?.[0];
	if (!feature) return undefined;
	const city = feature.text ?? "";
	const region = feature.context?.find((c) => c.id.startsWith("region"))?.text;
	return region ? `${region} - ${city}` : city || undefined;
}

export function SiteMap({
	onLocationPick,
	markers = [],
	supplierMarkers = [],
	pendingMarker,
	hint,
	className,
}: SiteMapProps) {
	const token = config.mapboxToken;
	const [internalMarker, setInternalMarker] = useState<SiteCoords | null>(null);
	const [geocoding, setGeocoding] = useState(false);
	const resolvedTheme = useResolvedTheme();

	const activeMarker = pendingMarker !== undefined ? pendingMarker : internalMarker;

	const handleClick = useCallback(
		(evt: MapMouseEvent) => {
			const { lat, lng } = evt.lngLat;
			const coords = { lat, lng };
			setInternalMarker(coords);
			setGeocoding(true);

			reverseGeocode(lng, lat, token)
				.then((name) => onLocationPick(coords, name))
				.catch(() => onLocationPick(coords))
				.finally(() => setGeocoding(false));
		},
		[token, onLocationPick],
	);

	if (!token) {
		return (
			<div
				className={`flex flex-col items-center justify-center gap-2 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-gray-400 text-sm ${className ?? ""}`}
			>
				<MapPin size={20} className="text-gray-300" />
				<span>Map unavailable — set</span>
				<code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">VITE_MAPBOX_TOKEN</code>
				<span>to enable</span>
			</div>
		);
	}

	return (
		<div className={`relative overflow-hidden rounded-lg ${className ?? ""}`}>
			<Map
				initialViewState={DEFAULT_VIEW}
				style={{ width: "100%", height: "100%" }}
				// Style swaps in place (react-map-gl diffs it); markers are React overlays and survive the swap
				mapStyle={MAP_STYLE[resolvedTheme]}
				mapboxAccessToken={token}
				onClick={handleClick}
				cursor={geocoding ? "wait" : "crosshair"}
			>
				<NavigationControl position="top-right" />

				{/* Pending / newly-picked location */}
				{activeMarker && (
					<Marker latitude={activeMarker.lat} longitude={activeMarker.lng} anchor="bottom">
						<div className="flex flex-col items-center">
							{geocoding ? (
								<Loader2 size={16} className="text-teal-600 animate-spin drop-shadow" />
							) : (
								<div className="w-3 h-3 rounded-full bg-teal-600 border-2 border-white shadow-md" />
							)}
						</div>
					</Marker>
				)}

				{/* Existing site markers */}
				{markers.map((m) => (
					<Marker key={m.id} latitude={m.coords.lat} longitude={m.coords.lng} anchor="bottom">
						<div className="flex flex-col items-center gap-0.5">
							<div className="px-1.5 py-0.5 rounded bg-teal-700 text-white text-[10px] font-medium shadow whitespace-nowrap max-w-[120px] truncate">
								{m.name}
							</div>
							<div className="w-2 h-2 rounded-full bg-teal-700 border border-white shadow" />
						</div>
					</Marker>
				))}

				{/* Supplier markers */}
				{supplierMarkers.map((m) => (
					<Marker key={m.id} latitude={m.coords.lat} longitude={m.coords.lng} anchor="bottom">
						<div className="flex flex-col items-center gap-0.5">
							<div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-600 text-white text-[10px] font-medium shadow whitespace-nowrap max-w-[120px]">
								<Truck size={9} />
								<span className="truncate">{m.name}</span>
							</div>
							<div className="w-2 h-2 rounded-full bg-amber-600 border border-white shadow" />
						</div>
					</Marker>
				))}
			</Map>

			{/* Hint overlay */}
			<div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-white/80 backdrop-blur-sm text-xs text-gray-500 pointer-events-none select-none shadow-sm border border-gray-100">
				{geocoding ? "Looking up location…" : (hint ?? "Click on the map to place a new site")}
			</div>
		</div>
	);
}
