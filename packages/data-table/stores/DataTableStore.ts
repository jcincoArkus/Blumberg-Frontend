import type { ColumnDef } from "@tanstack/react-table";
import {
	action,
	computed,
	type IReactionDisposer,
	makeObservable,
	observable,
	reaction,
	runInAction,
} from "mobx";
import { Subject } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";

import { DEFAULT_CONFIG } from "../constants/defaults";
import type {
	ActiveFilter,
	DataItem,
	DataTableConfig,
	ErrorInfo,
	IDataTableController,
	PaginationState,
	SearchState,
	SelectionState,
	SortingStateArray,
	StandardQuery,
} from "../types";

/**
 * Enhanced MobX store for DataTable with proper reactivity
 */
export class DataTableStore<TData extends DataItem = DataItem> {
	// Core references
	readonly controller: IDataTableController<TData>;
	readonly columns: ColumnDef<TData, unknown>[];
	readonly config: DataTableConfig;

	// UI State
	public _pagination: PaginationState = { pageIndex: 0, pageSize: 10 }; // Always use 0-based internally
	public _selection: SelectionState = {
		selectedRows: new Set(),
		isAllSelected: false,
		isPartiallySelected: false,
		selectedCount: 0,
	};
	public _sorting: SortingStateArray = [];
	public _filters: ActiveFilter[] = [];
	public _search: SearchState = {
		query: "",
		debouncedQuery: "",
		isSearching: false,
		results: [],
		highlightedIndex: -1,
	};

	// Search subject for RxJS debouncing
	private _searchSubject = new Subject<string>();
	private _searchSubscription: ReturnType<typeof this._searchSubject.subscribe> | null = null;

	// Disposers for cleanup
	private _disposers: IReactionDisposer[] = [];
	private _isDisposed = false;

	constructor(
		controller: IDataTableController<TData>,
		columns: ColumnDef<TData, unknown>[] | readonly ColumnDef<TData, unknown>[],
		config: Partial<DataTableConfig> = {},
	) {
		makeObservable(this, {
			// Observable properties (only UI state, not controller data)
			_pagination: observable,
			_selection: observable,
			_sorting: observable,
			_filters: observable,
			_search: observable,

			// Computed getters (delegate to controller for data, keep UI state)
			data: computed,
			total: computed,
			isLoading: computed,
			isRefreshing: computed,
			isFetching: computed,
			isError: computed,
			error: computed,
			pagination: computed,
			selection: computed,
			sorting: computed,
			filters: computed,
			search: computed,

			// Actions
			setPagination: action,
			setSelection: action,
			setSorting: action,
			setFilters: action,
			setSearchQuery: action,
			reset: action,
		});

		this.controller = controller;
		this.columns = [...columns];
		this.config = {
			tableId: controller.tableId,
			...controller.config,
			...config,
		};

		// Initialize pagination from config
		this._pagination.pageSize = this.config.defaultPageSize || 20;
		// Always start at page 0 internally (will be converted for API if needed)
		this._pagination.pageIndex = 0;

		// Set up search debouncing
		this.setupSearchDebounce();
		// Set up reactions for automatic data loading
		this.setupReactions();
		// Load initial data
		this.loadInitialData();
	}

	get data(): TData[] {
		return this.controller.data;
	}

	get total(): number {
		return Number(this.controller.total);
	}

	get isLoading(): boolean {
		return this.controller.isLoading;
	}

	get isRefreshing(): boolean {
		return this.controller.isFetching;
	}

	get isFetching(): boolean {
		return this.controller.isFetching;
	}

	get isError(): boolean {
		return this.controller.isError;
	}

	get error(): ErrorInfo | null {
		return this.controller.error;
	}

	get pagination(): PaginationState {
		return this._pagination;
	}

	get selection(): SelectionState {
		return this._selection;
	}

	get sorting(): SortingStateArray {
		return this._sorting;
	}

	get filters(): ActiveFilter[] {
		return this._filters;
	}

	get search(): SearchState {
		return this._search;
	}

	setPagination(pagination: Partial<PaginationState>): void {
		runInAction(() => {
			this._pagination = { ...this._pagination, ...pagination };
		});
	}

	setSelection(selection: Partial<SelectionState>): void {
		runInAction(() => {
			this._selection = { ...this._selection, ...selection };
		});
	}

	setSorting(sorting: SortingStateArray): void {
		runInAction(() => {
			this._sorting = [...sorting];
		});
	}

