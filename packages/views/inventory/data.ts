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

export function generateLotCode(arrivedAt: Date, sequenceIndex: number): string {
	const yy = String(arrivedAt.getFullYear()).slice(2);
	const mm = String(arrivedAt.getMonth() + 1).padStart(2, "0");
	const dd = String(arrivedAt.getDate()).padStart(2, "0");
	const seq = String(sequenceIndex).padStart(2, "0");
	const rand = Array.from({ length: 3 }, () =>
		String.fromCharCode(65 + Math.floor(Math.random() * 26)),
	).join("");
	return `L-${yy}${mm}${dd}-${seq}${rand}`;
}
