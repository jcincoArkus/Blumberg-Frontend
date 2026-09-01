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
import {
	type InvCategory,
	type InvLot,
	type InvProduct,
	type InvSite,
	useInventoryViewModel,
} from "~@/view-model";

import { daysUntil, type ExpStatus, expStatus, fmtDateShort, fmtMoney } from "./data";
import "./inventory.css";

type SortKey = "exp" | "name" | "qty";

type EnrichedLot = Omit<InvLot, "exp"> & {
	p: InvProduct;
	cat: InvCategory;
	site: InvSite;
	exp: ExpStatus;
	expDate: Date;
	onhandKg: number | null;
	value: number;
};

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

export const InventoryView = observer(function InventoryView() {
	const navigate = useNavigate();
	const vm = useInventoryViewModel();
	const [siteFilter, setSiteFilter] = useState<string>("all");
	const [catFilter] = useState<string>("all");
	const [search, setSearch] = useState("");
	const [sortBy] = useState<SortKey>("exp");

	const lots: EnrichedLot[] = useMemo(() => {
		let rows: EnrichedLot[] = vm.lots.map((l) => {
			const p = vm.productById(l.productId);
			const cat = vm.categoryById(p.cat);
			const site = vm.siteById(l.siteId);
			const exp = expStatus(l.exp);
			const onhandKg = p.kgPerBox && l.unit !== "kg" ? l.qty * p.kgPerBox : null;
			const value = l.qty * l.costPerUnit;
			return { ...l, p, cat, site, exp, expDate: l.exp, onhandKg, value };
		});
		if (siteFilter !== "all") rows = rows.filter((r) => r.siteId === siteFilter);
		if (catFilter !== "all") rows = rows.filter((r) => r.p.cat === catFilter);
		if (search) {
			const q = search.toLowerCase();
			rows = rows.filter(
				(r) =>
					r.p.name.toLowerCase().includes(q) ||
					r.id.toLowerCase().includes(q) ||
					r.p.sku.toLowerCase().includes(q),
			);
		}
		if (sortBy === "exp") rows.sort((a, b) => a.exp.days - b.exp.days);
		if (sortBy === "name") rows.sort((a, b) => a.p.name.localeCompare(b.p.name));
		if (sortBy === "qty") rows.sort((a, b) => b.qty - a.qty);
		return rows;
	}, [vm, siteFilter, catFilter, search, sortBy]);

	const totals = useMemo(() => {
		const totalLots = lots.length;
		const totalValue = lots.reduce((s, l) => s + l.value, 0);
		const expSoon = lots.filter((l) => l.exp.tone === "soon" || l.exp.tone === "critical").length;
		const expired = lots.filter((l) => l.exp.tone === "expired").length;
		return { totalLots, totalValue, expSoon, expired };
	}, [lots]);

	return (
		<div className="inventory-module">
			<div className="page-h">
				<div>
					<div className="ttl">{t`Current inventory`}</div>
					<div className="sub">
						{lots.length} {t`active lots · FIFO suggested for output`}
					</div>
				</div>
				<div className="right">
					<button type="button" className="btn" onClick={() => vm.refresh()}>
						<RefreshCw size={14} /> {t`Sync`}
					</button>
					<button type="button" className="btn">
						<Download size={14} /> {t`Export`}
					</button>
					<button
						type="button"
						className="btn btn-primary"
						onClick={() => navigate("/inventory/intake")}
					>
						<Plus size={14} /> {t`Receive intake`}
					</button>
				</div>
			</div>

			<div className="stat-grid">
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

			<div className="card" style={{ overflow: "hidden" }}>
				<div className="toolbar">
					<div className="seg">
						<button
							type="button"
							className={siteFilter === "all" ? "on" : ""}
							onClick={() => setSiteFilter("all")}
						>
							{t`All sites`}
						</button>
						{vm.sites.map((s) => (
							<button
								type="button"
								key={s.id}
								className={siteFilter === s.id ? "on" : ""}
								onClick={() => setSiteFilter(s.id)}
							>
								{s.name.split(" · ")[0]}
							</button>
						))}
					</div>

					<div className="grow" />

					<button type="button" className="filterbtn">
						<Filter size={13} /> {t`Category`}:{" "}
						<span className="v">
							{catFilter === "all" ? t`All` : vm.categoryById(catFilter).name}
						</span>
						<ChevronDown size={12} />
					</button>
					<button type="button" className="filterbtn">
						<SlidersHorizontal size={13} /> {t`Sort`}:{" "}
						<span className="v">
							{sortBy === "exp" ? t`Expiration` : sortBy === "name" ? t`Name` : t`Quantity`}
						</span>
						<ChevronDown size={12} />
					</button>
					<div className="search">
						<Search size={13} className="icn" />
						<input
							placeholder={t`Lot, product, SKU…`}
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>
				</div>

				{vm.isLoading ? (
					<div style={{ padding: "40px 16px", textAlign: "center", color: "var(--inv-ink-400)" }}>
						{t`Loading inventory…`}
					</div>
				) : (
					<div style={{ overflowX: "auto" }}>
						<table className="tbl">
							<thead>
								<tr>
									<th>{t`Product`}</th>
									<th>{t`Lot`}</th>
									<th>{t`Site / Zone`}</th>
									<th>{t`Entry`}</th>
									<th style={{ textAlign: "right" }}>{t`On hand`}</th>
									<th style={{ textAlign: "right", minWidth: 110 }}>{t`Expiration`}</th>
									<th style={{ textAlign: "right" }}>{t`Value`}</th>
									<th style={{ width: 80 }} />
								</tr>
							</thead>
							<tbody>
								{lots.map((l) => (
									<tr key={l.id} className={l.exp.tone}>
										<td>
											<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
												<span
													className="cat-dot"
													style={{
														background: l.cat.color,
														boxShadow: "inset 0 0 0 1px rgba(0,0,0,.06)",
													}}
												/>
												<div>
													<div className="pname">{l.p.name}</div>
													<div className="psku">
														{l.p.sku} · {l.cat.name}
													</div>
												</div>
											</div>
										</td>
										<td>
											<div className="lotid">{l.id}</div>
											<div className="meta">{l.supplier}</div>
										</td>
										<td>
											<div style={{ color: "var(--inv-ink-900)", fontWeight: 500 }}>
												{l.site.name.split(" · ")[0]}
											</div>
											<div className="meta">{l.zone}</div>
										</td>
										<td>
											<div style={{ color: "var(--inv-ink-900)" }}>{fmtDateShort(l.entry)}</div>
											<div className="meta">{Math.abs(daysUntil(l.entry))}d ago</div>
										</td>
										<td className="num">
											{l.qty.toLocaleString()}{" "}
											<span style={{ color: "var(--inv-ink-400)", fontWeight: 400 }}>{l.unit}</span>
											{l.onhandKg != null && (
												<div className="meta" style={{ textAlign: "right" }}>
													≈ {l.onhandKg.toFixed(1)} kg
												</div>
											)}
										</td>
										<td>
											<div className="exp-cell">
												<div className={`d ${l.exp.tone}`}>{l.exp.label}</div>
												<div className="when">{fmtDateShort(l.expDate)}</div>
											</div>
										</td>
										<td className="num">{fmtMoney(l.value)}</td>
										<td>
											<div className="row-actions">
												<button type="button" className="icn-btn" title={t`Adjust`}>
													<Pencil size={13} />
												</button>
												<button type="button" className="icn-btn" title={t`Mark waste`}>
													<Trash2 size={13} />
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}

				<div className="legend">
					<span>{t`Expiration`}:</span>
					<span className="it">
						<span className="b" style={{ background: "var(--inv-rose-fg)" }} />{" "}
						{t`≤ 2 days · critical`}
					</span>
					<span className="it">
						<span className="b" style={{ background: "var(--inv-amber-fg)" }} />{" "}
						{t`≤ 5 days · soon`}
					</span>
					<span className="it">
						<span className="b" style={{ background: "var(--inv-ink-300)" }} /> {t`> 5 days · ok`}
					</span>
					<span style={{ marginLeft: "auto" }}>
						{t`Showing`} {lots.length} {t`of`} {vm.lots.length} {t`lots`}
					</span>
				</div>
			</div>
		</div>
	);
});
