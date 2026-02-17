import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import useStore from '../store/useStore';
import { getPlanetVisualRadius } from '../utils/orbitalMechanics';
import { SUN_DATA } from '../data/planetData';

export default function CameraControls() {
  const { camera, scene, gl } = useThree();
  const controlsRef = useRef();
  const { currentView, cameraTarget, focusState, targetPlanet, resetToSystemView } = useStore();

  const targetPosition = useRef(new THREE.Vector3(0, 200, 500));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const isAnimating = useRef(false);
  const focusedPlanetPos = useRef(new THREE.Vector3(0, 0, 0));
  const dynamicMinDistance = useRef(150); // Safety: Sun radius is 109
  const dynamicMaxDistance = useRef(1000000);
  const hasAnimatedToFocus = useRef(false);

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
      
      // If no planet clicked, reset to system view
      if (planetIntersects.length === 0) {
        resetToSystemView();
      }
    };

    gl.domElement.addEventListener('click', handleClick);
    return () => gl.domElement.removeEventListener('click', handleClick);
  }, [currentView, camera, scene, gl.domElement, resetToSystemView]);

  useEffect(() => {
    if (currentView === 'solarsystem') {
      isAnimating.current = true;
      hasAnimatedToFocus.current = false; // Reset animation flag
      
      if (focusState === 'focused' && targetPlanet) {
        // Calculate dynamic zoom distance based on planet size
        let objectRadius;
        if (targetPlanet === 'sun') {
          objectRadius = SUN_DATA.visualRadius;
        } else {
          objectRadius = getPlanetVisualRadius(targetPlanet);
        }
        
        // Set dynamic min/max distances based on object size
        dynamicMinDistance.current = objectRadius * 1.5;
        dynamicMaxDistance.current = objectRadius * 20; // Allow more zoom out
        
        // Camera will be updated in useFrame to follow planet/sun
      } else {
        // Reset to solar system view
        targetPosition.current.set(0, 200, 500);
        targetLookAt.current.set(0, 0, 0);
        
        // Reset to default zoom limits (prevent camera entering Sun)
        dynamicMinDistance.current = 150; // Sun radius is 109, add safety margin
        dynamicMaxDistance.current = 1000000; // Allow zooming WAY out
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
  }, [currentView, cameraTarget, focusState, targetPlanet]);

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
        // Handle focused planet/sun camera
        if (focusState === 'focused' && targetPlanet) {
          let targetObject = null;
          let objectRadius = 1;
          
          // Handle Sun or Planet
          if (targetPlanet === 'sun') {
            // Sun is at origin
            focusedPlanetPos.current.set(0, 0, 0);
            objectRadius = 109; // Updated Sun radius
            targetObject = scene.getObjectByName('sun-group');
          } else {
            // Find the focused planet's current position
            const planetGroup = scene.getObjectByName(`planet-${targetPlanet}`);
            if (planetGroup) {
              focusedPlanetPos.current.copy(planetGroup.position);
              objectRadius = getPlanetVisualRadius(targetPlanet);
              targetObject = planetGroup;
            }
          }
          
          if (targetObject || targetPlanet === 'sun') {
            // ALWAYS update OrbitControls target to follow the moving object
            controlsRef.current.target.copy(focusedPlanetPos.current);
            
            // Only animate camera position ONCE on initial focus
            if (!hasAnimatedToFocus.current) {
              // Calculate ideal viewing distance (4x the radius)
              const idealDistance = objectRadius * 4.0;
              
              // Calculate camera offset (orbit around object)
              const currentCamDir = new THREE.Vector3()
                .subVectors(camera.position, focusedPlanetPos.current)
                .normalize();
              
              // Animate to ideal distance
              const currentDist = camera.position.distanceTo(focusedPlanetPos.current);
              if (Math.abs(currentDist - idealDistance) > objectRadius * 0.1) {
                targetPosition.current.copy(focusedPlanetPos.current).add(
                  currentCamDir.multiplyScalar(idealDistance)
                );
                const lerpFactor = 1 - Math.pow(0.1, delta);
                camera.position.lerp(targetPosition.current, lerpFactor);
              } else {
                // Animation complete
                hasAnimatedToFocus.current = true;
              }
            }
            // After initial animation, OrbitControls handles camera position
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
      minDistance={dynamicMinDistance.current}
      maxDistance={dynamicMaxDistance.current}
      maxPolarAngle={Math.PI * 0.9}
      minPolarAngle={Math.PI * 0.1}
      enablePan={false}
      rotateSpeed={0.5}
      zoomSpeed={0.8}
    />
  );
}
