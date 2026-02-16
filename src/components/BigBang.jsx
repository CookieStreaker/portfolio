import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useStore from '../store/useStore';
import bigBangVertexShader from '../shaders/bigBangVertex.glsl?raw';
import bigBangFragmentShader from '../shaders/bigBangFragment.glsl?raw';

const PARTICLE_COUNT = 15000;

export default function BigBang() {
  const pointsRef = useRef();
  const materialRef = useRef();
  const progressRef = useRef(0);
  const startTimeRef = useRef(null);

  const { currentView, setCurrentView, setBigBangProgress } = useStore();

  const { positions, sizes, speeds, directions, phases } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const speeds = new Float32Array(PARTICLE_COUNT);
    const directions = new Float32Array(PARTICLE_COUNT * 3);
    const phases = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      // All particles start at origin
      positions[i3] = 0;
      positions[i3 + 1] = 0;
      positions[i3 + 2] = 0;

      // Random sizes
      sizes[i] = Math.random() * 3.0 + 0.5;

      // Random speed multiplier
      speeds[i] = Math.random() * 1.5 + 0.3;

      // Random explosion direction (sphere)
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      directions[i3] = Math.sin(phi) * Math.cos(theta);
      directions[i3 + 1] = Math.sin(phi) * Math.sin(theta);
      directions[i3 + 2] = Math.cos(phi);

      // Random phase for turbulence
      phases[i] = Math.random() * Math.PI * 2;
    }

    return { positions, sizes, speeds, directions, phases };
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
    }),
    []
  );

  useFrame((state, delta) => {
    if (currentView !== 'bigbang') return;
    if (!materialRef.current) return;

    if (startTimeRef.current === null) {
      startTimeRef.current = state.clock.elapsedTime;
    }

    const elapsed = state.clock.elapsedTime - startTimeRef.current;

    // Big Bang lasts ~4 seconds
    const duration = 4.0;
    progressRef.current = Math.min(elapsed / duration, 1.0);

    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    materialRef.current.uniforms.uProgress.value = progressRef.current;

    setBigBangProgress(progressRef.current);

    // Camera shake (erratic → stable)
    const shakeAmount = (1 - progressRef.current) * 0.8;
    state.camera.position.x = Math.sin(elapsed * 12) * shakeAmount;
    state.camera.position.y = Math.cos(elapsed * 15) * shakeAmount * 0.5;
    state.camera.position.z = 5 + progressRef.current * 55; // Pull back as universe expands

    state.camera.lookAt(0, 0, 0);

    // Transition to solar system view
    if (progressRef.current >= 1.0) {
      setTimeout(() => {
        setCurrentView('solarsystem');
      }, 500);
    }
  });

  if (currentView !== 'bigbang') return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aSize"
          count={PARTICLE_COUNT}
          array={sizes}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aSpeed"
          count={PARTICLE_COUNT}
          array={speeds}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aDirection"
          count={PARTICLE_COUNT}
          array={directions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aPhase"
          count={PARTICLE_COUNT}
          array={phases}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={bigBangVertexShader}
        fragmentShader={bigBangFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
