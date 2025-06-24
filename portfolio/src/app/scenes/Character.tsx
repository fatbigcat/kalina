"use client";

import { Canvas } from "@react-three/fiber";
import { Chan } from "../../components/Chan";
import SobelEffect from "../../components/SobelEffect";
import { OrbitControls } from "@react-three/drei";
import React from "react";

export default function Character() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      className="w-full h-screen"
      style={{ background: "black" }}
    >
      <ambientLight scale={0.5} />
      <Chan />
      <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
      <SobelEffect enabled={true} />
    </Canvas>
  );
}
