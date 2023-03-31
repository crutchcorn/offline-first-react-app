import { useEffect, useLayoutEffect, useState } from "react";

const isBrowser = typeof window !== "undefined";

const useIsomorphicLayoutEffect = isBrowser ? useLayoutEffect : useEffect;

export const useClientOnly = () => {
  const [isClient, setClient] = useState(false);

  useIsomorphicLayoutEffect(() => {
    setClient(true);
  }, []);

  return isClient;
};
