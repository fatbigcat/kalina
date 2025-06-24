"use client";

import { Canvas } from "@react-three/fiber";
import { ChanSimple } from "../../components/ChanSimple";
import SobelEffect from "../../components/SobelEffect";
import AnimationPreview from "../../components/AnimationPreview";
import { OrbitControls } from "@react-three/drei";
import React from "react";
import * as THREE from "three";

export default function Character() {
  const [currentPose, setCurrentPose] = React.useState<{
    animationName: string;
    timePosition?: number;
    loop: boolean;
  }>({
    animationName: "Armature|mixamo.com|Layer0",
    timePosition: 0,
    loop: false,
  });

  // Note: This model currently has one Mixamo animation
  // Check browser console for available animations when component loads
  const poses = [
    {
      name: "T-Pose (Static)",
      animationName: "Armature|mixamo.com|Layer0",
      timePosition: 0,
      loop: false,
    },
    {
      name: "Mid Animation",
      animationName: "Armature|mixamo.com|Layer0",
      timePosition: 1.5,
      loop: false,
    },
    {
      name: "End Animation",
      animationName: "Armature|mixamo.com|Layer0",
      timePosition: 3.0,
      loop: false,
    },
    {
      name: "Play Animation",
      animationName: "Armature|mixamo.com|Layer0",
      loop: true,
    },
  ];

  return (
    <div className="relative w-full h-screen">
      {/* Pose Controls */}
      <div className="absolute top-4 left-4 z-10 bg-black/80 p-4 rounded">
        <h3 className="text-white mb-2">Poses:</h3>
        <div className="space-y-2">
          {poses.map((pose) => (
            <button
              key={`${pose.name}-${pose.timePosition ?? "loop"}`}
              onClick={() => setCurrentPose(pose)}
              className={`block w-full text-left px-3 py-1 rounded ${
                currentPose.animationName === pose.animationName &&
                currentPose.timePosition === pose.timePosition
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {pose.name}
            </button>
          ))}
        </div>
      </div>

      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }}
        className="w-full h-screen"
        style={{ background: "black" }}
        onCreated={() => console.log("Canvas created successfully!")}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />

        {/* Your character */}
        <ChanSimple
          animationName={currentPose.animationName}
          timePosition={currentPose.timePosition}
          loop={currentPose.loop}
          position={[0, -4, 0]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[2, 2, 2]}
        />

        <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
      </Canvas>
    </div>
  );
}
