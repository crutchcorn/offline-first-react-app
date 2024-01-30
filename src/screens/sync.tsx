import {useMutationState} from "../hooks/useMutationState";
import {useMemo} from "react";
import {mutationHasConflicts} from "../utils/mutations-utils.ts";

/**
 * Show all mutations, error, success, and pending (up to 24 hours ago)
 * Show newest first
 * Show conflicts with diffs in the screen alongside the error/success/pending
 * Show conflicts above the other mutations
 * Show conflicts in order of newest first
 * Should be able to click into a mutation and see the details
 * Errored mutations should have a retry button
 * Errored mutations should show the error code and message
 */
export const Sync = () => {
  const allMutations = useMutationState({select: m => m});

  const sortedMutations = useMemo(() => {
    return [...allMutations].sort((a, b) => {
      const baseSort = b.state.submittedAt > a.state.submittedAt ? 1 : -1
      const aHasConflict = mutationHasConflicts(a.state);
      const bHasConflict = mutationHasConflicts(b.state);
      if (aHasConflict && bHasConflict) {
        return baseSort
      }
      if (aHasConflict) {
        return -1
      }
      if (bHasConflict) {
        return 1
      }
      return baseSort
    })
  }, [allMutations])

  return <div>
    <h1>Sync</h1>
    {sortedMutations.length === 0 && <p>No recent queries</p>}
    {sortedMutations.length !== 0 && <div>
        <h2>{sortedMutations.length} items</h2>
        <ul>
          {sortedMutations.map(mutation => {
            const hasConflict = mutationHasConflicts(mutation.state);
            return <li key={mutation.mutationId}>
              <p>Type: <span style={hasConflict ? {
                color: "white",
                background: 'red'
              } : {}}>{hasConflict ? "CONFLICT" : "Mutation"}</span></p>
              <p>{JSON.stringify(mutation)}</p>
              <button onClick={() => mutation.continue()}>Resume</button>
            </li>
          })}
        </ul>
    </div>
    }
  </div>
}
