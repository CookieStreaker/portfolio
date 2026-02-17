import React, { useRef, useMemo, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import useStore from '../store/useStore';
import atmosphereVertexShader from '../shaders/atmosphereVertex.glsl?raw';
import atmosphereFragmentShader from '../shaders/atmosphereFragment.glsl?raw';
import { getPlanetPosition, getPlanetVisualRadius, getRotationAngle } from '../utils/orbitalMechanics';
import OrbitPath from './OrbitPath';

export default function Planet({ data, planetKey }) {
  const groupRef = useRef();
  const meshRef = useRef();
  const atmosphereRef = useRef();
  const rotationStartTime = useRef(Date.now() / 1000);

  const {
    hoveredPlanet,
    setHoveredPlanet,
    currentView,
    focusState,
    targetPlanet,
    handlePlanetClick,
    currentDate,
    timeScale,
  } = useStore();

  const isHovered = hoveredPlanet === planetKey;
  const isFocused = targetPlanet === planetKey;
  const [localHover, setLocalHover] = useState(false);

  // Load planet texture
  const texture = useTexture(`/textures/${planetKey}.jpg`);

  // Get visual radius (with visibility multiplier)
  const visualRadius = getPlanetVisualRadius(planetKey);

  // Atmosphere shader uniforms
  const atmosphereUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(data.atmosphereColor) },
      uSunPosition: { value: new THREE.Vector3(0, 0, 0) },
      uIntensity: { value: 1.5 },
    }),
    [data.atmosphereColor]
  );

  useFrame((state, delta) => {
    if (currentView !== 'solarsystem' && currentView !== 'planet') return;

    // Get current position from astronomy-engine
    const { position } = getPlanetPosition(planetKey, currentDate);
    const [x, y, z] = position;

    if (groupRef.current) {
      groupRef.current.position.set(x, y, z);
    }

    // Realistic rotation based on sidereal day and time scale
    if (meshRef.current) {
      const elapsedSeconds = (Date.now() / 1000) - rotationStartTime.current;
      const rotationAngle = getRotationAngle(data.siderealDay, elapsedSeconds, timeScale);
      meshRef.current.rotation.y = rotationAngle;
    }

    // Update atmosphere sun direction
    if (atmosphereRef.current) {
      atmosphereRef.current.material.uniforms.uSunPosition.value.set(0, 0, 0);
    }
  });

  const handleClick = useCallback(
    (e) => {
      e.stopPropagation();
      if (currentView !== 'solarsystem') return;
      handlePlanetClick(planetKey);
    },
    [currentView, planetKey, handlePlanetClick]
  );

  const handlePointerOver = useCallback(
    (e) => {
      e.stopPropagation();
      setHoveredPlanet(planetKey);
      setLocalHover(true);
      document.body.style.cursor = 'pointer';
    },
    [planetKey, setHoveredPlanet]
  );

  const handlePointerOut = useCallback(
    (e) => {
      e.stopPropagation();
      setHoveredPlanet(null);
      setLocalHover(false);
      document.body.style.cursor = 'default';
    },
    [setHoveredPlanet]
  );

  return (
    <>
      {/* Elliptical orbit path */}
      <OrbitPath
        planetKey={planetKey}
        color={data.color}
        isHighlighted={isHovered || isFocused}
      />

      {/* Planet group */}
      <group ref={groupRef} name={`planet-${planetKey}`}>
        {/* Planet mesh with axial tilt */}
        <group rotation={[0, 0, (data.axialTilt * Math.PI) / 180]}>
          <mesh
            ref={meshRef}
            onClick={handleClick}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
            castShadow
            receiveShadow
          >
            <sphereGeometry args={[visualRadius, 64, 64]} />
            <meshStandardMaterial
              map={texture}
              emissive={data.emissive}
              emissiveIntensity={0.05}
              roughness={0.9}
              metalness={0.1}
            />
          </mesh>

          {/* Atmosphere layer (Fresnel glow) */}
          <mesh ref={atmosphereRef} scale={1.1}>
            <sphereGeometry args={[visualRadius, 32, 32]} />
            <shaderMaterial
              vertexShader={atmosphereVertexShader}
              fragmentShader={atmosphereFragmentShader}
              uniforms={atmosphereUniforms}
              transparent
              side={THREE.BackSide}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>

          {/* Saturn's rings */}
          {data.hasRings && (
            <mesh rotation={[Math.PI * 0.4, 0, 0]} castShadow receiveShadow>
              <ringGeometry args={[visualRadius * 1.5, visualRadius * 2.5, 128]} />
              <meshStandardMaterial
                color="#ccbb88"
                transparent
                opacity={0.7}
                side={THREE.DoubleSide}
                roughness={0.9}
              />
            </mesh>
          )}
        </group>

        {/* Hover label - shows different info based on focus state */}
        {localHover && currentView === 'solarsystem' && (
          <Html
            position={[0, visualRadius * 1.3, 0]}
            center
            distanceFactor={15}
            style={{ pointerEvents: 'none' }}
          >
            {focusState === 'system' ? (
              // System view: Show "Click to Focus"
              <div className="bg-black/80 backdrop-blur-md border border-white/20 rounded-lg px-4 py-2 text-center whitespace-nowrap">
                <p className="text-white text-sm font-bold tracking-wider">
                  {data.label}
                </p>
                <p className="text-white/40 text-xs mt-0.5">Click to Focus</p>
              </div>
            ) : (
              // Focused view: Show detailed card
              <div className="bg-black/90 backdrop-blur-md border border-white/30 rounded-lg p-4 max-w-xs">
                <p className="text-white text-base font-bold tracking-wider mb-1">
                  {data.label}
                </p>
                <p className="text-white/60 text-xs mb-2">{data.name}</p>
                <p className="text-white/50 text-xs leading-relaxed mb-2">
                  {data.description}
                </p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {data.details.tech.slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 rounded-full text-[10px] border"
                      style={{
                        borderColor: data.color + '40',
                        color: data.color,
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <p className="text-white/30 text-[10px] uppercase tracking-wider">
                  {isFocused ? 'Click again to open project' : 'Click to focus'}
                </p>
              </div>
            )}
          </Html>
        )}
      </group>
    </>
  );
}
