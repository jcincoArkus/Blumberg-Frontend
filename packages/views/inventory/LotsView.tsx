import { Download, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { Button, cn } from "~@/ui";
import { useInventoryViewModel } from "~@/view-model";

import { fmtDateShort, fmtMoney } from "./data";

export const LotsView = observer(function LotsView() {
	const vm = useInventoryViewModel();
	const [search, setSearch] = useState("");

	const rows = useMemo(() => {
		const list = [...vm.enrichedLots].sort((a, b) => a.id.localeCompare(b.id));
		if (!search) return list;
		const q = search.toLowerCase();
		return list.filter(
			(r) =>
				r.id.toLowerCase().includes(q) ||
				r.product.name.toLowerCase().includes(q) ||
				r.supplier.toLowerCase().includes(q),
		);
	}, [vm.enrichedLots, search]);

	const toneColorMap = {
		expired: "border-l-danger",
		critical: "border-l-danger",
		soon: "border-l-warning",
		ok: "",
	};

	const handleExportCsv = () => {
		const headers = ["Lot", "Product", "Supplier", "Site", "Entry", "Expiration", "Qty", "Value"];
		const data = rows.map((r) => [
			r.id,
			r.product.name,
			r.supplier,
			r.site.name.split(" · ")[0],
			fmtDateShort(r.entry),
			fmtDateShort(r.expDate),
			`${r.qty.toLocaleString()} ${r.unit}`,
			fmtMoney(r.value),
		]);
		vm.exportLotsCsv([headers, ...data]);
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-start gap-4">
				<div>
					<h1 className="text-xl font-semibold tracking-tight text-foreground">{t`Lots`}</h1>
					<p className="text-sm text-muted-foreground mt-1">
						{vm.lots.filter((l) => l.qty > 0).length} {t`active lots · sortable by lot ID`}
					</p>
				</div>
				<div className="ml-auto flex items-center gap-2">
					<Button variant="outline" size="sm" onClick={handleExportCsv}>
						<Download size={14} /> {t`Export`}
					</Button>
				</div>
			</div>

			<div className="bg-card border border-border rounded-lg overflow-hidden">
				<div className="flex items-center gap-2 p-3 border-b border-border bg-card">
					<div className="flex-1" />
					<div className="relative w-60">
						<Search
							size={13}
							className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
						/>
						<input
							placeholder={t`Lot, product, supplier…`}
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="h-7 px-3 pl-7 rounded-lg border border-input bg-card text-foreground text-sm w-full outline-none focus:border-ring"
						/>
					</div>
				</div>

				{vm.isLoading ? (
					<div className="p-10 text-center text-muted-foreground text-sm">{t`Loading lots…`}</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full border-collapse text-sm">
							<thead>
								<tr>
									<th className="text-xs font-semibold tracking-wide uppercase text-muted-foreground text-left px-3.5 py-2.5 bg-card border-b border-border">{t`Lot`}</th>
									<th className="text-xs font-semibold tracking-wide uppercase text-muted-foreground text-left px-3.5 py-2.5 bg-card border-b border-border">{t`Product`}</th>
									<th className="text-xs font-semibold tracking-wide uppercase text-muted-foreground text-left px-3.5 py-2.5 bg-card border-b border-border">{t`Supplier`}</th>
									<th className="text-xs font-semibold tracking-wide uppercase text-muted-foreground text-left px-3.5 py-2.5 bg-card border-b border-border">{t`Site`}</th>
									<th className="text-xs font-semibold tracking-wide uppercase text-muted-foreground text-left px-3.5 py-2.5 bg-card border-b border-border">{t`Entry`}</th>
									<th className="text-xs font-semibold tracking-wide uppercase text-muted-foreground text-left px-3.5 py-2.5 bg-card border-b border-border">{t`Expiration`}</th>
									<th className="text-xs font-semibold tracking-wide uppercase text-muted-foreground text-right px-3.5 py-2.5 bg-card border-b border-border">{t`Qty`}</th>
									<th className="text-xs font-semibold tracking-wide uppercase text-muted-foreground text-right px-3.5 py-2.5 bg-card border-b border-border">{t`Value`}</th>
								</tr>
							</thead>
							<tbody>
								{rows.map((r) => (
									<tr
										key={r.id}
										className={cn(
											"hover:bg-muted border-b border-border border-l-2",
											toneColorMap[r.exp.tone],
										)}
									>
										<td className="px-3.5 py-3 text-foreground/85 font-mono">{r.id}</td>
										<td className="px-3.5 py-3 text-foreground/85">
											<div className="font-medium text-foreground">{r.product.name}</div>
											<div className="text-xs text-muted-foreground font-mono">{r.product.sku}</div>
										</td>
										<td className="px-3.5 py-3 text-foreground/85">{r.supplier}</td>
										<td className="px-3.5 py-3 text-foreground/85">
											<div className="text-foreground font-medium">
												{r.site.name.split(" · ")[0]}
											</div>
											<div className="text-xs text-muted-foreground mt-0.5">{r.zone}</div>
										</td>
										<td className="px-3.5 py-3 text-foreground/85">{fmtDateShort(r.entry)}</td>
										<td className="px-3.5 py-3">
											<div className="flex flex-col items-start gap-0.5">
												<div
													className={cn(
														"text-sm font-medium",
														r.exp.tone === "expired" || r.exp.tone === "critical"
															? "text-danger"
															: r.exp.tone === "soon"
																? "text-warning-foreground"
																: "text-foreground",
													)}
												>
													{r.exp.label}
												</div>
												<div className="text-xs text-muted-foreground">
													{fmtDateShort(r.expDate)}
												</div>
											</div>
										</td>
										<td className="px-3.5 py-3 text-right text-foreground font-mono">
											{r.qty.toLocaleString()}{" "}
											<span className="text-muted-foreground font-normal">{r.unit}</span>
										</td>
										<td className="px-3.5 py-3 text-right text-foreground font-mono">
											{fmtMoney(r.value)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}

				<div className="px-3.5 py-2.5 bg-card border-t border-border text-sm text-muted-foreground flex">
					<span className="ml-auto">
						{t`Showing`} {rows.length} {t`of`} {vm.lots.length} {t`lots`}
					</span>
				</div>
			</div>
		</div>
	);
});