	setFilters(filters: ActiveFilter[]): void {
		runInAction(() => {
			this._filters = [...filters];
		});
	}

	setSearchQuery(query: string): void {
		runInAction(() => {
			this._search.query = query;
		});
		// Emit to subject for debouncing
		this._searchSubject.next(query);
	}

	buildQuery(): StandardQuery {
		// Use config paginationBase if specified, otherwise use default
		const paginationBase = this.config.paginationBase ?? DEFAULT_CONFIG.paginationBase;
		// Convert internal 0-based index to API pagination base
		const apiPageIndex = this._pagination.pageIndex + paginationBase;

		const query: StandardQuery = {
			page: apiPageIndex,
			limit: this._pagination.pageSize,
		};

		// Add search
		if (this._search.debouncedQuery) {
			query.search = this._search.debouncedQuery;
		}

		// Add sorting
		if (this._sorting.length > 0) {
			const primarySort = this._sorting[0];
			query.sort = primarySort.id;
			query.sortDir = primarySort.desc ? "DESC" : "ASC";
		}

		// Add filters
		this._filters.forEach((filter) => {
			if (filter.value !== undefined && filter.value !== null && filter.value !== "") {
				query[filter.id] = filter.value;
			}
		});

		return query;
	}

	async loadData(): Promise<void> {
		if (this._isDisposed) return;

		const query = this.buildQuery();

		// Controller handles error state, we only log if needed
		// eslint-disable-next-line no-console
		await this.controller.load(query).catch((err) => console.error("Failed to load data:", err));
	}

	loadInitialData(): void {
		// Load data with initial state
		this.loadData();
	}

	async refresh(): Promise<void> {
		if (this._isDisposed) return;

		if (this.controller.refresh) {
			// Controller handles error state, we only log if needed
			// eslint-disable-next-line no-console
			await this.controller.refresh().catch((err) => console.error("Failed to refresh data:", err));
		} else {
			await this.loadData();
		}
	}

	// Reset to initial state
	reset(): void {
		runInAction(() => {
			this._pagination = { pageIndex: 0, pageSize: this.config.defaultPageSize || 20 }; // Always 0-based internally
			this._selection = {
				selectedRows: new Set(),
				isAllSelected: false,
				isPartiallySelected: false,
				selectedCount: 0,
			};
			this._sorting = [];
			this._filters = [];
			this._search = {
				query: "",
				debouncedQuery: "",
				isSearching: false,
				results: [],
				highlightedIndex: -1,
			};
		});
	}

	private setupSearchDebounce(): void {
		// Setup RxJS debouncing for search
		this._searchSubscription = this._searchSubject
			.pipe(debounceTime(this.config.searchDebounceMs || 300), distinctUntilChanged())
			.subscribe((query) => {
				runInAction(() => {
					this._search.debouncedQuery = query;
					// Reset to first page when search changes
					this._pagination.pageIndex = 0;
				});
				const queryParams = this.buildQuery();
				this.controller.load(queryParams);
			});
	}

	private setupReactions(): void {
		// React to pagination changes - let controller handle the loading
		const paginationReaction = reaction(
			() => ({
				pageIndex: this._pagination.pageIndex,
				pageSize: this._pagination.pageSize,
			}),
			() => {
				// Build query and let controller handle it
				const query = this.buildQuery();
				this.controller.load(query);
			},
		);

		this._disposers.push(paginationReaction);

		// React to sorting changes
		const sortingReaction = reaction(
			() => this._sorting.slice(),
			() => {
				// Reset to first page when sorting changes
				this.setPagination({ pageIndex: 0 });
				const query = this.buildQuery();
				this.controller.load(query);
			},
		);

		this._disposers.push(sortingReaction);

		// React to filter changes
		const filterReaction = reaction(
			() => this._filters.slice(),
			() => {
				// Reset to first page when filters change
				this.setPagination({ pageIndex: 0 });
				const query = this.buildQuery();
				this.controller.load(query);
			},
		);

		this._disposers.push(filterReaction);
	}

	dispose(): void {
		if (this._isDisposed) {
			return;
		}

		// Clean up search subscription
		if (this._searchSubscription) {
			this._searchSubscription.unsubscribe();
		}
		this._searchSubject.complete();

		// Dispose all reactions
		this._disposers.forEach((dispose) => dispose());
		this._disposers.length = 0;

		// Dispose controller if it has a dispose method
		if (this.controller.dispose) {
			this.controller.dispose();
		}

		this._isDisposed = true;
	}
}
