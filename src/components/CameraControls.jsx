import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import useStore from '../store/useStore';

export default function CameraControls() {
  const { camera, scene, gl } = useThree();
  const controlsRef = useRef();
  const { currentView, cameraTarget, selectedPlanet, focusedPlanet, setFocusedPlanet } = useStore();

  const targetPosition = useRef(new THREE.Vector3(0, 20, 50));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const isAnimating = useRef(false);
  const focusedPlanetPos = useRef(new THREE.Vector3(0, 0, 0));

  // Handle click on empty space (background) to reset focus
  useEffect(() => {
    const handleClick = (event) => {
      if (currentView !== 'solarsystem') return;
      
      // Only reset if not clicking on any object
      const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
      );
      
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      
      // Filter out background sphere and orbit lines
      const planetIntersects = intersects.filter((i) => {
        return i.object.type === 'Mesh' && i.object.geometry.type === 'SphereGeometry';
      });
      
      // If no planet clicked, reset focus to sun
      if (planetIntersects.length === 0) {
        setFocusedPlanet(null);
      }
    };

    gl.domElement.addEventListener('click', handleClick);
    return () => gl.domElement.removeEventListener('click', handleClick);
  }, [currentView, camera, scene, gl.domElement, setFocusedPlanet]);

  useEffect(() => {
    if (currentView === 'solarsystem') {
      isAnimating.current = true;
      
      if (focusedPlanet) {
        // Camera will be updated in useFrame to follow planet
      } else {
        // Reset to solar system view
        targetPosition.current.set(0, 20, 50);
        targetLookAt.current.set(0, 0, 0);
      }
      
      setTimeout(() => {
        isAnimating.current = false;
      }, 1500);
      
    } else if (currentView === 'planet' && cameraTarget) {
      isAnimating.current = true;
      const [x, y, z] = cameraTarget;
      const dir = new THREE.Vector3(x, y, z).normalize();
      targetPosition.current.set(
        x + dir.x * 4 + 1,
        y + 2,
        z + dir.z * 4 + 1
      );
      targetLookAt.current.set(x, y, z);
    }
  }, [currentView, cameraTarget, focusedPlanet]);

  useFrame((state, delta) => {
    // Don't interfere during Big Bang or loading
    if (currentView === 'bigbang' || currentView === 'loading') {
      if (controlsRef.current) {
        controlsRef.current.enabled = false;
      }
      return;
    }

    // Disable controls during planet view (modal open)
    if (currentView === 'planet') {
      if (controlsRef.current) {
        controlsRef.current.enabled = false;
      }
      
      const lerpFactor = 1 - Math.pow(0.05, delta);
      camera.position.lerp(targetPosition.current, lerpFactor);
      currentLookAt.current.lerp(targetLookAt.current, lerpFactor);
      camera.lookAt(currentLookAt.current);
      
      return;
    }

    // Solar system view with OrbitControls
    if (currentView === 'solarsystem') {
      if (controlsRef.current) {
        // Handle focused planet camera
        if (focusedPlanet) {
          // Find the focused planet's current position
          const planetGroup = scene.getObjectByName(`planet-${focusedPlanet}`);
          if (planetGroup) {
            focusedPlanetPos.current.copy(planetGroup.position);
            
            // Set OrbitControls target to planet
            controlsRef.current.target.copy(focusedPlanetPos.current);
            
            // Calculate camera offset (orbit around planet)
            const distance = 8; // Distance from planet
            const currentCamDir = new THREE.Vector3()
              .subVectors(camera.position, focusedPlanetPos.current)
              .normalize();
            
            // If camera is too far or too close, animate to proper distance
            const currentDist = camera.position.distanceTo(focusedPlanetPos.current);
            if (Math.abs(currentDist - distance) > 0.5) {
              targetPosition.current.copy(focusedPlanetPos.current).add(
                currentCamDir.multiplyScalar(distance)
              );
              const lerpFactor = 1 - Math.pow(0.1, delta);
              camera.position.lerp(targetPosition.current, lerpFactor);
            }
          }
          
          controlsRef.current.enabled = true;
        } else {
          // No focused planet - normal solar system view
          if (isAnimating.current) {
            // Animate to initial position
            const lerpFactor = 1 - Math.pow(0.05, delta);
            camera.position.lerp(targetPosition.current, lerpFactor);
            currentLookAt.current.lerp(targetLookAt.current, lerpFactor);
            camera.lookAt(currentLookAt.current);
            
            controlsRef.current.target.copy(currentLookAt.current);
          } else {
            // Keep target at sun
            controlsRef.current.target.set(0, 0, 0);
          }
          
          controlsRef.current.enabled = true;
        }
      }
    }
  });

  if (currentView !== 'solarsystem') return null;

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping={true}
      dampingFactor={0.05}
      minDistance={3}
      maxDistance={200}
      maxPolarAngle={Math.PI * 0.9}
      minPolarAngle={Math.PI * 0.1}
      enablePan={true}
      panSpeed={0.5}
      rotateSpeed={0.5}
      zoomSpeed={0.8}
    />
  );
}
