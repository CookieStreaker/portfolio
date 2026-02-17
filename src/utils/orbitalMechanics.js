/**
 * NASA-Grade Orbital Mechanics using astronomy-engine library.
 * Provides real-time, physically accurate planetary positions.
 */

// ✅ ALSO CORRECT (Named imports)
import * as Astronomy from 'astronomy-engine';

// Then in your code, you access things like:
// const position = Astronomy.HelioVector(Astronomy.Body.Earth, date);

// Scale factors
const KM_TO_SCENE_UNIT = 1 / 1000000; // 1 Three.js unit = 1,000,000 km
const AU_TO_KM = 149597870.7; // 1 AU in kilometers
const VISUAL_SCALE_MULTIPLIER = 2000; // Make planets visible (2000x larger than real)

// Planet physical radii in km (real values)
const PLANET_RADII_KM = {
  mercury: 2439.7,
  venus: 6051.8,
  earth: 6371.0,
  mars: 3389.5,
  jupiter: 69911,
  saturn: 58232,
  uranus: 25362,
  neptune: 24622,
};

// Map planet keys to Astronomy.Body enum
const BODY_MAP = {
  mercury: Astronomy.Body.Mercury,
  venus: Astronomy.Body.Venus,
  earth: Astronomy.Body.Earth,
  mars: Astronomy.Body.Mars,
  jupiter: Astronomy.Body.Jupiter,
  saturn: Astronomy.Body.Saturn,
  uranus: Astronomy.Body.Uranus,
  neptune: Astronomy.Body.Neptune,
};

/**
 * Get heliocentric position of a planet using astronomy-engine
 * @param {string} planetKey - Planet identifier
 * @param {Date} date - Date for position calculation
 * @returns {Object} { position: [x,y,z], velocity: [vx,vy,vz] }
 */
export function getPlanetPosition(planetKey, date) {
  const body = BODY_MAP[planetKey];
  if (!body) {
    console.error(`Unknown planet: ${planetKey}`);
    return { position: [0, 0, 0], velocity: [0, 0, 0] };
  }

  // Get heliocentric ecliptic coordinates
  const position = Astronomy.HelioVector(body, date);
  
  // Convert from AU to scene units (via km)
  // astronomy-engine returns AU, convert to km then to scene units
  const x = position.x * AU_TO_KM * KM_TO_SCENE_UNIT;
  const y = position.z * AU_TO_KM * KM_TO_SCENE_UNIT; // Z-up in astronomy, Y-up in Three.js
  const z = -position.y * AU_TO_KM * KM_TO_SCENE_UNIT; // Swap Y/Z

  return {
    position: [x, y, z],
    velocity: [0, 0, 0], // Can calculate if needed
  };
}

/**
 * Get all planet positions at once
 * @param {Date} date - Date for calculations
 * @returns {Object} Map of planet keys to positions
 */
export function getAllPlanetPositions(date) {
  const positions = {};
  Object.keys(BODY_MAP).forEach((planetKey) => {
    positions[planetKey] = getPlanetPosition(planetKey, date);
  });
  return positions;
}

/**
 * Get planet visual radius in scene units (with visibility multiplier)
 * @param {string} planetKey - Planet identifier
 * @returns {number} Visual radius
 */
export function getPlanetVisualRadius(planetKey) {
  const realRadiusKm = PLANET_RADII_KM[planetKey] || 6371;
  return (realRadiusKm * KM_TO_SCENE_UNIT * VISUAL_SCALE_MULTIPLIER);
}

/**
 * Get planet real radius in scene units (for collision/distance calculations)
 * @param {string} planetKey - Planet identifier
 * @returns {number} Real radius
 */
export function getPlanetRealRadius(planetKey) {
  const realRadiusKm = PLANET_RADII_KM[planetKey] || 6371;
  return (realRadiusKm * KM_TO_SCENE_UNIT);
}

/**
 * Generate orbit path points for visualization
 * @param {string} planetKey - Planet identifier
 * @param {Date} startDate - Starting date
 * @param {number} segments - Number of points
 * @returns {Array} Array of [x,y,z] positions
 */
export function getOrbitPath(planetKey, startDate, segments = 360) {
  const body = BODY_MAP[planetKey];
  if (!body) return [];

  // Get orbital period in days
  const periods = {
    mercury: 87.97,
    venus: 224.7,
    earth: 365.25,
    mars: 686.98,
    jupiter: 4332.59,
    saturn: 10759.22,
    uranus: 30688.5,
    neptune: 60182,
  };

  const periodDays = periods[planetKey] || 365.25;
  const points = [];

  for (let i = 0; i <= segments; i++) {
    const fraction = i / segments;
    const daysOffset = fraction * periodDays;
    const date = new Date(startDate.getTime() + daysOffset * 86400000);
    
    const position = Astronomy.HelioVector(body, date);
    const x = position.x * AU_TO_KM * KM_TO_SCENE_UNIT;
    const y = position.z * AU_TO_KM * KM_TO_SCENE_UNIT;
    const z = -position.y * AU_TO_KM * KM_TO_SCENE_UNIT;
    
    points.push([x, y, z]);
  }

  return points;
}

/**
 * Calculate rotation angle based on sidereal day and elapsed time
 * @param {number} siderealDayHours - Length of one sidereal day in Earth hours
 * @param {number} elapsedSeconds - Time elapsed since start
 * @param {number} timeScale - Time multiplier
 * @returns {number} Rotation angle in radians
 */
export function getRotationAngle(siderealDayHours, elapsedSeconds, timeScale = 1.0) {
  const siderealDaySeconds = siderealDayHours * 3600;
  const effectiveSeconds = elapsedSeconds * timeScale;
  const rotations = effectiveSeconds / siderealDaySeconds;
  return (rotations * 2 * Math.PI) % (2 * Math.PI);
}

/**
 * Get Sun position (always at origin)
 */
export function getSunPosition() {
  return [0, 0, 0];
}

/**
 * Convert scene position to AU for display
 */
export function sceneToAU(sceneUnits) {
  return (sceneUnits / KM_TO_SCENE_UNIT) / AU_TO_KM;
}
