import { createMongoAbility, type MongoAbility, type MongoQuery } from "@casl/ability";
import { createContextualCan } from "@casl/react";
import { createContext } from "react";

export type Ability = MongoAbility<[string, any], MongoQuery>;

export const ability: Ability = createMongoAbility();

export const AbilityContext = createContext<Ability>(ability);
export const Can = createContextualCan(AbilityContext.Consumer);
