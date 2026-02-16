import React, { useRef, useMemo, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import useStore from '../store/useStore';
import atmosphereVertexShader from '../shaders/atmosphereVertex.glsl?raw';
import atmosphereFragmentShader from '../shaders/atmosphereFragment.glsl?raw';
import { getPlanetPosition, getRotationDelta } from '../utils/orbitalMechanics';
import OrbitPath from './OrbitPath';

export default function Planet({ data, planetKey }) {
  const groupRef = useRef();
  const meshRef = useRef();
  const atmosphereRef = useRef();

  const {
    hoveredPlanet,
    setHoveredPlanet,
    setSelectedPlanet,
    setCurrentView,
    setCameraTarget,
    currentView,
    focusedPlanet,
    setFocusedPlanet,
    timeScale,
  } = useStore();

  const isHovered = hoveredPlanet === planetKey;
  const isFocused = focusedPlanet === planetKey;
  const [localHover, setLocalHover] = useState(false);

  // Load planet texture
  const texture = useTexture(`/textures/${planetKey}.jpg`);

  // Atmosphere shader uniforms
  const atmosphereUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(data.atmosphereColor) },
      uSunPosition: { value: new THREE.Vector3(0, 0, 0) },
      uIntensity: { value: 1.5 },
    }),
    [data.atmosphereColor]
  );

  // Compute initial position using Keplerian orbital mechanics
  const startDate = useMemo(() => new Date(), []);

  useFrame((state, delta) => {
    if (currentView !== 'solarsystem' && currentView !== 'planet') return;

    // Get current position from orbital mechanics
    const [x, y, z] = getPlanetPosition(data.orbital, startDate, timeScale);

    if (groupRef.current) {
      groupRef.current.position.set(x, y, z);
    }

    // Realistic rotation based on sidereal day
    if (meshRef.current) {
      const rotationDelta = getRotationDelta(data.siderealDay, delta, timeScale);
      meshRef.current.rotation.y += rotationDelta;
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

      const pos = groupRef.current?.position;
      if (pos) {
        setSelectedPlanet(planetKey);
        setCameraTarget([pos.x, pos.y, pos.z]);
        setCurrentView('planet');
      }
    },
    [currentView, planetKey, setSelectedPlanet, setCameraTarget, setCurrentView]
  );

  const handleDoubleClick = useCallback(
    (e) => {
      e.stopPropagation();
      if (currentView !== 'solarsystem') return;
      setFocusedPlanet(planetKey);
    },
    [currentView, planetKey, setFocusedPlanet]
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
        orbitalElements={data.orbital}
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
            onDoubleClick={handleDoubleClick}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
          >
            <sphereGeometry args={[data.radius, 32, 32]} />
            <meshStandardMaterial
              map={texture}
              emissive={data.emissive}
              emissiveIntensity={0.05}
              roughness={0.9}
              metalness={0.1}
            />
          </mesh>

          {/* Atmosphere layer (Fresnel glow) */}
          <mesh ref={atmosphereRef} scale={1.15}>
            <sphereGeometry args={[data.radius, 32, 32]} />
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
            <mesh rotation={[Math.PI * 0.45, 0, 0]}>
              <ringGeometry args={[data.radius * 1.4, data.radius * 2.2, 64]} />
              <meshStandardMaterial
                color="#ccbb88"
                transparent
                opacity={0.6}
                side={THREE.DoubleSide}
                roughness={0.9}
              />
            </mesh>
          )}
        </group>

        {/* Hover label */}
        {localHover && currentView === 'solarsystem' && (
          <Html
            position={[0, data.radius + 1.0, 0]}
            center
            distanceFactor={15}
            style={{ pointerEvents: 'none' }}
          >
            <div className="bg-black/80 backdrop-blur-md border border-white/20 rounded-lg px-4 py-2 text-center whitespace-nowrap">
              <p className="text-white text-sm font-bold tracking-wider">
                {data.label}
              </p>
              <p className="text-white/60 text-xs mt-0.5">{data.name}</p>
            </div>
          </Html>
        )}
      </group>
    </>
  );
}
