import React, { useMemo } from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { getOrbitPath } from '../utils/orbitalMechanics';

export default function OrbitPath({ orbitalElements, color, isHighlighted = false }) {
  const points = useMemo(() => {
    const pathPoints = getOrbitPath(orbitalElements, 256);
    return pathPoints.map(([x, y, z]) => new THREE.Vector3(x, y, z));
  }, [orbitalElements]);

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
