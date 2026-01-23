/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Deep merge helper for nested objects
 * @param target - The target object (defaults)
 * @param source - The source object (runtime values)
 * @returns Merged object with source values taking precedence
 */
function deepMerge(target: any, source: any): any {
	if (!source) return target;
	if (!target) return source;

	// If either is not an object, source wins
	if (typeof target !== "object" || typeof source !== "object") {
		return source;
	}

	// Handle arrays - source replaces target
	if (Array.isArray(source)) {
		return source;
	}

	// Deep merge objects
	const merged = { ...target };
	for (const key in source) {
		if (Object.prototype.hasOwnProperty.call(source, key)) {
			if (typeof source[key] === "object" && source[key] !== null && !Array.isArray(source[key])) {
				merged[key] = deepMerge(target[key], source[key]);
			} else {
				merged[key] = source[key];
			}
		}
	}
	return merged;
}

/**
 * Merge default values with provided arguments.
 * This function combines default values with runtime arguments,
 * with runtime arguments taking precedence.
 *
 * @param defaultValues - Default values to use
 * @param args - Runtime arguments
 * @returns Merged parameters
 */
export function mergeDefaults<T extends readonly unknown[]>(
	defaultValues: unknown | undefined,
	args: T,
): T {
	if (!defaultValues) {
		return args;
	}

	// If no args provided, use defaults directly
	if (!args || args.length === 0) {
		return [defaultValues] as unknown as T;
	}

	// Get the first argument
	const [firstArg, ...restArgs] = args;

	// If firstArg is never or undefined, just return defaults
	if (firstArg === undefined || firstArg === null) {
		return [defaultValues, ...restArgs] as unknown as T;
	}

	// Type-safe deep merge of objects
	if (typeof firstArg === "object" && typeof defaultValues === "object") {
		const merged = deepMerge(defaultValues, firstArg);
		return [merged, ...restArgs] as unknown as T;
	}

	// If types don't match or aren't objects, return args as-is
	return args;
}
