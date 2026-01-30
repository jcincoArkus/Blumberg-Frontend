/**
 * Interface for ViewModels that need cleanup on disposal.
 * Implement this interface when your ViewModel has subscriptions,
 * timers, or other resources that need to be cleaned up.
 */
export interface Disposable {
	dispose(): void;
}

/**
 * Type guard to check if an object implements Disposable
 */
export function isDisposable(obj: unknown): obj is Disposable {
	return (
		typeof obj === "object" &&
		obj !== null &&
		"dispose" in obj &&
		typeof (obj as Disposable).dispose === "function"
	);
}

/**
 * Base interface for ViewModels with loading state.
 * Useful for ViewModels that fetch data from APIs.
 */
export interface LoadableViewModel {
	readonly isLoading: boolean;
	readonly hasError: boolean;
	readonly error: Error | null;
}

/**
 * Base interface for ViewModels with CRUD operations.
 * Generic type T represents the entity type.
 */
export interface CrudViewModel<T> {
	readonly items: T[];
	readonly selectedItem: T | null;
	readonly editingItem: T | null;
	readonly isEditorOpen: boolean;

	selectItem(item: T | null): void;
	openEditor(item?: T | null): void;
	closeEditor(): void;
	saveItem(item: T): void;
	deleteItem(id: string): void;
}

/**
 * Base interface for ViewModels with filtering capabilities.
 */
export interface FilterableViewModel {
	readonly hasActiveFilters: boolean;
	clearFilters(): void;
}
