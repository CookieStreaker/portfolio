import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import sunVertexShader from '../shaders/sunVertex.glsl?raw';
import sunFragmentShader from '../shaders/sunFragment.glsl?raw';

export default function Sun() {
  const meshRef = useRef();
  const materialRef = useRef();
  const coronaRef = useRef();

  // Load sun texture (optional - shader will override most of it)
  const sunTexture = useTexture('/textures/sun.jpg');

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
    // Pulse the corona
    if (coronaRef.current) {
      const pulse = 1.0 + Math.sin(state.clock.elapsedTime * 2) * 0.03;
      coronaRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Core sun sphere with plasma shader */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[3, 64, 64]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={sunVertexShader}
          fragmentShader={sunFragmentShader}
          uniforms={uniforms}
        />
      </mesh>

      {/* Corona glow layer */}
      <mesh ref={coronaRef}>
        <sphereGeometry args={[3.5, 32, 32]} />
        <meshBasicMaterial
          color="#ff6600"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[4.5, 32, 32]} />
        <meshBasicMaterial
          color="#ff4400"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Point light from within the sun */}
      <pointLight
        color="#fff5e0"
        intensity={3}
        distance={200}
        decay={0.5}
      />
      <pointLight
        color="#ff8833"
        intensity={1.5}
        distance={100}
        decay={1}
      />
    </group>
  );
}
