import { Download, Plus, Search, Tag } from "lucide-react";
import { useMemo, useState } from "react";

import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { Button, cn, LoadingState } from "~@/ui";
import { useInventoryViewModel } from "~@/view-model";

import { AddCategoryModal } from "./AddCategoryModal";
import { AddProductModal } from "./AddProductModal";
import { fmtMoney } from "./data";

export const ProductsView = observer(function ProductsView() {
	const vm = useInventoryViewModel();
	const [catFilter, setCatFilter] = useState<string>("all");
	const [search, setSearch] = useState("");
	const [productModalOpen, setProductModalOpen] = useState(false);
	const [categoryModalOpen, setCategoryModalOpen] = useState(false);

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

	const handleExportCsv = () => {
		const headers = ["Product", "SKU", "Category", "Unit", "kg / box", "Shelf life", "Price"];
		const data = rows.map((p) => [
			p.name,
			p.sku,
			vm.categoryById(p.cat).name,
			p.unit,
			p.kgPerBox != null ? p.kgPerBox.toFixed(1) : "—",
			`${p.shelfLife}d`,
			fmtMoney(p.price),
		]);
		vm.exportProductsCsv([headers, ...data]);
	};

	return (
		<>
			<div className="space-y-6">
				<div className="flex flex-wrap items-start gap-4">
					<div>
						<h1 className="text-xl font-semibold tracking-tight text-foreground">{t`Products`}</h1>
						<p className={cn("text-sm text-muted-foreground mt-1", vm.isLoading && "invisible")}>
							{vm.products.length} {t`active SKUs · catalog used by intake and lots`}
						</p>
					</div>
					<div className="ml-auto flex items-center gap-2">
						<Button variant="outline" size="sm" onClick={handleExportCsv}>
							<Download size={14} /> {t`Export`}
						</Button>
						<Button variant="outline" size="sm" onClick={() => setCategoryModalOpen(true)}>
							<Tag size={14} /> {t`Add category`}
						</Button>
						<Button size="sm" onClick={() => setProductModalOpen(true)}>
							<Plus size={14} /> {t`Add product`}
						</Button>
					</div>
				</div>

				<div className="bg-card border border-border rounded-lg overflow-hidden">
					<div className="flex items-center gap-2 p-3 border-b border-border bg-card flex-wrap">
						<div className="flex border border-border rounded-lg p-0.5 bg-card gap-0.5">
							<button
								type="button"
								className={cn(
									"px-2.5 py-1.5 rounded text-sm font-medium transition-colors",
									catFilter === "all"
										? "bg-primary text-primary-foreground"
										: "bg-transparent text-foreground/85 hover:bg-muted",
								)}
								onClick={() => setCatFilter("all")}
							>
								{t`All`}
							</button>
							{vm.categories.map((c) => (
								<button
									type="button"
									key={c.id}
									className={cn(
										"px-2.5 py-1.5 rounded text-sm font-medium transition-colors",
										catFilter === c.id
											? "bg-primary text-primary-foreground"
											: "bg-transparent text-foreground/85 hover:bg-muted",
									)}
									onClick={() => setCatFilter(c.id)}
								>
									{c.name}
								</button>
							))}
						</div>
						<div className="flex-1" />
						<div className="relative w-60">
							<Search
								size={13}
								className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
							/>
							<input
								placeholder={t`Name, SKU…`}
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="h-7 px-3 pl-7 rounded-lg border border-input bg-card text-foreground text-sm w-full outline-none focus:border-ring"
							/>
						</div>
					</div>

					{vm.isLoading ? (
						<LoadingState variant="section" label={t`Loading products…`} />
					) : (
						<div className="overflow-x-auto">
							<table className="w-full border-collapse text-sm">
								<thead>
									<tr>
										<th className="text-xs font-semibold tracking-wide uppercase text-muted-foreground text-left px-3.5 py-2.5 bg-card border-b border-border">{t`Product`}</th>
										<th className="text-xs font-semibold tracking-wide uppercase text-muted-foreground text-left px-3.5 py-2.5 bg-card border-b border-border">{t`Category`}</th>
										<th className="text-xs font-semibold tracking-wide uppercase text-muted-foreground text-left px-3.5 py-2.5 bg-card border-b border-border">{t`Unit`}</th>
										<th className="text-xs font-semibold tracking-wide uppercase text-muted-foreground text-right px-3.5 py-2.5 bg-card border-b border-border">{t`kg / box`}</th>
										<th className="text-xs font-semibold tracking-wide uppercase text-muted-foreground text-right px-3.5 py-2.5 bg-card border-b border-border">{t`Shelf life`}</th>
										<th className="text-xs font-semibold tracking-wide uppercase text-muted-foreground text-right px-3.5 py-2.5 bg-card border-b border-border">{t`Price`}</th>
									</tr>
								</thead>
								<tbody>
									{rows.map((p) => {
										const cat = vm.categoryById(p.cat);
										return (
											<tr key={p.id} className="hover:bg-muted border-b border-border">
												<td className="px-3.5 py-3 text-foreground/85">
													<div className="flex items-center gap-2.5">
														<span
															className="w-2 h-2 rounded-full flex-shrink-0"
															style={{
																background: cat.color,
																boxShadow: "inset 0 0 0 1px rgba(0,0,0,.06)",
															}}
														/>
														<div>
															<div className="font-medium text-foreground">{p.name}</div>
															<div className="text-xs text-muted-foreground font-mono mt-0.5">
																{p.sku}
															</div>
														</div>
													</div>
												</td>
												<td className="px-3.5 py-3 text-foreground/85">{cat.name}</td>
												<td className="px-3.5 py-3 text-foreground/85">{p.unit}</td>
												<td className="px-3.5 py-3 text-foreground font-medium text-right font-mono">
													{p.kgPerBox != null ? p.kgPerBox.toFixed(1) : "—"}
												</td>
												<td className="px-3.5 py-3 text-foreground font-medium text-right font-mono">
													{p.shelfLife}d
												</td>
												<td className="px-3.5 py-3 text-foreground font-medium text-right font-mono">
													{fmtMoney(p.price)}
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					)}

					<div className="px-3.5 py-2.5 bg-card border-t border-border text-sm text-muted-foreground flex">
						<span className={cn("ml-auto", vm.isLoading && "invisible")}>
							{t`Showing`} {rows.length} {t`of`} {vm.products.length} {t`products`}
						</span>
					</div>
				</div>
			</div>

			<AddProductModal open={productModalOpen} onClose={() => setProductModalOpen(false)} />
			<AddCategoryModal open={categoryModalOpen} onClose={() => setCategoryModalOpen(false)} />
		</>
	);
});
