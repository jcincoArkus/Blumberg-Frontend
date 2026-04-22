import type { FC } from "react";

import type { DataTablePaginationProps } from "~@/data-table";
import { Trans } from "~@/i18n/macro";

import { Button } from "../Button";
import { Select } from "../Select";

/**
 * Pagination Component
 * Handles page navigation and page size selection
 */
export const Pagination: FC<DataTablePaginationProps> = ({
	pagination,
	onPageChange,
	onPageSizeChange,
	pageSizeOptions = [10, 20, 50, 100],
	showPageSizeSelector = true,
	showInfo = true,
}) => {
	const { currentPage, totalPages, pageSize, totalItems, startItem, endItem } = pagination;

	return (
		<div className="flex items-center justify-between px-2 py-4">
			<div className="flex items-center gap-4">
				{showPageSizeSelector && (
					<div className="flex items-center gap-2">
						<span className="text-sm text-muted-foreground">
							<Trans>Rows per page:</Trans>
						</span>
						<Select
							value={pageSize.toString()}
							onValueChange={(value) => onPageSizeChange(Number(value))}
						>
							{pageSizeOptions.map((size) => (
								<option key={size} value={size}>
									{size}
								</option>
							))}
						</Select>
					</div>
				)}
				{showInfo && (
					<div className="text-sm text-muted-foreground">
						<Trans>
							Showing {startItem ?? 0} to {endItem ?? 0} of {totalItems} results
						</Trans>
					</div>
				)}
			</div>

			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(0)}
					disabled={!pagination.hasPreviousPage}
				>
					<Trans>First</Trans>
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(currentPage - 1)}
					disabled={!pagination.hasPreviousPage}
				>
					<Trans>Previous</Trans>
				</Button>
				<div className="flex items-center gap-1 px-2">
					<span className="text-sm">
						<Trans>
							Page {currentPage + 1} of {totalPages}
						</Trans>
					</span>
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(currentPage + 1)}
					disabled={!pagination.hasNextPage}
				>
					<Trans>Next</Trans>
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(totalPages - 1)}
					disabled={!pagination.hasNextPage}
				>
					<Trans>Last</Trans>
				</Button>
			</div>
		</div>
	);
};
