import { makeAutoObservable, reaction, runInAction } from "mobx";

import { queryClient } from "~@/query-client";

import { MobxQuery } from "./mobx-query";
import type { ExtractQueryData, QueryInput, QueryOptions } from "./types";
import { mergeDefaults } from "./utils/mergeDefaults";

/**
 * Creates a MobX query observer for the given API SDK function and parameters.
 * This function bridges the gap between API SDK functions and MobX observables.
 */
function makeObserver<T extends QueryInput, R extends QueryOptions<T> = QueryOptions<T>>(
	apiSdkFn: T,
	parameters: Parameters<T>,
	observerOptions?: R,
) {
	return new MobxQuery<
		ExtractQueryData<T>,
		Error,
		ExtractQueryData<T>,
		ExtractQueryData<T>,
		ReturnType<T>["queryKey"]
	>(queryClient, () => ({
		...apiSdkFn(...parameters),
		...observerOptions,
	}));
}

/**
 * High-level observable query class that provides a user-friendly API for React Query integration.
 * This class manages query state, loading, errors, and provides convenient methods for
 * loading, unloading, and invalidating queries.
 *
 * Features:
 * - Automatic MobX observable setup for reactive UI updates
 * - Convenient getter methods for common query states
 * - Load/unload lifecycle management
 * - Query invalidation support
 * - Structural comparison for better performance
 * - User-centric API design for accessibility
 */
export class ObservedQuery<
	T extends QueryInput,
	D = Parameters<T>[0],
	R extends QueryOptions<T> = QueryOptions<T>,
> {
	/**
	 * Private fields prefixed with _ are not observed by makeAutoObservable.
	 * Stores the API SDK function for creating queries.
	 */
	private _apiSdkFn!: T;

	/**
	 * Private fields prefixed with _ are not observed by makeAutoObservable.
	 * Stores default values to be merged with parameters when loading.
	 */
	private _defaultValues?: Partial<D>;

	/**
	 * Private fields prefixed with _ are not observed by makeAutoObservable.
	 * Stores additional observer options for query configuration.
	 */
	private _observerOptions!: R;

	constructor(apiSdkFn: T, defaultValues?: Partial<D>, observerOptions?: R) {
		this._apiSdkFn = apiSdkFn;
		this._defaultValues = defaultValues;
		this._observerOptions = (observerOptions ?? {}) as R;
		makeAutoObservable(this);
	}

	/**
	 * The query being observed.
	 * This holds the actual MobX query instance when loaded.
	 */
	query: ReturnType<typeof makeObserver<T>> | null = null;

	/**
	 * Has the api call been completed at least once (success doesn't matter).
	 * This is useful for showing loading states vs empty states.
	 */
	get isReady(): boolean {
		return this.query !== null;
	}

	/**
	 * Are we fetching results for the first time.
	 * This indicates initial loading state.
	 */
	get isLoading(): boolean {
		return this.query?.state?.isLoading ?? false;
	}

	/**
	 * Are we fetching results (including background re-fetches).
	 * This indicates any fetching activity.
	 */
	get isFetching(): boolean {
		return this.query?.state?.isFetching ?? false;
	}

	/**
	 * Convenience method for getting the error status of the query results.
	 * This is useful for conditional error handling in components.
	 */
	get hasError(): boolean {
		return this.query?.state?.isError ?? false;
	}

	/**
	 * Convenience method for getting the Error of the query results.
	 * Returns null if there's no error, making it safe to use in templates.
	 */
	get error(): Error | null {
		return this.query?.state?.error as Error | null;
	}

	/**
	 * Convenience method for getting the response from the query.
	 * Uses structural comparison for better performance.
	 * Returns null if no data is available, making it safe for conditional rendering.
	 */
	get data(): ExtractQueryData<T> | null {
		return this.query?.state?.data as ExtractQueryData<T> | null;
	}

	/**
	 * Fire off the request to the API.
	 * This method creates a new query with the provided parameters
	 * and disposes of any existing query to prevent memory leaks.
	 *
	 * @param args - Parameters to pass to the API SDK function
	 */
	load = (...args: Partial<Parameters<T>>): void => {
		this.query?.dispose();

		// Merge default values with provided arguments
		const mergedArgs = mergeDefaults(this._defaultValues, args) as Parameters<T>;

		runInAction(() => {
			this.query = makeObserver(this._apiSdkFn, mergedArgs, this._observerOptions);
		});
	};

	/**
	 * Fire off the request to the API and wait for completion.
	 * This method creates a new query with the provided parameters,
	 * disposes of any existing query, and returns a promise that resolves
	 * when the query completes.
	 *
	 * @param args - Parameters to pass to the API SDK function
	 * @returns Promise that resolves with the query data
	 */
	loadAsync = async (...args: Partial<Parameters<T>>): Promise<ExtractQueryData<T>> => {
		this.load(...args);

		return await new Promise((resolve, reject) => {
			if (!this.query) {
				reject(new Error("Query failed to initialize"));
				return;
			}

			const disposer = reaction(
				() => ({
					isSuccess: this.query?.state?.isSuccess,
					isError: this.query?.state?.isError,
					data: this.query?.state?.data,
					error: this.query?.state?.error,
				}),
				(result) => {
					if (result.isSuccess) {
						disposer();
						resolve(result.data as ExtractQueryData<T>);
					}

					if (result.isError) {
						disposer();
						reject(result.error);
					}
				},
				{ fireImmediately: true },
			);
		});
	};

	/**
	 * Refetch the current query (same parameters).
	 * Returns a promise that resolves when the refetch completes.
	 * No-op if no query has been loaded yet.
	 */
	refetch = async (): Promise<void> => {
		if (this.query) {
			await this.query.refetch();
		}
	};

	/**
	 * Clear the query as if we never called `.load()`.
	 * This resets the query state and cleans up resources.
	 * Useful for clearing data when navigating away or resetting forms.
	 */
	dispose = (): void => {
		this.query?.dispose();
		this.query = null;
	};

	/**
	 * Invalidate the query by query key.
	 *
	 * This will cause the query to be re-fetched everywhere it is used in a controller.
	 * This is useful for updating data after mutations or when you know the data is stale.
	 *
	 * @throws {Error} When invalidation fails
	 */
	invalidate = (): void => {
		if (this.query === null) {
			return;
		}

		const { queryKey } = this.query.queryOptions;

		queryClient.invalidateQueries({ queryKey }).catch((error) => {
			// eslint-disable-next-line no-console
			console.error("Error invalidating query", { error, queryKey });
		});
	};
}
