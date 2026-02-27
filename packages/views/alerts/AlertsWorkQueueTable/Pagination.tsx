import { ChevronLeft, ChevronRight } from "lucide-react";

import { t } from "~@/i18n/macro";
import { Button } from "~@/ui";

import type { PaginationProps } from "./types";

export function Pagination({
	currentPage,
	totalPages,
	itemsPerPage,
	totalItems,
	onPageChange,
}: PaginationProps) {
	const from = (currentPage - 1) * itemsPerPage + 1;
	const to = Math.min(currentPage * itemsPerPage, totalItems);

	return (
		<div className="flex items-center justify-between">
			<p className="text-sm text-muted-foreground">
				{t`Showing ${from} to ${to} of ${totalItems} alerts`}
			</p>
			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(Math.max(1, currentPage - 1))}
					disabled={currentPage === 1}
				>
					<ChevronLeft className="h-4 w-4" />
					{t`Previous`}
				</Button>
				<div className="flex items-center gap-1">
					{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
						let pageNum: number;
						if (totalPages <= 5) {
							pageNum = i + 1;
						} else if (currentPage <= 3) {
							pageNum = i + 1;
						} else if (currentPage >= totalPages - 2) {
							pageNum = totalPages - 4 + i;
						} else {
							pageNum = currentPage - 2 + i;
						}
						return (
							<Button
								key={pageNum}
								variant={currentPage === pageNum ? "default" : "outline"}
								size="sm"
								className="w-8"
								onClick={() => onPageChange(pageNum)}
							>
								{pageNum}
							</Button>
						);
					})}
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
					disabled={currentPage === totalPages}
				>
					{t`Next`}
					<ChevronRight className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
