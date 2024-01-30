import {Link, Outlet, useNavigate} from "react-router-dom";
import {useMutationState} from "@tanstack/react-query";
import type {Mutation, MutationState} from "@tanstack/query-core";

const isPaused = (mutationState: MutationState) => mutationState.isPaused;

export const Layout = () => {
  const navigate = useNavigate();

  const pausedMutations = useMutationState({
    filters: {
      predicate: (mutation: Mutation) => isPaused(mutation.state)
    }
  });

  return <div>
    {pausedMutations.length !== 0 &&
        <div style={{background: "yellow", padding: "1rem"}}>
            <p style={{margin: 0}}>You have {pausedMutations.length} paused queries</p>
            <Link to={"/sync"}>Go to sync</Link>
        </div>
    }
    <Outlet/>
    <div>
      <button onClick={() => navigate(-1)}>Back</button>
      <button onClick={() => navigate("/")}>List view</button>
      <button onClick={() => navigate("/sync")}>Sync view</button>
    </div>
  </div>
}
