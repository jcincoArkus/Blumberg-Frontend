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
	const ms = d.getTime() - Date.now();
	return Math.round(ms / 86_400_000);
}

export function expStatus(exp: Date | string): ExpStatus {
	const d = daysUntil(exp);
	if (d < 0) return { tone: "expired", label: `${Math.abs(d)}d past`, days: d };
	if (d <= 2) return { tone: "critical", label: `${d}d left`, days: d };
	if (d <= 5) return { tone: "soon", label: `${d}d left`, days: d };
	return { tone: "ok", label: `${d}d left`, days: d };
}
