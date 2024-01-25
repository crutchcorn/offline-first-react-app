import {Outlet, useNavigate} from "react-router-dom";
import {useMutationState} from "@tanstack/react-query";
import {useMemo} from "react";

export const Layout = () => {
  const navigate = useNavigate();

  const allMutations = useMutationState({select: mutation => mutation});
  const filteredMutations = useMemo(() => {
    return allMutations
      .filter(mutation => mutation.state.isPaused).length
  }, [allMutations])

  return <div>
    {filteredMutations !== 0 && <p onClick={() => navigate("/sync")}>You have {filteredMutations} paused queries</p>}
    <Outlet/>
  </div>
}
