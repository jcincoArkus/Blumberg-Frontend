import { Link } from "react-router";

import type { SensorResponse } from "~@/api";
import { SensorStatus } from "~@/api";
import type { DataTableProps } from "~@/data-table";
import { t } from "~@/i18n/macro";
import { Button } from "~@/ui";

function statusLabel(status: SensorStatus | undefined): string {
	switch (status) {
		case SensorStatus._0:
			return t`Active`;
		case SensorStatus._1:
			return t`Inactive`;
		case SensorStatus._2:
			return t`Maintenance`;
		case SensorStatus._3:
			return t`Offline`;
		default:
			return "—";
	}
}

export function getSensorColumns(options: {
	onDelete?: (sensor: SensorResponse) => void;
	equipmentId?: string | null;
	siteId?: string | null;
}): DataTableProps<SensorResponse>["columns"] {
	return [
		{
			accessorKey: "serial",
			header: t`Serial`,
			cell: ({ row }) => {
				const s = row.original;
				const id = s.id;
				const serial = s.serial ?? t`—`;
				if (!id) return serial;
				const detailUrl = `/sensors/${id}`;
				return (
					<Link to={detailUrl} className="font-medium text-primary hover:underline">
						{serial}
					</Link>
				);
			},
		},
		{
			accessorKey: "status",
			header: t`Status`,
			cell: ({ row }) => statusLabel(row.original.status),
		},
		{
			accessorKey: "equipmentName",
			header: t`Equipment`,
			cell: ({ row }) => {
				const s = row.original;
				const name = s.equipmentName ?? "—";
				const id = s.equipmentId;
				if (!id) return name;
				return (
					<Link to={`/equipment/${id}`} className="text-primary hover:underline">
						{name}
					</Link>
				);
			},
		},
		{
			accessorKey: "sensorTypeName",
			header: t`Type`,
			cell: ({ row }) => (row.original.sensorTypeName ?? "—") as string,
		},
		{
			id: "actions",
			header: "",
			enableSorting: false,
			size: 120,
			cell: ({ row }) => {
				const s = row.original;
				const id = s.id;
				if (!id) return null;
				const editTo = `/sensors/${id}/edit`;
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
								onClick={() => options.onDelete?.(s)}
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
