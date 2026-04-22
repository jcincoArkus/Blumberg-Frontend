import type { FC } from "react";

interface AlertBeaconProps {
	size?: number;
	className?: string;
	/** When true, fill parent (e.g. inside SVG foreignObject) instead of fixed size */
	fillContainer?: boolean;
}

/** Alert beacon matching mockup: red circle, white triangle+exclamation, pulse glow */
export const AlertBeacon: FC<AlertBeaconProps> = ({
	size = 44,
	className = "",
	fillContainer = false,
}) => (
	<div
		className={`relative rounded-full flex items-center justify-center overflow-visible ${className}`}
		style={
			fillContainer
				? {
						width: "100%",
						height: "100%",
						minWidth: 0,
						minHeight: 0,
						background: "#ef4444",
						boxShadow: "0 10px 25px rgba(239, 68, 68, 0.25)",
					}
				: {
						width: size,
						height: size,
						background: "#ef4444",
						boxShadow: "0 10px 25px rgba(239, 68, 68, 0.25)",
					}
		}
		aria-label="Alert"
	>
		{/* Pulse layers (mockup-style) */}
		<span className="absolute inset-0 rounded-full bg-red-500/35 animate-alert-pulse" aria-hidden />
		<span
			className="absolute inset-0 rounded-full bg-red-500/22 animate-alert-pulse"
			style={{ animationDelay: "0.8s" }}
			aria-hidden
		/>
		{/* White triangle + exclamation icon (60% of circle, like mockup) */}
		<svg
			viewBox="0 0 24 24"
			className="relative z-[3] shrink-0"
			style={{ width: "60%", height: "60%" }}
			aria-hidden
		>
			<path
				d="M12 2 1 21h22L12 2zm0 6c.55 0 1 .45 1 1v5a1 1 0 1 1-2 0V9c0-.55.45-1 1-1zm0 10a1.25 1.25 0 1 1 0-2.5A1.25 1.25 0 0 1 12 18z"
				fill="white"
			/>
		</svg>
	</div>
);
