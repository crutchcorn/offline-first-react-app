import type {MutationState} from "@tanstack/query-core";
import type {CustomerContexts} from "../constants/query-keys.ts";

export const mutationHasConflicts = (mutationState: MutationState<unknown, Error, unknown, unknown>) => (mutationState.context as CustomerContexts)?.status === "conflict";
