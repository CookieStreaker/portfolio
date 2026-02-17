import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import useStore from '../store/useStore';
import { getPlanetVisualRadius } from '../utils/orbitalMechanics';
import { SUN_DATA } from '../data/planetData';

// Safety constants
const SUN_RADIUS = 109;
const SYSTEM_MIN_DISTANCE = SUN_RADIUS + 50; // Never clip into the Sun
const SYSTEM_MAX_DISTANCE = 1500000;         // Beyond Neptune
const DEFAULT_POSITION = [0, 200, 400];

export default function CameraControls() {
  const { camera, scene, gl } = useThree();
  const controlsRef = useRef();
  const { currentView, cameraTarget, focusState, targetPlanet, resetToSystemView } = useStore();

  const targetPosition = useRef(new THREE.Vector3(...DEFAULT_POSITION));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const isAnimating = useRef(false);
  const focusedPlanetPos = useRef(new THREE.Vector3(0, 0, 0));
  const hasAnimatedToFocus = useRef(false);

  // Current dynamic limits (applied imperatively in useFrame)
  const limitsRef = useRef({
    minDistance: SYSTEM_MIN_DISTANCE,
    maxDistance: SYSTEM_MAX_DISTANCE,
  });

  // Handle right-click on empty space to reset focus
  useEffect(() => {
    const handleClick = (event) => {
      if (currentView !== 'solarsystem') return;

      const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      // Only count hits on planet/sun meshes — ignore background sphere, orbit lines, points
      const planetHit = intersects.some((hit) => {
        const obj = hit.object;
        // Must be a Mesh with SphereGeometry AND within a reasonable distance
        // Background sphere is at 900k radius so filter by distance
        return (
          obj.isMesh &&
          obj.geometry?.type === 'SphereGeometry' &&
          hit.distance < 100000
        );
      });

      if (!planetHit) {
        resetToSystemView();
      }
    };

    gl.domElement.addEventListener('click', handleClick);
    return () => gl.domElement.removeEventListener('click', handleClick);
  }, [currentView, camera, scene, gl.domElement, resetToSystemView]);

  // React to focus state changes
  useEffect(() => {
    if (currentView === 'solarsystem') {
      isAnimating.current = true;
      hasAnimatedToFocus.current = false;

      if (focusState === 'focused' && targetPlanet) {
        let objectRadius;
        if (targetPlanet === 'sun') {
          objectRadius = SUN_RADIUS;
        } else {
          objectRadius = getPlanetVisualRadius(targetPlanet);
        }

        // Dynamic limits for focused object
        limitsRef.current.minDistance = Math.max(objectRadius * 1.5, 20);
        limitsRef.current.maxDistance = objectRadius * 20;
      } else {
        // System view defaults
        targetPosition.current.set(...DEFAULT_POSITION);
        targetLookAt.current.set(0, 0, 0);
        limitsRef.current.minDistance = SYSTEM_MIN_DISTANCE;
        limitsRef.current.maxDistance = SYSTEM_MAX_DISTANCE;
      }

      setTimeout(() => {
        isAnimating.current = false;
      }, 1500);
    } else if (currentView === 'planet' && cameraTarget) {
      isAnimating.current = true;
      const [x, y, z] = cameraTarget;
      const dir = new THREE.Vector3(x, y, z).normalize();
      targetPosition.current.set(x + dir.x * 4 + 1, y + 2, z + dir.z * 4 + 1);
      targetLookAt.current.set(x, y, z);
    }
  }, [currentView, cameraTarget, focusState, targetPlanet]);

  useFrame((state, delta) => {
    // ── Apply dynamic limits imperatively every frame ──
    if (controlsRef.current) {
      controlsRef.current.minDistance = limitsRef.current.minDistance;
      controlsRef.current.maxDistance = limitsRef.current.maxDistance;
    }

    // Don't interfere during Big Bang or loading
    if (currentView === 'bigbang' || currentView === 'loading') {
      if (controlsRef.current) controlsRef.current.enabled = false;
      return;
    }

    // Disable controls during planet view (modal open)
    if (currentView === 'planet') {
      if (controlsRef.current) controlsRef.current.enabled = false;
      const lerpFactor = 1 - Math.pow(0.05, delta);
      camera.position.lerp(targetPosition.current, lerpFactor);
      currentLookAt.current.lerp(targetLookAt.current, lerpFactor);
      camera.lookAt(currentLookAt.current);
      return;
    }

    // ── Solar system view ──
    if (currentView === 'solarsystem' && controlsRef.current) {
      if (focusState === 'focused' && targetPlanet) {
        // ── Focused on a planet / sun ──
        let objectRadius = 1;

        if (targetPlanet === 'sun') {
          focusedPlanetPos.current.set(0, 0, 0);
          objectRadius = SUN_RADIUS;
        } else {
          const planetGroup = scene.getObjectByName(`planet-${targetPlanet}`);
          if (planetGroup) {
            focusedPlanetPos.current.copy(planetGroup.position);
            objectRadius = getPlanetVisualRadius(targetPlanet);
          }
        }

        // ALWAYS update OrbitControls.target to follow the moving object
        controlsRef.current.target.copy(focusedPlanetPos.current);

        // Animate camera to ideal distance ONCE, then let user control zoom
        if (!hasAnimatedToFocus.current) {
          const idealDistance = objectRadius * 4.0;
          const offset = new THREE.Vector3().subVectors(
            camera.position,
            focusedPlanetPos.current
          );
          const currentDist = offset.length();

          // Guard against zero-length vector (prevent NaN)
          if (currentDist < 0.001) {
            // Camera is AT the target — push it out along +Z
            camera.position.copy(focusedPlanetPos.current);
            camera.position.z += idealDistance;
            hasAnimatedToFocus.current = true;
          } else if (Math.abs(currentDist - idealDistance) > objectRadius * 0.1) {
            offset.normalize().multiplyScalar(idealDistance);
            targetPosition.current.copy(focusedPlanetPos.current).add(offset);
            const lerpFactor = 1 - Math.pow(0.1, delta);
            camera.position.lerp(targetPosition.current, lerpFactor);
          } else {
            hasAnimatedToFocus.current = true;
          }
        }
        // After animation: OrbitControls handles zoom/rotate freely

        controlsRef.current.enabled = true;
      } else {
        // ── System view (no focus) ──
        if (isAnimating.current) {
          const lerpFactor = 1 - Math.pow(0.05, delta);
          camera.position.lerp(targetPosition.current, lerpFactor);
          currentLookAt.current.lerp(targetLookAt.current, lerpFactor);
          camera.lookAt(currentLookAt.current);
          controlsRef.current.target.copy(currentLookAt.current);
        } else {
          controlsRef.current.target.set(0, 0, 0);
        }
        controlsRef.current.enabled = true;
      }
    }
  });

  if (currentView !== 'solarsystem') return null;

  return (
    <OrbitControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
      target={[0, 0, 0]}
      enableDamping
      dampingFactor={0.05}
      enablePan={false}
      rotateSpeed={0.5}
      zoomSpeed={0.8}
      maxPolarAngle={Math.PI * 0.9}
      minPolarAngle={Math.PI * 0.1}
      minDistance={SYSTEM_MIN_DISTANCE}
      maxDistance={SYSTEM_MAX_DISTANCE}
    />
  );
}
