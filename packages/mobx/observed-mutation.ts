import { makeAutoObservable } from "mobx";

import { queryClient } from "~@/query-client";

import { MobxMutation } from "./mobx-mutation";
import type { ExtractMutationData, MutationInput, MutationOptions } from "./types";
import { mergeDefaults } from "./utils/mergeDefaults";

/**
 * Creates a MobX mutation observer for the given API SDK function and parameters.
 * This function bridges the gap between API SDK functions and MobX observables for mutations.
 */
function makeObserver<T extends MutationInput, R extends MutationOptions<T> = MutationOptions<T>>(
	apiSdkFn: T,
	parameters: Parameters<T>,
	observerOptions?: R,
) {
	return new MobxMutation<
		ExtractMutationData<T>,
		Error,
		Parameters<NonNullable<ReturnType<T>["mutationFn"]>>[0],
		Parameters<NonNullable<ReturnType<T>["onSuccess"]>>[2]
	>(queryClient, () => ({
		...apiSdkFn(...parameters),
		...observerOptions,
	}));
}

/**
 * High-level observable mutation class that provides a user-friendly API for React Query mutations.
 * This class manages mutation state, pending status, errors, and provides convenient methods for
 * executing mutations both synchronously and asynchronously.
 *
 * Features:
 * - Automatic MobX observable setup for reactive UI updates
 * - Convenient getter methods for common mutation states
 * - Both async and fire-and-forget mutation execution
 * - Error handling and logging
 * - User-centric API design for accessibility
 * - Memory leak prevention through proper disposal
 */
export class ObservedMutation<
	T extends MutationInput,
	D = Parameters<T>[0],
	R extends MutationOptions<T> = MutationOptions<T>,
> {
	/**
	 * Private fields prefixed with _ are not observed by makeAutoObservable.
	 * Stores the API mutation SDK function for creating mutations.
	 */
	private _apiMutationSdkFn!: T;

	/**
	 * Private fields prefixed with _ are not observed by makeAutoObservable.
	 * Stores default values to be merged with parameters when mutating.
	 */
	private _defaultValues?: Partial<D>;

	/**
	 * Private fields prefixed with _ are not observed by makeAutoObservable.
	 * Stores additional observer options for mutation configuration.
	 */
	private _observerOptions!: R;

	constructor(apiMutationSdkFn: T, defaultValues?: Partial<D>, observerOptions?: R) {
		this._apiMutationSdkFn = apiMutationSdkFn;
		this._defaultValues = defaultValues;
		this._observerOptions = (observerOptions ?? {}) as R;
		makeAutoObservable(this);
	}

	/**
	 * The mutation being observed.
	 * This holds the actual MobX mutation instance when created.
	 */
	mutation: ReturnType<typeof makeObserver<T>> | null = null;

	/**
	 * API request sent, waiting on response.
	 * This indicates that a mutation is currently in progress.
	 */
	get isPending(): boolean {
		return this.mutation?.state?.isPending ?? false;
	}

	/**
	 * Are we doing anything at all?
	 * This indicates whether the mutation is in an idle state (not executing).
	 */
	get isIdle(): boolean {
		return this.mutation?.state?.isIdle ?? false;
	}

	/**
	 * Convenience method for getting the error status of the mutation results.
	 * This is useful for conditional error handling in components.
	 */
	get hasError(): boolean {
		return this.mutation?.state?.isError ?? false;
	}

	/**
	 * Convenience method for getting the Error of the mutation results.
	 * Returns null if there's no error, making it safe to use in templates.
	 */
	get error(): Error | null {
		return this.mutation?.state?.error ?? null;
	}

	/**
	 * Convenience method for getting the response of the API call.
	 * Returns null if no data is available, making it safe for conditional rendering.
	 */
	get response(): ExtractMutationData<T> | null {
		return this.mutation?.state?.data ?? null;
	}

	/**
	 * Send data to API.
	 *
	 * Does not wait for the response.
	 * This method is useful for fire-and-forget mutations where you don't need
	 * to wait for the result or handle errors directly.
	 *
	 * @param args - Parameters to pass to the API mutation SDK function
	 */
	mutate = (...args: Partial<Parameters<T>>): void => {
		this.mutation?.dispose();

		// Merge default values with provided arguments
		const mergedArgs = mergeDefaults(this._defaultValues, args) as Parameters<T>;

		this.mutation = makeObserver(this._apiMutationSdkFn, mergedArgs, this._observerOptions);
		this.mutation.mutate(mergedArgs);
	};

	/**
	 * Send data to API and wait for the response.
	 *
	 * Returns a promise that resolves with the mutation result.
	 * This method is useful when you need to wait for the mutation to complete
	 * and handle the result or errors using async/await.
	 *
	 * @param args - Parameters to pass to the API mutation SDK function
	 * @returns Promise that resolves with the mutation data
	 */
	mutateAsync = async (...args: Partial<Parameters<T>>): Promise<ExtractMutationData<T>> => {
		this.mutation?.dispose();

		// Merge default values with provided arguments
		const mergedArgs = mergeDefaults(this._defaultValues, args) as Parameters<T>;

		this.mutation = makeObserver(this._apiMutationSdkFn, mergedArgs, this._observerOptions);
		return await this.mutation.mutateAsync(mergedArgs);
	};

	/**
	 * Dispose of the mutation and clean up resources.
	 * This method should be called when the mutation is no longer needed
	 * to prevent memory leaks.
	 */
	dispose = (): void => {
		this.mutation?.dispose();
		this.mutation = null;
	};
}
