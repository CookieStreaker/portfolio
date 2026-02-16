// Big Bang fragment shader
uniform float uProgress;
uniform float uTime;

varying float vAlpha;
varying float vDistance;

void main() {
  // Circular point shape
  float d = length(gl_PointCoord - vec2(0.5));
  if (d > 0.5) discard;

  float alpha = smoothstep(0.5, 0.0, d) * vAlpha;

  // Color gradient: white-hot core → orange → blue at edges
  vec3 coreColor = vec3(1.0, 1.0, 1.0);
  vec3 midColor = vec3(1.0, 0.6, 0.2);
  vec3 edgeColor = vec3(0.3, 0.5, 1.0);

  float colorMix = smoothstep(0.0, 40.0, vDistance);
  vec3 color = mix(coreColor, midColor, colorMix);
  color = mix(color, edgeColor, smoothstep(40.0, 100.0, vDistance));

  // Fade everything as big bang completes
  float fadeOut = 1.0 - smoothstep(0.75, 1.0, uProgress);

  gl_FragColor = vec4(color, alpha * fadeOut);
}
