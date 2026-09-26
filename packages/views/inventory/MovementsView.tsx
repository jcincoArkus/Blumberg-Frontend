import type { LucideIcon } from "lucide-react";
import {
	ArrowDown,
	ArrowLeftRight,
	ArrowUp,
	Calendar,
	Download,
	Pencil,
	Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { Button, cn } from "~@/ui";
import { type InvMovementType, useInventoryViewModel } from "~@/view-model";

import { fmtDate, fmtTime, type Movement } from "./data";

const TYPE_ICON: Record<InvMovementType, LucideIcon> = {
	intake: ArrowDown,
	output: ArrowUp,
	waste: Trash2,
	adjustment: Pencil,
	transfer: ArrowLeftRight,
};

function typeLabel(type: InvMovementType): string {
	switch (type) {
		case "intake":
			return t`Intake`;
		case "output":
			return t`Sale`;
		case "waste":
			return t`Waste`;
		case "adjustment":
			return t`Adjustment`;
		case "transfer":
			return t`Transfer`;
	}
}

/** Calendar-day difference between `date` and today in local time (negative = past). */
function calendarDaysFromToday(date: Date | string): number {
	const d = date instanceof Date ? new Date(date) : new Date(date);
	const today = new Date();
	d.setHours(0, 0, 0, 0);
	today.setHours(0, 0, 0, 0);
	return Math.round((d.getTime() - today.getTime()) / 86_400_000);
}

type DayHeader = { day: string; daysAgo: number; isHeader: true };
type Row = DayHeader | (Movement & { isHeader?: false });

export const MovementsView = observer(function MovementsView() {
	const vm = useInventoryViewModel();
	const [filter, setFilter] = useState<InvMovementType | "all">("all");

	const counts = useMemo(() => {
		const c: Record<InvMovementType, number> = {
			intake: 0,
			output: 0,
			waste: 0,
			adjustment: 0,
			transfer: 0,
		};
		vm.movements.forEach((m) => {
			c[m.type]++;
		});
		return c;
	}, [vm.movements]);

	const rows = useMemo(() => {
		let list = vm.movements.slice();
		if (filter !== "all") list = list.filter((m) => m.type === filter);
		return list;
	}, [vm.movements, filter]);

	const handleExportCsv = () => {
		const headers = ["Time", "Type", "Product", "Lot", "Site", "By", "Reference", "Qty"];
		const data = rows.map((m) => {
			const p = vm.productById(m.productId);
			const s = vm.siteById(m.siteId);
			const isNeg =
				m.type === "output" || m.type === "waste" || (m.type === "adjustment" && m.qty < 0);
			const isPos = m.type === "intake" || (m.type === "adjustment" && m.qty > 0);
			const sign = isNeg ? "-" : isPos ? "+" : "";
			return [
				fmtTime(m.at),
				typeLabel(m.type as InvMovementType),
				p.name,
				m.lotId,
				s.name.split(" · ")[0],
				m.by,
				m.note,
				`${sign}${Math.abs(m.qty).toLocaleString()} ${m.unit}`,
			];
		});
		vm.exportMovementsCsv([headers, ...data]);
	};

	const grouped: Row[] = useMemo(() => {
		const out: Row[] = [];
		let lastKey = "";
		rows.forEach((m) => {
			const k = fmtDate(m.at);
			if (k !== lastKey) {
				out.push({ day: k, daysAgo: calendarDaysFromToday(m.at), isHeader: true });
				lastKey = k;
			}
			out.push(m);
		});
		return out;
	}, [rows]);

	const dayLabel = (key: string, daysAgo: number) => {
		// daysAgo is a signed calendar-day offset: negative = past, positive = future
		if (daysAgo === 0) return `${t`Today`} · ${key}`;
		if (daysAgo === -1) return `${t`Yesterday`} · ${key}`;
		if (daysAgo === 1) return `${t`Tomorrow`} · ${key}`;
		const n = Math.abs(daysAgo);
		return daysAgo < 0 ? `${t`${n}d ago`} · ${key}` : `${t`in ${n}d`} · ${key}`;
	};

	const filterTypes: InvMovementType[] = ["intake", "output", "waste", "adjustment", "transfer"];

	const typeColorMap: Record<InvMovementType, string> = {
		intake: "bg-green-50 text-green-700",
		output: "bg-blue-50 text-blue-700",
		waste: "bg-red-50 text-red-700",
		adjustment: "bg-amber-50 text-amber-700",
		transfer: "bg-gray-100 text-gray-700",
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-start gap-4">
				<div>
					<h1 className="text-xl font-semibold tracking-tight text-gray-900">{t`Movements`}</h1>
					<p className="text-sm text-gray-600 mt-1">{t`Every intake, sale, waste mark, adjustment and transfer · audit trail`}</p>
				</div>
				<div className="ml-auto flex items-center gap-2">
					<Button variant="outline" size="sm">
						<Calendar size={14} /> {t`Last 7 days`}
					</Button>
					<Button variant="outline" size="sm" onClick={handleExportCsv}>
						<Download size={14} /> {t`Export CSV`}
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
				<button
					className={cn(
						"p-3 rounded-lg border transition-colors cursor-pointer text-left",
						filter === "all"
							? "bg-teal-700 border-teal-700 text-white"
							: "bg-white border-gray-200 hover:border-teal-500",
					)}
					onClick={() => setFilter("all")}
				>
					<div
						className={cn(
							"text-xs font-medium",
							filter === "all" ? "text-white/85" : "text-gray-600",
						)}
					>{t`All movements`}</div>
					<div
						className={cn(
							"text-xl font-semibold mt-1",
							filter === "all" ? "text-white" : "text-gray-900",
						)}
					>
						{vm.movements.length}
					</div>
					<div
						className={cn("text-xs mt-1", filter === "all" ? "text-white/70" : "text-gray-500")}
					>{t`last 7 days`}</div>
				</button>
				{filterTypes.map((type) => {
					const Icn = TYPE_ICON[type];
					const subText: Record<InvMovementType, string> = {
						intake: t`received lots`,
						output: t`fulfilled SOs`,
						waste: t`review root cause`,
						adjustment: t`cycle counts`,
						transfer: t`inter-site`,
					};
					return (
						<button
							key={type}
							className={cn(
								"p-3 rounded-lg border transition-colors cursor-pointer text-left",
								filter === type
									? "bg-teal-700 border-teal-700 text-white"
									: "bg-white border-gray-200 hover:border-teal-500",
							)}
							onClick={() => setFilter(type)}
						>
							<div
								className={cn(
									"text-xs font-medium flex items-center gap-1",
									filter === type ? "text-white/85" : "text-gray-600",
								)}
							>
								<Icn size={12} /> {typeLabel(type)}
							</div>
							<div
								className={cn(
									"text-xl font-semibold mt-1",
									filter === type ? "text-white" : "text-gray-900",
								)}
							>
								{counts[type]}
							</div>
							<div
								className={cn("text-xs mt-1", filter === type ? "text-white/70" : "text-gray-500")}
							>
								{subText[type]}
							</div>
						</button>
					);
				})}
			</div>

			{vm.isLoading ? (
				<div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-gray-400 text-sm">
					{t`Loading movements…`}
				</div>
			) : (
				<div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full border-collapse text-xs">
							<thead>
								<tr>
									<th className="text-left px-3 py-2 font-semibold uppercase tracking-wide text-gray-500 border-b border-gray-200 w-24">{t`Time`}</th>
									<th className="text-left px-3 py-2 font-semibold uppercase tracking-wide text-gray-500 border-b border-gray-200 w-28">{t`Type`}</th>
									<th className="text-left px-3 py-2 font-semibold uppercase tracking-wide text-gray-500 border-b border-gray-200">{t`Product`}</th>
									<th className="text-left px-3 py-2 font-semibold uppercase tracking-wide text-gray-500 border-b border-gray-200 w-28">{t`Lot`}</th>
									<th className="text-left px-3 py-2 font-semibold uppercase tracking-wide text-gray-500 border-b border-gray-200">{t`Site`}</th>
									<th className="text-left px-3 py-2 font-semibold uppercase tracking-wide text-gray-500 border-b border-gray-200">{t`By`}</th>
									<th className="text-left px-3 py-2 font-semibold uppercase tracking-wide text-gray-500 border-b border-gray-200">{t`Reference`}</th>
									<th className="text-right px-3 py-2 font-semibold uppercase tracking-wide text-gray-500 border-b border-gray-200 w-20">{t`Qty`}</th>
								</tr>
							</thead>
							<tbody>
								{grouped.map((row, i) => {
									if ("isHeader" in row && row.isHeader) {
										return (
											<tr key={`d-${i}`} className="bg-gray-50">
												<td
													colSpan={8}
													className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 border-b border-t border-gray-200"
												>
													{dayLabel(row.day, row.daysAgo)}
												</td>
											</tr>
										);
									}
									const m = row as Movement;
									const p = vm.productById(m.productId);
									const site = vm.siteById(m.siteId);
									const Icn = TYPE_ICON[m.type as InvMovementType];
									const isNeg =
										m.type === "output" ||
										m.type === "waste" ||
										(m.type === "adjustment" && m.qty < 0);
									const isPos = m.type === "intake" || (m.type === "adjustment" && m.qty > 0);
									const sign = isNeg ? "-" : isPos ? "+" : "";
									return (
										<tr key={m.id} className="hover:bg-gray-50 border-b border-gray-100">
											<td className="px-3 py-2.5 text-gray-700 font-mono">
												<div>{fmtTime(m.at)}</div>
											</td>
											<td className="px-3 py-2.5">
												<span
													className={cn(
														"inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
														typeColorMap[m.type as InvMovementType],
													)}
												>
													<Icn size={11} /> {typeLabel(m.type as InvMovementType)}
												</span>
											</td>
											<td className="px-3 py-2.5">
												<div className="font-medium text-gray-900">{p.name}</div>
												<div className="text-xs text-gray-500 font-mono mt-0.5">{p.sku}</div>
											</td>
											<td className="px-3 py-2.5 text-gray-700 font-mono">{m.lotId}</td>
											<td className="px-3 py-2.5 text-gray-700">
												<div className="text-gray-900 font-medium">{site.name.split(" · ")[0]}</div>
											</td>
											<td className="px-3 py-2.5 text-gray-700">{m.by}</td>
											<td className="px-3 py-2.5 text-gray-600 text-xs">{m.note}</td>
											<td className="px-3 py-2.5 text-right font-mono">
												<span
													className={cn(
														"font-medium",
														isNeg ? "text-red-600" : isPos ? "text-green-600" : "text-gray-900",
													)}
												>
													{sign}
													{Math.abs(m.qty).toLocaleString()}
												</span>
												<span className="text-gray-500 font-normal ml-1">{m.unit}</span>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</div>
			)}
		</div>
	);
});
