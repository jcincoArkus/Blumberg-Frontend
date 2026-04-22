import type { FC } from "react";

import type { DataTableSearchInputProps } from "~@/data-table";
import { t } from "~@/i18n/macro";

import { Input } from "../Input";

/**
 * SearchInput Component
 * Provides search functionality with optional title
 */
export const SearchInput: FC<DataTableSearchInputProps> = ({
	value,
	onChange,
	placeholder = t`Search...`,
	title,
}) => {
	return (
		<div className="flex items-center justify-between gap-4 p-4">
			{title && <h2 className="text-2xl font-bold">{title}</h2>}
			<div className="flex-1 max-w-sm">
				<Input
					type="search"
					placeholder={placeholder}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					className="w-full"
				/>
			</div>
		</div>
	);
};
