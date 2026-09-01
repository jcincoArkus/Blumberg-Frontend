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
import { type InvMovementType, useInventoryViewModel } from "~@/view-model";

import { daysUntil, fmtDate, fmtTime, type Movement } from "./data";
import "./inventory.css";

const TYPE_ICON: Record<InvMovementType, LucideIcon> = {
	intake: ArrowDown,
	output: ArrowUp,
	waste: Trash2,
	adjustment: Pencil,
	transfer: ArrowLeftRight,
};

const TYPE_LABEL: Record<InvMovementType, string> = {
	intake: "Intake",
	output: "Sale",
	waste: "Waste",
	adjustment: "Adjustment",
	transfer: "Transfer",
};

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

	const grouped: Row[] = useMemo(() => {
		const out: Row[] = [];
		let lastKey = "";
		rows.forEach((m) => {
			const k = fmtDate(m.at);
			if (k !== lastKey) {
				out.push({ day: k, daysAgo: daysUntil(m.at), isHeader: true });
				lastKey = k;
			}
			out.push(m);
		});
		return out;
	}, [rows]);

	const dayLabel = (key: string, daysAgo: number) => {
		if (daysAgo === 0) return `${t`Today`} · ${key}`;
		if (daysAgo === -1) return `${t`Yesterday`} · ${key}`;
		return `${Math.abs(daysAgo)}d ${t`ago`} · ${key}`;
	};

	const filterTypes: InvMovementType[] = ["intake", "output", "waste", "adjustment", "transfer"];

	return (
		<div className="inventory-module">
			<div className="page-h">
				<div>
					<div className="ttl">{t`Movements`}</div>
					<div className="sub">{t`Every intake, sale, waste mark, adjustment and transfer · audit trail`}</div>
				</div>
				<div className="right">
					<button type="button" className="btn">
						<Calendar size={14} /> {t`Last 7 days`}
					</button>
					<button type="button" className="btn">
						<Download size={14} /> {t`Export CSV`}
					</button>
				</div>
			</div>

			<div className="mov-summary">
				<div
					className={`mov-tile ${filter === "all" ? "on" : ""}`}
					onClick={() => setFilter("all")}
					onKeyDown={(e) => e.key === "Enter" && setFilter("all")}
					role="button"
					tabIndex={0}
				>
					<div className="lbl">{t`All movements`}</div>
					<div className="val">{vm.movements.length}</div>
					<div className="sub">{t`last 7 days`}</div>
				</div>
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
						<div
							key={type}
							className={`mov-tile ${filter === type ? "on" : ""}`}
							onClick={() => setFilter(type)}
							onKeyDown={(e) => e.key === "Enter" && setFilter(type)}
							role="button"
							tabIndex={0}
						>
							<div className="lbl">
								<Icn size={12} /> {TYPE_LABEL[type]}
							</div>
							<div className="val">{counts[type]}</div>
							<div className="sub">{subText[type]}</div>
						</div>
					);
				})}
			</div>

			{vm.isLoading ? (
				<div
					className="card"
					style={{ padding: "40px 16px", textAlign: "center", color: "var(--inv-ink-400)" }}
				>
					{t`Loading movements…`}
				</div>
			) : (
				<div className="card" style={{ overflow: "hidden" }}>
					<div style={{ overflowX: "auto" }}>
						<table className="mov-table">
							<thead>
								<tr>
									<th style={{ width: 120 }}>{t`Time`}</th>
									<th style={{ width: 130 }}>{t`Type`}</th>
									<th>{t`Product`}</th>
									<th>{t`Lot`}</th>
									<th>{t`Site`}</th>
									<th>{t`By`}</th>
									<th>{t`Reference`}</th>
									<th style={{ textAlign: "right" }}>{t`Qty`}</th>
								</tr>
							</thead>
							<tbody>
								{grouped.map((row, i) => {
									if ("isHeader" in row && row.isHeader) {
										return (
											<tr key={`d-${i}`}>
												<td colSpan={8} className="mov-day">
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
										<tr key={m.id}>
											<td style={{ color: "var(--inv-ink-700)" }}>
												<div style={{ fontVariantNumeric: "tabular-nums" }}>{fmtTime(m.at)}</div>
												<div
													style={{
														fontSize: 11,
														color: "var(--inv-ink-400)",
														fontFamily: "'JetBrains Mono',monospace",
													}}
												>
													{m.id}
												</div>
											</td>
											<td>
												<span className={`type-chip type-${m.type}`}>
													<Icn size={11} /> {TYPE_LABEL[m.type as InvMovementType]}
												</span>
											</td>
											<td>
												<div style={{ fontWeight: 500, color: "var(--inv-ink-900)" }}>{p.name}</div>
												<div
													style={{
														fontSize: 11,
														color: "var(--inv-ink-400)",
														fontFamily: "'JetBrains Mono',monospace",
													}}
												>
													{p.sku}
												</div>
											</td>
											<td style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>
												{m.lotId}
											</td>
											<td>
												<div style={{ color: "var(--inv-ink-900)" }}>
													{site.name.split(" · ")[0]}
												</div>
											</td>
											<td>{m.by}</td>
											<td style={{ color: "var(--inv-ink-500)", fontSize: 12.5 }}>{m.note}</td>
											<td className="num">
												<span className={isNeg ? "qty-neg" : isPos ? "qty-pos" : ""}>
													{sign}
													{Math.abs(m.qty).toLocaleString()}
												</span>
												<span
													style={{ color: "var(--inv-ink-400)", fontWeight: 400, marginLeft: 4 }}
												>
													{m.unit}
												</span>
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
