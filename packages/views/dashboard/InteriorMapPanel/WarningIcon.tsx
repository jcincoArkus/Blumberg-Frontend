import { RefreshCw } from "lucide-react";
import type { FC } from "react";

interface WarningIconProps {
	size?: number;
	className?: string;
	/** When true, fill parent (e.g. inside SVG foreignObject) instead of fixed size */
	fillContainer?: boolean;
}

/** Orange warning icon for zones in warning state */
export const WarningIcon: FC<WarningIconProps> = ({
	size = 28,
	className = "",
	fillContainer = false,
}) => (
	<div
		className={`flex items-center justify-center rounded-full bg-amber-50 border-2 border-amber-300 ${className}`}
		style={
			fillContainer
				? { width: "100%", height: "100%", minWidth: 0, minHeight: 0 }
				: { width: size, height: size }
		}
		aria-hidden
	>
		<RefreshCw
			className="text-amber-600 shrink-0"
			style={{
				width: fillContainer ? "50%" : Math.round(size * 0.5),
				height: fillContainer ? "50%" : Math.round(size * 0.5),
			}}
			strokeWidth={2.5}
			aria-hidden
		/>
	</div>
);
