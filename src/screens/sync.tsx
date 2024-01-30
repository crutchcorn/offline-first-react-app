import {useMutationState} from "../hooks/useMutationState";
import {useMemo} from "react";
import {mutationHasConflicts} from "../utils/mutations-utils.ts";
import type {Mutation} from "@tanstack/query-core";
import {type customerKeys, type GetKeyContext, type GetKeyData, getKeyRecordFromKey} from "../constants/query-keys.ts";
import {stringify} from "superjson";

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
    <h1>Client {"<->"} Server Sync</h1>
    {sortedMutations.length === 0 && <p>No recent queries</p>}
    {sortedMutations.length !== 0 && <div>
        <h2>{sortedMutations.length} items</h2>
        <ul>
          {sortedMutations.map((mutation, i) => {
            return <li key={mutation.mutationId}>
              <MutationSwitchCase mutation={mutation} index={i}/>
              <button onClick={() => void mutation.continue()}>View details</button>
            </li>
          })}
        </ul>
    </div>
    }
  </div>
}

interface MutationSwitchCaseProps {
  mutation: Mutation<unknown, Error, unknown, unknown>
  index: number
}

function MutationSwitchCase({mutation, index}: MutationSwitchCaseProps) {
  const matchedKeyMeta = useMemo(() => getKeyRecordFromKey(mutation.options.mutationKey!, mutation.state.variables), [mutation]);
  switch (matchedKeyMeta?.type) {
    case "person":
      return <PersonListDetails mutation={mutation} index={index}/>
    default:
      return null;
  }
}

interface PersonListDetailsProps {
  index: number;
  mutation: Mutation<unknown, Error, unknown, unknown>
}

function PersonListDetails({mutation: _mutation, index: i}: PersonListDetailsProps) {
  const mutation = _mutation as never as Mutation<GetKeyData<typeof customerKeys.details>, Error, GetKeyData<typeof customerKeys.details>, GetKeyContext<typeof customerKeys.details>>;
  const hasConflict = useMemo(() => mutationHasConflicts(mutation.state), [mutation]);

  const statusEl = useMemo(() => {
    const pendingOrIdle = <span
      style={{paddingRight: '1rem', paddingLeft: '1rem', background: "lightyellow", color: "black"}}>Pending</span>;

    if (hasConflict) {
      return <span style={{
        paddingRight: '1rem',
        paddingLeft: '1rem',
        background: "darkred",
        color: "white"
      }}>Conflicting with the server</span>
    }

    if (mutation.state.isPaused) {
      return pendingOrIdle;
    }

    switch (mutation.state.status) {
      case "error":
        return <span style={{
          paddingRight: '1rem',
          paddingLeft: '1rem',
          background: "darkred",
          color: "white"
        }}>Error: {stringify(mutation.state.error)}</span>
      case "success":
        return <span
          style={{paddingRight: '1rem', paddingLeft: '1rem', background: "darkgreen", color: 'white'}}>Success</span>
      case "idle":
      case "pending":
      default:
        return pendingOrIdle;
    }
  }, [mutation, hasConflict])

  return (
    <>
      <p>Item {i}</p>
      <p>Type: Person</p>
      <p>Status: {statusEl}</p>
      <p>Name: {mutation.state.variables?.name}</p>
      <p>Age: {mutation.state.variables?.age}</p>
    </>
  )
}
