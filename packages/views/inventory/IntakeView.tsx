import { Check, Clock, Info, Plus, Printer, RefreshCw, Snowflake, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { deleteIntakeShipmentV1, deleteInventoryLotV1, getInventoryLotsV1 } from "~@/api";
import { plural, t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { Button } from "~@/ui";
import { useInventoryViewModel } from "~@/view-model";

import { addDays, fmtDateShort, fmtMoney, generateLotCode } from "./data";

type IntakeUnit = "kg" | "unit" | "box";

type LineItem = {
	id: number;
	productId: string;
	qty: number;
	unit: IntakeUnit;
	cost: number;
	lotSuffix: string;
	shelfDays: number;
	fromReader?: boolean; // lot already exists in DB — skip creation on save
};

function localDateInputValue(d: Date): string {
	const yyyy = d.getFullYear();
	const mm = String(d.getMonth() + 1).padStart(2, "0");
	const dd = String(d.getDate()).padStart(2, "0");
	return `${yyyy}-${mm}-${dd}`;
}

function localTimeInputValue(d: Date): string {
	return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/**
 * Numeric cell input that keeps the raw text while the user edits it, so the field
 * can be cleared (no "050" when typing over a 0). The parsed number is pushed up on
 * every valid change; an empty/invalid value is reported as 0 and fixed up on blur.
 */
function NumericCellInput({
	value,
	onValueChange,
	className,
	step,
	min,
	ariaLabel,
}: {
	value: number;
	onValueChange: (n: number) => void;
	className?: string;
	step?: string;
	min?: string;
	ariaLabel?: string;
}) {
	const [draft, setDraft] = useState<string | null>(null);
	return (
		<input
			className={className}
			type="number"
			inputMode="decimal"
			step={step}
			min={min}
			aria-label={ariaLabel}
			value={draft ?? String(value)}
			onFocus={(e) => {
				setDraft(String(value));
				e.currentTarget.select();
			}}
			onChange={(e) => {
				const raw = e.target.value;
				setDraft(raw);
				const n = Number.parseFloat(raw);
				onValueChange(Number.isFinite(n) ? n : 0);
			}}
			onBlur={() => setDraft(null)}
		/>
	);
}

export const IntakeView = observer(function IntakeView() {
	const navigate = useNavigate();
	const vm = useInventoryViewModel();

	const [poNumber, setPoNumber] = useState(
		() => `PO-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`,
	);
	const [supplier, setSupplier] = useState("");
	const [site, setSite] = useState("");
	const [zone, setZone] = useState("");
	// Use the user's local date/time (toISOString() would give the UTC date)
	const [arrivalDate, setArrivalDate] = useState(() => localDateInputValue(new Date()));
	const [arrivalTime, setArrivalTime] = useState(() => localTimeInputValue(new Date()));
	const [vehicle, setVehicle] = useState("");
	const [tempCheck, setTempCheck] = useState("4");
	const [receivedBy, setReceivedBy] = useState("");
	const [draftIntakeId, setDraftIntakeId] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const firstProduct = vm.products[0];
	const [lines, setLines] = useState<LineItem[]>(() =>
		firstProduct
			? [
					{
						id: 1,
						productId: firstProduct.id,
						qty: 1,
						unit: "kg",
						cost: 0,
						lotSuffix: "",
						shelfDays: firstProduct.shelfLife,
					},
				]
			: [],
	);

	const [lotCodes, setLotCodes] = useState<Record<number, string>>(() =>
		firstProduct ? { 1: generateLotCode(new Date(), 0) } : {},
	);

	// When the page is opened directly, products may arrive after the first render:
	// seed the first line once they are available.
	const seededFirstLine = useRef(lines.length > 0);
	useEffect(() => {
		if (seededFirstLine.current || !firstProduct) return;
		seededFirstLine.current = true;
		setLines((ls) =>
			ls.length > 0
				? ls
				: [
						{
							id: 1,
							productId: firstProduct.id,
							qty: 1,
							unit: "kg",
							cost: 0,
							lotSuffix: "",
							shelfDays: firstProduct.shelfLife,
						},
					],
		);
		setLotCodes((lc) => (lc[1] ? lc : { ...lc, 1: generateLotCode(new Date(), 0) }));
	}, [firstProduct]);

	// Mutable ref so the unmount closure always reads the latest values without stale state
	const cleanupRef = useRef({
		draftIntakeId: null as string | null,
		linesLength: 0,
		isCleaning: false,
	});
	cleanupRef.current.draftIntakeId = draftIntakeId;
	cleanupRef.current.linesLength = lines.length;

	const runCleanup = async (): Promise<void> => {
		const s = cleanupRef.current;
		if (!s.draftIntakeId || s.linesLength > 0 || s.isCleaning) return;
		s.isCleaning = true;
		const id = s.draftIntakeId;
		try {
			const result = await getInventoryLotsV1({ query: { IntakeShipmentId: id, PageSize: 500 } });
			const lots = result.data?.items ?? [];
			// 404 = already gone, treat as success. Any other error aborts before shipment delete.
			await Promise.all(
				lots
					.filter((l) => !!l.lotCode)
					.map((l) =>
						deleteInventoryLotV1({ path: { lotCode: l.lotCode ?? "" } }).catch((err: unknown) => {
							const status = (err as { response?: { status?: number } }).response?.status;
							if (status === 404) return;
							throw err;
						}),
					),
			);
			// Reached only if all lot deletes succeeded (or were 404)
			await deleteIntakeShipmentV1({ path: { id } });
			setDraftIntakeId(null);
		} catch {
			// draftIntakeId intentionally preserved on failure for retry
		} finally {
			s.isCleaning = false;
		}
	};

	// Keep a stable ref so the useEffect unmount closure always calls the latest version
	const runCleanupRef = useRef(runCleanup);
	runCleanupRef.current = runCleanup;

	useEffect(() => {
		return () => {
			void runCleanupRef.current();
		};
	}, []);

	const currentSite = vm.siteById(site);
	const zones = currentSite.zones;

	const updateLine = <K extends keyof LineItem>(id: number, k: K, v: LineItem[K]) =>
		setLines((ls) => ls.map((l) => (l.id === id ? { ...l, [k]: v } : l)));
	const removeLine = (id: number) => {
		setLines((ls) => ls.filter((l) => l.id !== id));
		setLotCodes((lc) => {
			const newLc = { ...lc };
			delete newLc[id];
			return newLc;
		});
	};
	const addLine = () => {
		const p = vm.products[0];
		if (!p) return;
		const newId = Date.now();
		const auto = generateLotCode(new Date(), lines.length);
		setLines((ls) => [
			...ls,
			{
				id: newId,
				productId: p.id,
				qty: 1,
				unit: "kg",
				cost: 0,
				lotSuffix: "",
				shelfDays: p.shelfLife,
			},
		]);
		setLotCodes((lc) => ({ ...lc, [newId]: auto }));
	};

	const enriched = lines.map((l) => {
		const p = vm.productById(l.productId);
		const kgPerBox = p.kgPerBox;
		let kgEquiv: number | null = null;
		if (l.unit === "kg") kgEquiv = l.qty;
		else if (l.unit === "box" && kgPerBox) kgEquiv = l.qty * kgPerBox;
		const total = l.qty * l.cost;
		return { ...l, p, kgEquiv, total };
	});

	// FIFO preview: sort distinct products on this receipt by shelf life (earliest expiration first)
	const fifoOrder = [...new Map(enriched.map((l) => [l.productId, l])).values()].sort(
		(a, b) => a.p.shelfLife - b.p.shelfLife,
	);
	const fifoMessage = (() => {
		if (fifoOrder.length < 2) {
			return t`Earliest expiration first. Lots from this receipt will be picked before newer stock of the same product.`;
		}
		const first = fifoOrder[0];
		const last = fifoOrder[fifoOrder.length - 1];
		if (first.p.shelfLife === last.p.shelfLife) {
			return t`Earliest expiration first. All products on this receipt share the same shelf life (${first.p.shelfLife}d).`;
		}
		const firstName = first.p.name;
		const firstDays = first.p.shelfLife;
		const lastName = last.p.name;
		const lastDays = last.p.shelfLife;
		return t`Earliest expiration first. ${firstName} (${firstDays}d) will be picked before ${lastName} (${lastDays}d).`;
	})();

	const tempValue = Number.parseFloat(tempCheck);
	const tempOk = !Number.isFinite(tempValue) || tempValue <= 6;

	const subtotal = enriched.reduce((s, l) => s + l.total, 0);
	const tax = subtotal * 0.16;
	const grand = subtotal + tax;
	const totalKg = enriched.reduce((s, l) => s + (l.kgEquiv ?? 0), 0);

	const handleRefresh = async () => {
		if (!draftIntakeId) return;
		const result = await getInventoryLotsV1({
			query: { IntakeShipmentId: draftIntakeId, PageSize: 500 },
		});
		const lots = result.data?.items ?? [];
		if (lots.length === 0) return;

		setLotCodes((prevCodes) => {
			const existingCodes = new Set(Object.values(prevCodes));
			const newEntries: Record<number, string> = {};
			const newLines: LineItem[] = [];

			for (const lot of lots) {
				const lotCode = lot.lotCode ?? "";
				if (!lotCode || existingCodes.has(lotCode)) continue;
				const id = Date.now() + newLines.length;
				const product = vm.productById(lot.productId ?? "");
				newLines.push({
					id,
					productId: lot.productId ?? "",
					qty: lot.qty ?? 1,
					unit: (lot.unit ?? "kg") as IntakeUnit,
					cost: lot.costPerUnit ?? 0,
					lotSuffix: "",
					shelfDays: product.shelfLife,
					fromReader: true,
				});
				newEntries[id] = lotCode;
				existingCodes.add(lotCode);
			}

			if (newLines.length > 0) setLines((prev) => [...prev, ...newLines]);
			return { ...prevCodes, ...newEntries };
		});
	};

	const handleAddFromReader = async () => {
		if (draftIntakeId) return;
		if (!site) {
			setError(t`Please select a site`);
			return;
		}
		if (!supplier) {
			setError(t`Please select a supplier`);
			return;
		}
		setError(null);
		try {
			const arrivedAt = new Date(`${arrivalDate}T${arrivalTime}`);
			const result = await vm.createShipmentMutation.mutateAsync({
				body: {
					poReference: poNumber,
					supplierId: supplier,
					siteId: site,
					receivingZone: zone,
					arrivedAt,
					receivedBy: receivedBy || "—",
					status: "draft",
				},
			});
			const id = (result as { id?: string }).id;
			if (id) setDraftIntakeId(id);
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			setError(t`Failed to start reader session: ${message}`);
		}
	};

	const handleSave = async () => {
		setError(null);
		if (!site) {
			setError(t`Please select a site`);
			return;
		}
		if (!supplier) {
			setError(t`Please select a supplier`);
			return;
		}
		if (!receivedBy) {
			setError(t`Please enter who received the goods`);
			return;
		}
		if (lines.length === 0) {
			setError(t`Add at least one line item`);
			return;
		}
		if (lines.some((l) => !Number.isFinite(l.qty) || l.qty <= 0)) {
			setError(t`All line items must have a quantity greater than 0`);
			return;
		}
		if (lines.some((l) => !Number.isFinite(l.cost) || l.cost < 0)) {
			setError(t`Cost per unit cannot be negative`);
			return;
		}
		setSaving(true);
		try {
			const arrivedAt = new Date(`${arrivalDate}T${arrivalTime}`);
			const shipmentBody = {
				poReference: poNumber,
				supplierId: supplier,
				vehicle: vehicle || undefined,
				siteId: site,
				receivingZone: zone,
				coldChainTempC: tempCheck ? Number(tempCheck) : undefined,
				arrivedAt,
				receivedBy,
				status: "received",
			};
			let shipmentId: string;
			if (draftIntakeId) {
				await vm.updateShipmentMutation.mutateAsync({
					path: { id: draftIntakeId },
					body: shipmentBody,
				});
				shipmentId = draftIntakeId;
			} else {
				const shipment = await vm.createShipmentMutation.mutateAsync({ body: shipmentBody });
				shipmentId = (shipment as { id?: string }).id ?? "";
				if (!shipmentId) {
					setError(t`Failed to create shipment: no ID in response`);
					return;
				}
			}
			await Promise.all(
				lines.map((l) =>
					vm.createLineMutation.mutateAsync({
						body: {
							shipmentId,
							productId: l.productId,
							qty: l.qty,
							unit: l.unit,
							costPerUnit: l.cost,
						},
					}),
				),
			);

			// Create lot records for each line — skip reader-sourced lines (already exist in DB)
			for (let i = 0; i < lines.length; i++) {
				const l = lines[i];
				if (l.fromReader) continue;
				const product = vm.productById(l.productId);
				const lotCode = lotCodes[l.id] || generateLotCode(arrivedAt, i);
				const expiresAt = addDays(arrivedAt, product.shelfLife);

				try {
					await vm.createLotMutation.mutateAsync({
						body: {
							lotCode,
							productId: l.productId,
							qty: l.qty,
							unit: l.unit,
							entryAt: arrivedAt,
							expiresAt,
							siteId: site,
							zone,
							supplierId: supplier,
							costPerUnit: l.cost,
						},
					});
				} catch (err) {
					const message = err instanceof Error ? err.message : String(err);
					setError(
						t`Lot creation failed for line ${i + 1} (${product.name}): ${message}. Shipment saved but inventory not updated.`,
					);
					setSaving(false);
					return;
				}
			}

			// Create movement records for each line
			const tempNote = tempCheck ? ` · Temp: ${tempCheck}°C` : "";
			for (let i = 0; i < lines.length; i++) {
				const l = lines[i];
				const lotCode = lotCodes[l.id] || generateLotCode(arrivedAt, i);

				try {
					await vm.createMovementMutation.mutateAsync({
						body: {
							type: "intake",
							occurredAt: arrivedAt,
							productId: l.productId,
							qty: l.qty,
							unit: l.unit,
							lotCode,
							siteId: site,
							performedBy: receivedBy,
							note: `Intake shipment ${poNumber}${tempNote}`,
						},
					});
				} catch (err) {
					const message = err instanceof Error ? err.message : String(err);
					setError(
						t`Movement recording failed: ${message}. Shipment & lots created but audit trail incomplete.`,
					);
					// Continue anyway since lots are created
				}
			}

			await vm.refresh();
			const lotsCreated = lines.filter((l) => !l.fromReader).length;
			toast.success(t`Intake ${poNumber} saved`, {
				description: plural(lotsCreated, {
					one: "# lot created",
					other: "# lots created",
				}),
			});
			navigate("/inventory");
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			setError(t`Failed to save intake: ${message}`);
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-start gap-4">
				<div>
					<h1 className="text-xl font-semibold tracking-tight text-foreground">
						{t`Receive intake`} · {poNumber}
					</h1>
					<p className="text-sm text-muted-foreground mt-1">{t`Lots are created on save · stock increases at the selected zone`}</p>
					{error && (
						<div style={{ color: "var(--danger-foreground)", fontSize: 13, marginTop: 8 }}>
							{error}
						</div>
					)}
					{draftIntakeId && (
						<div className="flex items-center gap-2 mt-2 px-3 py-2 bg-info-subtle border border-info-border rounded text-xs text-info-foreground">
							<Info size={13} className="flex-shrink-0" />
							<span>
								{t`Reader session active`} · {t`Draft`}{" "}
								<span className="font-mono font-semibold">{draftIntakeId}</span>
							</span>
						</div>
					)}
				</div>
				<div className="ml-auto flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => void runCleanup().finally(() => navigate("/inventory"))}
					>
						{t`Cancel`}
					</Button>
					<Button variant="outline" size="sm">
						<Printer size={14} /> {t`Print receipt`}
					</Button>
					<Button
						size="sm"
						disabled={saving || lines.length === 0}
						onClick={() => void handleSave()}
					>
						<Check size={14} />{" "}
						{saving
							? t`Saving…`
							: plural(lines.length, {
									one: "Save · create # lot",
									other: "Save · create # lots",
								})}
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-max">
				<div className="lg:col-span-2 space-y-0 min-w-0">
					<div className="bg-card border border-border rounded-lg overflow-hidden">
						{/* STEP 1 */}
						<div className="border-b border-border p-5">
							<div className="flex items-center gap-3 mb-4">
								<div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
									1
								</div>
								<div>
									<div className="text-sm font-semibold text-foreground">{t`Shipment details`}</div>
									<div className="text-xs text-muted-foreground">{t`Where and when the goods arrived`}</div>
								</div>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
								<div>
									<label
										className="block text-xs font-medium text-foreground/85 mb-1.5"
										htmlFor="intake-supplier"
									>{t`Supplier`}</label>
									<select
										id="intake-supplier"
										className="h-8 px-3 rounded border border-input bg-card text-foreground text-sm w-full outline-none focus:border-ring"
										value={supplier}
										onChange={(e) => setSupplier(e.target.value)}
									>
										<option value="">{t`Select supplier…`}</option>
										{vm.suppliers.map((s) => (
											<option key={s.id} value={s.id}>
												{s.name}
											</option>
										))}
									</select>
								</div>
								<div>
									<label
										className="block text-xs font-medium text-foreground/85 mb-1.5"
										htmlFor="intake-po"
									>{t`PO / Reference`}</label>
									<input
										id="intake-po"
										className="h-8 px-3 rounded border border-input bg-card text-foreground text-sm w-full outline-none focus:border-ring"
										value={poNumber}
										onChange={(e) => setPoNumber(e.target.value)}
									/>
								</div>
								<div>
									<label
										className="block text-xs font-medium text-foreground/85 mb-1.5"
										htmlFor="intake-vehicle"
									>{t`Vehicle / Driver`}</label>
									<input
										id="intake-vehicle"
										className="h-8 px-3 rounded border border-input bg-card text-foreground text-sm w-full outline-none focus:border-ring"
										value={vehicle}
										onChange={(e) => setVehicle(e.target.value)}
									/>
								</div>
								<div>
									<label
										className="block text-xs font-medium text-foreground/85 mb-1.5"
										htmlFor="intake-site"
									>{t`Site`}</label>
									<select
										id="intake-site"
										className="h-8 px-3 rounded border border-input bg-card text-foreground text-sm w-full outline-none focus:border-ring"
										value={site}
										onChange={(e) => {
											setSite(e.target.value);
											const s = vm.siteById(e.target.value);
											setZone(s.zones[0] ?? "");
										}}
									>
										<option value="">{t`Select site…`}</option>
										{vm.sites.map((s) => (
											<option key={s.id} value={s.id}>
												{s.name}
											</option>
										))}
									</select>
								</div>
								<div>
									<label
										className="block text-xs font-medium text-foreground/85 mb-1.5"
										htmlFor="intake-zone"
									>{t`Receiving zone`}</label>
									<select
										id="intake-zone"
										className="h-8 px-3 rounded border border-input bg-card text-foreground text-sm w-full outline-none focus:border-ring"
										value={zone}
										onChange={(e) => setZone(e.target.value)}
									>
										<option value="">{t`Select zone…`}</option>
										{zones.map((z) => (
											<option key={z}>{z}</option>
										))}
									</select>
								</div>
								<div>
									<label
										className="block text-xs font-medium text-foreground/85 mb-1.5"
										htmlFor="intake-temp"
									>{t`Cold-chain temp °C`}</label>
									<input
										id="intake-temp"
										className="h-8 px-3 rounded border border-input bg-card text-foreground text-sm w-full outline-none focus:border-ring"
										type="number"
										step="0.1"
										value={tempCheck}
										onChange={(e) => setTempCheck(e.target.value)}
									/>
									<div className="text-xs text-muted-foreground mt-0.5">{t`Target ≤ 6 °C for refrigerated lots`}</div>
								</div>
								<div>
									<label
										className="block text-xs font-medium text-foreground/85 mb-1.5"
										htmlFor="intake-date"
									>{t`Arrival date`}</label>
									<input
										id="intake-date"
										className="h-8 px-3 rounded border border-input bg-card text-foreground text-sm w-full outline-none focus:border-ring"
										type="date"
										value={arrivalDate}
										onChange={(e) => setArrivalDate(e.target.value)}
									/>
								</div>
								<div>
									<label
										className="block text-xs font-medium text-foreground/85 mb-1.5"
										htmlFor="intake-time"
									>{t`Arrival time`}</label>
									<input
										id="intake-time"
										className="h-8 px-3 rounded border border-input bg-card text-foreground text-sm w-full outline-none focus:border-ring"
										type="time"
										value={arrivalTime}
										onChange={(e) => setArrivalTime(e.target.value)}
									/>
								</div>
								<div>
									<label
										className="block text-xs font-medium text-foreground/85 mb-1.5"
										htmlFor="intake-by"
									>{t`Received by`}</label>
									<input
										id="intake-by"
										className="h-8 px-3 rounded border border-input bg-card text-foreground text-sm w-full outline-none focus:border-ring"
										value={receivedBy}
										onChange={(e) => setReceivedBy(e.target.value)}
									/>
								</div>
							</div>
						</div>

						{/* STEP 2 */}
						<div className="border-b border-border p-5">
							<div className="flex items-center gap-3 mb-4">
								<div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
									2
								</div>
								<div>
									<div className="text-sm font-semibold text-foreground">{t`Line items`}</div>
									<div className="text-xs text-muted-foreground">
										{plural(lines.length, { one: "# product", other: "# products" })} ·{" "}
										{totalKg.toFixed(1)} kg {t`total`}
									</div>
								</div>
							</div>

							<div className="overflow-x-auto">
								<table className="w-full border-collapse text-xs">
									<thead>
										<tr>
											<th className="text-left px-3 py-2 font-semibold uppercase tracking-wide text-muted-foreground border-b border-border">{t`Product`}</th>
											<th className="text-left px-3 py-2 font-semibold uppercase tracking-wide text-muted-foreground border-b border-border w-16">{t`Qty`}</th>
											<th className="text-left px-3 py-2 font-semibold uppercase tracking-wide text-muted-foreground border-b border-border w-20">{t`Unit`}</th>
											<th className="text-left px-3 py-2 font-semibold uppercase tracking-wide text-muted-foreground border-b border-border w-28">{t`Cost / unit`}</th>
											<th className="text-right px-3 py-2 font-semibold uppercase tracking-wide text-muted-foreground border-b border-border w-24">{t`Line total`}</th>
											<th className="text-left px-3 py-2 font-semibold uppercase tracking-wide text-muted-foreground border-b border-border w-28">{t`≈ kg equiv.`}</th>
											<th className="text-left px-3 py-2 font-semibold uppercase tracking-wide text-muted-foreground border-b border-border w-28">{t`Shelf life`}</th>
											<th className="w-8" />
										</tr>
									</thead>
									<tbody>
										{enriched.map((l) => (
											<tr key={l.id} className="border-b border-border">
												<td className="px-3 py-2">
													<select
														className="h-6 px-2 rounded border border-input bg-card text-foreground text-xs w-full outline-none focus:border-ring"
														value={l.productId}
														onChange={(e) => {
															const p = vm.productById(e.target.value);
															updateLine(l.id, "productId", e.target.value);
															updateLine(l.id, "shelfDays", p.shelfLife);
														}}
													>
														{vm.products.map((p) => (
															<option key={p.id} value={p.id}>
																{p.name}
															</option>
														))}
													</select>
												</td>
												<td className="px-3 py-2">
													<NumericCellInput
														className="h-6 px-2 rounded border border-input bg-card text-foreground text-xs w-full text-right outline-none focus:border-ring font-mono"
														min="0"
														ariaLabel={t`Qty`}
														value={l.qty}
														onValueChange={(n) => updateLine(l.id, "qty", n)}
													/>
												</td>
												<td className="px-3 py-2">
													<select
														className="h-6 px-2 rounded border border-input bg-card text-foreground text-xs w-full outline-none focus:border-ring"
														value={l.unit}
														onChange={(e) => updateLine(l.id, "unit", e.target.value as IntakeUnit)}
													>
														<option value="kg">kg</option>
														<option value="unit">unit</option>
														<option value="box">box</option>
													</select>
												</td>
												<td className="px-3 py-2">
													<NumericCellInput
														className="h-6 px-2 rounded border border-input bg-card text-foreground text-xs w-full text-right outline-none focus:border-ring font-mono"
														step="0.5"
														min="0"
														ariaLabel={t`Cost / unit`}
														value={l.cost}
														onValueChange={(n) => updateLine(l.id, "cost", n)}
													/>
												</td>
												<td className="px-3 py-2 text-right text-foreground font-mono font-medium">
													{fmtMoney(l.total)}
												</td>
												<td className="px-3 py-2 text-muted-foreground font-mono">
													{l.kgEquiv != null ? `${l.kgEquiv.toFixed(1)} kg` : "—"}
													{l.unit === "box" && l.p.kgPerBox && (
														<div className="text-xs text-muted-foreground">
															{l.p.kgPerBox} kg/box
														</div>
													)}
												</td>
												<td className="px-3 py-2">
													<div className="flex items-center gap-1 text-foreground/85 font-mono">
														<Clock size={12} /> {l.p.shelfLife}d
														<span className="text-muted-foreground text-xs">
															· {t`exp`} {fmtDateShort(addDays(new Date(), l.p.shelfLife))}
														</span>
													</div>
												</td>
												<td className="px-3 py-2">
													<button
														type="button"
														className="p-1 hover:bg-muted rounded"
														onClick={() => removeLine(l.id)}
													>
														<X size={12} />
													</button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>

							<div className="pt-4 flex items-center gap-2">
								<Button type="button" size="sm" variant="outline" onClick={addLine}>
									<Plus size={12} /> {t`Add line`}
								</Button>
								<Button
									type="button"
									size="sm"
									variant="outline"
									disabled={!!draftIntakeId}
									onClick={() => void handleAddFromReader()}
								>
									<Plus size={12} /> {t`Add From Reader`}
								</Button>
								{draftIntakeId && (
									<Button
										type="button"
										size="sm"
										variant="outline"
										onClick={() => void handleRefresh()}
									>
										<RefreshCw size={12} /> {t`Refresh`}
									</Button>
								)}
							</div>
						</div>

						{/* STEP 3 */}
						<div className="border-b border-border p-5">
							<div className="flex items-center gap-3 mb-4">
								<div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
									3
								</div>
								<div>
									<div className="text-sm font-semibold text-foreground">{t`Lot codes`}</div>
									<div className="text-xs text-muted-foreground">{t`Auto-generated · override if supplier provided codes`}</div>
								</div>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
								{enriched.map((l) => {
									return (
										<div key={l.id}>
											<label className="block text-xs font-medium text-foreground/85 mb-1.5 flex justify-between">
												<span>{l.p.name}</span>
												<span className="text-muted-foreground font-normal">
													{l.qty} {l.unit}
												</span>
											</label>
											<input
												className="h-8 px-3 rounded border border-input bg-card text-foreground text-sm w-full font-mono outline-none focus:border-ring"
												value={lotCodes[l.id] || ""}
												onChange={(e) => setLotCodes((lc) => ({ ...lc, [l.id]: e.target.value }))}
											/>
										</div>
									);
								})}
							</div>
						</div>
					</div>
				</div>

				{/* SUMMARY */}
				<div className="sticky top-0">
					<div className="bg-card border border-border rounded-lg p-5 space-y-4">
						<h3 className="text-sm font-semibold text-foreground">{t`Receipt summary`}</h3>

						<div className="space-y-2 text-sm">
							<div className="flex justify-between">
								<span className="text-muted-foreground">{t`Lines`}</span>
								<span className="font-medium text-foreground">{lines.length}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">{t`Units total`}</span>
								<span className="font-medium text-foreground">
									{lines.reduce((s, l) => s + l.qty, 0).toLocaleString()}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">{t`kg equivalent`}</span>
								<span className="font-medium text-foreground font-mono">
									{totalKg.toFixed(1)} kg
								</span>
							</div>
						</div>

						<div className="border-t border-border pt-3 space-y-2 text-sm">
							<div className="flex justify-between">
								<span className="text-muted-foreground">{t`Subtotal`}</span>
								<span className="text-foreground">{fmtMoney(subtotal)}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">{t`Tax (16%)`}</span>
								<span className="text-foreground">{fmtMoney(tax)}</span>
							</div>
							<div className="flex justify-between border-t border-border pt-2">
								<span className="font-semibold text-foreground">{t`Total cost`}</span>
								<span className="font-semibold text-primary text-base">{fmtMoney(grand)}</span>
							</div>
						</div>

						<div className="bg-success-subtle border border-success-border rounded-lg p-3">
							<div className="flex items-start gap-2.5">
								<Info size={14} className="text-success-foreground flex-shrink-0 mt-0.5" />
								<div className="text-xs">
									<div className="font-semibold text-success-foreground mb-0.5">{t`FIFO will route output`}</div>
									<div className="text-success-foreground">{fifoMessage}</div>
								</div>
							</div>
						</div>

						<div className="bg-surface-muted rounded-lg p-3">
							<div className="text-xs font-semibold text-foreground mb-2">{t`Cold-chain check`}</div>
							<div className="flex items-center justify-between gap-2">
								<div className="flex items-center gap-2 text-xs text-foreground/85">
									<Snowflake size={13} /> {tempCheck || "—"} °C —{" "}
									{tempOk ? t`within tolerance` : t`above 6 °C target`}
								</div>
								<span
									className={
										tempOk
											? "px-2 py-1 bg-success/15 text-success-foreground rounded-full text-xs font-medium"
											: "px-2 py-1 bg-warning/15 text-warning-foreground rounded-full text-xs font-medium"
									}
								>
									{tempOk ? t`OK` : t`Check`}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
});
