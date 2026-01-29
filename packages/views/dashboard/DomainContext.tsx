import { createContext, type ReactNode, useContext, useState } from "react";

export type Domain = "All" | "Energy" | "Climate" | "Refrigeration" | "Equipment";

interface DomainContextType {
	activeDomain: Domain;
	setActiveDomain: (domain: Domain) => void;
}

const DomainContext = createContext<DomainContextType | undefined>(undefined);

export function DomainProvider({ children }: { children: ReactNode }) {
	const [activeDomain, setActiveDomain] = useState<Domain>("All");

	return (
		<DomainContext.Provider value={{ activeDomain, setActiveDomain }}>
			{children}
		</DomainContext.Provider>
	);
}

export function useDomain() {
	const context = useContext(DomainContext);
	if (context === undefined) {
		throw new Error("useDomain must be used within a DomainProvider");
	}
	return context;
}
