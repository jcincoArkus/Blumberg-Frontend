export type Category = { id: string; name: string; color: string };

export type Product = {
	id: string;
	sku: string;
	name: string;
	cat: string;
	unit: "kg" | "unit" | "box";
	kgPerBox: number | null;
	shelfLife: number;
	price: number;
};

export type Site = { id: string; name: string; zones: string[] };

export type Lot = {
	id: string;
	productId: string;
	qty: number;
	unit: "kg" | "unit";
	entry: Date;
	exp: Date;
	siteId: string;
	zone: string;
	supplier: string;
	costPerUnit: number;
};

export type MovementType = "intake" | "output" | "waste" | "adjustment" | "transfer";

export type Movement = {
	id: string;
	type: MovementType;
	at: Date;
	productId: string;
	qty: number;
	unit: "kg" | "unit";
	lotId: string;
	siteId: string;
	by: string;
	note: string;
};

export type ExpTone = "expired" | "critical" | "soon" | "ok";
export type ExpStatus = { tone: ExpTone; label: string; days: number };

export const TODAY = new Date("2026-04-29T10:30:00");

export const categories: Category[] = [
	{ id: "fruit", name: "Fruit", color: "#dcf4ed" },
	{ id: "veg", name: "Vegetables", color: "#e8eef3" },
	{ id: "citrus", name: "Citrus", color: "#fbf4c7" },
	{ id: "leafy", name: "Leafy Greens", color: "#dcf4ed" },
	{ id: "herbs", name: "Herbs", color: "#eaf6f3" },
];

export const products: Product[] = [
	{ id: "p-hass", sku: "AVO-HAS", name: "Avocado · Hass", cat: "fruit", unit: "kg", kgPerBox: 4.5, shelfLife: 7, price: 38.0 },
	{ id: "p-tom-rom", sku: "TOM-ROM", name: "Tomato · Roma", cat: "veg", unit: "kg", kgPerBox: 9.0, shelfLife: 10, price: 18.5 },
	{ id: "p-tom-saladette", sku: "TOM-SAL", name: "Tomato · Saladette", cat: "veg", unit: "kg", kgPerBox: 9.0, shelfLife: 9, price: 16.0 },
	{ id: "p-lime", sku: "LIM-MEX", name: "Lime · Mexicano", cat: "citrus", unit: "kg", kgPerBox: 10.0, shelfLife: 14, price: 22.0 },
	{ id: "p-lemon", sku: "LEM-AMA", name: "Lemon · Amarillo", cat: "citrus", unit: "kg", kgPerBox: 10.0, shelfLife: 18, price: 28.0 },
	{ id: "p-orange", sku: "ORA-VAL", name: "Orange · Valencia", cat: "citrus", unit: "kg", kgPerBox: 18.0, shelfLife: 21, price: 14.5 },
	{ id: "p-roma-let", sku: "LET-ROM", name: "Lettuce · Romaine", cat: "leafy", unit: "unit", kgPerBox: null, shelfLife: 6, price: 12.0 },
	{ id: "p-spinach", sku: "SPI-BAB", name: "Spinach · Baby", cat: "leafy", unit: "kg", kgPerBox: 2.5, shelfLife: 5, price: 42.0 },
	{ id: "p-cilantro", sku: "HRB-CIL", name: "Cilantro", cat: "herbs", unit: "unit", kgPerBox: null, shelfLife: 4, price: 6.5 },
	{ id: "p-mint", sku: "HRB-HBA", name: "Hierbabuena (Mint)", cat: "herbs", unit: "unit", kgPerBox: null, shelfLife: 4, price: 7.0 },
	{ id: "p-jala", sku: "CHL-JAL", name: "Chile · Jalapeño", cat: "veg", unit: "kg", kgPerBox: 8.0, shelfLife: 12, price: 24.0 },
	{ id: "p-sera", sku: "CHL-SER", name: "Chile · Serrano", cat: "veg", unit: "kg", kgPerBox: 8.0, shelfLife: 12, price: 26.0 },
	{ id: "p-mango", sku: "MNG-ATA", name: "Mango · Ataulfo", cat: "fruit", unit: "kg", kgPerBox: 6.0, shelfLife: 8, price: 32.0 },
	{ id: "p-papaya", sku: "PAP-MAR", name: "Papaya · Maradol", cat: "fruit", unit: "kg", kgPerBox: 9.0, shelfLife: 7, price: 19.5 },
];

