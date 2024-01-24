import type {MutationKey, QueryClient} from "@tanstack/react-query";

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
 * or are pending while online
 */
export const clearPreviousMutations = ({mutationKey, queryClient}: ClearMutationsProps) => {
  const mutationCache = queryClient.getMutationCache();
  const existingPausedMutations = mutationCache.findAll({mutationKey})
    .filter(mutation => mutation.state.isPaused);
  // Mutate original list
  existingPausedMutations.sort((mutA, mutB) => {
    return mutA.state.submittedAt - mutB.state.submittedAt;
  })
  // The most recent offline mutation should be persisted
  existingPausedMutations.pop()
  for (const mutation of existingPausedMutations) {
    mutationCache.remove(mutation)
  }
}
