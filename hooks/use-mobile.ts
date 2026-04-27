"use client" 

import { useSyncExternalStore } from "react" 

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const subscribe = (onStoreChange: () => void) => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    mql.addEventListener("change", onStoreChange)

    return () => mql.removeEventListener("change", onStoreChange)
  }

  const getSnapshot = () => {
    return window.innerWidth < MOBILE_BREAKPOINT
  }

  const getServerSnapshot = () => false

  const isMobile = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  return isMobile
}