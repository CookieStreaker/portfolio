import React, { Suspense } from 'react';
import { Canvas, useLoader, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import BigBang from './BigBang';
import SolarSystem from './SolarSystem';
import CameraControls from './CameraControls';
import Starfield from './Starfield';
import useStore from '../store/useStore';

function Background() {
  const texture = useLoader(THREE.TextureLoader, '/textures/stars.jpg');
  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[900000, 64, 64]} />
      <meshBasicMaterial 
        map={texture} 
        side={THREE.BackSide}
        transparent
        opacity={0.6}
        depthWrite={false}
      />
    </mesh>
  );
}

function TimeProgression() {
  const { timeScale, currentDate, setCurrentDate, currentView } = useStore();

  useFrame((state, delta) => {
    // Only progress time during solarsystem or planet view
    if (currentView !== 'solarsystem' && currentView !== 'planet') return;

    // Delta is in seconds, timeScale is multiplier
    // Update date by delta * timeScale milliseconds
    const newDate = new Date(currentDate.getTime() + delta * timeScale * 1000);
    setCurrentDate(newDate);
  });

  return null;
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#111111" wireframe />
    </mesh>
  );
}

export default function Scene() {
  const resetToSystemView = useStore((state) => state.resetToSystemView);
  const currentView = useStore((state) => state.currentView);

  // Handle right-click to reset view
  const handleContextMenu = (e) => {
    e.preventDefault();
    if (currentView === 'solarsystem') {
      resetToSystemView();
    }
  };

  return (
    <Canvas
      camera={{ position: [0, 200, 500], fov: 60, near: 0.1, far: 2000000 }}
      gl={{
        logarithmicDepthBuffer: true, // Fix Z-fighting for inner planets
        antialias: true,
        toneMapping: 3, // ACESFilmicToneMapping
        toneMappingExposure: 1.0,
      }}
      style={{ position: 'fixed', inset: 0 }}
      onContextMenu={handleContextMenu}
    >
      <Suspense fallback={<LoadingFallback />}>
        {/* Camera controls - OrbitControls enabled only in solar system view */}
        <CameraControls />

        {/* Time progression - updates currentDate based on timeScale */}
        <TimeProgression />

        {/* Massive universe sphere with stars.jpg texture */}
        <Background />
        
        {/* Procedural starfield - deep space dots beyond texture */}
        <Starfield />

        {/* Big Bang particle explosion */}
        <BigBang />

        {/* Solar System with planets */}
        <SolarSystem />

        {/* Post-processing: Bloom for sun and atmosphere glow */}
        <EffectComposer>
          <Bloom
            intensity={1.5}
            luminanceThreshold={0.6}
            luminanceSmoothing={0.9}
            mipmapBlur
            radius={0.8}
          />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
