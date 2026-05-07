import { Download, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { useInventoryViewModel } from "~@/view-model";

import { expStatus, fmtDateShort, fmtMoney } from "./data";
import "./inventory.css";

export const LotsView = observer(function LotsView() {
	const vm = useInventoryViewModel();
	const [search, setSearch] = useState("");

	const rows = useMemo(() => {
		const list = vm.lots
			.map((l) => {
				const p = vm.productById(l.productId);
				const site = vm.siteById(l.siteId);
				const exp = expStatus(l.exp);
				const expDate = l.exp;
				const value = l.qty * l.costPerUnit;
				return { ...l, p, site, exp, expDate, value };
			})
			.sort((a, b) => a.id.localeCompare(b.id));

		if (!search) return list;
		const q = search.toLowerCase();
		return list.filter(
			(r) =>
				r.id.toLowerCase().includes(q) ||
				r.p.name.toLowerCase().includes(q) ||
				r.supplier.toLowerCase().includes(q),
		);
	}, [vm, search]);

	return (
		<div className="inventory-module">
			<div className="page-h">
				<div>
					<div className="ttl">{t`Lots`}</div>
					<div className="sub">
						{vm.lots.length} {t`active lots · sortable by lot ID`}
					</div>
				</div>
				<div className="right">
					<button type="button" className="btn">
						<Download size={14} /> {t`Export`}
					</button>
				</div>
			</div>

			<div className="card" style={{ overflow: "hidden" }}>
				<div className="toolbar">
					<div className="grow" />
					<div className="search">
						<Search size={13} className="icn" />
						<input
							placeholder={t`Lot, product, supplier…`}
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>
				</div>

				{vm.isLoading ? (
					<div style={{ padding: "40px 16px", textAlign: "center", color: "var(--inv-ink-400)" }}>
						{t`Loading lots…`}
					</div>
				) : (
					<div style={{ overflowX: "auto" }}>
						<table className="tbl">
							<thead>
								<tr>
									<th>{t`Lot`}</th>
									<th>{t`Product`}</th>
									<th>{t`Supplier`}</th>
									<th>{t`Site`}</th>
									<th>{t`Entry`}</th>
									<th>{t`Expiration`}</th>
									<th style={{ textAlign: "right" }}>{t`Qty`}</th>
									<th style={{ textAlign: "right" }}>{t`Value`}</th>
								</tr>
							</thead>
							<tbody>
								{rows.map((r) => (
									<tr key={r.id} className={r.exp.tone}>
										<td>
											<div className="lotid">{r.id}</div>
										</td>
										<td>
											<div className="pname">{r.p.name}</div>
											<div className="psku">{r.p.sku}</div>
										</td>
										<td>{r.supplier}</td>
										<td>
											<div style={{ color: "var(--inv-ink-900)", fontWeight: 500 }}>
												{r.site.name.split(" · ")[0]}
											</div>
											<div className="meta">{r.zone}</div>
										</td>
										<td>{fmtDateShort(r.entry)}</td>
										<td>
											<div className="exp-cell">
												<div className={`d ${r.exp.tone}`}>{r.exp.label}</div>
												<div className="when">{fmtDateShort(r.expDate)}</div>
											</div>
										</td>
										<td className="num">
											{r.qty.toLocaleString()}{" "}
											<span style={{ color: "var(--inv-ink-400)", fontWeight: 400 }}>{r.unit}</span>
										</td>
										<td className="num">{fmtMoney(r.value)}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}

				<div className="legend">
					<span style={{ marginLeft: "auto" }}>
						{t`Showing`} {rows.length} {t`of`} {vm.lots.length} {t`lots`}
					</span>
				</div>
			</div>
		</div>
	);
});
