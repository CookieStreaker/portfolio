import React, { useMemo } from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { getOrbitPath } from '../utils/orbitalMechanics';
import useStore from '../store/useStore';

export default function OrbitPath({ planetKey, color, isHighlighted = false }) {
  const currentDate = useStore((state) => state.currentDate);
  
  const points = useMemo(() => {
    const pathPoints = getOrbitPath(planetKey, currentDate, 256);
    return pathPoints.map(([x, y, z]) => new THREE.Vector3(x, y, z));
  }, [planetKey, currentDate]);

  return (
    <Line
      points={points}
      color={color}
      lineWidth={isHighlighted ? 2 : 1}
      transparent
      opacity={isHighlighted ? 0.6 : 0.15}
      dashed={false}
    />
  );
}
