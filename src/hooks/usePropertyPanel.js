import { useCallback, useEffect, useState } from 'react'
import { propertyLayouts } from '../data/propertyLayouts'

export function usePropertyPanel() {
  const [activeProperty, setActiveProperty] = useState(null)

  const openPanel = useCallback((propertyId) => {
    setActiveProperty(
      propertyLayouts.find((property) => property.id === propertyId) ?? null,
    )
  }, [])

  const closePanel = useCallback(() => {
    setActiveProperty(null)
  }, [])

  useEffect(() => {
    if (!activeProperty) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closePanel()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [activeProperty, closePanel])

  return { activeProperty, openPanel, closePanel }
}

export default usePropertyPanel
