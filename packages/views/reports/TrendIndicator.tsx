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
			className: "bg-success/15 text-success-foreground border-success-border",
			label: t`Improving`,
		},
		worsening: {
			icon: ArrowUp,
			className: "bg-danger/15 text-danger-foreground border-danger-border",
			label: t`Worsening`,
		},
		stable: {
			icon: Minus,
			className: "bg-muted text-foreground/85 border-border",
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
