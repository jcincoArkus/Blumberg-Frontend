import {
	ChevronDown,
	Download,
	Filter,
	Pencil,
	Plus,
	RefreshCw,
	Search,
	SlidersHorizontal,
	Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { Button, cn, LoadingState } from "~@/ui";
import { daysUntil, type InvEnrichedLot, useInventoryViewModel } from "~@/view-model";

import { fmtDateShort, fmtMoney } from "./data";

type SortKey = "exp" | "name" | "qty";

function StatCard({
	label,
	value,
	sub,
	accent = 0.6,
	tone = "ok",
}: {
	label: string;
	value: string | number;
	sub?: string;
	accent?: number;
	tone?: "ok" | "up" | "warn" | "down";
}) {
	const toneColorMap = {
		ok: "text-primary",
		up: "text-success-foreground",
		warn: "text-warning-foreground",
		down: "text-danger",
	};

	return (
		<div className="bg-card border border-border rounded-lg p-4">
			<div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
				{label}
			</div>
			<div className="text-2xl font-semibold tracking-tight text-foreground mt-1">{value}</div>
			{sub && <div className={`text-xs mt-1 ${toneColorMap[tone]}`}>{sub}</div>}
			<div className="h-0.5 bg-muted rounded mt-3 overflow-hidden">
				<div
					className="h-full bg-primary rounded"
					style={{ width: `${Math.round(accent * 100)}%` }}
				/>
			</div>
		</div>
	);
}

export const InventoryView = observer(function InventoryView() {
	const navigate = useNavigate();
	const vm = useInventoryViewModel();
	const [siteFilter, setSiteFilter] = useState<string>("all");
	const [catFilter] = useState<string>("all");
	const [search, setSearch] = useState("");
	const [sortBy] = useState<SortKey>("exp");

	const lots: InvEnrichedLot[] = useMemo(() => {
		let rows = vm.enrichedLots;
		if (siteFilter !== "all") rows = rows.filter((r) => r.siteId === siteFilter);
		if (catFilter !== "all") rows = rows.filter((r) => r.product.cat === catFilter);
		if (search) {
			const q = search.toLowerCase();
			rows = rows.filter(
				(r) =>
					r.product.name.toLowerCase().includes(q) ||
					r.id.toLowerCase().includes(q) ||
					r.product.sku.toLowerCase().includes(q),
			);
		}
		if (sortBy === "exp") rows = [...rows].sort((a, b) => a.exp.days - b.exp.days);
		if (sortBy === "name")
			rows = [...rows].sort((a, b) => a.product.name.localeCompare(b.product.name));
		if (sortBy === "qty") rows = [...rows].sort((a, b) => b.qty - a.qty);
		return rows;
	}, [vm.enrichedLots, siteFilter, catFilter, search, sortBy]);

	const totals = useMemo(() => {
		// Depleted lots (qty 0) stay in the list for traceability but are not "active"
		const active = lots.filter((l) => l.qty > 0);
		const totalLots = active.length;
		const totalValue = active.reduce((s, l) => s + l.value, 0);
		const expSoon = active.filter((l) => l.exp.tone === "soon" || l.exp.tone === "critical").length;
		const expired = active.filter((l) => l.exp.tone === "expired").length;
		return { totalLots, totalValue, expSoon, expired };
	}, [lots]);

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-start gap-4">
				<div>
					<h1 className="text-xl font-semibold tracking-tight text-foreground">{t`Current inventory`}</h1>
					<p className={cn("text-sm text-muted-foreground mt-1", vm.isLoading && "invisible")}>
						{totals.totalLots} {t`active lots · FIFO suggested for output`}
					</p>
				</div>
				<div className="ml-auto flex items-center gap-2">
					<Button variant="outline" size="sm" onClick={() => vm.refresh()}>
						<RefreshCw size={14} /> {t`Sync`}
					</Button>
					<Button variant="outline" size="sm">
						<Download size={14} /> {t`Export`}
					</Button>
					<Button size="sm" onClick={() => navigate("/inventory/intake")}>
						<Plus size={14} /> {t`Receive intake`}
					</Button>
				</div>
			</div>

			{/* Hidden until the first load finishes so the KPIs don't flash 0 */}
			<div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-4", vm.isLoading && "hidden")}>
				<StatCard
					label={t`Active lots`}
					value={totals.totalLots}
					sub={`${vm.sites.length} ${t`sites`}`}
					accent={0.85}
				/>
				<StatCard
					label={t`Inventory value`}
					value={fmtMoney(totals.totalValue)}
					sub={t`at last cost`}
					accent={0.62}
				/>
				<StatCard
					label={t`Expiring ≤ 5d`}
					value={totals.expSoon}
					sub={totals.expSoon ? t`review FIFO output` : t`all clear`}
					tone={totals.expSoon ? "warn" : "up"}
					accent={0.4}
				/>
				<StatCard
					label={t`Past expiration`}
					value={totals.expired}
					sub={totals.expired ? t`mark as waste` : t`none today`}
					tone={totals.expired ? "down" : "up"}
					accent={0.05}
				/>
			</div>

			<div className="bg-card border border-border rounded-lg overflow-hidden">
				<div className="flex items-center gap-2 p-3 border-b border-border bg-card flex-wrap">
					<div className="flex border border-border rounded-lg p-0.5 bg-card gap-0.5">
						<button
							type="button"
							className={cn(
								"px-2.5 py-1.5 rounded text-sm font-medium transition-colors",
								siteFilter === "all"
									? "bg-primary text-primary-foreground"
									: "bg-transparent text-foreground/85 hover:bg-muted",
							)}
							onClick={() => setSiteFilter("all")}
						>
							{t`All sites`}
						</button>
						{vm.sites.map((s) => (
							<button
								type="button"
								key={s.id}
								className={cn(
									"px-2.5 py-1.5 rounded text-sm font-medium transition-colors",
									siteFilter === s.id
										? "bg-primary text-primary-foreground"
										: "bg-transparent text-foreground/85 hover:bg-muted",
								)}
								onClick={() => setSiteFilter(s.id)}
							>
								{s.name.split(" · ")[0]}
							</button>
						))}
					</div>

					<div className="flex-1" />

					<button
						type="button"
						className="flex items-center gap-1.5 px-2.5 py-1.5 border border-border rounded-lg bg-card text-sm text-foreground/85 hover:bg-muted"
					>
						<Filter size={13} /> {t`Category`}:{" "}
						<span className="font-medium">
							{catFilter === "all" ? t`All` : vm.categoryById(catFilter).name}
						</span>
						<ChevronDown size={12} />
					</button>
					<button
						type="button"
						className="flex items-center gap-1.5 px-2.5 py-1.5 border border-border rounded-lg bg-card text-sm text-foreground/85 hover:bg-muted"
					>
						<SlidersHorizontal size={13} /> {t`Sort`}:{" "}
						<span className="font-medium">
							{sortBy === "exp" ? t`Expiration` : sortBy === "name" ? t`Name` : t`Quantity`}
						</span>
						<ChevronDown size={12} />
					</button>
					<div className="relative w-60">
						<Search
							size={13}
							className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
						/>
						<input
							placeholder={t`Lot, product, SKU…`}
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="h-7 px-3 pl-7 rounded-lg border border-input bg-card text-foreground text-sm w-full outline-none focus:border-ring"
						/>
					</div>
				</div>

				{vm.isLoading ? (
					<LoadingState variant="section" label={t`Loading inventory…`} />
				) : (
					<div className="overflow-x-auto">
						<table className="w-full border-collapse text-sm">
							<thead>
								<tr>
									<th className="text-xs font-semibold tracking-wide uppercase text-muted-foreground text-left px-3.5 py-2.5 bg-card border-b border-border">{t`Product`}</th>
									<th className="text-xs font-semibold tracking-wide uppercase text-muted-foreground text-left px-3.5 py-2.5 bg-card border-b border-border">{t`Lot`}</th>
									<th className="text-xs font-semibold tracking-wide uppercase text-muted-foreground text-left px-3.5 py-2.5 bg-card border-b border-border">{t`Site / Zone`}</th>
									<th className="text-xs font-semibold tracking-wide uppercase text-muted-foreground text-left px-3.5 py-2.5 bg-card border-b border-border">{t`Entry`}</th>
									<th className="text-xs font-semibold tracking-wide uppercase text-muted-foreground text-right px-3.5 py-2.5 bg-card border-b border-border">{t`On hand`}</th>
									<th className="text-xs font-semibold tracking-wide uppercase text-muted-foreground text-right px-3.5 py-2.5 bg-card border-b border-border min-w-28">{t`Expiration`}</th>
									<th className="text-xs font-semibold tracking-wide uppercase text-muted-foreground text-right px-3.5 py-2.5 bg-card border-b border-border">{t`Value`}</th>
									<th className="text-xs font-semibold tracking-wide uppercase text-muted-foreground text-left px-3.5 py-2.5 bg-card border-b border-border w-20" />
								</tr>
							</thead>
							<tbody>
								{lots.map((l) => {
									const toneColorMap = {
										expired: "border-l-danger",
										critical: "border-l-danger",
										soon: "border-l-warning",
										ok: "",
									};
									return (
										<tr
											key={l.id}
											className={cn(
												"hover:bg-muted border-b border-border border-l-2",
												toneColorMap[l.exp.tone],
											)}
										>
											<td className="px-3.5 py-3 text-foreground/85">
												<div className="flex items-center gap-2.5">
													<span
														className="w-2 h-2 rounded-full flex-shrink-0"
														style={{
															background: l.category.color,
															boxShadow: "inset 0 0 0 1px rgba(0,0,0,.06)",
														}}
													/>
													<div>
														<div className="font-medium text-foreground">{l.product.name}</div>
														<div className="text-xs text-muted-foreground">
															{l.product.sku} · {l.category.name}
														</div>
													</div>
												</div>
											</td>
											<td className="px-3.5 py-3 text-foreground/85">
												<div className="font-mono text-sm">{l.id}</div>
												<div className="text-xs text-muted-foreground mt-0.5">{l.supplier}</div>
											</td>
											<td className="px-3.5 py-3 text-foreground/85">
												<div className="text-foreground font-medium">
													{l.site.name.split(" · ")[0]}
												</div>
												<div className="text-xs text-muted-foreground mt-0.5">{l.zone}</div>
											</td>
											<td className="px-3.5 py-3 text-foreground/85">
												<div className="text-foreground">{fmtDateShort(l.entry)}</div>
												<div className="text-xs text-muted-foreground mt-0.5">
													{Math.abs(daysUntil(l.entry))}d ago
												</div>
											</td>
											<td className="px-3.5 py-3 text-right text-foreground font-mono">
												{l.qty.toLocaleString()}{" "}
												<span className="text-muted-foreground font-normal">{l.unit}</span>
												{l.onhandKg != null && (
													<div className="text-xs text-muted-foreground mt-0.5">
														≈ {l.onhandKg.toFixed(1)} kg
													</div>
												)}
											</td>
											<td className="px-3.5 py-3 text-right">
												<div className="flex flex-col items-end gap-0.5">
													<div
														className={cn(
															"text-sm font-medium",
															l.exp.tone === "expired" || l.exp.tone === "critical"
																? "text-danger"
																: l.exp.tone === "soon"
																	? "text-warning-foreground"
																	: "text-foreground",
														)}
													>
														{l.exp.label}
													</div>
													<div className="text-xs text-muted-foreground">
														{fmtDateShort(l.expDate)}
													</div>
												</div>
											</td>
											<td className="px-3.5 py-3 text-right text-foreground font-mono">
												{fmtMoney(l.value)}
											</td>
											<td className="px-3.5 py-3">
												<div className="flex gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
													<button
														type="button"
														className="p-1.5 rounded border border-border bg-card hover:bg-muted"
														title={t`Adjust`}
													>
														<Pencil size={13} />
													</button>
													<button
														type="button"
														className="p-1.5 rounded border border-border bg-card hover:bg-muted"
														title={t`Mark waste`}
													>
														<Trash2 size={13} />
													</button>
												</div>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				)}

				<div className="px-3.5 py-2.5 bg-card border-t border-border text-sm text-muted-foreground flex items-center gap-3 flex-wrap">
					<span>{t`Expiration`}:</span>
					<div className="flex items-center gap-1">
						<span className="w-2 h-0.5 rounded bg-danger" />
						<span>{t`≤ 2 days · critical`}</span>
					</div>
					<div className="flex items-center gap-1">
						<span className="w-2 h-0.5 rounded bg-amber-600 dark:bg-warning" />
						<span>{t`≤ 5 days · soon`}</span>
					</div>
					<div className="flex items-center gap-1">
						<span className="w-2 h-0.5 rounded bg-gray-300 dark:bg-muted-foreground" />
						<span>{t`> 5 days · ok`}</span>
					</div>
					<span className={cn("ml-auto", vm.isLoading && "invisible")}>
						{t`Showing`} {lots.length} {t`of`} {vm.lots.length} {t`lots`}
					</span>
				</div>
			</div>
		</div>
	);
});
