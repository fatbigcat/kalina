"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { Frontflip } from "../../components/Frontflip";
import SobelEffect from "../../components/SobelEffect";
import React, { useMemo } from "react";

function ChanWrapper({
  animationName,
  timePosition,
  loop,
}: Readonly<{
  animationName: string;
  timePosition?: number;
  loop: boolean;
}>) {
  const { size, camera } = useThree();
  const position = useMemo(() => {
    const width = size.width / camera.zoom;
    const height = size.height / camera.zoom;
    return [-width / 2 + 1, -height / 2, 0] as [number, number, number]; // adjust Y margin here
  }, [size, camera.zoom]);

  return (
    <Frontflip
      animationName={animationName}
      timePosition={timePosition}
      loop={loop}
      position={position}
      scale={[2, 2, 2]}
      rotation={[0, Math.PI / 2, 0]}
    />
  );
}

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

  // Note: This model has the Frontflip animation from Mixamo
  // Check browser console for available animations when component loads
  const poses = [
    {
      name: "Starting Pose",
      animationName: "Armature|mixamo.com|Layer0",
      timePosition: 0,
      loop: false,
    },
    {
      name: "Mid Frontflip",
      animationName: "Armature|mixamo.com|Layer0",
      timePosition: 0.8,
      loop: false,
    },
    {
      name: "Landing Pose",
      animationName: "Armature|mixamo.com|Layer0",
      timePosition: 1.6,
      loop: false,
    },
    {
      name: "Play Frontflip",
      animationName: "Armature|mixamo.com|Layer0",
      loop: true,
    },
  ];

  return (
    <div className="relative w-full h-screen">
      {/* Pose Controls */}
      <div className="absolute top-4 left-4 z-10 bg-black/80 p-4 rounded">
        <h3 className="text-white mb-2">Frontflip Poses:</h3>
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
        orthographic
        camera={{ zoom: 100, position: [0, 0, 10] }}
        className="w-full h-screen"
        style={{ background: "black" }}
        onCreated={() => console.log("Canvas created successfully!")}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        {/* Your character */}
        <ChanWrapper
          animationName={currentPose.animationName}
          timePosition={currentPose.timePosition}
          loop={currentPose.loop}
        />
        <SobelEffect enabled={true} />
      </Canvas>
    </div>
  );
}
