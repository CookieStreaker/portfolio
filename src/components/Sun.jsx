import React, { useRef, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, Html } from '@react-three/drei';
import * as THREE from 'three';
import sunVertexShader from '../shaders/sunVertex.glsl?raw';
import sunFragmentShader from '../shaders/sunFragment.glsl?raw';
import useStore from '../store/useStore';
import { SUN_DATA } from '../data/planetData';

export default function Sun() {
  const meshRef = useRef();
  const materialRef = useRef();
  const coronaRef = useRef();

  const {
    hoveredPlanet,
    setHoveredPlanet,
    currentView,
    handlePlanetClick,
  } = useStore();

  const isHovered = hoveredPlanet === 'sun';

  // Load sun texture (optional - shader will override most of it)
  const sunTexture = useTexture('/textures/sun.jpg');

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    []
  );

  const handleClick = useCallback(
    (e) => {
      e.stopPropagation();
      if (currentView !== 'solarsystem') return;
      handlePlanetClick('sun');
    },
    [currentView, handlePlanetClick]
  );

  const handlePointerOver = useCallback(
    (e) => {
      e.stopPropagation();
      setHoveredPlanet('sun');
      document.body.style.cursor = 'pointer';
    },
    [setHoveredPlanet]
  );

  const handlePointerOut = useCallback(
    (e) => {
      e.stopPropagation();
      setHoveredPlanet(null);
      document.body.style.cursor = 'default';
    },
    [setHoveredPlanet]
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
    <group position={[0, 0, 0]} name="sun-group">
      {/* Ambient light to prevent pitch black shadows */}
      <ambientLight intensity={0.1} />
      
      {/* Core sun sphere - 109x Earth's size */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[109, 64, 64]} />
        <meshBasicMaterial
          color="#fff5e0"
          emissive="#ffaa00"
          emissiveIntensity={10}
          toneMapped={false}
        />
      </mesh>

      {/* Corona glow layer */}
      <mesh ref={coronaRef}>
        <sphereGeometry args={[120, 32, 32]} />
        <meshBasicMaterial
          color="#ff6600"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[135, 32, 32]} />
        <meshBasicMaterial
          color="#ff4400"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Massive infinite point light - stars don't decay */}
      <pointLight
        color="#fff5e0"
        intensity={2.0}
        distance={0}
        decay={0}
      />
      {/* Secondary warm light for color variation */}
      <pointLight
        color="#ff8833"
        intensity={1.0}
        distance={0}
        decay={0}
      />

      {/* Hover label */}
      {isHovered && currentView === 'solarsystem' && (
        <Html
          position={[0, 140, 0]}
          center
          distanceFactor={15}
          style={{ pointerEvents: 'none' }}
        >
          <div className="bg-black/90 backdrop-blur-md border border-white/30 rounded-lg p-4 max-w-xs">
            <p className="text-white text-base font-bold tracking-wider mb-1">
              {SUN_DATA.label}
            </p>
            <p className="text-white/60 text-xs mb-2">{SUN_DATA.name}</p>
            <p className="text-white/50 text-xs leading-relaxed mb-2">
              {SUN_DATA.description}
            </p>
            <div className="flex flex-wrap gap-1 mb-2">
              {SUN_DATA.details.tech.slice(0, 3).map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-0.5 rounded-full text-[10px] border"
                  style={{
                    borderColor: SUN_DATA.color + '40',
                    color: SUN_DATA.color,
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
            <p className="text-white/30 text-[10px] uppercase tracking-wider">
              Click to focus
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}
