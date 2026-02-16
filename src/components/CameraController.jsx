import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import useStore from '../store/useStore';

export default function CameraController() {
  const { camera } = useThree();
  const { currentView, cameraTarget, selectedPlanet } = useStore();

  const targetPosition = useRef(new THREE.Vector3(0, 25, 60));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    if (currentView === 'solarsystem') {
      targetPosition.current.set(0, 25, 60);
      targetLookAt.current.set(0, 0, 0);
    } else if (currentView === 'planet' && cameraTarget) {
      const [x, y, z] = cameraTarget;
      // Position camera near the planet
      const dir = new THREE.Vector3(x, y, z).normalize();
      targetPosition.current.set(
        x + dir.x * 4 + 1,
        y + 2,
        z + dir.z * 4 + 1
      );
      targetLookAt.current.set(x, y, z);
    }
  }, [currentView, cameraTarget]);

  useFrame((state, delta) => {
    if (currentView === 'bigbang' || currentView === 'loading') return;

    // Smooth camera interpolation
    const lerpFactor = 1 - Math.pow(0.05, delta);

    camera.position.lerp(targetPosition.current, lerpFactor);
    currentLookAt.current.lerp(targetLookAt.current, lerpFactor);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}
