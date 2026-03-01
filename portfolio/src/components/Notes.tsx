import * as React from "react";
import * as THREE from "three";
import { Instances, Instance, Outlines, useGLTF } from "@react-three/drei";

type NotesProps = {
  /** Path to your exported .glb (public folder) */
  url?: string;
  /** Number of note instances */
  count?: number;
  /** Overall scale multiplier */
  scale?: number;
  /** Scatter box size in world units: [x, y, z] */
  spread?: [number, number, number];
  /** Base toon color */
  color?: THREE.ColorRepresentation;
  /** Outline color */
  outlineColor?: THREE.ColorRepresentation;
  /** Outline thickness (world units-ish; tune per scale) */
  outlineThickness?: number;
  /** Number of toon bands (2–6 typical) */
  toonSteps?: number;
  /** Optional fixed seed for stable layout */
  seed?: number;
};

type GLTFResult = {
  nodes: Record<string, THREE.Mesh>;
  materials: Record<string, THREE.Material>;
};

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeGradientMap(steps: number) {
  const s = Math.max(2, Math.floor(steps));
  const data = new Uint8Array(s);
  for (let i = 0; i < s; i++) data[i] = (i / (s - 1)) * 255;
  const tex = new THREE.DataTexture(data, s, 1, THREE.RedFormat);
  tex.needsUpdate = true;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  return tex;
}

function pickFirstMeshGeometry(
  nodes: Record<string, any>,
): THREE.BufferGeometry {
  for (const k of Object.keys(nodes)) {
    const n = nodes[k];
    if (n && n.isMesh && n.geometry) return n.geometry;
  }
  throw new Error(
    "No mesh geometry found in GLB. Ensure the exported model contains a Mesh.",
  );
}

export default function Notes({
  url = "/models/note.glb",
  count = 10,
  scale = 0.1,
  spread = [12, 6, 12],
  color = "red",
  outlineColor = "white",
  outlineThickness = 0.03,
  toonSteps = 4,
  seed = 1337,
}: NotesProps) {
  const gltf = useGLTF(url) as unknown as GLTFResult;

  const geometry = React.useMemo(
    () => pickFirstMeshGeometry(gltf.nodes),
    [gltf.nodes],
  );

  const gradientMap = React.useMemo(
    () => makeGradientMap(toonSteps),
    [toonSteps],
  );

  const toonMaterial = React.useMemo(() => {
    const m = new THREE.MeshToonMaterial({
      color,
      gradientMap,
    });
    // If you see banding that’s too harsh, increase toonSteps or remove nearest filtering above.
    return m;
  }, [color, gradientMap]);

  // Stable random transforms, but all notes same size
  const transforms = React.useMemo(() => {
    const rand = mulberry32(seed);
    const [sx, sy, sz] = spread;
    return Array.from({ length: count }, () => {
      const px = (rand() - 0.5) * sx;
      const py = (rand() - 0.5) * sy;
      const pz = (rand() - 0.5) * sz;

      const rx = rand() * Math.PI * 2;
      const ry = rand() * Math.PI * 2;
      const rz = rand() * Math.PI * 2;

      // All notes same size
      const s = scale;

      return {
        position: [px, py, pz] as [number, number, number],
        rotation: [rx, ry, rz] as [number, number, number],
        scale: s,
      };
    });
  }, [count, seed, spread, scale]);

  return (
    <Instances geometry={geometry} material={toonMaterial} scale={scale}>
      {/* Important: Outlines + instancing */}
      {/* Drei's <Outlines /> works per-mesh. With <Instances/>, attach it once here as a child and it applies to instances. */}
      <Outlines color={outlineColor} thickness={outlineThickness} />

      {transforms.map((t, i) => (
        <Instance
          key={i}
          position={t.position}
          rotation={t.rotation}
          scale={t.scale}
        />
      ))}
    </Instances>
  );
}

// Preload helper (optional)
useGLTF.preload("/models/note.glb");
