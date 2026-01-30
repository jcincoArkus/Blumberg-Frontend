import { ArrowDown, ArrowUp, Minus } from "lucide-react";

import { t } from "~@/i18n/macro";
import { Badge, cn } from "~@/ui";

interface TrendIndicatorProps {
	delta: number;
	label?: string;
	trend?: "improving" | "stable" | "worsening";
}

export function TrendIndicator({ delta, label, trend }: TrendIndicatorProps) {
	const computedTrend =
		trend || (Math.abs(delta) < 5 ? "stable" : delta > 0 ? "worsening" : "improving");

	const config = {
		improving: {
			icon: ArrowDown,
			className: "bg-emerald-100 text-emerald-700 border-emerald-200",
			label: t`Improving`,
		},
		worsening: {
			icon: ArrowUp,
			className: "bg-red-100 text-red-700 border-red-200",
			label: t`Worsening`,
		},
		stable: {
			icon: Minus,
			className: "bg-slate-100 text-slate-700 border-slate-200",
			label: t`Stable`,
		},
	};

	const cfg = config[computedTrend];
	const Icon = cfg.icon;

	return (
		<div className="mt-1 flex items-center gap-1.5">
			<Badge variant="outline" className={cn("border text-xs", cfg.className)}>
				<Icon className="mr-0.5 size-3" />
				{Math.abs(delta).toFixed(1)}%
			</Badge>
			{label && <span className="text-xs text-muted-foreground">{label}</span>}
		</div>
	);
}
