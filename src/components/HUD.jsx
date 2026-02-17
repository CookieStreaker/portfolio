import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import planetData, { SUN_DATA } from '../data/planetData';

export default function HUD() {
  const {
    currentView,
    selectedPlanet,
    closePlanetView,
    hoveredPlanet,
    setHoveredPlanet,
    focusState,
    targetPlanet,
    handlePlanetClick,
  } = useStore();

  if (currentView !== 'solarsystem' && currentView !== 'planet') return null;

  return (
    <div className="fixed inset-0 z-30 pointer-events-none">
      {/* Top-left: Name / Logo */}
      <AnimatePresence>
        {currentView === 'solarsystem' && (
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="absolute top-8 left-8"
          >
            <h1 className="text-white text-xl font-bold tracking-[0.2em]">
              YASH
            </h1>
            <p className="text-white/40 text-xs tracking-[0.3em] uppercase mt-1">
              Full-Stack Developer
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom center: Navigation hint */}
      <AnimatePresence>
        {currentView === 'solarsystem' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center"
          >
            <p className="text-white/30 text-xs tracking-[0.2em] uppercase mb-1">
              Click planet → Focus Camera
            </p>
            <p className="text-white/20 text-[10px] tracking-[0.15em] uppercase mb-1">
              Click again → View Project
            </p>
            <p className="text-white/20 text-[10px] tracking-[0.15em] uppercase">
              Right-click → Reset View
            </p>
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-white/20 text-lg mt-2"
            >
              ↓
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back button when viewing a planet */}
      <AnimatePresence>
        {currentView === 'planet' && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            onClick={closePlanetView}
            className="absolute top-8 left-8 pointer-events-auto flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
          >
            <span className="text-lg group-hover:-translate-x-1 transition-transform">
              ←
            </span>
            <span className="text-sm tracking-[0.1em] uppercase">
              Back to Universe
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Top-right: Navigation links */}
      <AnimatePresence>
        {currentView === 'solarsystem' && (
          <motion.nav
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="absolute top-8 right-8 flex gap-6"
          >
            {['About', 'Projects', 'Contact'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-white/40 text-xs tracking-[0.2em] uppercase hover:text-white transition-colors pointer-events-auto"
              >
                {item}
              </a>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Left sidebar: Planet list */}
      <AnimatePresence>
        {currentView === 'solarsystem' && (
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="absolute left-8 top-1/2 -translate-y-1/2"
          >
            <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-lg p-4">
              <p className="text-white/50 text-[10px] tracking-[0.2em] uppercase mb-3">
                Celestial Bodies
              </p>
              <div className="flex flex-col gap-2">
                {/* Sun entry */}
                {(() => {
                  const isActive = targetPlanet === 'sun';
                  const isHovered = hoveredPlanet === 'sun';
                  
                  return (
                    <button
                      key="sun"
                      onClick={() => handlePlanetClick('sun')}
                      onMouseEnter={() => setHoveredPlanet('sun')}
                      onMouseLeave={() => setHoveredPlanet(null)}
                      className="pointer-events-auto text-left transition-all relative group"
                    >
                      <div
                        className={`flex items-center gap-2 px-3 py-1.5 rounded transition-all ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : isHovered
                            ? 'bg-white/10 text-white/80'
                            : 'text-white/40 hover:text-white/60'
                        }`}
                      >
                        {/* Sun color indicator */}
                        <div
                          className={`w-2 h-2 rounded-full transition-all ${
                            isActive || isHovered ? 'scale-125' : ''
                          }`}
                          style={{
                            backgroundColor: SUN_DATA.color,
                            boxShadow:
                              isActive || isHovered
                                ? `0 0 8px ${SUN_DATA.color}`
                                : 'none',
                          }}
                        />

                        {/* Sun label */}
                        <span className="text-xs tracking-[0.1em] uppercase">
                          {SUN_DATA.label}
                        </span>

                        {/* Active indicator */}
                        {isActive && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="ml-auto w-1 h-1 rounded-full bg-white"
                          />
                        )}
                      </div>

                      {/* Hover tooltip */}
                      {isHovered && !isActive && (
                        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap bg-black/90 backdrop-blur-md border border-white/20 rounded px-2 py-1 pointer-events-none">
                          <p className="text-white text-[10px] tracking-wide">
                            Click to focus
                          </p>
                        </div>
                      )}
                    </button>
                  );
                })()}
                
                {/* Planets */}
                {Object.entries(planetData).map(([key, data]) => {
                  const isActive = targetPlanet === key;
                  const isHovered = hoveredPlanet === key;

                  return (
                    <button
                      key={key}
                      onClick={() => handlePlanetClick(key)}
                      onMouseEnter={() => setHoveredPlanet(key)}
                      onMouseLeave={() => setHoveredPlanet(null)}
                      className="pointer-events-auto text-left transition-all relative group"
                    >
                      <div
                        className={`flex items-center gap-2 px-3 py-1.5 rounded transition-all ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : isHovered
                            ? 'bg-white/10 text-white/80'
                            : 'text-white/40 hover:text-white/60'
                        }`}
                      >
                        {/* Planet color indicator */}
                        <div
                          className={`w-2 h-2 rounded-full transition-all ${
                            isActive || isHovered ? 'scale-125' : ''
                          }`}
                          style={{
                            backgroundColor: data.color,
                            boxShadow:
                              isActive || isHovered
                                ? `0 0 8px ${data.color}`
                                : 'none',
                          }}
                        />

                        {/* Planet name */}
                        <span className="text-xs tracking-[0.1em] uppercase">
                          {data.label}
                        </span>

                        {/* Active indicator */}
                        {isActive && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="ml-auto w-1 h-1 rounded-full bg-white"
                          />
                        )}
                      </div>

                      {/* Hover tooltip */}
                      {isHovered && !isActive && (
                        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap bg-black/90 backdrop-blur-md border border-white/20 rounded px-2 py-1 pointer-events-none">
                          <p className="text-white text-[10px] tracking-wide">
                            Click to focus
                          </p>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Focus state indicator */}
              {focusState === 'focused' && targetPlanet && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 pt-3 border-t border-white/10"
                >
                  <p className="text-white/30 text-[9px] tracking-[0.15em] uppercase">
                    Focused: {targetPlanet === 'sun' ? SUN_DATA.label : planetData[targetPlanet]?.label || 'Unknown'}
                  </p>
                  <p className="text-white/20 text-[8px] mt-0.5">
                    Click again to view {targetPlanet === 'sun' ? 'about me' : 'project'}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
