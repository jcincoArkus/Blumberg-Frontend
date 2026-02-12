import { Link } from "react-router";

import type { SiteResponse } from "~@/api";
import type { DataTableProps } from "~@/data-table";
import { t } from "~@/i18n/macro";
import { Button } from "~@/ui";

export function getSiteColumns(options: {
	onDelete?: (site: SiteResponse) => void;
}): DataTableProps<SiteResponse>["columns"] {
	return [
		{
			accessorKey: "name",
			header: t`Name`,
			cell: ({ row }) => {
				const site = row.original;
				const id = site.id;
				const name = site.name ?? t`Unnamed`;
				if (!id) return name;
				return (
					<Link to={`/sites/${id}`} className="font-medium text-primary hover:underline">
						{name}
					</Link>
				);
			},
		},
		{
			accessorKey: "address",
			header: t`Address`,
			cell: ({ row }) => (row.original.address ?? "—") as string,
		},
		{
			accessorKey: "city",
			header: t`City`,
			cell: ({ row }) => (row.original.city ?? "—") as string,
		},
		{
			accessorKey: "state",
			header: t`State`,
			cell: ({ row }) => (row.original.state ?? "—") as string,
		},
		{
			accessorKey: "country",
			header: t`Country`,
			cell: ({ row }) => (row.original.country ?? "—") as string,
		},
		{
			id: "actions",
			header: "",
			enableSorting: false,
			size: 120,
			cell: ({ row }) => {
				const site = row.original;
				const id = site.id;
				if (!id) return null;
				return (
					<div className="flex items-center gap-2">
						<Button variant="ghost" size="sm" asChild>
							<Link to={`/sites/${id}/edit`}>{t`Edit`}</Link>
						</Button>
						{options.onDelete && (
							<Button
								variant="ghost"
								size="sm"
								className="text-destructive hover:text-destructive"
								onClick={() => options.onDelete?.(site)}
							>
								{t`Delete`}
							</Button>
						)}
					</div>
				);
			},
		},
	];
}
