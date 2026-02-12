import { Link } from "react-router";

import type { EquipmentResponse } from "~@/api";
import type { DataTableProps } from "~@/data-table";
import { t } from "~@/i18n/macro";
import { Button } from "~@/ui";

export function getEquipmentColumns(options: {
	onDelete?: (equipment: EquipmentResponse) => void;
	siteId?: string | null;
}): DataTableProps<EquipmentResponse>["columns"] {
	return [
		{
			accessorKey: "name",
			header: t`Name`,
			cell: ({ row }) => {
				const eq = row.original;
				const id = eq.id;
				const name = eq.name ?? t`Unnamed`;
				if (!id) return name;
				return (
					<Link
						to={options.siteId ? `/sites/${options.siteId}/equipment/${id}` : `/equipment/${id}`}
						className="font-medium text-primary hover:underline"
					>
						{name}
					</Link>
				);
			},
		},
		{
			accessorKey: "equipmentType",
			header: t`Type`,
			cell: ({ row }) => (row.original.equipmentType ?? "—") as string,
		},
		{
			accessorKey: "siteName",
			header: t`Site`,
			cell: ({ row }) => {
				const eq = row.original;
				const name = eq.siteName ?? t`—`;
				const id = eq.siteId;
				if (!id) return name;
				return (
					<Link to={`/sites/${id}`} className="text-primary hover:underline">
						{name}
					</Link>
				);
			},
		},
		{
			id: "actions",
			header: "",
			enableSorting: false,
			size: 120,
			cell: ({ row }) => {
				const eq = row.original;
				const id = eq.id;
				const siteId = options.siteId ?? eq.siteId;
				if (!id) return null;
				const editTo = siteId ? `/sites/${siteId}/equipment/${id}/edit` : `/equipment/${id}/edit`;
				return (
					<div className="flex items-center gap-2">
						<Button variant="ghost" size="sm" asChild>
							<Link to={editTo}>{t`Edit`}</Link>
						</Button>
						{options.onDelete && (
							<Button
								variant="ghost"
								size="sm"
								className="text-destructive hover:text-destructive"
								onClick={() => options.onDelete?.(eq)}
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
