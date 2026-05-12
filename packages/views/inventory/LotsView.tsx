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
		expired: "border-l-red-600",
		critical: "border-l-red-600",
		soon: "border-l-amber-600",
		ok: "",
	};

	return (
		<div className="space-y-6">
			<div className="flex items-start gap-4">
				<div>
					<h1 className="text-xl font-semibold tracking-tight text-gray-900">{t`Lots`}</h1>
					<p className="text-sm text-gray-600 mt-1">
						{vm.lots.length} {t`active lots · sortable by lot ID`}
					</p>
				</div>
				<div className="ml-auto flex items-center gap-2">
					<Button variant="outline" size="sm">
						<Download size={14} /> {t`Export`}
					</Button>
				</div>
			</div>

			<div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
				<div className="flex items-center gap-2 p-3 border-b border-gray-100 bg-white">
					<div className="flex-1" />
					<div className="relative w-60">
						<Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
						<input
							placeholder={t`Lot, product, supplier…`}
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="h-7 px-3 pl-7 rounded-lg border border-gray-200 bg-white text-sm w-full outline-none focus:border-teal-500"
						/>
					</div>
				</div>

				{vm.isLoading ? (
					<div className="p-10 text-center text-gray-400 text-sm">{t`Loading lots…`}</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full border-collapse text-sm">
							<thead>
								<tr>
									<th className="text-xs font-semibold tracking-wide uppercase text-gray-500 text-left px-3.5 py-2.5 bg-white border-b border-gray-200">{t`Lot`}</th>
									<th className="text-xs font-semibold tracking-wide uppercase text-gray-500 text-left px-3.5 py-2.5 bg-white border-b border-gray-200">{t`Product`}</th>
									<th className="text-xs font-semibold tracking-wide uppercase text-gray-500 text-left px-3.5 py-2.5 bg-white border-b border-gray-200">{t`Supplier`}</th>
									<th className="text-xs font-semibold tracking-wide uppercase text-gray-500 text-left px-3.5 py-2.5 bg-white border-b border-gray-200">{t`Site`}</th>
									<th className="text-xs font-semibold tracking-wide uppercase text-gray-500 text-left px-3.5 py-2.5 bg-white border-b border-gray-200">{t`Entry`}</th>
									<th className="text-xs font-semibold tracking-wide uppercase text-gray-500 text-left px-3.5 py-2.5 bg-white border-b border-gray-200">{t`Expiration`}</th>
									<th className="text-xs font-semibold tracking-wide uppercase text-gray-500 text-right px-3.5 py-2.5 bg-white border-b border-gray-200">{t`Qty`}</th>
									<th className="text-xs font-semibold tracking-wide uppercase text-gray-500 text-right px-3.5 py-2.5 bg-white border-b border-gray-200">{t`Value`}</th>
								</tr>
							</thead>
							<tbody>
								{rows.map((r) => (
									<tr
										key={r.id}
										className={cn(
											"hover:bg-gray-50 border-b border-gray-100 border-l-2",
											toneColorMap[r.exp.tone],
										)}
									>
										<td className="px-3.5 py-3 text-gray-700 font-mono">{r.id}</td>
										<td className="px-3.5 py-3 text-gray-700">
											<div className="font-medium text-gray-900">{r.product.name}</div>
											<div className="text-xs text-gray-500 font-mono">{r.product.sku}</div>
										</td>
										<td className="px-3.5 py-3 text-gray-700">{r.supplier}</td>
										<td className="px-3.5 py-3 text-gray-700">
											<div className="text-gray-900 font-medium">{r.site.name.split(" · ")[0]}</div>
											<div className="text-xs text-gray-500 mt-0.5">{r.zone}</div>
										</td>
										<td className="px-3.5 py-3 text-gray-700">{fmtDateShort(r.entry)}</td>
										<td className="px-3.5 py-3">
											<div className="flex flex-col items-start gap-0.5">
												<div
													className={cn(
														"text-sm font-medium",
														r.exp.tone === "expired" || r.exp.tone === "critical"
															? "text-red-600"
															: r.exp.tone === "soon"
																? "text-amber-600"
																: "text-gray-900",
													)}
												>
													{r.exp.label}
												</div>
												<div className="text-xs text-gray-500">{fmtDateShort(r.expDate)}</div>
											</div>
										</td>
										<td className="px-3.5 py-3 text-right text-gray-900 font-mono">
											{r.qty.toLocaleString()}{" "}
											<span className="text-gray-500 font-normal">{r.unit}</span>
										</td>
										<td className="px-3.5 py-3 text-right text-gray-900 font-mono">
											{fmtMoney(r.value)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}

				<div className="px-3.5 py-2.5 bg-white border-t border-gray-100 text-sm text-gray-600 flex">
					<span className="ml-auto">
						{t`Showing`} {rows.length} {t`of`} {vm.lots.length} {t`lots`}
					</span>
				</div>
			</div>
		</div>
	);
});
