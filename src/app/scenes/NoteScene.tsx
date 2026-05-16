"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Center } from "@react-three/drei";
import Notes from "@/components/Notes";

type MusicSceneProps = {
  noteColor?: string;
  outlineColor?: string;
  cameraPosition?: [number, number, number];
  noteScale?: number;
};

export default function MusicScene({
  noteColor = "red",
  outlineColor = "white",
  cameraPosition = [0, 3, 12],
  noteScale = 5,
}: MusicSceneProps) {
  return (
    <Canvas camera={{ position: cameraPosition, fov: 45 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} />
      <Center>
        <Notes
          count={10}
          scale={noteScale}
          spread={[60, 30, 60]}
          outlineThickness={0.1}
          color={noteColor}
          outlineColor={outlineColor}
        />
      </Center>
      <OrbitControls enablePan={false} />
    </Canvas>
  );
}
