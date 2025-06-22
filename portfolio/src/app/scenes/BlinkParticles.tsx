"use client";

import { Canvas, extend, useFrame } from "@react-three/fiber";
import { OrbitControls, shaderMaterial } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

export default function BlinkParticles() {
  return (
    <Canvas camera={{ position: [0, 0, 0], fov: 90 }}>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={true}
        autoRotate
        autoRotateSpeed={0.05}
      />
      <ambientLight />
      <StaticParticles />
    </Canvas>
  );
}
function StaticParticles() {
  const gridSize = 25;
  const separation = 7;
  const count = gridSize * gridSize * gridSize;

  const { positions, scales } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    let i = 0;
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        for (let z = 0; z < gridSize; z++) {
          const idx = i * 3;
          positions[idx + 0] = (x - gridSize / 2) * separation;
          positions[idx + 1] = (y - gridSize / 2) * separation;
          positions[idx + 2] = (z - gridSize / 2) * separation - 60; // Move grid further away
          scales[i] = (Math.sin(i) + 1) * 0.01; // Scale based on index for variety
          i++;
        }
      }
    }
    return { positions, scales };
  }, [count, gridSize, separation]);

  const BlinkMaterial = shaderMaterial(
    { uTime: 0 },
    `
    uniform float uTime;
    attribute float aScale;

    // === GLSL 3D Simplex Noise ===
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
    vec4 taylorInvSqrt(vec4 r) {
      return 1.79284291400159 - 0.85373472095314 * r;
    }

    float snoise(vec3 v) {
      const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

      vec3 i = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);

      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);

      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;

      i = mod289(i);
      vec4 p = permute(permute(permute(
          i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));

      vec4 j = p - 49.0 * floor(p * (1.0 / 7.0));
      vec4 x_ = floor(j * (1.0 / 7.0));
      vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ * (1.0 / 7.0) + 1.0 / 14.0;
      vec4 y = y_ * (1.0 / 7.0) + 1.0 / 14.0;
      vec4 h = 1.0 - abs(x) - abs(y);

      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      vec4 s0 = floor(b0) * 2.0 + 1.0;
      vec4 s1 = floor(b1) * 2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));

      vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);

      vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1),
                                     dot(p2, p2), dot(p3, p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;

      vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1),
                              dot(x2, x2), dot(x3, x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1),
                                    dot(p2, x2), dot(p3, x3)));
    }

    void main() {
      // Add per-particle phase offset for more random blinking
      float phase = aScale * 10.0;
      float noise = snoise(vec3(position.xy * 1.5, uTime * 0.5 + phase));
      float size = aScale + noise * 0.5;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      gl_PointSize = size * 0.001 * (100.0 / -mvPosition.z);
    }
  `,
    `
    void main() {
      float d = distance(gl_PointCoord, vec2(0.5));
      if (d > 0.5) discard;
      gl_FragColor = vec4(1.0);
    }
  `
  );
  extend({ BlinkMaterial });
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const geometryRef = useRef<THREE.BufferGeometry | null>(null);
  useEffect(() => {
    if (geometryRef.current) {
      geometryRef.current.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3)
      );
      geometryRef.current.setAttribute(
        "aScale",
        new THREE.Float32BufferAttribute(scales, 1)
      );
    }
  }, [positions, scales]);
  useFrame(({ clock }) => {
    if (materialRef.current?.uniforms?.uTime) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });
  return (
    <points>
      <bufferGeometry ref={geometryRef} />
      {/* @ts-expect-error: Custom shader material type */}
      {/* <pointsMaterial color={"#ffffff"} size={0.5} /> */}
      <blinkMaterial ref={materialRef} />
    </points>
  );
}
