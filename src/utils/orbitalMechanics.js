/**
 * Kepler's Equation solver and orbital mechanics for accurate 3D planetary positions.
 * Based on JPL's Keplerian elements approximation for the planets.
 * Reference: https://ssd.jpl.nasa.gov/planets/approx_pos.html
 */

const DEG2RAD = Math.PI / 180;
const AU_TO_SCENE = 8; // Scale factor: 1 AU = 8 scene units

/**
 * Solve Kepler's Equation: M = E - e*sin(E)
 * Uses Newton-Raphson iteration to find Eccentric Anomaly (E)
 */
function solveKepler(M, e, tol = 1e-10, maxIter = 100) {
  let E = M; // Initial guess
  for (let i = 0; i < maxIter; i++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < tol) break;
  }
  return E;
}

/**
 * Compute a planet's heliocentric position in 3D ecliptic coordinates.
 * @param {Object} orbitalElements - Keplerian orbital elements
 * @param {Date} date - Date for which to compute position
 * @param {number} timeScale - Time multiplier for animation (1.0 = real-time)
 * @returns {Array} [x, y, z] in scene units
 */
export function getPlanetPosition(orbitalElements, date = new Date(), timeScale = 1.0) {
  // Centuries since J2000.0 epoch (2000-01-01 12:00 TT)
  const J2000 = Date.UTC(2000, 0, 1, 12, 0, 0);
  const T = ((date.getTime() - J2000) * timeScale) / (36525 * 86400000);

  const { a, aRate, e, eRate, i, iRate, L, LRate, longPeri, longPeriRate, longNode, longNodeRate } =
    orbitalElements;

  // Compute current orbital elements at epoch T
  const aC = a + aRate * T; // Semi-major axis (AU)
  const eC = e + eRate * T; // Eccentricity
  const iC = (i + iRate * T) * DEG2RAD; // Inclination
  const LC = (L + LRate * T) * DEG2RAD; // Mean longitude
  const wBar = (longPeri + longPeriRate * T) * DEG2RAD; // Longitude of perihelion
  const Omega = (longNode + longNodeRate * T) * DEG2RAD; // Longitude of ascending node

  // Argument of perihelion
  const w = wBar - Omega;

  // Mean anomaly
  let M = LC - wBar;
  // Normalize to [-π, π]
  M = ((M % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;

  // Solve Kepler's equation for Eccentric Anomaly
  const E = solveKepler(M, eC);

  // True anomaly (angle from perihelion to planet)
  const nu = 2 * Math.atan2(
    Math.sqrt(1 + eC) * Math.sin(E / 2),
    Math.sqrt(1 - eC) * Math.cos(E / 2)
  );

  // Distance from sun (radius)
  const r = aC * (1 - eC * Math.cos(E));

  // Position in orbital plane
  const xOrb = r * Math.cos(nu);
  const yOrb = r * Math.sin(nu);
  const zOrb = 0;

  // Rotation matrices to convert to ecliptic coordinates
  // 1. Rotate by argument of perihelion (w)
  const cosW = Math.cos(w);
  const sinW = Math.sin(w);
  const x1 = cosW * xOrb - sinW * yOrb;
  const y1 = sinW * xOrb + cosW * yOrb;
  const z1 = zOrb;

  // 2. Rotate by inclination (i)
  const cosI = Math.cos(iC);
  const sinI = Math.sin(iC);
  const x2 = x1;
  const y2 = cosI * y1 - sinI * z1;
  const z2 = sinI * y1 + cosI * z1;

  // 3. Rotate by longitude of ascending node (Omega)
  const cosO = Math.cos(Omega);
  const sinO = Math.sin(Omega);
  const x = cosO * x2 - sinO * y2;
  const y = sinO * x2 + cosO * y2;
  const z = z2;

  // Convert from AU to scene units
  return [x * AU_TO_SCENE, y * AU_TO_SCENE, z * AU_TO_SCENE];
}

/**
 * Generate elliptical orbit path points for visualization
 * @param {Object} orbitalElements - Keplerian orbital elements
 * @param {number} segments - Number of points on the orbit
 * @returns {Array} Array of [x, y, z] positions
 */
export function getOrbitPath(orbitalElements, segments = 256) {
  const points = [];
  const { a, e, i, longPeri, longNode } = orbitalElements;

  const iRad = i * DEG2RAD;
  const wBar = longPeri * DEG2RAD;
  const Omega = longNode * DEG2RAD;
  const w = wBar - Omega;

  for (let j = 0; j <= segments; j++) {
    const nu = (j / segments) * 2 * Math.PI; // True anomaly
    const r = a * (1 - e * e) / (1 + e * Math.cos(nu)); // Radius

    // Position in orbital plane
    const xOrb = r * Math.cos(nu);
    const yOrb = r * Math.sin(nu);

    // Apply 3D rotation transformations
    const cosW = Math.cos(w);
    const sinW = Math.sin(w);
    const x1 = cosW * xOrb - sinW * yOrb;
    const y1 = sinW * xOrb + cosW * yOrb;

    const cosI = Math.cos(iRad);
    const sinI = Math.sin(iRad);
    const x2 = x1;
    const y2 = cosI * y1;
    const z2 = sinI * y1;

    const cosO = Math.cos(Omega);
    const sinO = Math.sin(Omega);
    const x = cosO * x2 - sinO * y2;
    const y = sinO * x2 + cosO * y2;
    const z = z2;

    points.push([x * AU_TO_SCENE, y * AU_TO_SCENE, z * AU_TO_SCENE]);
  }

  return points;
}

/**
 * Calculate rotation angle based on sidereal day and time scale
 * @param {number} siderealDayHours - Length of one sidereal day in Earth hours
 * @param {number} deltaTime - Time elapsed in seconds
 * @param {number} timeScale - Time multiplier
 * @returns {number} Rotation angle in radians
 */
export function getRotationDelta(siderealDayHours, deltaTime, timeScale = 1.0) {
  // Convert sidereal day to seconds
  const siderealDaySeconds = siderealDayHours * 3600;
  // Radians per second
  const radiansPerSecond = (2 * Math.PI) / siderealDaySeconds;
  return radiansPerSecond * deltaTime * timeScale;
}
