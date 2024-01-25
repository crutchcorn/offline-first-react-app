import {useMutationState} from "@tanstack/react-query";
import {useMemo} from "react";

export const Sync = () => {
  const allMutations = useMutationState({
    select: mutation => mutation
  });

  const filteredMutations = useMemo(() => {
    return allMutations
      .filter(mutation => mutation.state.isPaused)
  }, [allMutations])

  return <div>
    <h1>Sync</h1>
    {filteredMutations.length === 0 && <p>No paused queries</p>}
    {filteredMutations.length !== 0 && <ul>
      {filteredMutations.map(mutation => {
        return <li key={mutation.mutationId}>
          <p>{JSON.stringify(mutation.state.variables)}</p>
          <button onClick={() => mutation.continue()}>Resume</button>
        </li>
      })}
    </ul>}
  </div>
}

