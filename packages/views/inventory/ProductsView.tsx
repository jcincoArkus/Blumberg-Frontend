import { Download, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { useInventoryViewModel } from "~@/view-model";

import { fmtMoney } from "./data";
import "./inventory.css";

export const ProductsView = observer(function ProductsView() {
	const vm = useInventoryViewModel();
	const [catFilter, setCatFilter] = useState<string>("all");
	const [search, setSearch] = useState("");

	const rows = useMemo(() => {
		let list = vm.products.slice();
		if (catFilter !== "all") list = list.filter((p) => p.cat === catFilter);
		if (search) {
			const q = search.toLowerCase();
			list = list.filter(
				(p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q),
			);
		}
		return list;
	}, [vm.products, catFilter, search]);

	return (
		<div className="inventory-module">
			<div className="page-h">
				<div>
					<div className="ttl">{t`Products`}</div>
					<div className="sub">
						{vm.products.length} {t`active SKUs · catalog used by intake and lots`}
					</div>
				</div>
				<div className="right">
					<button type="button" className="btn">
						<Download size={14} /> {t`Export`}
					</button>
					<button type="button" className="btn btn-primary">
						<Plus size={14} /> {t`Add product`}
					</button>
				</div>
			</div>

			<div className="card" style={{ overflow: "hidden" }}>
				<div className="toolbar">
					<div className="seg">
						<button
							type="button"
							className={catFilter === "all" ? "on" : ""}
							onClick={() => setCatFilter("all")}
						>
							{t`All`}
						</button>
						{vm.categories.map((c) => (
							<button
								type="button"
								key={c.id}
								className={catFilter === c.id ? "on" : ""}
								onClick={() => setCatFilter(c.id)}
							>
								{c.name}
							</button>
						))}
					</div>
					<div className="grow" />
					<div className="search">
						<Search size={13} className="icn" />
						<input
							placeholder={t`Name, SKU…`}
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>
				</div>

				{vm.isLoading ? (
					<div style={{ padding: "40px 16px", textAlign: "center", color: "var(--inv-ink-400)" }}>
						{t`Loading products…`}
					</div>
				) : (
					<div style={{ overflowX: "auto" }}>
						<table className="tbl">
							<thead>
								<tr>
									<th>{t`Product`}</th>
									<th>{t`Category`}</th>
									<th>{t`Unit`}</th>
									<th style={{ textAlign: "right" }}>{t`kg / box`}</th>
									<th style={{ textAlign: "right" }}>{t`Shelf life`}</th>
									<th style={{ textAlign: "right" }}>{t`Price`}</th>
								</tr>
							</thead>
							<tbody>
								{rows.map((p) => {
									const cat = vm.categoryById(p.cat);
									return (
										<tr key={p.id}>
											<td>
												<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
													<span
														className="cat-dot"
														style={{
															background: cat.color,
															boxShadow: "inset 0 0 0 1px rgba(0,0,0,.06)",
														}}
													/>
													<div>
														<div className="pname">{p.name}</div>
														<div className="psku">{p.sku}</div>
													</div>
												</div>
											</td>
											<td>{cat.name}</td>
											<td>{p.unit}</td>
											<td className="num">{p.kgPerBox != null ? p.kgPerBox.toFixed(1) : "—"}</td>
											<td className="num">{p.shelfLife}d</td>
											<td className="num">{fmtMoney(p.price)}</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				)}

				<div className="legend">
					<span style={{ marginLeft: "auto" }}>
						{t`Showing`} {rows.length} {t`of`} {vm.products.length} {t`products`}
					</span>
				</div>
			</div>
		</div>
	);
});
