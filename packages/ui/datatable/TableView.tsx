import { flexRender } from "@tanstack/react-table";
import type { FC } from "react";

import type { DataItem, DataTableTableViewProps } from "~@/data-table";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../Table";
import { cn } from "../utils";

/**
 * TableView Component
 * Renders the data table with TanStack Table integration
 */
export const TableView: FC<DataTableTableViewProps<DataItem>> = ({
	table,
	onRowClick,
	onRowDoubleClick,
	isLoading,
	isFetching: _isFetching,
	stickyHeader = false,
}) => {
	return (
		<div className="relative">
			{/* Only show overlay during initial load; avoid persistent spinner when isFetching lags */}
			{isLoading && (
				<div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
				</div>
			)}
			<Table>
				<TableHeader className={cn(stickyHeader && "sticky top-0 z-10 bg-background")}>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<TableHead
									key={header.id}
									style={{
										width: header.getSize() !== 150 ? header.getSize() : undefined,
									}}
								>
									{header.isPlaceholder
										? null
										: flexRender(header.column.columnDef.header, header.getContext())}
								</TableHead>
							))}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows.map((row, index) => (
						<TableRow
							key={row.id}
							data-state={row.getIsSelected() ? "selected" : undefined}
							onClick={() => onRowClick?.(row.original, index)}
							onDoubleClick={() => onRowDoubleClick?.(row.original, index)}
							className={cn((onRowClick || onRowDoubleClick) && "cursor-pointer")}
						>
							{row.getVisibleCells().map((cell) => (
								<TableCell key={cell.id}>
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</TableCell>
							))}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
};
