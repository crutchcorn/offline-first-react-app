import type { QueryClient } from "@tanstack/react-query";
import type { Mutation } from "@tanstack/query-core";
import { stabilizeMutationKeys } from "./key-handling";

interface SanitizeMutationCacheProps {
	queryClient: QueryClient;
}

/**
 * Since we are dehydrating _all_ mutations, regardless of if there are other keys that are the same,
 * we need to ensure that rehydrated mutations are only of the most recent mutation.
 *
 * TODO: Ideally at some point in the future we should clean up the cache during the dehydration check in App.tsx.
 */
export function sanitizeMutationCache({
	queryClient,
}: SanitizeMutationCacheProps) {
	const mutationCache = queryClient.getMutationCache();
	const mutations = mutationCache.getAll();
	const mutationKeys = new Map<string, Mutation>();
	for (const mutation of mutations) {
		const stableMutationKey = stabilizeMutationKeys(
			mutation.options.mutationKey!,
		);
		if (mutationKeys.has(stableMutationKey)) {
			// Check if the mutation is newer than the one we have stored
			const existingMutation = mutationKeys.get(stableMutationKey)!;
			if (mutation.state.submittedAt > existingMutation.state.submittedAt) {
				mutationKeys.set(stableMutationKey, mutation);
			} else {
				mutationCache.remove(mutation);
			}
		} else {
			mutationKeys.set(stableMutationKey, mutation);
		}
	}
}
