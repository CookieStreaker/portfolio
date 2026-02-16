import { create } from 'zustand';

const useStore = create((set, get) => ({
  // 'loading' | 'bigbang' | 'solarsystem' | 'planet'
  currentView: 'loading',
  setCurrentView: (view) => set({ currentView: view }),

  // Which planet is selected (null = none)
  selectedPlanet: null,
  setSelectedPlanet: (planet) => set({ selectedPlanet: planet }),

  // Hovered planet
  hoveredPlanet: null,
  setHoveredPlanet: (planet) => set({ hoveredPlanet: planet }),

  // Camera target position for smooth transitions
  cameraTarget: [0, 0, 0],
  setCameraTarget: (target) => set({ cameraTarget: target }),

  // Big Bang progress (0 to 1)
  bigBangProgress: 0,
  setBigBangProgress: (progress) => set({ bigBangProgress: progress }),

  // Loading complete flag
  loadingComplete: false,
  setLoadingComplete: (v) => set({ loadingComplete: v }),

  // Focused planet for camera (null = Sun)
  focusedPlanet: null,
  setFocusedPlanet: (planet) => set({ focusedPlanet: planet }),

  // Time scale for orbital and rotation speed (1.0 = real-time)
  timeScale: 500000, // Default: 500000x speed so we can see movement
  setTimeScale: (scale) => set({ timeScale: scale }),

  // Close planet modal and go back to solar system
  closePlanetView: () =>
    set({
      currentView: 'solarsystem',
      selectedPlanet: null,
      cameraTarget: [0, 0, 0],
    }),
}));

export default useStore;
