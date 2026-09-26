import { useEffect, useState } from "react";

import { makeAutoObservable, reaction } from "~@/mobx";

/** User preference. "system" follows the OS `prefers-color-scheme` live. */
export type ThemeMode = "light" | "dark" | "system";
/** The theme actually painted on screen. */
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "blumberg.theme";
const DEFAULT_MODE: ThemeMode = "light";
const DARK_QUERY = "(prefers-color-scheme: dark)";

function isThemeMode(value: unknown): value is ThemeMode {
	return value === "light" || value === "dark" || value === "system";
}

function readStoredMode(): ThemeMode {
	try {
		const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
		return isThemeMode(stored) ? stored : DEFAULT_MODE;
	} catch {
		return DEFAULT_MODE;
	}
}

function writeStoredMode(mode: ThemeMode) {
	try {
		window.localStorage.setItem(THEME_STORAGE_KEY, mode);
	} catch {
		// Storage unavailable (private mode, blocked site data): the choice lasts for this page load only.
	}
}

/**
 * Inline, render-blocking script for the document <head>. Applies the persisted theme before first paint so
 * dark-mode users never see a light flash. Must stay in sync with ThemeViewModel's resolution logic.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var m=localStorage.getItem(${JSON.stringify(
	THEME_STORAGE_KEY,
)});var d=m==="dark"||(m==="system"&&window.matchMedia(${JSON.stringify(
	DARK_QUERY,
)}).matches);var r=document.documentElement;r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light";}catch(e){}})();`;

/**
 * Global theme controller (singleton). Owns the light/dark/system preference, persists it in localStorage,
 * tracks the OS preference and keeps the `dark` class + `color-scheme` on <html> in sync.
 */
class ThemeViewModel {
	mode: ThemeMode = DEFAULT_MODE;
	systemPrefersDark = false;

	constructor() {
		makeAutoObservable(this);
		if (typeof window === "undefined") return;

		this.mode = readStoredMode();

		const media = window.matchMedia?.(DARK_QUERY);
		if (media) {
			this.systemPrefersDark = media.matches;
			media.addEventListener("change", (e) => this.setSystemPrefersDark(e.matches));
		}

		// Keep several open tabs in sync
		window.addEventListener("storage", (e) => {
			if (e.key === THEME_STORAGE_KEY)
				this.applyMode(isThemeMode(e.newValue) ? e.newValue : DEFAULT_MODE);
		});

		reaction(
			() => this.resolvedTheme,
			(theme) => applyToDocument(theme),
			{ fireImmediately: true },
		);
	}

	/** "light" or "dark" — what is on screen right now. */
	get resolvedTheme(): ResolvedTheme {
		if (this.mode === "system") return this.systemPrefersDark ? "dark" : "light";
		return this.mode;
	}

	get isDark(): boolean {
		return this.resolvedTheme === "dark";
	}

	/** Change and persist the preference. */
	setMode(mode: ThemeMode) {
		this.applyMode(mode);
		writeStoredMode(mode);
	}

	/** Flip between explicit light and dark (based on what is currently shown). */
	toggle() {
		this.setMode(this.isDark ? "light" : "dark");
	}

	/**
	 * Re-apply the class/color-scheme to <html>. React clears attributes on the <html> singleton when it
	 * (re)renders the document, so the root Layout calls this in a layout effect after hydration.
	 */
	syncDocument() {
		if (typeof document !== "undefined") applyToDocument(this.resolvedTheme);
	}

	applyMode(mode: ThemeMode) {
		this.mode = mode;
	}

	setSystemPrefersDark(value: boolean) {
		this.systemPrefersDark = value;
	}
}

function applyToDocument(theme: ResolvedTheme) {
	const root = document.documentElement;
	root.classList.toggle("dark", theme === "dark");
	root.style.colorScheme = theme;
}

export const themeViewModel = new ThemeViewModel();

/**
 * Resolved theme for components that are not MobX observers (e.g. third-party map/chart wrappers).
 * Observer components can read `themeViewModel.resolvedTheme` directly.
 */
export function useResolvedTheme(): ResolvedTheme {
	const [theme, setTheme] = useState<ResolvedTheme>(themeViewModel.resolvedTheme);
	useEffect(
		() =>
			reaction(
				() => themeViewModel.resolvedTheme,
				(next) => setTheme(next),
				{ fireImmediately: true },
			),
		[],
	);
	return theme;
}
