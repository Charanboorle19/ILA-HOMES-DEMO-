import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useAnimations, useGLTF } from '@react-three/drei'

const MODEL_PATH = '/models/ila-guide-v01.glb'
const DEFAULT_SPEED = 2

/**
 * Loads the ILA guide GLB, plays its Mixamo animation, and optionally
 * moves the whole character forward (movement is independent of animation).
 */
export default function Character({ isRunning = false, speed = DEFAULT_SPEED }) {
  const groupRef = useRef(null)
  const { scene, animations } = useGLTF(MODEL_PATH)
  const { actions, names } = useAnimations(animations, groupRef)

  // Existing animation system — unchanged behavior
  useEffect(() => {
    console.log('GLB animation clips:', names)

    if (names.length === 0) {
      console.warn('No animation clips found in the GLB.')
      return
    }

    const firstClipName = names[0]
    const action = actions[firstClipName]

    if (!action) {
      console.warn(`Could not start animation: "${firstClipName}"`)
      return
    }

    action.reset().fadeIn(0.3).play()
    console.log(`Playing animation: "${firstClipName}"`)

    return () => {
      action.fadeOut(0.3)
    }
  }, [actions, names])

  // Movement only — does not touch the animation mixer
  useFrame((_, delta) => {
    if (!isRunning || !groupRef.current) return
    // Forward = -Z (away from the default camera at +Z)
    groupRef.current.position.z -= speed * delta
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]} dispose={null}>
      <primitive object={scene} />
    </group>
  )
}

useGLTF.preload(MODEL_PATH)
