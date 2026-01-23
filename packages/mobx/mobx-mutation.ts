import {
	type DefaultError,
	type MutateOptions,
	MutationObserver,
	type MutationObserverOptions,
	type MutationObserverResult,
	type QueryClient,
} from "@tanstack/query-core";
import {
	action,
	computed,
	makeObservable,
	observable,
	onBecomeObserved,
	onBecomeUnobserved,
	reaction,
	runInAction,
	toJS,
} from "mobx";

const targets = ["onSuccess", "onError", "onSettled", "onMutate"] as const;

/**
 * Internal MobX mutation implementation that handles the low-level integration
 * between MobX observables and React Query's MutationObserver.
 * This class manages the lifecycle of mutation observers and disposables.
 */
class _MobxMutation<TData = unknown, TError = DefaultError, TVariables = void, TContext = unknown> {
	queryClient: QueryClient;

	_mutationOptions: () => MutationObserverOptions<TData, TError, TVariables, TContext>;

	mObserver: MutationObserver<TData, TError, TVariables, TContext> | undefined = undefined;

	public state: MutationObserverResult<TData, TError, TVariables, TContext> | undefined = undefined;

	private disposables: (() => void)[] = [];

	constructor(
		queryClient: QueryClient,
		mutationOptions: () => MutationObserverOptions<TData, TError, TVariables, TContext>,
	) {
		makeObservable(this, {
			state: observable.ref,
			update: action,
			mutationOptions: computed,
			mutate: action,
			_updateOptions: action.bound,
		});
		this.queryClient = queryClient;
		this._mutationOptions = mutationOptions;
	}

	/**
	 * Computed property that returns the current mutation options.
	 * This is reactive and will trigger updates when options change.
	 */
	get mutationOptions() {
		return this._mutationOptions();
	}

	/**
	 * Sets up the mutation observer and disposables for managing the mutation lifecycle.
	 * This method is called when the mutation becomes observed.
	 */
	setupDisposables = (): void => {
		if (this.mObserver) {
			return;
		}

		this.mObserver = new MutationObserver(
			this.queryClient,
			this.wrapEffectsWithActions(toJS(this.mutationOptions)),
		);

		this.state = this.mObserver.getCurrentResult();

		this.disposables.push(
			this.mObserver.subscribe((e) => {
				this.update(e);
			}),
			reaction(
				() => this.mutationOptions,
				() => {
					this._updateOptions();
				},
			),
			() => {
				this.mObserver?.reset();
			},
		);
	};

	/**
	 * Executes the mutation without waiting for the result.
	 * This is useful for fire-and-forget mutations.
	 */
	mutate = (
		variables: TVariables,
		options?: MutateOptions<TData, TError, TVariables, TContext>,
	): void => {
		this.setupDisposables();
		this.mObserver?.mutate(variables, options);
	};

	/**
	 * Executes the mutation and returns a promise that resolves with the result.
	 * This is useful when you need to wait for the mutation to complete.
	 */
	mutateAsync = (
		variables: TVariables,
		options?: MutateOptions<TData, TError, TVariables, TContext>,
	): Promise<TData> => {
		this.setupDisposables();
		return this.mObserver?.mutate(variables, options) as Promise<TData>;
	};

	/**
	 * Updates the observable state with new mutation results.
	 * This action is called when the mutation observer emits new data.
	 */
	update = (state: MutationObserverResult<TData, TError, TVariables, TContext>): void => {
		this.state = state;
	};

	/**
	 * Updates the mutation options function.
	 * This allows for dynamic mutation option changes.
	 */
	updateOptions = (
		options: () => MutationObserverOptions<TData, TError, TVariables, TContext>,
	): void => {
		this._mutationOptions = options;
	};

	/**
	 * Internal method to update the mutation observer with new options.
	 * This is called reactively when mutation options change.
	 */
	_updateOptions = (): void => {
		if (this.mObserver) {
			this.mObserver.setOptions(this.mutationOptions);
		}
	};

