import React from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';

export default function TimeScaleControl() {
  const { currentView, timeScale, setTimeScale } = useStore();

  if (currentView !== 'solarsystem') return null;

  const presets = [
    { label: '1x', value: 1 },
    { label: '1000x', value: 1000 },
    { label: '10k', value: 10000 },
    { label: '100k', value: 100000 },
    { label: '500k', value: 500000 },
    { label: '1M', value: 1000000 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4 }}
      className="fixed bottom-8 right-8 z-40 pointer-events-auto"
    >
      <div className="bg-black/70 backdrop-blur-md border border-white/20 rounded-lg p-4">
        <p className="text-white/40 text-xs uppercase tracking-[0.2em] mb-3">
          Time Scale
        </p>
        <div className="flex gap-2">
          {presets.map((preset) => (
            <button
              key={preset.value}
              onClick={() => setTimeScale(preset.value)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                timeScale === preset.value
                  ? 'bg-white text-black'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <p className="text-white/30 text-[10px] mt-2 text-center">
          Current: {timeScale.toLocaleString()}x
        </p>
      </div>
    </motion.div>
  );
}
