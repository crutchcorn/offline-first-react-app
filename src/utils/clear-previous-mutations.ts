import type { MutationKey, QueryClient } from "@tanstack/react-query";

interface ClearMutationsProps {
	mutationKey: MutationKey;
	queryClient: QueryClient;
}

/**
 * Clears all previous mutations for a given mutation key
 *
 * We do this to ensure:
 * - Avoiding race conditions to the server from previous mutations
 * - Makes it easier to show how many offline mutations are pending
 *
 * This shouldn't impact any mutations that are currently in flight
 */
export const clearPreviousMutations = ({
	mutationKey,
	queryClient,
}: ClearMutationsProps) => {
	const mutationCache = queryClient.getMutationCache();
	const existingMutations = mutationCache
		.findAll({ mutationKey })
		.filter(
			(mutation) =>
				mutation.state.isPaused ||
				mutation.state.status === "idle" ||
				mutation.state.status === "error" ||
				mutation.state.status === "success",
		);
	// Mutate original list
	existingMutations.sort((mutA, mutB) => {
		return mutA.state.submittedAt - mutB.state.submittedAt;
	});
	// The most recent offline mutation should be persisted
	existingMutations.pop();
	for (const mutation of existingMutations) {
		mutationCache.remove(mutation);
	}
};
