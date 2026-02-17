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

  // NASA Eyes-style interaction state machine
  // 'system' = viewing entire solar system | 'focused' = focused on specific planet
  focusState: 'system',
  setFocusState: (state) => set({ focusState: state }),
  
  // Target planet for focus (null = Sun/system view)
  targetPlanet: null,
  setTargetPlanet: (planet) => set({ targetPlanet: planet }),

  // Time scale for simulation (1 = real-time, higher = faster)
  timeScale: 1.0, // Default: Real-time
  setTimeScale: (scale) => set({ timeScale: scale }),

  // Current simulation date (updated by time scale)
  currentDate: new Date(),
  setCurrentDate: (date) => set({ currentDate: date }),

  // Planet that user is clicking (for double-click logic)
  lastClickedPlanet: null,
  lastClickTime: 0,
  handlePlanetClick: (planetKey) => {
    const state = get();
    const now = Date.now();
    const timeSinceLastClick = now - state.lastClickTime;
    
    if (state.focusState === 'system') {
      // First click: Focus on planet
      set({
        focusState: 'focused',
        targetPlanet: planetKey,
        lastClickedPlanet: planetKey,
        lastClickTime: now,
      });
    } else if (state.focusState === 'focused' && state.targetPlanet === planetKey) {
      // Second click on same planet: Open project
      if (timeSinceLastClick < 500) {
        // Double-click detected
        state.openPlanetProject(planetKey);
      } else {
        // Single click on already-focused planet - just update time
        set({ lastClickTime: now });
      }
    } else {
      // Click on different planet while focused: Switch focus
      set({
        targetPlanet: planetKey,
        lastClickedPlanet: planetKey,
        lastClickTime: now,
      });
    }
  },

  // Reset to system view
  resetToSystemView: () => {
    set({
      focusState: 'system',
      targetPlanet: null,
      selectedPlanet: null,
      lastClickedPlanet: null,
    });
  },

  // Open planet project (override this with actual URLs)
  openPlanetProject: (planetKey) => {
    console.log(`Opening project for ${planetKey}`);
    // In production, use: window.open(projectUrls[planetKey], '_blank');
  },

  // Close planet modal and go back to solar system
  closePlanetView: () =>
    set({
      currentView: 'solarsystem',
      selectedPlanet: null,
      cameraTarget: [0, 0, 0],
    }),
}));

export default useStore;
