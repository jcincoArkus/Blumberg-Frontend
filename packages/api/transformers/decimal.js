import { $ } from "@hey-api/openapi-ts";

export const Expressions = ({ dataExpression, schema }) => {
	if (schema.type !== "string" || schema.format !== "decimal") {
		return;
	}

	if (dataExpression === undefined) {
		return;
	}

	return [$.new("Decimal").arg(dataExpression)];
};

export const TypeTransformers = ({ schema }) => {
	if (schema.type !== "string" || schema.format !== "decimal") {
		return;
	}

	return $.type("Decimal");
};
