import React from 'react';
import Sun from './Sun';
import Planet from './Planet';
import useStore from '../store/useStore';
import planetData from '../data/planetData';

export default function SolarSystem() {
  const currentView = useStore((s) => s.currentView);

  if (currentView !== 'solarsystem' && currentView !== 'planet') return null;

  return (
    <group>
      {/* Ambient light for minimum visibility */}
      <ambientLight intensity={0.03} />

      {/* The Sun */}
      <Sun />

      {/* All planets */}
      {Object.entries(planetData).map(([key, data]) => (
        <Planet key={key} planetKey={key} data={data} />
      ))}
    </group>
  );
}
