import { observer } from "mobx-react-lite";
import type { ReactElement } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { DataTableComponentOverrides } from "../config/DataTableConfigProvider";
import { useDataTableDefaults } from "../config/DataTableConfigProvider";
import { useDataTable } from "../hooks/useDataTable";
import { DataTableProvider, useDataTableStore } from "../stores/DataTableContext";
import type { DataItem, DataTableProps, ViewMode } from "../types";

/**
 * Main DataTable component
 *
 * This is a modern implementation with enhanced architecture.
 * Features include optimized performance, MobX integration, and modular design.
 */
const DataTableCore = observer(function DataTableCore<TData extends DataItem = DataItem>({
	viewMode = "table",
	height = "auto",
	isFullPage = false,
	galleryCard: GalleryCard,
	listItem: ListItem,
	customEmptyState,
	galleryClassName,
	onRowClick,
	onRowDoubleClick,
	onSelectionChange,
	renderTopBar,
	renderBottomBar,
	showSearch = true,
	searchPlaceholder,
	title,
	isClickable = true,
	className = "",
	style,
	components,
	headerActions,
	..._props
}: DataTableProps<TData>) {
	const { components: globalComponents } = useDataTableDefaults();
	const componentOverrides = useMemo(
		() => ({
			...(globalComponents || {}),
			...(components || {}),
		}),
		[globalComponents, components],
	);

	const requireComponent = <T extends keyof DataTableComponentOverrides<TData>>(
		key: T,
	): NonNullable<DataTableComponentOverrides<TData>[T]> => {
		const component = componentOverrides[key];
		if (!component) {
			throw new Error(
				`DataTable is headless. Please provide component override for "${String(key)}".`,
			);
		}
		return component as NonNullable<DataTableComponentOverrides<TData>[T]>;
	};

	// Memoize search placeholder
	const actualSearchPlaceholder = useMemo(
		() => searchPlaceholder || "Search...",
		[searchPlaceholder],
	);

	const {
		table,
		data,
		total,
		isLoading,
		isFetching,
		isError,
		error,
		pagination,
		selection,
		goToPage,
		setPageSize,
		refresh,
	} = useDataTable<TData>();

	// Get store for search functionality
	const store = useDataTableStore();

	// Handle search change
	const handleSearchChange = useCallback(
		(value: string) => {
			store.setSearchQuery(value);
		},
		[store],
	);

	// Computed values
	const isEmpty = data?.length === 0 && !isLoading;
	const hasData = data?.length > 0;

	// Handle view mode changes
	const [currentViewMode, setCurrentViewMode] = useState<ViewMode>(viewMode);

	useEffect(() => {
		setCurrentViewMode(viewMode);
	}, [viewMode]);

	// Handle row clicks
	const handleRowClick = (row: TData, index: number) => {
		onRowClick?.(row, index);
		store.controller?.onRowClick?.(row);
	};

	const handleRowDoubleClick = (row: TData, index: number) => {
		onRowDoubleClick?.(row, index);
		store.controller?.onRowDoubleClick?.(row);
	};

	// Handle selection changes
	useEffect(() => {
		if (onSelectionChange) {
			const selectedRows = data.filter((row) => {
				const id = store.controller?.getRowId?.(row) || row.id?.toString() || "";
				return selection.selectedRows.has(id);
			});
			onSelectionChange(selectedRows, Array.from(selection.selectedRows));
		}
	}, [selection.selectedRows, data, onSelectionChange, store.controller]);

	// Render with search and loading state
	const EmptyStateComponent = requireComponent("EmptyState");
	const ErrorStateComponent = requireComponent("ErrorState");
	const TableViewComponent = requireComponent("TableView");
	const PaginationComponent = requireComponent("Pagination");
	const LoadingComponent = requireComponent("Loading");
	const SearchInputComponent = showSearch ? requireComponent("SearchInput") : null;
	const GalleryViewComponent =
		currentViewMode === "gallery" ? requireComponent("GalleryView") : null;
	const ListViewComponent = currentViewMode === "list" ? requireComponent("ListView") : null;

	if (isLoading && !hasData) {
		return (
			<div>
				{(showSearch || headerActions) && (
					<div>
						{showSearch && SearchInputComponent && (
							<SearchInputComponent
								value={store.search.query}
								onChange={handleSearchChange}
								placeholder={actualSearchPlaceholder}
								title={title}
							/>
						)}
						{headerActions && <div>{headerActions}</div>}
					</div>
				)}
				<LoadingComponent />
			</div>
		);
	}

	// Render with search and error state
	if (isError && error) {
		return (
			<div>
				{(showSearch || headerActions) && (
					<div>
						{showSearch && SearchInputComponent && (
							<SearchInputComponent
								value={store.search.query}
								onChange={handleSearchChange}
								placeholder={actualSearchPlaceholder}
								title={title}
							/>
						)}
						{headerActions && <div>{headerActions}</div>}
					</div>
				)}
				<ErrorStateComponent
					error={error}
					title="Failed to load data"
					message={error.message}
					icon="⚠️"
					showRetryButton={true}
					retryButtonText="Try Again"
					onRetry={refresh}
				/>
			</div>
		);
	}

	// Render with search and empty state
	if (isEmpty) {
		return (
			<div>
				{(showSearch || headerActions) && (
					<div>
						{showSearch && SearchInputComponent && (
							<SearchInputComponent
								value={store.search.query}
								onChange={handleSearchChange}
								placeholder={actualSearchPlaceholder}
								title={title}
							/>
						)}
						{headerActions && <div>{headerActions}</div>}
					</div>
				)}
				{customEmptyState ? (
					customEmptyState()
				) : (
					<EmptyStateComponent
						title="No data found"
						message="Try adjusting your search or filter criteria."
						icon="🔍"
						showActionButton={false}
					/>
				)}
			</div>
		);
	}

	return (
		<div>
			{(showSearch || headerActions) && (
				<div>
					{showSearch && SearchInputComponent && (
						<SearchInputComponent
							value={store.search.query}
							onChange={handleSearchChange}
							placeholder={actualSearchPlaceholder}
							title={title}
						/>
					)}
					{headerActions && <div>{headerActions}</div>}
				</div>
			)}
			<div className={className} style={isFullPage ? style : { height, ...style }}>
				{renderTopBar?.({
					selectedCount: selection.selectedCount,
					totalCount: total,
					selection,
					onRefresh: refresh,
				})}

				<div>
					{currentViewMode === "table" && (
						<TableViewComponent
							table={table}
							onRowClick={handleRowClick}
							onRowDoubleClick={handleRowDoubleClick}
							isLoading={isLoading}
							isFetching={isFetching}
							stickyHeader={true}
						/>
					)}

					{currentViewMode === "gallery" && GalleryCard && GalleryViewComponent && (
						<GalleryViewComponent
							data={data}
							CardComponent={GalleryCard}
							onItemClick={handleRowClick}
							onItemDoubleClick={handleRowDoubleClick}
							isLoading={isLoading}
							isFetching={isFetching}
							isClickable={isClickable}
							gridClassName={galleryClassName}
						/>
					)}

					{currentViewMode === "list" && ListItem && ListViewComponent && (
						<ListViewComponent
							data={data}
							ItemComponent={ListItem}
							onItemClick={handleRowClick}
							onItemDoubleClick={handleRowDoubleClick}
							isLoading={isLoading}
							isFetching={isFetching}
						/>
					)}
				</div>

				{renderBottomBar ? (
					renderBottomBar({
						selectedCount: selection.selectedCount,
						totalCount: total,
						pagination,
						onPageChange: goToPage,
						onPageSizeChange: setPageSize,
					})
				) : (
					<PaginationComponent
						pagination={pagination}
						onPageChange={goToPage}
						onPageSizeChange={setPageSize}
						pageSizeOptions={[10, 20, 50, 100]}
						showPageSizeSelector={true}
						showInfo={true}
					/>
				)}
			</div>
		</div>
	);
});

// Main component with provider
export function DataTable<TData extends DataItem = DataItem>(
	props: DataTableProps<TData>,
): ReactElement {
	const defaults = useDataTableDefaults();

	// CRITICAL: Memoize mergedConfig to prevent store recreation on every render
	// Without this, the store is recreated on each render, losing pagination state
	const mergedConfig = useMemo(
		() => ({
			...(defaults.config || {}),
			...(props.config || {}),
		}),
		[defaults.config, props.config],
	);

	return (
		<DataTableProvider
			columns={props.columns}
			controller={props.controller}
			config={mergedConfig}
			actions={props.actions}
		>
			<DataTableCore {...props} style={{ maxWidth: "100%", height: "100%" }} />
		</DataTableProvider>
	);
}
