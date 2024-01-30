import type {MutationState} from "@tanstack/query-core";
import type {KeyRecordContexts} from "../constants/query-keys.ts";

export const mutationHasConflicts = (mutationState: MutationState<unknown, Error, unknown, unknown>) => (mutationState.context as KeyRecordContexts)?.status === "conflict";
