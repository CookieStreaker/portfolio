import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import planetData from '../data/planetData';

export default function PlanetModal() {
  const { currentView, selectedPlanet, closePlanetView } = useStore();

  if (currentView !== 'planet' || !selectedPlanet) return null;

  const data = planetData[selectedPlanet];
  if (!data) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="planet-modal"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="fixed right-0 top-0 h-full w-full max-w-md z-50 pointer-events-auto"
      >
        <div className="h-full bg-black/70 backdrop-blur-xl border-l border-white/10 p-8 flex flex-col">
          {/* Close button */}
          <button
            onClick={closePlanetView}
            className="self-end mb-6 text-white/60 hover:text-white transition-colors text-2xl"
          >
            ✕
          </button>

          {/* Planet indicator */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: data.color, boxShadow: `0 0 12px ${data.color}` }}
            />
            <span className="text-white/50 text-sm uppercase tracking-[0.3em]">
              {data.name}
            </span>
          </div>

          {/* Project title */}
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
            {data.label}
          </h1>

          {/* Description */}
          <p className="text-white/70 text-base leading-relaxed mb-8">
            {data.description}
          </p>

          {/* Detailed description */}
          <p className="text-white/50 text-sm leading-relaxed mb-8">
            {data.details.description}
          </p>

          {/* Tech stack */}
          <div className="mb-8">
            <h3 className="text-white/40 text-xs uppercase tracking-[0.2em] mb-3">
              Tech Stack
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.details.tech.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 rounded-full text-xs font-medium border"
                  style={{
                    borderColor: data.color + '40',
                    color: data.color,
                    backgroundColor: data.color + '10',
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-auto flex gap-3">
            <button
              className="flex-1 py-3 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-[1.02]"
              style={{
                backgroundColor: data.color,
                color: '#000',
              }}
            >
              View Project
            </button>
            <button
              className="flex-1 py-3 rounded-lg text-sm font-semibold border border-white/20 text-white/80 hover:bg-white/10 transition-all duration-300"
            >
              Source Code
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
