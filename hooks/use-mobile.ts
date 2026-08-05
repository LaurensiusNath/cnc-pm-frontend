import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Lazy initializer instead of the shadcn-generated version's sync
  // setState call inside the effect body below - react-hooks/set-state-in-effect
  // (already enforced project-wide, see CLAUDE.md's "adjust state during
  // render" note) flags that pattern. The effect below now only
  // subscribes to the external matchMedia change event, which IS the
  // legitimate use of useEffect.
  const [isMobile, setIsMobile] = React.useState<boolean>(
    () => typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT,
  )

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}
