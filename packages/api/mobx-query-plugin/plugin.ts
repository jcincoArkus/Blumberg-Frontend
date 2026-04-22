import { $ } from "@hey-api/openapi-ts";

import type { MobxQueryPlugin } from "./types";

const classToUse = {
	query: "ObservedQuery",
	mutation: "ObservedMutation",
} as const;

const typeToUse = {
	query: "QueryOptions",
	mutation: "MutationOptions",
} as const;

const roleToUse = {
	query: "queryOptions",
	mutation: "mutationOptions",
} as const;

// File names for each type (without .gen.ts extension)
const fileNames = {
	query: "mobx-query",
	mutation: "mobx-mutation",
} as const;

type OperationType = keyof typeof classToUse;

/**
 * Creates a wrapper function for a query or mutation operation.
 * Queries and mutations are routed to separate files using getFilePath.
 */
function createMobxWrapper({
	operation,
	plugin,
	type,
}: {
	operation: { id: string };
	plugin: MobxQueryPlugin["Instance"];
	type: OperationType;
}): void {
	const operationId = operation.id;
	const MobxClass = classToUse[type];
	const optionsTypeName = typeToUse[type];
	const fileName = fileNames[type];
	const role = roleToUse[type];

	// Get references to external symbols from ~@/mobx
	const symbolMobxClass = plugin.external(`~@/mobx.${MobxClass}`);
	const symbolOptionsType = plugin.external(`~@/mobx.${optionsTypeName}`);

	// Get reference to the tanstack-query options function for this operation
	const symbolTanstackOptions = plugin.querySymbol({
		category: "hook",
		resource: "operation",
		resourceId: operationId,
		role,
	});

	if (!symbolTanstackOptions) {
		return;
	}

	// Get reference to the Data type for this operation (e.g., AccountListData)
	// The typescript plugin registers these with role: 'data'
	const symbolDataType = plugin.querySymbol({
		category: "type",
		resource: "operation",
		resourceId: operationId,
		role: "data",
	});

	// Create the wrapper function name: e.g., "getUserObservedQuery" or "createUserObservedMutation"
	const wrapperName = `${operationId}${MobxClass}`;
	const symbolWrapper = plugin.symbol(wrapperName, {
		// Use getFilePath to route to the correct file based on type
		getFilePath: () => fileName,
		meta: {
			category: "hook",
			resource: "operation",
			resourceId: operationId,
			role: `mobx-${type}`,
			tool: plugin.name,
		},
	});

	// Build the type for observerOptions parameter:
	// QueryOptions<typeof getUserOptions> or MutationOptions<typeof createUserMutation>
	const observerOptionsType = $.type(symbolOptionsType).generic(
		$(symbolTanstackOptions).typeofType(),
	);

	// Build the type for defaultValues parameter:
	// Partial<GetUserData> or undefined if no data type exists
	const defaultValuesType = symbolDataType
		? $.type("Partial").generic(symbolDataType)
		: $.type("undefined");

	// Create the statement:
	// export const getUserObservedQuery = (defaultValues?, observerOptions?) =>
	//   new ObservedQuery(getUserOptions, defaultValues, observerOptions);
	const statement = $.const(symbolWrapper)
		.export()
		.assign(
			$.func()
				.param("defaultValues", (p) => p.optional().type(defaultValuesType))
				.param("observerOptions", (p) => p.optional().type(observerOptionsType))
				.do(
					$.return(
						$.new(symbolMobxClass).args(
							$(symbolTanstackOptions),
							$("defaultValues"),
							$("observerOptions"),
						),
					),
				),
		);

	plugin.node(statement);
}

export const handler: MobxQueryPlugin["Handler"] = ({ plugin }) => {
	// Register external symbols from ~@/mobx
	plugin.symbol("ObservedQuery", {
		external: "~@/mobx",
		meta: { category: "external", resource: "~@/mobx.ObservedQuery" },
	});
	plugin.symbol("ObservedMutation", {
		external: "~@/mobx",
		meta: { category: "external", resource: "~@/mobx.ObservedMutation" },
	});
	plugin.symbol("QueryOptions", {
		external: "~@/mobx",
		kind: "type",
		meta: { category: "external", resource: "~@/mobx.QueryOptions" },
	});
	plugin.symbol("MutationOptions", {
		external: "~@/mobx",
		kind: "type",
		meta: { category: "external", resource: "~@/mobx.MutationOptions" },
	});

	const reactQueryPlugin = plugin.getPlugin("@tanstack/react-query");
	if (!reactQueryPlugin) {
		throw new Error("React-Query plugin not loaded! Add @tanstack/react-query to your plugins.");
	}

	plugin.forEach(
		"operation",
		({ operation }) => {
			if (plugin.hooks.operation.isQuery(operation)) {
				createMobxWrapper({ operation, plugin, type: "query" });
			}

			if (plugin.hooks.operation.isMutation(operation)) {
				createMobxWrapper({ operation, plugin, type: "mutation" });
			}
		},
		{ order: "declarations" },
	);
};
