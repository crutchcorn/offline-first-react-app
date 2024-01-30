import {useRef, useState, type EffectCallback, useEffect} from 'react'

/**
 * This hook handles StrictMode and prod mode
 */
export const useEffectOnce = (effect: EffectCallback) => {
  const destroyFunc = useRef<void | (() => void)>()
  const effectCalled = useRef(false)
  const renderAfterCalled = useRef(false)
  const [val, setVal] = useState(0)

  if (effectCalled.current) {
    renderAfterCalled.current = true
  }

  useEffect(() => {
    // only execute the effect first time around
    if (!effectCalled.current) {
      destroyFunc.current = effect()
      effectCalled.current = true
    }

    // this forces one render after the effect is run
    setVal((v) => v + 1)

    return () => {
      // if the comp didn't render since the useEffect was called,
      // we know it's the dummy React cycle
      if (!renderAfterCalled.current) {
        return
      }
      if (destroyFunc.current) {
        destroyFunc.current()
      }
    }
  }, [])
}
