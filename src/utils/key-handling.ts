import type { MutationKey } from "@tanstack/react-query";

/**
 * A map is reference sensitive, so we need to stabilize the mutation key away from being a referentially unstable array.
 */
export function stabilizeMutationKeys(mutationKey: MutationKey): string {
	return mutationKey.join(",");
}
