"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export default function BlinkParticles() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
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
  const gridSize = 100;
  const separation = 0.1;
  const count = gridSize * gridSize;

  const { positions, scales } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);

    let i = 0;
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        const idx = i * 3;
        positions[idx + 0] = (x - gridSize / 2) * separation;
        positions[idx + 1] = (y - gridSize / 2) * separation;
        positions[idx + 2] = 0;
        scales[i] = Math.random();
        i++;
      }
    }

    return { positions, scales };
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          itemSize={3}
          count={positions.length / 3}
        />
        <bufferAttribute
          attach="attributes-aScale"
          array={scales}
          itemSize={1}
          count={scales.length}
        />
      </bufferGeometry>
      <pointsMaterial
        color={0xffffff}
        size={0.05}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
