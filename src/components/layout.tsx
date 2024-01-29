import {Outlet, useNavigate} from "react-router-dom";
import {useMutationState} from "@tanstack/react-query";
import {useMemo} from "react";
import type {Mutation} from "@tanstack/query-core";
import type {CustomerContexts} from "../constants/query-keys.ts";

export const Layout = () => {
  const navigate = useNavigate();

  const allMutations = useMutationState({select: mutation => mutation});
  const filteredMutations = useMemo(() => {
    const pausedMutations: Mutation[] = [];
    const conflictMutations: Mutation[] = [];
    for (const mutation of allMutations) {
      if (mutation.state.isPaused) {
        pausedMutations.push(mutation as Mutation);
      }
      if ((mutation.state.context as CustomerContexts)?.status === "conflict") {
        conflictMutations.push(mutation as Mutation);
      }
    }
    return {hasConflicts: conflictMutations, pausedMutations};
  }, [allMutations])

  // TODO: Do not block the entire app, but rather "lock" the edit for the specific person that was mutated and conflicted
  if (filteredMutations.hasConflicts.length !== 0) {
    return <div>
      <p onClick={() => navigate("/sync")}>You have {filteredMutations.hasConflicts.length} conflicted queries. You need to resolve them before moving forward</p>
      <button onClick={() => navigate("/sync")}>Sync view</button>
    </div>
  }

  return <div>
    {filteredMutations.pausedMutations.length !== 0 &&
        <p onClick={() => navigate("/sync")}>You have {filteredMutations.pausedMutations.length} paused queries</p>}
    <Outlet/>
    <div>
      <button onClick={() => navigate(-1)}>Back</button>
      <button onClick={() => navigate("/")}>List view</button>
      <button onClick={() => navigate("/sync")}>Sync view</button>
    </div>
  </div>
}
