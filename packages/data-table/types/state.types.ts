/**
 * Search state
 */
export interface SearchState {
	query: string;
	debouncedQuery: string;
	isSearching: boolean;
	results: unknown[];
	highlightedIndex: number;
}
