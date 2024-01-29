import {useMutationState} from "../hooks/useMutationState";
import {useMemo} from "react";

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
  const allMutations = useMutationState({
    select: mutation => mutation
  });

  const sortedMutations = useMemo(() => {
    return [...allMutations].sort((a, b) => {
      return b.state.submittedAt - a.state.submittedAt;
    })
  }, [allMutations])

  return <div>
    <h1>Sync</h1>
    {sortedMutations.length === 0 && <p>No recent queries</p>}
    {sortedMutations.length !== 0 && <div>
        <h2>{sortedMutations.length} items</h2>
        <ul>
          {sortedMutations.map(mutation => {
            return <li key={mutation.mutationId}>
              <p>{JSON.stringify(mutation)}</p>
              <button onClick={() => mutation.continue()}>Resume</button>
            </li>
          })}
        </ul>
    </div>
    }
  </div>
}
