import { Check, Clock, Info, Plus, Printer, Snowflake, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

import { t } from "~@/i18n/macro";

import { addDays, fmtDateShort, fmtMoney, productById, sites, siteById, products, TODAY } from "./data";
import "./inventory.css";

type IntakeUnit = "kg" | "unit" | "box";

type LineItem = {
	id: number;
	productId: string;
	qty: number;
	unit: IntakeUnit;
	cost: number;
	lotSuffix: string;
	shelfDays: number;
};

export function IntakeView() {
	const navigate = useNavigate();
	const [poNumber] = useState("PO-2285");
	const [supplier, setSupplier] = useState("Distrib. Michoacán");
	const [site, setSite] = useState("cdmx");
	const [zone, setZone] = useState("Cold Room A");
	const [arrivalDate, setArrivalDate] = useState("2026-04-29");
	const [arrivalTime, setArrivalTime] = useState("11:30");
	const [vehicle, setVehicle] = useState("Truck 04 · MX-7821");
	const [tempCheck, setTempCheck] = useState("4");

	const [lines, setLines] = useState<LineItem[]>([
		{ id: 1, productId: "p-hass", qty: 8, unit: "box", cost: 126.0, lotSuffix: "", shelfDays: 7 },
		{ id: 2, productId: "p-jala", qty: 90, unit: "kg", cost: 16.0, lotSuffix: "", shelfDays: 12 },
		{ id: 3, productId: "p-cilantro", qty: 200, unit: "unit", cost: 3.5, lotSuffix: "", shelfDays: 4 },
	]);

	const updateLine = <K extends keyof LineItem>(id: number, k: K, v: LineItem[K]) =>
		setLines((ls) => ls.map((l) => (l.id === id ? { ...l, [k]: v } : l)));
	const removeLine = (id: number) => setLines((ls) => ls.filter((l) => l.id !== id));
	const addLine = () =>
		setLines((ls) => [
			...ls,
			{ id: Date.now(), productId: "p-tom-rom", qty: 1, unit: "box", cost: 0, lotSuffix: "", shelfDays: 10 },
		]);

	const enriched = lines.map((l) => {
		const p = productById(l.productId);
		const kgPerBox = p.kgPerBox;
		let kgEquiv: number | null = null;
		if (l.unit === "kg") kgEquiv = l.qty;
		else if (l.unit === "box" && kgPerBox) kgEquiv = l.qty * kgPerBox;
		const total = l.qty * l.cost;
		return { ...l, p, kgEquiv, total };
	});

	const subtotal = enriched.reduce((s, l) => s + l.total, 0);
	const tax = subtotal * 0.16;
	const grand = subtotal + tax;
	const totalKg = enriched.reduce((s, l) => s + (l.kgEquiv ?? 0), 0);

	return (
		<div className="inventory-module">
			<div className="page-h">
				<div>
					<div className="ttl">
						{t`Receive intake`} · {poNumber}
					</div>
					<div className="sub">{t`Lots are created on save · stock increases at the selected zone`}</div>
				</div>
				<div className="right">
					<button type="button" className="btn" onClick={() => navigate("/inventory")}>
						{t`Cancel`}
					</button>
					<button type="button" className="btn">
						<Printer size={14} /> {t`Print receipt`}
					</button>
					<button type="button" className="btn btn-primary">
						<Check size={14} /> {t`Save · create`} {lines.length} {t`lots`}
					</button>
				</div>
			</div>

			<div className="intake">
				<div className="form-card">
					{/* STEP 1 */}
					<div className="form-step">
						<div className="step-h">
							<span className="num">1</span>
							<span className="ttl">{t`Shipment details`}</span>
							<span className="sub">{t`Where and when the goods arrived`}</span>
						</div>
						<div className="field-grid cols-3">
							<div>
								<label className="label" htmlFor="intake-supplier">{t`Supplier`}</label>
								<select
									id="intake-supplier"
									className="input"
									value={supplier}
									onChange={(e) => setSupplier(e.target.value)}
								>
									<option>Distrib. Michoacán</option>
									<option>Hortícola del Bajío</option>
									<option>Citrícola Veracruz</option>
									<option>Frutas Pacífico</option>
									<option>Verduras del Norte</option>
									<option>Mercado Central</option>
								</select>
							</div>
							<div>
								<label className="label" htmlFor="intake-po">{t`PO / Reference`}</label>
								<input id="intake-po" className="input" value={poNumber} readOnly />
							</div>
							<div>
								<label className="label" htmlFor="intake-vehicle">{t`Vehicle / Driver`}</label>
								<input
									id="intake-vehicle"
									className="input"
									value={vehicle}
									onChange={(e) => setVehicle(e.target.value)}
								/>
							</div>
							<div>
								<label className="label" htmlFor="intake-site">{t`Site`}</label>
								<select
									id="intake-site"
									className="input"
									value={site}
									onChange={(e) => {
										setSite(e.target.value);
										setZone(siteById(e.target.value).zones[0]);
									}}
								>
									{sites.map((s) => (
										<option key={s.id} value={s.id}>
											{s.name}
										</option>
									))}
								</select>
							</div>
							<div>
								<label className="label" htmlFor="intake-zone">{t`Receiving zone`}</label>
								<select
									id="intake-zone"
									className="input"
									value={zone}
									onChange={(e) => setZone(e.target.value)}
								>
									{siteById(site).zones.map((z) => (
										<option key={z}>{z}</option>
									))}
								</select>
							</div>
							<div>
								<label className="label" htmlFor="intake-temp">{t`Cold-chain temp °C`}</label>
								<input
									id="intake-temp"
									className="input"
									type="number"
									step="0.1"
									value={tempCheck}
									onChange={(e) => setTempCheck(e.target.value)}
								/>
								<div className="help">{t`Target ≤ 6 °C for refrigerated lots`}</div>
							</div>
							<div>
								<label className="label" htmlFor="intake-date">{t`Arrival date`}</label>
								<input
									id="intake-date"
									className="input"
									type="date"
									value={arrivalDate}
									onChange={(e) => setArrivalDate(e.target.value)}
								/>
							</div>
							<div>
								<label className="label" htmlFor="intake-time">{t`Arrival time`}</label>
								<input
									id="intake-time"
									className="input"
									type="time"
									value={arrivalTime}
									onChange={(e) => setArrivalTime(e.target.value)}
								/>
							</div>
							<div>
								<label className="label" htmlFor="intake-by">{t`Received by`}</label>
								<input id="intake-by" className="input" defaultValue="M. Reyes" />
							</div>
						</div>
					</div>

					{/* STEP 2 */}
					<div className="form-step">
						<div className="step-h">
							<span className="num">2</span>
							<span className="ttl">{t`Line items`}</span>
							<span className="sub">
								{lines.length} {t`products`} · {totalKg.toFixed(1)} kg {t`total`}
							</span>
						</div>

						<div style={{ overflowX: "auto" }}>
							<table className="line-tbl">
								<thead>
									<tr>
										<th style={{ width: "34%" }}>{t`Product`}</th>
										<th style={{ width: 80 }}>{t`Qty`}</th>
										<th style={{ width: 90 }}>{t`Unit`}</th>
										<th style={{ width: 110 }}>{t`Cost / unit`}</th>
										<th style={{ width: 100, textAlign: "right" }}>{t`Line total`}</th>
										<th style={{ width: 130 }}>{t`≈ kg equiv.`}</th>
										<th style={{ width: 120 }}>{t`Shelf life`}</th>
										<th style={{ width: 32 }} />
									</tr>
								</thead>
								<tbody>
									{enriched.map((l) => (
										<tr key={l.id}>
											<td>
												<select
													value={l.productId}
													onChange={(e) => updateLine(l.id, "productId", e.target.value)}
												>
													{products.map((p) => (
														<option key={p.id} value={p.id}>
															{p.name}
														</option>
													))}
												</select>
											</td>
											<td>
												<input
													className="num"
													type="number"
													value={l.qty}
													onChange={(e) => updateLine(l.id, "qty", +e.target.value)}
												/>
											</td>
											<td>
												<select
													value={l.unit}
													onChange={(e) => updateLine(l.id, "unit", e.target.value as IntakeUnit)}
												>
													<option value="kg">kg</option>
													<option value="unit">unit</option>
													<option value="box">box</option>
												</select>
											</td>
											<td>
												<input
													className="num"
													type="number"
													step="0.5"
													value={l.cost}
													onChange={(e) => updateLine(l.id, "cost", +e.target.value)}
												/>
											</td>
											<td
												style={{
													textAlign: "right",
													fontVariantNumeric: "tabular-nums",
													color: "var(--inv-ink-900)",
													fontWeight: 500,
												}}
											>
												{fmtMoney(l.total)}
											</td>
											<td style={{ fontVariantNumeric: "tabular-nums", color: "var(--inv-ink-500)", fontSize: 12.5 }}>
												{l.kgEquiv != null ? `${l.kgEquiv.toFixed(1)} kg` : "—"}
												{l.unit === "box" && l.p.kgPerBox && (
													<div style={{ fontSize: 11, color: "var(--inv-ink-400)" }}>
														{l.p.kgPerBox} kg/box
													</div>
												)}
											</td>
											<td>
												<div
													style={{
														display: "flex",
														alignItems: "center",
														gap: 6,
														fontVariantNumeric: "tabular-nums",
														color: "var(--inv-ink-700)",
														fontSize: 12.5,
													}}
												>
													<Clock size={13} /> {l.p.shelfLife}d
													<span style={{ color: "var(--inv-ink-400)", fontSize: 11 }}>
														· {t`exp`} {fmtDateShort(addDays(TODAY, l.p.shelfLife))}
													</span>
												</div>
											</td>
											<td>
												<button type="button" className="icn-btn" onClick={() => removeLine(l.id)}>
													<X size={12} />
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						<button type="button" className="btn btn-sm" style={{ marginTop: 12 }} onClick={addLine}>
							<Plus size={12} /> {t`Add line`}
						</button>
					</div>

					{/* STEP 3 */}
					<div className="form-step">
						<div className="step-h">
							<span className="num">3</span>
							<span className="ttl">{t`Lot codes`}</span>
							<span className="sub">{t`Auto-generated · override if supplier provided codes`}</span>
						</div>
						<div className="field-grid cols-3">
							{enriched.map((l, i) => {
								const auto = `L-26044-${String(20 + i).padStart(2, "0")}`;
								return (
									<div key={l.id}>
										<label className="label" style={{ display: "flex", justifyContent: "space-between" }}>
											<span>{l.p.name}</span>
											<span style={{ color: "var(--inv-ink-400)", fontWeight: 400 }}>
												{l.qty} {l.unit}
											</span>
										</label>
										<input className="input mono" defaultValue={auto} />
									</div>
								);
							})}
						</div>
					</div>
				</div>

				{/* SUMMARY */}
				<div className="summary">
					<div className="sum-card">
						<h4>{t`Receipt summary`}</h4>
						<div className="sum-row">
							<span>{t`Lines`}</span>
							<span className="v">{lines.length}</span>
						</div>
						<div className="sum-row">
							<span>{t`Units total`}</span>
							<span className="v">{lines.reduce((s, l) => s + l.qty, 0).toLocaleString()}</span>
						</div>
						<div className="sum-row">
							<span>{t`kg equivalent`}</span>
							<span className="v mono">{totalKg.toFixed(1)} kg</span>
						</div>
						<div className="sum-row">
							<span>{t`Subtotal`}</span>
							<span className="v">{fmtMoney(subtotal)}</span>
						</div>
						<div className="sum-row">
							<span>{t`Tax (16%)`}</span>
							<span className="v">{fmtMoney(tax)}</span>
						</div>
						<div className="sum-row tot">
							<span>{t`Total cost`}</span>
							<span className="v">{fmtMoney(grand)}</span>
						</div>

						<div className="sum-tip">
							<Info size={14} />
							<div>
								<div style={{ fontWeight: 600, marginBottom: 2 }}>{t`FIFO will route output`}</div>
								{t`Earliest expiration first. Cilantro (4d) will be picked before Avocado (7d).`}
							</div>
						</div>

						<div style={{ marginTop: 14, padding: "11px", background: "var(--inv-surface)", borderRadius: 8 }}>
							<div style={{ fontSize: 12, fontWeight: 600, color: "var(--inv-ink-900)", marginBottom: 6 }}>
								{t`Cold-chain check`}
							</div>
							<div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--inv-ink-700)" }}>
								<Snowflake size={14} /> {tempCheck} °C — {t`within tolerance`}
								<span style={{ marginLeft: "auto" }} className="chip chip-leaf">
									OK
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
