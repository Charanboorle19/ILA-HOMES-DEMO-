import { forwardRef, useEffect, useRef, useState } from 'react'

/**
 * Shared MapLibre master-plan embed (satellite + Sark Green GeoJSON layout).
 * Assets live in /public/master-plan (no Mapbox token required).
 */
const MOBILE_QUERY = '(max-width: 900px)'

const MasterPlanMap = forwardRef(function MasterPlanMap(
  {
    className = 'master-plan-map',
    title = 'Sark Green Plains — Master Plan',
    channel = 'hero',
    theme = 'dark',
    origin = null,
    connectivity = null,
    onLoad,
  },
  ref,
) {
  const iframeRef = useRef(null)
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(MOBILE_QUERY).matches : false,
  )

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY)
    const sync = () => setIsMobile(media.matches)
    sync()
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', sync)
      return () => media.removeEventListener('change', sync)
    }
    media.addListener(sync)
    return () => media.removeListener(sync)
  }, [])

  const params = new URLSearchParams({
    v: 'hero-no-page-zoom-1',
    channel,
    theme,
  })
  if (isMobile && channel === 'hero') params.set('mobile', '1')

  function pushConnectivity() {
    const frame = iframeRef.current
    const win = frame?.contentWindow
    if (!win) return
    win.postMessage(
      {
        source: 'ila-host',
        type: 'set-connectivity',
        origin,
        infrastructure: connectivity ?? [],
      },
      '*',
    )
  }

  useEffect(() => {
    if (typeof ref === 'function') ref(iframeRef.current)
    else if (ref) ref.current = iframeRef.current
  }, [ref])

  useEffect(() => {
    pushConnectivity()
  }, [origin, connectivity])

  useEffect(() => {
    function onMessage(event) {
      if (event.data?.source !== 'ila-master-plan') return
      if (event.data?.type !== 'map-ready') return
      if (event.data?.channel && event.data.channel !== channel) return
      pushConnectivity()
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [channel, origin, connectivity])

  return (
    <iframe
      ref={iframeRef}
      className={className}
      key={params.toString()}
      src={`/master-plan/index.html?${params.toString()}`}
      title={title}
      loading="eager"
      referrerPolicy="no-referrer"
      allow="fullscreen"
      onLoad={(event) => {
        pushConnectivity()
        onLoad?.(event)
      }}
    />
  )
})

export default MasterPlanMap
