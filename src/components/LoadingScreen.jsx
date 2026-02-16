import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';

export default function LoadingScreen() {
  const { currentView, setCurrentView } = useStore();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentView !== 'loading') return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [currentView]);

  useEffect(() => {
    if (progress >= 100 && currentView === 'loading') {
      const timer = setTimeout(() => {
        setCurrentView('bigbang');
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [progress, currentView, setCurrentView]);

  if (currentView !== 'loading') return null;

  return (
    <AnimatePresence>
      <motion.div
        key="loading"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center"
      >
        {/* Central singularity dot */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="relative mb-12"
        >
          <div
            className="w-4 h-4 rounded-full bg-white"
            style={{
              boxShadow:
                '0 0 20px #fff, 0 0 40px #fff, 0 0 60px #ff8800, 0 0 80px #ff4400',
            }}
          />
          {/* Pulsing ring */}
          <motion.div
            animate={{ scale: [1, 2.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full border border-white/30"
            style={{ transformOrigin: 'center' }}
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-white text-2xl font-light tracking-[0.5em] uppercase mb-8"
        >
          Initializing Universe
        </motion.h1>

        {/* Progress bar */}
        <div className="w-64 h-[2px] bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-500 via-white to-blue-400"
            style={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Progress text */}
        <p className="text-white/30 text-xs mt-4 tracking-[0.3em] uppercase">
          {Math.min(Math.round(progress), 100)}% — Condensing matter
        </p>
      </motion.div>
    </AnimatePresence>
  );
}
