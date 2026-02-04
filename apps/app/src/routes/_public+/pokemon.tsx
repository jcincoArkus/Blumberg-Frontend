import { flexRender } from "@tanstack/react-table";
import type { FC } from "react";
import { useMemo } from "react";

import {
	type DataItem,
	DataTable,
	type DataTableEmptyStateProps,
	type DataTableErrorStateProps,
	type DataTableLoadingProps,
	type DataTablePaginationProps,
	type DataTableProps,
	type DataTableSearchInputProps,
	type DataTableTableViewProps,
	type ErrorInfo,
	type IDataTableController,
	type StandardQuery,
} from "~@/data-table";
import { makeAutoObservable, runInAction } from "~@/mobx";
import { Button, Input } from "~@/ui";

type PokemonRow = DataItem & {
	id: number;
	name: string;
	url: string;
	spriteUrl: string;
};

function parsePokemonIdFromUrl(url: string): number | null {
	const match = url.match(/\/pokemon\/(\d+)\/?$/);
	return match?.[1] ? Number(match[1]) : null;
}

function getSpriteUrl(id: number): string {
	return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

class PokemonDataTableController implements IDataTableController<PokemonRow> {
	readonly tableId = "pokemon-demo";
	readonly config = {
		paginationBase: 0 as const,
		defaultPageSize: 20,
		searchDebounceMs: 300,
	};

	data: PokemonRow[] = [];
	total: number = 0;
	isLoading = false;
	isFetching = false;
	isError = false;
	error: ErrorInfo | null = null;

	private _abortController: AbortController | null = null;
	private _requestSeq = 0;

	constructor() {
		makeAutoObservable(this);
	}

	dispose(): void {
		this._abortController?.abort();
		this._abortController = null;
	}

	async load(query: StandardQuery): Promise<void> {
		const requestId = ++this._requestSeq;
		const isFirstLoad = this.data.length === 0;
		this._abortController?.abort();
		this._abortController = new AbortController();
		const signal = this._abortController.signal;

		runInAction(() => {
			this.isError = false;
			this.error = null;
			if (isFirstLoad) this.isLoading = true;
			else this.isFetching = true;
		});

		try {
			const search = String(query.search || "")
				.trim()
				.toLowerCase();

			if (search) {
				const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(search)}`, {
					signal,
				});

				// Treat not-found as an empty state instead of an error.
				if (res.status === 404) {
					runInAction(() => {
						this.data = [];
						this.total = 0;
					});
					return;
				}

				if (!res.ok) {
					throw new Error(`PokeAPI error: ${res.status} ${res.statusText}`);
				}

				const json = (await res.json()) as { id: number; name: string };
				const id = json.id;
				runInAction(() => {
					this.data = [
						{
							id,
							name: json.name,
							url: `https://pokeapi.co/api/v2/pokemon/${id}/`,
							spriteUrl: getSpriteUrl(id),
						},
					];
					this.total = 1;
				});
				return;
			}

			const page = Number(query.page ?? 0);
			const limit = Number(query.limit ?? 20);
			const offset = Math.max(0, page) * Math.max(1, limit);

			const res = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`, {
				signal,
			});
			if (!res.ok) {
				throw new Error(`PokeAPI error: ${res.status} ${res.statusText}`);
			}

			const json = (await res.json()) as {
				count: number;
				results: { name: string; url: string }[];
			};

			const items: PokemonRow[] = json.results
				.map((r) => {
					const id = parsePokemonIdFromUrl(r.url);
					if (!id) return null;
					return {
						id,
						name: r.name,
						url: r.url,
						spriteUrl: getSpriteUrl(id),
					} satisfies PokemonRow;
				})
				.filter(Boolean) as PokemonRow[];

			runInAction(() => {
				this.data = items;
				this.total = json.count;
			});
		} catch (e) {
			if (signal.aborted) return;
			if (requestId !== this._requestSeq) return;
			const message = e instanceof Error ? e.message : "Unknown error";
			runInAction(() => {
				this.isError = true;
				this.error = { message };
			});
		} finally {
			// Only the latest request should own the loading flags.
			if (requestId === this._requestSeq) {
				runInAction(() => {
					this.isLoading = false;
					this.isFetching = false;
				});
			}
		}
	}
}

export const getPokemonColumns = (): DataTableProps<PokemonRow>["columns"] =>
	[
		{
			id: "sprite",
			header: "",
			accessorKey: "spriteUrl",
			enableSorting: false,
			size: 40,
			cell: ({ row }) => (
				<img
					alt={row.original.name}
					src={row.original.spriteUrl}
					width={32}
					height={32}
					loading="lazy"
				/>
			),
		},
		{
			accessorKey: "id",
			header: "ID",
			enableSorting: false,
			size: 80,
		},
		{
			accessorKey: "name",
			header: "Name",
			enableSorting: false,
		},
		{
			accessorKey: "url",
			header: "URL",
			enableSorting: false,
			cell: ({ row }) => (
				<a
					className="text-blue-600 underline"
					href={row.original.url}
					target="_blank"
					rel="noreferrer"
				>
					{row.original.url}
				</a>
			),
		},
	] satisfies DataTableProps<PokemonRow>["columns"];

const TableView: FC<DataTableTableViewProps<PokemonRow>> = ({ table, onRowClick, isFetching }) => {
	return (
		<div className="overflow-auto rounded-lg border border-gray-200 bg-white">
			{isFetching ? <div className="px-3 py-2 text-xs text-gray-500">Fetching…</div> : null}
			<table className="w-full border-collapse text-sm">
				<thead className="bg-gray-50">
					{table.getHeaderGroups().map((hg) => (
						<tr key={hg.id}>
							{hg.headers.map((header) => (
								<th key={header.id} className="px-3 py-2 text-left font-semibold text-gray-700">
									{header.isPlaceholder
										? null
										: flexRender(header.column.columnDef.header, header.getContext())}
								</th>
							))}
						</tr>
					))}
				</thead>
				<tbody>
					{table.getRowModel().rows.map((row) => (
						<tr
							key={row.id}
							className="border-t border-gray-100 hover:bg-gray-50"
							onClick={() => onRowClick?.(row.original, row.index)}
						>
							{row.getVisibleCells().map((cell) => (
								<td key={cell.id} className="px-3 py-2 align-middle">
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

const Pagination: FC<DataTablePaginationProps> = ({
	pagination,
	onPageChange,
	onPageSizeChange,
}) => {
	const totalPages = Math.max(1, pagination.totalPages);
	return (
		<div className="mt-3 flex flex-wrap items-center justify-between gap-2">
			<div className="text-sm text-gray-600">
				Page {pagination.currentPage} of {totalPages} • {pagination.totalItems} total
			</div>
			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					disabled={!pagination.hasPreviousPage}
					onClick={() => onPageChange(pagination.currentPage - 1)}
				>
					Prev
				</Button>
				<Button
					variant="outline"
					size="sm"
					disabled={!pagination.hasNextPage}
					onClick={() => onPageChange(pagination.currentPage + 1)}
				>
					Next
				</Button>
				<select
					className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm"
					value={pagination.pageSize}
					onChange={(e) => onPageSizeChange(Number(e.target.value))}
				>
					{[10, 20, 50].map((n) => (
						<option key={n} value={n}>
							{n} / page
						</option>
					))}
				</select>
			</div>
		</div>
	);
};

const SearchInput: FC<DataTableSearchInputProps> = ({ value, onChange, placeholder }) => {
	return (
		<div className="mb-3 max-w-md">
			<Input
				value={value}
				onChange={onChange}
				placeholder={placeholder || "Search by name or id"}
			/>
			<div className="mt-1 text-xs text-gray-500">
				Search is exact match (PokeAPI /pokemon/:name)
			</div>
		</div>
	);
};

const Loading: FC<DataTableLoadingProps> = ({ message }) => {
	return <div className="py-6 text-sm text-gray-600">{message || "Loading…"}</div>;
};

const EmptyState: FC<DataTableEmptyStateProps> = ({ title, message }) => {
	return (
		<div className="rounded-lg border border-gray-200 bg-white p-6">
			<div className="text-lg font-semibold">{title || "No results"}</div>
			<div className="mt-1 text-sm text-gray-600">{message || "Try a different search."}</div>
		</div>
	);
};

const ErrorState: FC<DataTableErrorStateProps> = ({ title, message, error, onRetry }) => {
	return (
		<div className="rounded-lg border border-red-200 bg-white p-6">
			<div className="text-lg font-semibold text-red-700">{title || "Error"}</div>
			<div className="mt-1 text-sm text-gray-700">{message || error?.message}</div>
			{onRetry ? (
				<div className="mt-3">
					<Button variant="outline" size="sm" onClick={onRetry}>
						Retry
					</Button>
				</div>
			) : null}
		</div>
	);
};

export default function PokemonRoute() {
	const controller = useMemo(() => new PokemonDataTableController(), []);
	const columns = useMemo(() => getPokemonColumns(), []);

	return (
		<div className="mx-auto max-w-5xl p-6">
			<h1 className="text-2xl font-semibold">Pokémon DataTable demo</h1>
			<p className="mt-1 text-sm text-gray-600">Public page using https://pokeapi.co</p>

			<div className="mt-6">
				<DataTable
					controller={controller}
					columns={columns}
					config={{
						paginationBase: 0,
						defaultPageSize: 20,
						searchDebounceMs: 300,
					}}
					searchPlaceholder="Search by name or id (exact)"
					components={{
						TableView,
						Pagination,
						SearchInput,
						Loading,
						EmptyState,
						ErrorState,
					}}
				/>
			</div>
		</div>
	);
}
