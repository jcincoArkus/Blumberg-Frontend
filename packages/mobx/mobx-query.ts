import {
	type DefaultError,
	type QueryClient,
	type QueryKey,
	QueryObserver,
	type QueryObserverOptions,
	type QueryObserverResult,
} from "@tanstack/query-core";
import {
	action,
	computed,
	makeObservable,
	observable,
	onBecomeObserved,
	onBecomeUnobserved,
	reaction,
} from "mobx";

/**
 * Internal MobX query implementation that handles the low-level integration
 * between MobX observables and React Query's QueryObserver.
 * This class manages the lifecycle of query observers and disposables.
 */
class _MobxQuery<
	TQueryFnData = unknown,
	TError = DefaultError,
	TData = TQueryFnData,
	TQueryData = TQueryFnData,
	TQueryKey extends QueryKey = QueryKey,
> {
	queryClient: QueryClient;

	_queryOptions: () => QueryObserverOptions<TQueryFnData, TError, TData, TQueryData, TQueryKey>;

	qObserver: QueryObserver<TQueryFnData, TError, TData, TQueryData, TQueryKey> | undefined =
		undefined;

	public state: QueryObserverResult<TData, TError> | undefined = undefined;

	private disposables: (() => void)[] = [];

	constructor(
		queryClient: QueryClient,
		queryOptions: () => QueryObserverOptions<TQueryFnData, TError, TData, TQueryData, TQueryKey>,
	) {
		makeObservable(this, {
			state: observable.ref,
			update: action,
			queryOptions: computed,
			refetch: action,
			_updateOptions: action.bound,
		});
		this.queryClient = queryClient;
		this._queryOptions = queryOptions;
	}

	/**
	 * Computed property that returns the current query options.
	 * This is reactive and will trigger updates when options change.
	 */
	get queryOptions() {
		return this._queryOptions();
	}

	/**
	 * Sets up the query observer and disposables for managing the query lifecycle.
	 * This method is called when the query becomes observed.
	 */
	setupDisposables = (): void => {
		if (this.qObserver) {
			return;
		}

		this.qObserver = new QueryObserver(this.queryClient, {
			...this.queryOptions,
			staleTime: this.queryOptions.staleTime ?? 0,
		});

		this.state = this.qObserver.getCurrentResult();

		this.disposables.push(
			this.qObserver.subscribe((e) => {
				this.update(e);
			}),
			reaction(
				() => this.queryOptions,
				() => {
					this._updateOptions();
				},
			),
			() => {
				this.qObserver?.destroy();
			},
		);
	};

	/**
	 * Triggers a refetch of the query data.
	 * This is an action that can be called to manually refresh the query.
	 * Returns a promise that resolves when the refetch completes.
	 */
	refetch = (): Promise<QueryObserverResult<TData, TError> | undefined> => {
		return this.qObserver?.refetch() ?? Promise.resolve(undefined);
	};

	/**
	 * Updates the observable state with new query results.
	 * This action is called when the query observer emits new data.
	 */
	update = (state: QueryObserverResult<TData, TError>): void => {
		this.state = state;
	};

	/**
	 * Updates the query options function.
	 * This allows for dynamic query option changes.
	 */
	updateOptions = (
		options: () => QueryObserverOptions<TQueryFnData, TError, TData, TQueryData, TQueryKey>,
	): void => {
		this._queryOptions = options;
	};

	/**
	 * Internal method to update the query observer with new options.
	 * This is called reactively when query options change.
	 */
	_updateOptions = (): void => {
		this.qObserver?.setOptions(this.queryOptions);
	};

	/**
	 * Disposes of all resources and cleans up subscriptions.
	 * This method ensures no memory leaks occur when the query is no longer needed.
	 */
	dispose = (): void => {
		this.disposables.forEach((fn) => {
			try {
				fn();
			} catch (error) {
				// eslint-disable-next-line no-console
				console.warn("Error disposing resource:", error);
			}
		});
		this.disposables.length = 0; // Clear array to prevent memory leaks
	};
}

/**
 * Public MobX query class that provides a clean API for integrating React Query with MobX.
 * This class automatically manages the lifecycle of queries based on MobX observation.
 * When the query becomes observed, it sets up the necessary subscriptions.
 * When it becomes unobserved, it cleans up resources to prevent memory leaks.
 */
export class MobxQuery<
	TQueryFnData = unknown,
	TError = DefaultError,
	TData = TQueryFnData,
	TQueryData = TQueryFnData,
	TQueryKey extends QueryKey = QueryKey,
> {
	private query: _MobxQuery<TQueryFnData, TError, TData, TQueryData, TQueryKey>;

	constructor(
		queryClient: QueryClient,
		queryOptions: () => QueryObserverOptions<TQueryFnData, TError, TData, TQueryData, TQueryKey>,
	) {
		this.query = new _MobxQuery(queryClient, queryOptions);

		makeObservable(this, {
			// @ts-expect-error Mobx can see it don't worry
			query: observable.ref,
		});

		// Set up automatic lifecycle management based on MobX observation
		onBecomeObserved(
			this,
			"query",
			action(() => {
				this.query.setupDisposables();
			}),
		);

		onBecomeUnobserved(
			this,
			"query",
			action(() => {
				this.query.dispose();
			}),
		);
	}

	/**
	 * Gets the current query state with loading, error, and data information.
	 * This is a reactive property that will trigger re-renders when the state changes.
	 */
	get state(): _MobxQuery<TQueryFnData, TError, TData, TQueryData, TQueryKey>["state"] {
		return this.query.state;
	}

	/**
	 * Gets the current query options.
	 * This is useful for debugging or accessing the query configuration.
	 */
	get queryOptions(): QueryObserverOptions<TQueryFnData, TError, TData, TQueryData, TQueryKey> {
		return this.query.queryOptions;
	}

	/**
	 * Manually triggers a refetch of the query data.
	 * This can be used to refresh data on user action.
	 * Returns a promise that resolves when the refetch completes.
	 */
	refetch = (): Promise<QueryObserverResult<TData, TError> | undefined> => {
		return this.query.refetch();
	};

	/**
	 * Updates the query options dynamically.
	 * This allows for changing query behavior at runtime.
	 */
	updateOptions = (
		options: () => QueryObserverOptions<TQueryFnData, TError, TData, TQueryData, TQueryKey>,
	): void => {
		this.query.updateOptions(options);
	};

	/**
	 * Manually disposes of the query and cleans up resources.
	 * This is typically not needed as disposal is handled automatically.
	 */
	dispose = (): void => {
		this.query.dispose();
	};
}
