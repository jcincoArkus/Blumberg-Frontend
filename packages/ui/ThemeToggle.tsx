import { Monitor, Moon, Sun } from "lucide-react";

import { t } from "~@/i18n/macro";

import { Button } from "./Button";
import { DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "./DropdownMenu";
import { cn } from "./utils";

/** Mirrors `ThemeMode` from ~@/view-model/theme (ui stays free of view-model imports). */
type ThemeModeOption = "light" | "dark" | "system";

const menuItemClass =
	"cursor-pointer focus:bg-primary focus:text-primary-foreground data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground";

interface ThemeModeMenuProps {
	value: ThemeModeOption;
	onValueChange: (mode: ThemeModeOption) => void;
}

/** Light / Dark / System radio group, meant to live inside a DropdownMenuContent. */
function ThemeModeMenu({ value, onValueChange }: ThemeModeMenuProps) {
	const options = [
		{ value: "light", label: t`Light`, Icon: Sun },
		{ value: "dark", label: t`Dark`, Icon: Moon },
		{ value: "system", label: t`System`, Icon: Monitor },
	] as const;

	return (
		<>
			<DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
				{t`Theme`}
			</DropdownMenuLabel>
			<DropdownMenuRadioGroup
				value={value}
				onValueChange={(next) => onValueChange(next as ThemeModeOption)}
			>
				{options.map(({ value: optionValue, label, Icon }) => (
					<DropdownMenuRadioItem
						key={optionValue}
						value={optionValue}
						className={menuItemClass}
						// Keep the menu open so the user sees the change applied
						onSelect={(e) => e.preventDefault()}
					>
						<Icon className="size-4" aria-hidden />
						{label}
					</DropdownMenuRadioItem>
				))}
			</DropdownMenuRadioGroup>
		</>
	);
}

interface ThemeToggleButtonProps {
	resolvedTheme: "light" | "dark";
	onToggle: () => void;
	className?: string;
}

/** Compact icon button that flips between light and dark. */
function ThemeToggleButton({ resolvedTheme, onToggle, className }: ThemeToggleButtonProps) {
	const isDark = resolvedTheme === "dark";
	const label = isDark ? t`Switch to light theme` : t`Switch to dark theme`;
	return (
		<Button
			type="button"
			variant="ghost"
			size="icon"
			className={cn(
				"text-muted-foreground hover:bg-muted hover:text-foreground dark:hover:bg-muted",
				className,
			)}
			onClick={onToggle}
			aria-label={label}
			title={label}
		>
			{isDark ? <Sun className="size-5" aria-hidden /> : <Moon className="size-5" aria-hidden />}
		</Button>
	);
}

export { ThemeModeMenu, type ThemeModeMenuProps, ThemeToggleButton, type ThemeToggleButtonProps };
