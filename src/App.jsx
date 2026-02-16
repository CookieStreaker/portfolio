import React from 'react';
import Scene from './components/Scene';
import LoadingScreen from './components/LoadingScreen';
import HUD from './components/HUD';
import PlanetModal from './components/PlanetModal';
import TimeScaleControl from './components/TimeScaleControl';

function App() {
  return (
    <div className="w-full h-full bg-black">
      {/* 3D Canvas */}
      <Scene />

      {/* 2D UI Overlays */}
      <LoadingScreen />
      <HUD />
      <PlanetModal />
      <TimeScaleControl />
    </div>
  );
}

export default App;
