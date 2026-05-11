import { ArrowDown, ArrowLeftRight, ArrowUp, Pencil, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router";

import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { Button, cn } from "~@/ui";
import { type InvMovementType, useInventoryViewModel } from "~@/view-model";

import { expStatus, fmtMoney, fmtTime } from "./data";

const TYPE_ICON = {
	intake: ArrowDown,
	output: ArrowUp,
	waste: Trash2,
	adjustment: Pencil,
	transfer: ArrowLeftRight,
} as const satisfies Record<InvMovementType, unknown>;

const TYPE_LABEL: Record<InvMovementType, string> = {
	intake: "Intake",
	output: "Sale",
	waste: "Waste",
	adjustment: "Adjustment",
	transfer: "Transfer",
};

const TYPE_COLOR_MAP: Record<InvMovementType, string> = {
	intake: "bg-green-50 text-green-700",
	output: "bg-blue-50 text-blue-700",
	waste: "bg-red-50 text-red-700",
	adjustment: "bg-amber-50 text-amber-700",
	transfer: "bg-gray-100 text-gray-700",
};

function StatCard({
	label,
	value,
	sub,
	tone = "ok",
	accent = 0.6,
}: {
	label: string;
	value: string | number;
	sub?: string;
	tone?: "ok" | "up" | "warn" | "down";
	accent?: number;
}) {
	const toneColorMap = {
		ok: "text-teal-700",
		up: "text-green-600",
		warn: "text-amber-600",
		down: "text-red-600",
	};

	return (
		<div className="bg-white border border-gray-200 rounded-lg p-4">
			<div className="text-xs font-medium uppercase tracking-wider text-gray-500">{label}</div>
			<div className="text-2xl font-semibold tracking-tight text-gray-900 mt-1">{value}</div>
			{sub && <div className={`text-xs mt-1 ${toneColorMap[tone]}`}>{sub}</div>}
			<div className="h-0.5 bg-gray-100 rounded mt-3 overflow-hidden">
				<div
					className="h-full bg-teal-700 rounded"
					style={{ width: `${Math.round(accent * 100)}%` }}
				/>
			</div>
		</div>
	);
}

function SectionCard({
	title,
	sub,
	children,
}: {
	title: string;
	sub?: string;
	children: React.ReactNode;
}) {
	return (
		<div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
			<div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
				<div className="text-sm font-semibold text-gray-900">{title}</div>
				{sub && <div className="text-xs text-gray-500">· {sub}</div>}
			</div>
			<div className="px-4 py-3">{children}</div>
		</div>
	);
}

function Bar({ pct, color }: { pct: number; color?: string }) {
	return (
		<div className="w-full h-1.5 bg-gray-100 rounded overflow-hidden">
			<div
				className={cn("h-full rounded", color ?? "bg-teal-700")}
				style={{ width: `${Math.max(2, Math.round(pct * 100))}%` }}
			/>
		</div>
	);
}

export const InventoryDashboardView = observer(function InventoryDashboardView() {
	const vm = useInventoryViewModel();

	const enriched = useMemo(
		() =>
			vm.lots.map((l) => {
				const p = vm.productById(l.productId);
				const cat = vm.categoryById(p.cat);
				const site = vm.siteById(l.siteId);
				const exp = expStatus(l.exp);
				const value = l.qty * l.costPerUnit;
				const kg = l.unit === "kg" ? l.qty : p.kgPerBox ? l.qty * p.kgPerBox : 0;
				return { ...l, p, cat, site, exp, value, kg };
			}),
		[vm],
	);

	const totals = useMemo(() => {
		const totalValue = enriched.reduce((s, l) => s + l.value, 0);
		const totalKg = enriched.reduce((s, l) => s + l.kg, 0);
		const totalUnits = enriched.reduce((s, l) => s + l.qty, 0);
		const expSoon = enriched.filter(
			(l) => l.exp.tone === "soon" || l.exp.tone === "critical",
		).length;
		return { totalValue, totalKg, totalUnits, expSoon };
	}, [enriched]);

	const bySite = useMemo(() => {
		const totalValue = totals.totalValue || 1;
		return vm.sites
			.map((s) => {
				const slots = enriched.filter((l) => l.siteId === s.id);
				const value = slots.reduce((sum, l) => sum + l.value, 0);
				return { site: s, count: slots.length, value, share: value / totalValue };
			})
			.sort((a, b) => b.value - a.value);
	}, [enriched, totals.totalValue, vm.sites]);

	const byCategory = useMemo(() => {
		const totalValue = totals.totalValue || 1;
		return vm.categories
			.map((c) => {
				const slots = enriched.filter((l) => l.cat.id === c.id);
				const value = slots.reduce((sum, l) => sum + l.value, 0);
				return { cat: c, count: slots.length, value, share: value / totalValue };
			})
			.filter((row) => row.count > 0)
			.sort((a, b) => b.value - a.value);
	}, [enriched, totals.totalValue, vm.categories]);

	const expirationBuckets = useMemo(() => {
		const buckets = [
			{
				key: "expired",
				label: t`Past`,
				range: "≤ 0d",
				tone: "expired" as const,
				count: 0,
				value: 0,
			},
			{
				key: "critical",
				label: t`≤ 2d`,
				range: "0–2d",
				tone: "critical" as const,
				count: 0,
				value: 0,
			},
			{ key: "soon", label: t`≤ 5d`, range: "3–5d", tone: "soon" as const, count: 0, value: 0 },
			{ key: "ok", label: t`> 5d`, range: "> 5d", tone: "ok" as const, count: 0, value: 0 },
		];
		enriched.forEach((l) => {
			const b = buckets.find((x) => x.key === l.exp.tone);
			if (b) {
				b.count++;
				b.value += l.value;
			}
		});
		const max = Math.max(1, ...buckets.map((b) => b.count));
		return { buckets, max };
	}, [enriched]);

	const movementsLast7 = useMemo(() => {
		const cutoff = new Date();
		cutoff.setDate(cutoff.getDate() - 7);
		const recent = vm.movements.filter((m) => m.at >= cutoff);
		const by: Record<InvMovementType, number> = {
			intake: 0,
			output: 0,
			waste: 0,
			adjustment: 0,
			transfer: 0,
		};
		recent.forEach((m) => {
			by[m.type]++;
		});
		return { total: recent.length, by, recent };
	}, [vm.movements]);

	const topProducts = useMemo(() => {
		const map = new Map<
			string,
			{ product: ReturnType<typeof vm.productById>; value: number; lots: number }
		>();
		enriched.forEach((l) => {
			const cur = map.get(l.p.id) ?? { product: l.p, value: 0, lots: 0 };
			cur.value += l.value;
			cur.lots += 1;
			map.set(l.p.id, cur);
		});
		return Array.from(map.values())
			.sort((a, b) => b.value - a.value)
			.slice(0, 5);
	}, [enriched, vm, vm.productById]);

	if (vm.isLoading) {
		return (
			<div className="space-y-6">
				<div className="flex items-start gap-4">
					<div>
						<h1 className="text-xl font-semibold tracking-tight text-gray-900">{t`Inventory dashboard`}</h1>
						<p className="text-sm text-gray-600 mt-1">{t`Snapshot across all sites · last 7 days of activity`}</p>
					</div>
				</div>
				<div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-gray-400 text-sm">
					{t`Loading…`}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-start gap-4">
				<div>
					<h1 className="text-xl font-semibold tracking-tight text-gray-900">{t`Inventory dashboard`}</h1>
					<p className="text-sm text-gray-600 mt-1">{t`Snapshot across all sites · last 7 days of activity`}</p>
				</div>
				<div className="ml-auto flex items-center gap-2">
					<Button variant="outline" size="sm" asChild>
						<Link to="/inventory">{t`View lots`}</Link>
					</Button>
					<Button size="sm" asChild>
						<Link to="/inventory/intake">{t`Receive intake`}</Link>
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-4 gap-3">
				<StatCard
					label={t`Active lots`}
					value={enriched.length}
					sub={`${vm.sites.length} ${t`sites`}`}
					accent={0.85}
				/>
				<StatCard
					label={t`Inventory value`}
					value={fmtMoney(totals.totalValue)}
					sub={t`at last cost`}
					accent={0.7}
				/>
				<StatCard
					label={t`On hand`}
					value={`${totals.totalKg.toFixed(0)} kg`}
					sub={`${totals.totalUnits.toLocaleString()} ${t`units total`}`}
					accent={0.55}
				/>
				<StatCard
					label={t`Expiring ≤ 5d`}
					value={totals.expSoon}
					sub={totals.expSoon ? t`review FIFO output` : t`all clear`}
					tone={totals.expSoon ? "warn" : "up"}
					accent={0.4}
				/>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<SectionCard title={t`By site`} sub={`${vm.sites.length} ${t`locations`}`}>
					<div className="space-y-3">
						{bySite.map((row) => (
							<div key={row.site.id}>
								<div className="flex items-baseline justify-between">
									<div className="text-sm font-medium text-gray-900">
										{row.site.name.split(" · ")[0]}
									</div>
									<div className="text-xs text-gray-500">
										{row.count} {t`lots`} · <span className="font-mono">{fmtMoney(row.value)}</span>
									</div>
								</div>
								<div className="mt-1.5">
									<Bar pct={row.share} />
								</div>
							</div>
						))}
					</div>
				</SectionCard>

				<SectionCard title={t`By category`} sub={`${byCategory.length} ${t`active`}`}>
					<div className="space-y-3">
						{byCategory.map((row) => (
							<div key={row.cat.id}>
								<div className="flex items-center gap-2">
									<span
										className="w-3 h-3 rounded-full flex-shrink-0"
										style={{
											background: row.cat.color,
											boxShadow: "inset 0 0 0 1px rgba(0,0,0,.06)",
										}}
									/>
									<div className="text-sm font-medium text-gray-900">{row.cat.name}</div>
									<div className="ml-auto text-xs text-gray-500">
										{row.count} {t`lots`} · <span className="font-mono">{fmtMoney(row.value)}</span>
									</div>
								</div>
								<div className="mt-1.5">
									<Bar pct={row.share} />
								</div>
							</div>
						))}
					</div>
				</SectionCard>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<SectionCard title={t`Expiration risk`} sub={t`lots by remaining shelf life`}>
					<div className="grid grid-cols-4 gap-2.5">
						{expirationBuckets.buckets.map((b) => {
							const toneColor = {
								expired: "text-red-600",
								critical: "text-red-600",
								soon: "text-amber-600",
								ok: "text-teal-700",
							}[b.tone];
							return (
								<div key={b.key} className="border border-gray-200 rounded-lg p-3">
									<div className="text-xs font-medium text-gray-500">{b.label}</div>
									<div
										className={cn("text-2xl font-semibold mt-1 font-variant-numeric", toneColor)}
									>
										{b.count}
									</div>
									<div className="mt-2 h-1 bg-gray-100 rounded overflow-hidden">
										<div
											className={cn("h-full rounded", {
												"bg-red-600": b.tone === "expired" || b.tone === "critical",
												"bg-amber-600": b.tone === "soon",
												"bg-teal-700": b.tone === "ok",
											})}
											style={{
												width: `${(b.count / expirationBuckets.max) * 100}%`,
											}}
										/>
									</div>
									<div className="mt-1.5 text-xs text-gray-400">{fmtMoney(b.value)}</div>
								</div>
							);
						})}
					</div>
				</SectionCard>

				<SectionCard
					title={t`Movements · last 7 days`}
					sub={`${movementsLast7.total} ${t`events`}`}
				>
					<div className="grid grid-cols-5 gap-2">
						{(["intake", "output", "waste", "adjustment", "transfer"] as InvMovementType[]).map(
							(type) => {
								const Icn = TYPE_ICON[type];
								return (
									<div key={type} className="border border-gray-200 rounded-lg p-3">
										<div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
											<Icn size={12} /> {TYPE_LABEL[type]}
										</div>
										<div className="text-xl font-semibold text-gray-900 mt-1 font-variant-numeric">
											{movementsLast7.by[type]}
										</div>
									</div>
								);
							},
						)}
					</div>
					<div className="mt-3">
						<Link
							to="/inventory/movements"
							className="text-xs font-medium text-teal-700 hover:text-teal-600 no-underline"
						>
							{t`View full movements log →`}
						</Link>
					</div>
				</SectionCard>
			</div>

			<div className="grid grid-cols-3 gap-4">
				<div className="col-span-2">
					<SectionCard title={t`Recent activity`} sub={t`latest 6 events`}>
						<div className="overflow-x-auto">
							<table className="w-full text-xs border-collapse">
								<thead>
									<tr>
										<th className="text-left px-3 py-2 font-semibold uppercase tracking-wide text-gray-500 border-b border-gray-200 w-16">{t`Time`}</th>
										<th className="text-left px-3 py-2 font-semibold uppercase tracking-wide text-gray-500 border-b border-gray-200 w-24">{t`Type`}</th>
										<th className="text-left px-3 py-2 font-semibold uppercase tracking-wide text-gray-500 border-b border-gray-200">{t`Product`}</th>
										<th className="text-right px-3 py-2 font-semibold uppercase tracking-wide text-gray-500 border-b border-gray-200 w-20">{t`Qty`}</th>
									</tr>
								</thead>
								<tbody>
									{movementsLast7.recent.slice(0, 6).map((m) => {
										const p = vm.productById(m.productId);
										const Icn = TYPE_ICON[m.type];
										const isNeg =
											m.type === "output" ||
											m.type === "waste" ||
											(m.type === "adjustment" && m.qty < 0);
										const isPos = m.type === "intake" || (m.type === "adjustment" && m.qty > 0);
										const sign = isNeg ? "-" : isPos ? "+" : "";
										return (
											<tr key={m.id} className="hover:bg-gray-50 border-b border-gray-100">
												<td className="px-3 py-2.5 text-gray-700 font-mono">{fmtTime(m.at)}</td>
												<td className="px-3 py-2.5">
													<span
														className={cn(
															"inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
															TYPE_COLOR_MAP[m.type],
														)}
													>
														<Icn size={11} /> {TYPE_LABEL[m.type]}
													</span>
												</td>
												<td className="px-3 py-2.5">
													<div className="font-medium text-gray-900">{p.name}</div>
												</td>
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
					</SectionCard>
				</div>

				<SectionCard title={t`Top products by value`} sub={t`top 5`}>
					<div className="space-y-3">
						{topProducts.map((row) => {
							const cat = vm.categoryById(row.product.cat);
							const max = topProducts[0]?.value || 1;
							return (
								<div key={row.product.id}>
									<div className="flex items-center gap-2">
										<span
											className="w-3 h-3 rounded-full flex-shrink-0"
											style={{
												background: cat.color,
												boxShadow: "inset 0 0 0 1px rgba(0,0,0,.06)",
											}}
										/>
										<div className="text-sm text-gray-900 font-medium">{row.product.name}</div>
										<div className="ml-auto text-xs text-gray-500">
											{row.lots} {t`lots`}
										</div>
										<div className="font-mono text-xs text-gray-900 font-medium">
											{fmtMoney(row.value)}
										</div>
									</div>
									<div className="mt-1.5">
										<Bar pct={row.value / max} />
									</div>
								</div>
							);
						})}
					</div>
				</SectionCard>
			</div>
		</div>
	);
});
