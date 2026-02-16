import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';

export default function HUD() {
  const { currentView, selectedPlanet, closePlanetView } = useStore();

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
              Click planet → Project Details
            </p>
            <p className="text-white/20 text-[10px] tracking-[0.15em] uppercase">
              Double-click → Focus Camera
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
    </div>
  );
}