export const sites: Site[] = [
	{ id: "cdmx", name: "CDMX · Iztapalapa", zones: ["Cold Room A", "Cold Room B", "Dry Bay 1", "Dock 3"] },
	{ id: "gdl", name: "Guadalajara · Zapopan", zones: ["Cold Room 1", "Cold Room 2", "Bay 4"] },
	{ id: "mty", name: "Monterrey · Apodaca", zones: ["Refrig. 1", "Refrig. 2", "Dock 2"] },
];

export function addDays(date: Date, days: number): Date {
	const d = new Date(date);
	d.setDate(d.getDate() + days);
	return d;
}

export function fmtDate(d: Date | string): string {
	const date = d instanceof Date ? d : new Date(d);
	return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

export function fmtDateShort(d: Date | string): string {
	const date = d instanceof Date ? d : new Date(d);
	return date.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

export function fmtTime(d: Date | string): string {
	const date = d instanceof Date ? d : new Date(d);
	return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function fmtMoney(n: number): string {
	return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function daysUntil(date: Date | string): number {
	const d = date instanceof Date ? date : new Date(date);
	const ms = d.getTime() - TODAY.getTime();
	return Math.round(ms / 86_400_000);
}

function lot(
	id: string,
	productId: string,
	qty: number,
	unit: "kg" | "unit",
	daysAgo: number,
	shelfLife: number,
	siteId: string,
	zone: string,
	supplier: string,
	costPerUnit: number,
): Lot {
	const entry = addDays(TODAY, -daysAgo);
	const exp = addDays(entry, shelfLife);
	return { id, productId, qty, unit, entry, exp, siteId, zone, supplier, costPerUnit };
}

export const lots: Lot[] = [
	lot("L-26044-01", "p-hass", 185, "kg", 2, 7, "cdmx", "Cold Room A", "Distrib. Michoacán", 28.0),
	lot("L-26044-02", "p-hass", 62, "kg", 5, 7, "cdmx", "Cold Room A", "Distrib. Michoacán", 27.5),
	lot("L-26043-08", "p-tom-rom", 340, "kg", 3, 10, "cdmx", "Cold Room B", "Hortícola del Bajío", 12.0),
	lot("L-26043-09", "p-tom-saladette", 220, "kg", 1, 9, "cdmx", "Cold Room B", "Hortícola del Bajío", 11.5),
	lot("L-26041-15", "p-lime", 480, "kg", 6, 14, "cdmx", "Cold Room A", "Citrícola Veracruz", 14.0),
	lot("L-26042-02", "p-lemon", 140, "kg", 4, 18, "gdl", "Cold Room 1", "Citrícola Veracruz", 20.0),
	lot("L-26041-22", "p-orange", 720, "kg", 8, 21, "gdl", "Cold Room 2", "Citrícola Veracruz", 9.5),
	lot("L-26044-09", "p-roma-let", 96, "unit", 1, 6, "cdmx", "Cold Room B", "Verduras del Norte", 7.0),
	lot("L-26043-12", "p-roma-let", 48, "unit", 4, 6, "mty", "Refrig. 1", "Verduras del Norte", 7.0),
	lot("L-26044-04", "p-spinach", 38, "kg", 2, 5, "cdmx", "Cold Room B", "Hortícola del Bajío", 28.0),
	lot("L-26043-21", "p-cilantro", 220, "unit", 3, 4, "cdmx", "Dry Bay 1", "Mercado Central", 3.5),
	lot("L-26043-22", "p-mint", 140, "unit", 3, 4, "cdmx", "Dry Bay 1", "Mercado Central", 4.0),
	lot("L-26044-11", "p-jala", 85, "kg", 2, 12, "cdmx", "Cold Room A", "Hortícola del Bajío", 16.0),
	lot("L-26044-12", "p-sera", 52, "kg", 2, 12, "cdmx", "Cold Room A", "Hortícola del Bajío", 18.0),
	lot("L-26043-30", "p-mango", 175, "kg", 4, 8, "gdl", "Cold Room 1", "Frutas Pacífico", 22.0),
	lot("L-26043-31", "p-papaya", 96, "kg", 3, 7, "gdl", "Cold Room 1", "Frutas Pacífico", 13.0),
	lot("L-26044-15", "p-tom-rom", 120, "kg", 1, 10, "mty", "Refrig. 2", "Hortícola del Bajío", 12.5),
	lot("L-26043-40", "p-orange", 240, "kg", 12, 21, "mty", "Refrig. 2", "Citrícola Veracruz", 9.5),
];

function mv(
	id: string,
	type: MovementType,
	daysAgo: number,
	hour: number,
	productId: string,
	qty: number,
	unit: "kg" | "unit",
	lotId: string,
	siteId: string,
	by: string,
	note: string,
): Movement {
	const at = new Date(TODAY);
	at.setDate(at.getDate() - daysAgo);
	at.setHours(hour, (id.charCodeAt(2) * 7) % 60, 0, 0);
	return { id, type, at, productId, qty, unit, lotId, siteId, by, note };
}

export const movements: Movement[] = [
	mv("M-2641", "intake", 0, 9, "p-hass", 185, "kg", "L-26044-01", "cdmx", "M. Reyes", "PO-2284 · Distrib. Michoacán"),
	mv("M-2640", "intake", 0, 8, "p-jala", 85, "kg", "L-26044-11", "cdmx", "M. Reyes", "PO-2283"),
	mv("M-2639", "output", 0, 11, "p-lime", 40, "kg", "L-26041-15", "cdmx", "A. López", "SO-9912 · Restaurante Los Pinos"),
	mv("M-2638", "output", 0, 11, "p-tom-rom", 60, "kg", "L-26043-08", "cdmx", "A. López", "SO-9912"),
	mv("M-2637", "waste", 0, 10, "p-spinach", 4, "kg", "L-26044-04", "cdmx", "J. Núñez", "Wilted leaves, top of crate"),
	mv("M-2636", "transfer", 0, 8, "p-orange", 120, "kg", "L-26041-22", "gdl", "C. Vega", "GDL → MTY restock"),
	mv("M-2635", "output", 1, 16, "p-cilantro", 60, "unit", "L-26043-21", "cdmx", "A. López", "SO-9909"),
	mv("M-2634", "adjustment", 1, 14, "p-tom-saladette", -3, "kg", "L-26043-09", "cdmx", "J. Núñez", "Cycle count · variance"),
	mv("M-2633", "intake", 1, 9, "p-tom-saladette", 220, "kg", "L-26043-09", "cdmx", "M. Reyes", "PO-2280"),
	mv("M-2632", "waste", 1, 10, "p-papaya", 8, "kg", "L-26043-31", "gdl", "R. Santana", "Bruising on 4 fruit"),
	mv("M-2631", "output", 2, 15, "p-mango", 35, "kg", "L-26043-30", "gdl", "C. Vega", "SO-9905"),
	mv("M-2630", "intake", 2, 8, "p-hass", 62, "kg", "L-26044-02", "cdmx", "M. Reyes", "PO-2278"),
	mv("M-2629", "intake", 3, 9, "p-cilantro", 220, "unit", "L-26043-21", "cdmx", "M. Reyes", "PO-2275"),
	mv("M-2628", "intake", 3, 9, "p-mint", 140, "unit", "L-26043-22", "cdmx", "M. Reyes", "PO-2275"),
	mv("M-2627", "transfer", 4, 11, "p-roma-let", 48, "unit", "L-26043-12", "mty", "C. Vega", "CDMX → MTY"),
	mv("M-2626", "output", 5, 14, "p-lemon", 22, "kg", "L-26042-02", "gdl", "R. Santana", "SO-9898"),
];

export function productById(id: string): Product {
	const p = products.find((x) => x.id === id);
	if (!p) throw new Error(`Product not found: ${id}`);
	return p;
}

export function categoryById(id: string): Category {
	const c = categories.find((x) => x.id === id);
	if (!c) throw new Error(`Category not found: ${id}`);
	return c;
}

export function siteById(id: string): Site {
	const s = sites.find((x) => x.id === id);
	if (!s) throw new Error(`Site not found: ${id}`);
	return s;
}

export function expStatus(exp: Date | string): ExpStatus {
	const d = daysUntil(exp);
	if (d < 0) return { tone: "expired", label: `${Math.abs(d)}d past`, days: d };
	if (d <= 2) return { tone: "critical", label: `${d}d left`, days: d };
	if (d <= 5) return { tone: "soon", label: `${d}d left`, days: d };
	return { tone: "ok", label: `${d}d left`, days: d };
}
