// This is the new implementation of useMutationState
// @see https://github.com/TanStack/query/pull/6758
'use client'
import * as React from 'react'

import { notifyManager, replaceEqualDeep } from '@tanstack/query-core'
import { useQueryClient } from '@tanstack/react-query'
import type {
  DefaultError,
  Mutation,
  MutationCache,
  MutationFilters,
  MutationState,
  QueryClient,
} from '@tanstack/query-core'

type MutationStateOptions<TResult = MutationState> = {
  filters?: MutationFilters
  select?: (
    mutation: Mutation<unknown, DefaultError, unknown, unknown>,
  ) => TResult
}

function getResult<TResult = MutationState>(
  mutationCache: MutationCache,
  options: MutationStateOptions<TResult>,
): Array<TResult> {
  return mutationCache
    .findAll(options.filters)
    .map(
      (mutation): TResult =>
        (options.select
          ? options.select(
            mutation as Mutation<unknown, DefaultError, unknown, unknown>,
          )
          : mutation.state) as TResult,
    )
}

export function useMutationState<TResult = MutationState>(
  options: MutationStateOptions<TResult> = {},
  queryClient?: QueryClient,
): Array<TResult> {
  const mutationCache = useQueryClient(queryClient).getMutationCache()
  const optionsRef = React.useRef(options)
  const result = React.useRef<Array<TResult>>()
  if (!result.current) {
    result.current = getResult(mutationCache, options)
  }

  React.useEffect(() => {
    optionsRef.current = options
  })

  return React.useSyncExternalStore(
    React.useCallback(
      (onStoreChange) =>
        mutationCache.subscribe(notifyManager.batchCalls(onStoreChange)),
      [mutationCache],
    ),
    () => {
      const nextResult = replaceEqualDeep(
        result.current,
        getResult(mutationCache, optionsRef.current),
      )
      if (result.current !== nextResult) {
        result.current = nextResult
      }

      return result.current
    },
    () => result.current,
  )!
}
