import { useEffect, useState } from 'react'

export interface ViewportSize {
  width: number
  height: number
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isPortrait: boolean
  isLandscape: boolean
}

/**
 * Hook to track viewport size and device type
 *
 * Breakpoints:
 * - Mobile: < 768px
 * - Tablet: 768px - 1023px
 * - Desktop: >= 1024px
 *
 * @example
 * ```tsx
 * const { isMobile, width } = useViewport()
 *
 * if (isMobile) {
 *   return <MobileView />
 * }
 * return <DesktopView />
 * ```
 */
export function useViewport(): ViewportSize {
  const [viewport, setViewport] = useState<ViewportSize>(() => {
    // Initialize with current window size
    const width = window.innerWidth
    const height = window.innerHeight

    return {
      width,
      height,
      isMobile: width < 768,
      isTablet: width >= 768 && width < 1024,
      isDesktop: width >= 1024,
      isPortrait: height > width,
      isLandscape: width >= height,
    }
  })

  useEffect(() => {
    let timeoutId: number | undefined

    const handleResize = () => {
      // Debounce resize events to avoid performance issues
      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }

      timeoutId = window.setTimeout(() => {
        const width = window.innerWidth
        const height = window.innerHeight

        setViewport({
          width,
          height,
          isMobile: width < 768,
          isTablet: width >= 768 && width < 1024,
          isDesktop: width >= 1024,
          isPortrait: height > width,
          isLandscape: width >= height,
        })
      }, 100) // 100ms debounce
    }

    window.addEventListener('resize', handleResize)

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return viewport
}
