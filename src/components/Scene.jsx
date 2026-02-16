import React, { Suspense } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import BigBang from './BigBang';
import SolarSystem from './SolarSystem';
import CameraControls from './CameraControls';

function Background() {
  const texture = useLoader(THREE.TextureLoader, '/textures/stars.jpg');
  return (
    <mesh scale={[500, 500, 500]}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
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
  return (
    <Canvas
      camera={{ position: [0, 20, 50], fov: 60, near: 0.1, far: 1000 }}
      gl={{
        antialias: true,
        toneMapping: 3, // ACESFilmicToneMapping
        toneMappingExposure: 1.0,
      }}
      style={{ position: 'fixed', inset: 0 }}
    >
      <Suspense fallback={<LoadingFallback />}>
        {/* Camera controls - OrbitControls enabled only in solar system view */}
        <CameraControls />

        {/* Starfield background sphere */}
        <Background />

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
