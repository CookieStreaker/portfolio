// Big Bang vertex shader
uniform float uTime;
uniform float uProgress; // 0 = collapsed, 1 = fully expanded

attribute float aSize;
attribute float aSpeed;
attribute vec3 aDirection;
attribute float aPhase;

varying float vAlpha;
varying float vDistance;

// Simplex-like noise
float hash(float n) { return fract(sin(n) * 43758.5453123); }

float noise3d(vec3 x) {
  vec3 p = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  float n = p.x + p.y * 157.0 + 113.0 * p.z;
  return mix(
    mix(mix(hash(n + 0.0), hash(n + 1.0), f.x),
        mix(hash(n + 157.0), hash(n + 158.0), f.x), f.y),
    mix(mix(hash(n + 113.0), hash(n + 114.0), f.x),
        mix(hash(n + 270.0), hash(n + 271.0), f.x), f.y),
    f.z);
}

void main() {
  // Explosion trajectory
  float speed = aSpeed * (0.5 + 0.5 * uProgress);
  float t = uProgress * speed;

  // Shockwave: particles accelerate then decelerate
  float shockwave = smoothstep(0.0, 0.3, uProgress) * (1.0 - smoothstep(0.7, 1.0, uProgress) * 0.3);

  // Position along explosion direction
  vec3 displaced = aDirection * t * 80.0 * shockwave;

  // Add noise turbulence
  float noiseScale = 1.5;
  displaced.x += noise3d(displaced * noiseScale + uTime * 0.5) * 5.0 * uProgress;
  displaced.y += noise3d(displaced * noiseScale + 100.0 + uTime * 0.3) * 5.0 * uProgress;
  displaced.z += noise3d(displaced * noiseScale + 200.0 + uTime * 0.7) * 5.0 * uProgress;

  // Camera shake effect (erratic early, stable later)
  float shake = (1.0 - uProgress) * sin(uTime * 20.0 + aPhase) * 2.0;

  vec4 mvPosition = modelViewMatrix * vec4(position + displaced + vec3(shake * 0.2, shake * 0.15, 0.0), 1.0);

  // Size attenuation
  float dist = length(mvPosition.xyz);
  gl_PointSize = aSize * (300.0 / dist) * (0.5 + 0.5 * uProgress);

  // Alpha based on distance and progress
  vDistance = length(displaced);
  vAlpha = smoothstep(0.0, 0.1, uProgress) * (1.0 - smoothstep(60.0, 120.0, vDistance));

  gl_Position = projectionMatrix * mvPosition;
}
