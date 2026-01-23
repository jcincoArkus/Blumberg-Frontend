/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AnyUseMutationOptions, AnyUseQueryOptions } from "@tanstack/react-query";

/**
 * Type definition for query input functions that return React Query options.
 * These functions take parameters and return query configuration objects.
 */
export type QueryInput = (...args: never[]) => AnyUseQueryOptions;

/**
 * Extracts the data type that a query function will return.
 * This utility type looks at the queryFn return type and extracts the awaited result.
 */
export type ExtractQueryData<T extends QueryInput> = T extends QueryInput
	? NonNullable<ReturnType<T>["queryFn"]> extends (...args: any[]) => infer R
		? Awaited<R>
		: never
	: never;

/**
 * Extracts query options excluding internal React Query properties.
 * Removes queryKey, queryFn, and any properties starting with underscore.
 */
export type QueryOptions<T extends QueryInput> = Omit<
	ReturnType<T>,
	"queryKey" | "queryFn" | `_${string}`
>;

/**
 * Type definition for mutation input functions that return React Query mutation options.
 * These functions take parameters and return mutation configuration objects.
 */
export type MutationInput = (...args: never[]) => AnyUseMutationOptions;

/**
 * Extracts the data type that a mutation function will return.
 * This utility type looks at the mutationFn return type and extracts the awaited result.
 */
export type ExtractMutationData<T extends MutationInput> = T extends MutationInput
	? NonNullable<ReturnType<T>["mutationFn"]> extends (...args: any[]) => infer R
		? Awaited<R>
		: never
	: never;

/**
 * Extracts mutation options excluding internal React Query properties.
 * Removes mutationKey, mutationFn, and any properties starting with underscore.
 */
export type MutationOptions<T extends MutationInput> = Omit<
	ReturnType<T>,
	"mutationKey" | "mutationFn" | `_${string}`
>;
