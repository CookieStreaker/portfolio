// Atmosphere Fresnel fragment shader
uniform vec3 uColor;
uniform vec3 uSunPosition;
uniform float uIntensity;

varying vec3 vNormal;
varying vec3 vWorldPosition;

void main() {
  // View direction
  vec3 viewDir = normalize(cameraPosition - vWorldPosition);

  // Fresnel effect — glows at edges
  float fresnel = 1.0 - max(dot(viewDir, vNormal), 0.0);
  fresnel = pow(fresnel, 3.0) * uIntensity;

  // Sunlight direction
  vec3 sunDir = normalize(uSunPosition - vWorldPosition);
  float sunFacing = max(dot(vNormal, sunDir), 0.0);

  // Atmosphere is brighter on sun-facing side
  float atmosphereBrightness = 0.15 + sunFacing * 0.85;

  // Final color
  vec3 color = uColor * fresnel * atmosphereBrightness;
  float alpha = fresnel * atmosphereBrightness * 0.8;

  gl_FragColor = vec4(color, alpha);
}