	/**
	 * Disposes of all resources and cleans up subscriptions.
	 * This method ensures no memory leaks occur when the mutation is no longer needed.
	 */
	dispose = (): void => {
		this.disposables.forEach((fn) => {
			try {
				fn();
			} catch (error) {
				// eslint-disable-next-line no-console
				console.warn("Error disposing mutation resource:", error);
			}
		});
		this.disposables.length = 0; // Clear array to prevent memory leaks
	};

	/**
	 * Wraps mutation lifecycle callbacks (onSuccess, onError, onSettled, onMutate) with MobX actions.
	 * This ensures that any observable state changes within these callbacks are properly tracked
	 * by MobX and prevents warnings about untracked state modifications.
	 *
	 * @param options - The mutation options containing lifecycle callbacks
	 * @returns The mutation options with wrapped callbacks
	 */
	wrapEffectsWithActions(
		options: MutationObserverOptions<TData, TError, TVariables, TContext>,
	): MutationObserverOptions<TData, TError, TVariables, TContext> {
		const wrappedOptions = { ...options };

		for (const target of targets) {
			const effect = options[target];
			if (!effect) {
				continue;
			}
			// @ts-expect-error - Different callbacks have different return types
			wrappedOptions[target] = (...args: unknown[]) => {
				// @ts-expect-error - Spreading args with proper types
				return runInAction(() => effect(...args));
			};
		}

		return wrappedOptions;
	}
}

/**
 * Public MobX mutation class that provides a clean API for integrating React Query mutations with MobX.
 * This class automatically manages the lifecycle of mutations based on MobX observation.
 * When the mutation becomes observed, it sets up the necessary subscriptions.
 * When it becomes unobserved, it cleans up resources to prevent memory leaks.
 */
export class MobxMutation<
	TData = unknown,
	TError = DefaultError,
	TVariables = void,
	TContext = unknown,
> {
	private mutation: _MobxMutation<TData, TError, TVariables, TContext>;

	constructor(
		queryClient: QueryClient,
		mutationOptions: () => MutationObserverOptions<TData, TError, TVariables, TContext>,
	) {
		this.mutation = new _MobxMutation(queryClient, mutationOptions);

		makeObservable(this, {
			// @ts-expect-error Mobx can see it don't worry
			mutation: observable.ref,
		});

		// Set up automatic lifecycle management based on MobX observation
		onBecomeObserved(
			this,
			"mutation",
			action(() => {
				this.mutation.setupDisposables();
			}),
		);

		onBecomeUnobserved(
			this,
			"mutation",
			action(() => {
				this.mutation.dispose();
			}),
		);
	}

	/**
	 * Gets the current mutation state with pending, error, and data information.
	 * This is a reactive property that will trigger re-renders when the state changes.
	 */
	get state(): _MobxMutation<TData, TError, TVariables, TContext>["state"] {
		return this.mutation.state;
	}

	/**
	 * Gets the current mutation options.
	 * This is useful for debugging or accessing the mutation configuration.
	 */
	get mutationOptions(): _MobxMutation<TData, TError, TVariables, TContext>["mutationOptions"] {
		return this.mutation.mutationOptions;
	}

	/**
	 * Executes the mutation without waiting for the result.
	 * This is useful for fire-and-forget mutations where you don't need the result.
	 */
	mutate = (
		variables: TVariables,
		options?: MutateOptions<TData, TError, TVariables, TContext>,
	): void => {
		this.mutation.mutate(variables, options);
	};

	/**
	 * Executes the mutation and returns a promise that resolves with the result.
	 * This is useful when you need to wait for the mutation to complete.
	 */
	mutateAsync = (
		variables: TVariables,
		options?: MutateOptions<TData, TError, TVariables, TContext>,
	): Promise<TData> => {
		return this.mutation.mutateAsync(variables, options);
	};

	/**
	 * Updates the mutation options dynamically.
	 * This allows for changing mutation behavior at runtime.
	 */
	updateOptions = (
		options: () => MutationObserverOptions<TData, TError, TVariables, TContext>,
	): void => {
		this.mutation.updateOptions(options);
	};

	/**
	 * Manually disposes of the mutation and cleans up resources.
	 * This is typically not needed as disposal is handled automatically.
	 */
	dispose = (): void => {
		this.mutation.dispose();
	};
}
