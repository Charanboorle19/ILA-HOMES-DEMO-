import { Component, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Character from './Character'

/**
 * Catches load/runtime errors from the Canvas tree and shows a readable message.
 */
class SceneErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error) {
    console.error('3D scene error:', error)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="viewer-error" role="alert">
          <h1>Could not load 3D character</h1>
          <p>
            Failed to load <code>/models/ila-guide-v01.glb</code>. Check that the
            file exists in <code>public/models/</code> and that the browser
            console has no network errors.
          </p>
          <p className="viewer-error-detail">{this.state.error.message}</p>
        </div>
      )
    }

    return this.props.children
  }
}

function SceneContent({ isRunning, speed }) {
  return (
    <>
      <color attach="background" args={['#1a1a1e']} />

      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        castShadow={false}
      />
      <directionalLight position={[-4, 3, -2]} intensity={0.35} />

      <Suspense fallback={null}>
        <Character isRunning={isRunning} speed={speed} />
      </Suspense>

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        target={[0, 0.8, 0]}
        minDistance={1}
        maxDistance={12}
      />
    </>
  )
}

/**
 * Full-viewport React Three Fiber scene with camera, lights, and controls.
 */
export default function Scene({ isRunning = false, speed = 2 }) {
  return (
    <SceneErrorBoundary>
      <div className="viewer">
        <Canvas
          camera={{ position: [0, 1.4, 3.2], fov: 45, near: 0.1, far: 100 }}
          gl={{ antialias: true }}
        >
          <SceneContent isRunning={isRunning} speed={speed} />
        </Canvas>
      </div>
    </SceneErrorBoundary>
  )
}
