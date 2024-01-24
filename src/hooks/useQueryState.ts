// This will eventually be a hook upstream in TanStack Query
// Source: Me & TkDodo
import { notifyManager, replaceEqualDeep } from '@tanstack/query-core'
import type {
  DefaultError,
  Query,
  QueryCache,
  QueryClient,
  QueryFilters,
  QueryKey,
  QueryState,
} from '@tanstack/query-core'
import {useQueryClient} from "@tanstack/react-query";
import {useCallback, useEffect, useRef, useSyncExternalStore} from "react";

type QueryStateOptions<TResult = QueryState> = {
  filters?: QueryFilters
  select?: (query: Query<unknown, DefaultError, unknown, QueryKey>) => TResult
}

function getResult<TResult = QueryState>(
  queryCache: QueryCache,
  options: QueryStateOptions<TResult>,
): Array<TResult> {
  return queryCache
    .findAll(options.filters)
    .map(
      (query): TResult =>
        (options.select ? options.select(query) : query.state) as TResult,
    )
}

export function useQueryState<TResult = QueryState>(
  options: QueryStateOptions<TResult> = {},
  queryClient?: QueryClient,
): Array<TResult> {
  const queryCache = useQueryClient(queryClient).getQueryCache()
  const optionsRef = useRef(options)
  const result = useRef<Array<TResult>>()
  if (!result.current) {
    result.current = getResult(queryCache, options)
  }

  useEffect(() => {
    optionsRef.current = options
  })

  return useSyncExternalStore(
    useCallback(
      (onStoreChange) =>
        queryCache.subscribe(notifyManager.batchCalls(onStoreChange)),
      [queryCache],
    ),
    () => {
      const nextResult = replaceEqualDeep(
        result.current,
        getResult(queryCache, optionsRef.current),
      )
      if (result.current !== nextResult) {
        result.current = nextResult
      }

      return result.current
    },
    () => result.current,
  )!
}
