import { ArrowDown, ArrowLeftRight, ArrowUp, Pencil, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router";

import { t } from "~@/i18n/macro";

import {
	categories,
	categoryById,
	expStatus,
	fmtMoney,
	fmtTime,
	lots,
	movements,
	productById,
	sites,
	siteById,
	TODAY,
	type MovementType,
} from "./data";
import "./inventory.css";

const TYPE_ICON = {
	intake: ArrowDown,
	output: ArrowUp,
	waste: Trash2,
	adjustment: Pencil,
	transfer: ArrowLeftRight,
} as const satisfies Record<MovementType, unknown>;

const TYPE_LABEL: Record<MovementType, string> = {
	intake: "Intake",
	output: "Sale",
	waste: "Waste",
	adjustment: "Adjustment",
	transfer: "Transfer",
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
	return (
		<div className="stat">
			<div className="lbl">{label}</div>
			<div className="val">{value}</div>
			{sub && <div className={`delta ${tone}`}>{sub}</div>}
			<div className="accent-bar">
				<span style={{ width: `${Math.round(accent * 100)}%` }} />
			</div>
		</div>
	);
}

function SectionCard({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
	return (
		<div className="card" style={{ overflow: "hidden" }}>
			<div
				style={{
					padding: "12px 16px",
					borderBottom: "1px solid var(--inv-line-soft)",
					display: "flex",
					alignItems: "center",
					gap: 8,
				}}
			>
				<div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--inv-ink-900)" }}>{title}</div>
				{sub && <div style={{ fontSize: 12, color: "var(--inv-ink-500)" }}>· {sub}</div>}
			</div>
			<div style={{ padding: "12px 16px" }}>{children}</div>
		</div>
	);
}

function Bar({ pct, color }: { pct: number; color?: string }) {
	return (
		<div style={{ width: "100%", height: 6, background: "var(--inv-mint-100)", borderRadius: 3, overflow: "hidden" }}>
			<div
				style={{
					width: `${Math.max(2, Math.round(pct * 100))}%`,
					height: "100%",
					background: color ?? "var(--inv-teal-700)",
					borderRadius: 3,
				}}
			/>
		</div>
	);
}

export function InventoryDashboardView() {
	const enriched = useMemo(
		() =>
			lots.map((l) => {
				const p = productById(l.productId);
				const cat = categoryById(p.cat);
				const site = siteById(l.siteId);
				const exp = expStatus(l.exp);
				const value = l.qty * l.costPerUnit;
				const kg = l.unit === "kg" ? l.qty : p.kgPerBox ? l.qty * p.kgPerBox : 0;
				return { ...l, p, cat, site, exp, value, kg };
			}),
		[],
	);

	const totals = useMemo(() => {
		const totalValue = enriched.reduce((s, l) => s + l.value, 0);
		const totalKg = enriched.reduce((s, l) => s + l.kg, 0);
		const totalUnits = enriched.reduce((s, l) => s + l.qty, 0);
		const expSoon = enriched.filter((l) => l.exp.tone === "soon" || l.exp.tone === "critical").length;
		const expired = enriched.filter((l) => l.exp.tone === "expired").length;
		return { totalValue, totalKg, totalUnits, expSoon, expired };
	}, [enriched]);

	const bySite = useMemo(() => {
		const totalValue = totals.totalValue || 1;
		return sites
			.map((s) => {
				const slots = enriched.filter((l) => l.siteId === s.id);
				const value = slots.reduce((sum, l) => sum + l.value, 0);
				return { site: s, count: slots.length, value, share: value / totalValue };
			})
			.sort((a, b) => b.value - a.value);
	}, [enriched, totals.totalValue]);

	const byCategory = useMemo(() => {
		const totalValue = totals.totalValue || 1;
		return categories
			.map((c) => {
				const slots = enriched.filter((l) => l.cat.id === c.id);
				const value = slots.reduce((sum, l) => sum + l.value, 0);
				return { cat: c, count: slots.length, value, share: value / totalValue };
			})
			.filter((row) => row.count > 0)
			.sort((a, b) => b.value - a.value);
	}, [enriched, totals.totalValue]);

	const expirationBuckets = useMemo(() => {
		const buckets = [
			{ key: "expired", label: t`Past`, range: "≤ 0d", tone: "expired" as const, count: 0, value: 0 },
			{ key: "critical", label: t`≤ 2d`, range: "0–2d", tone: "critical" as const, count: 0, value: 0 },
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
		const cutoff = new Date(TODAY);
		cutoff.setDate(cutoff.getDate() - 7);
		const recent = movements.filter((m) => m.at >= cutoff);
		const by: Record<MovementType, number> = { intake: 0, output: 0, waste: 0, adjustment: 0, transfer: 0 };
		recent.forEach((m) => {
			by[m.type]++;
		});
		return { total: recent.length, by, recent };
	}, []);

	const topProducts = useMemo(() => {
		const map = new Map<string, { product: ReturnType<typeof productById>; value: number; lots: number }>();
		enriched.forEach((l) => {
			const cur = map.get(l.p.id) ?? { product: l.p, value: 0, lots: 0 };
			cur.value += l.value;
			cur.lots += 1;
			map.set(l.p.id, cur);
		});
		return Array.from(map.values())
			.sort((a, b) => b.value - a.value)
			.slice(0, 5);
	}, [enriched]);

	const expColors: Record<"expired" | "critical" | "soon" | "ok", string> = {
		expired: "var(--inv-rose-fg)",
		critical: "var(--inv-rose-fg)",
		soon: "var(--inv-amber-fg)",
		ok: "var(--inv-teal-700)",
	};

	return (
		<div className="inventory-module">
			<div className="page-h">
				<div>
					<div className="ttl">{t`Inventory dashboard`}</div>
					<div className="sub">{t`Snapshot across all sites · last 7 days of activity`}</div>
				</div>
				<div className="right">
					<Link to="/inventory" className="btn">
						{t`View lots`}
					</Link>
					<Link to="/inventory/intake" className="btn btn-primary">
						{t`Receive intake`}
					</Link>
				</div>
			</div>

			<div className="stat-grid">
				<StatCard
					label={t`Active lots`}
					value={enriched.length}
					sub={`${sites.length} ${t`sites`}`}
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

			<div
				style={{
					display: "grid",
					gridTemplateColumns: "1fr 1fr",
					gap: 14,
					marginBottom: 14,
				}}
			>
				<SectionCard title={t`By site`} sub={`${sites.length} ${t`locations`}`}>
					<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
						{bySite.map((row) => (
							<div key={row.site.id}>
								<div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
									<div style={{ fontSize: 13, fontWeight: 500, color: "var(--inv-ink-900)" }}>
										{row.site.name.split(" · ")[0]}
									</div>
									<div style={{ fontSize: 12, color: "var(--inv-ink-500)" }}>
										{row.count} {t`lots`} · <span className="mono">{fmtMoney(row.value)}</span>
									</div>
								</div>
								<div style={{ marginTop: 6 }}>
									<Bar pct={row.share} />
								</div>
							</div>
						))}
					</div>
				</SectionCard>

				<SectionCard title={t`By category`} sub={`${byCategory.length} ${t`active`}`}>
					<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
						{byCategory.map((row) => (
							<div key={row.cat.id}>
								<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
									<span
										className="cat-dot"
										style={{ background: row.cat.color, boxShadow: "inset 0 0 0 1px rgba(0,0,0,.06)" }}
									/>
									<div style={{ fontSize: 13, fontWeight: 500, color: "var(--inv-ink-900)" }}>
										{row.cat.name}
									</div>
									<div style={{ marginLeft: "auto", fontSize: 12, color: "var(--inv-ink-500)" }}>
										{row.count} {t`lots`} · <span className="mono">{fmtMoney(row.value)}</span>
									</div>
								</div>
								<div style={{ marginTop: 6 }}>
									<Bar pct={row.share} />
								</div>
							</div>
						))}
					</div>
				</SectionCard>
			</div>

			<div
				style={{
					display: "grid",
					gridTemplateColumns: "1fr 1fr",
					gap: 14,
					marginBottom: 14,
				}}
			>
				<SectionCard title={t`Expiration risk`} sub={t`lots by remaining shelf life`}>
					<div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
						{expirationBuckets.buckets.map((b) => (
							<div
								key={b.key}
								style={{
									border: "1px solid var(--inv-line)",
									borderRadius: 9,
									padding: "10px 12px",
								}}
							>
								<div style={{ fontSize: 11.5, color: "var(--inv-ink-500)", fontWeight: 500 }}>
									{b.label}
								</div>
								<div
									style={{
										fontSize: 22,
										fontWeight: 600,
										color: expColors[b.tone],
										marginTop: 4,
										fontVariantNumeric: "tabular-nums",
									}}
								>
									{b.count}
								</div>
								<div
									style={{
										marginTop: 8,
										width: "100%",
										height: 4,
										background: "var(--inv-line-soft)",
										borderRadius: 2,
										overflow: "hidden",
									}}
								>
									<div
										style={{
											width: `${(b.count / expirationBuckets.max) * 100}%`,
											height: "100%",
											background: expColors[b.tone],
										}}
									/>
								</div>
								<div style={{ marginTop: 6, fontSize: 11, color: "var(--inv-ink-400)" }}>
									{fmtMoney(b.value)}
								</div>
							</div>
						))}
					</div>
				</SectionCard>

				<SectionCard title={t`Movements · last 7 days`} sub={`${movementsLast7.total} ${t`events`}`}>
					<div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
						{(["intake", "output", "waste", "adjustment", "transfer"] as MovementType[]).map((type) => {
							const Icn = TYPE_ICON[type];
							return (
								<div
									key={type}
									style={{
										border: "1px solid var(--inv-line)",
										borderRadius: 9,
										padding: "10px 12px",
									}}
								>
									<div
										style={{
											display: "flex",
											alignItems: "center",
											gap: 6,
											fontSize: 11.5,
											color: "var(--inv-ink-500)",
											fontWeight: 500,
										}}
									>
										<Icn size={12} /> {TYPE_LABEL[type]}
									</div>
									<div
										style={{
											fontSize: 20,
											fontWeight: 600,
											color: "var(--inv-ink-900)",
											marginTop: 4,
											fontVariantNumeric: "tabular-nums",
										}}
									>
										{movementsLast7.by[type]}
									</div>
								</div>
							);
						})}
					</div>
					<div style={{ marginTop: 14 }}>
						<Link
							to="/inventory/movements"
							style={{
								fontSize: 12,
								color: "var(--inv-teal-700)",
								fontWeight: 500,
								textDecoration: "none",
							}}
						>
							{t`View full movements log →`}
						</Link>
					</div>
				</SectionCard>
			</div>

			<div
				style={{
					display: "grid",
					gridTemplateColumns: "1.4fr 1fr",
					gap: 14,
				}}
			>
				<SectionCard title={t`Recent activity`} sub={t`latest 6 events`}>
					<table className="mov-table">
						<thead>
							<tr>
								<th style={{ width: 70 }}>{t`Time`}</th>
								<th style={{ width: 110 }}>{t`Type`}</th>
								<th>{t`Product`}</th>
								<th style={{ textAlign: "right" }}>{t`Qty`}</th>
							</tr>
						</thead>
						<tbody>
							{movementsLast7.recent.slice(0, 6).map((m) => {
								const p = productById(m.productId);
								const Icn = TYPE_ICON[m.type];
								const isNeg = m.type === "output" || m.type === "waste" || (m.type === "adjustment" && m.qty < 0);
								const isPos = m.type === "intake" || (m.type === "adjustment" && m.qty > 0);
								const sign = isNeg ? "-" : isPos ? "+" : "";
								return (
									<tr key={m.id}>
										<td style={{ fontVariantNumeric: "tabular-nums" }}>{fmtTime(m.at)}</td>
										<td>
											<span className={`type-chip type-${m.type}`}>
												<Icn size={11} /> {TYPE_LABEL[m.type]}
											</span>
										</td>
										<td>
											<div style={{ fontWeight: 500, color: "var(--inv-ink-900)" }}>{p.name}</div>
										</td>
										<td className="num">
											<span className={isNeg ? "qty-neg" : isPos ? "qty-pos" : ""}>
												{sign}
												{Math.abs(m.qty).toLocaleString()}
											</span>
											<span style={{ color: "var(--inv-ink-400)", fontWeight: 400, marginLeft: 4 }}>{m.unit}</span>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</SectionCard>

				<SectionCard title={t`Top products by value`} sub={t`top 5`}>
					<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
						{topProducts.map((row) => {
							const cat = categoryById(row.product.cat);
							const max = topProducts[0]?.value || 1;
							return (
								<div key={row.product.id}>
									<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
										<span
											className="cat-dot"
											style={{ background: cat.color, boxShadow: "inset 0 0 0 1px rgba(0,0,0,.06)" }}
										/>
										<div style={{ fontSize: 13, color: "var(--inv-ink-900)", fontWeight: 500 }}>
											{row.product.name}
										</div>
										<div style={{ marginLeft: "auto", fontSize: 12, color: "var(--inv-ink-500)" }}>
											{row.lots} {t`lots`}
										</div>
										<div className="mono" style={{ fontSize: 12, color: "var(--inv-ink-900)", fontWeight: 500 }}>
											{fmtMoney(row.value)}
										</div>
									</div>
									<div style={{ marginTop: 6 }}>
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
}
