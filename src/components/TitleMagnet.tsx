'use client';

import { Component, Suspense, useEffect, useRef, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text3D } from '@react-three/drei';
import { Box3, Group } from 'three';
import { MAGNET_LIFT_PX } from './MagnetItem';

const FONT_URL = '/fonts/kalina-magnets.json';
const BODY_DEPTH = 0.072;
const BODY_BEVEL_THICKNESS = 0.023;
// The source font's ascender/descender put the baseline 0.3475em below the line-box centre.
const BASELINE_FROM_CENTRE = (945 - 250) / 2000;

type TitleMagnetProps = {
  onReadyChange: (ready: boolean) => void;
};

class MagnetBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function MagnetScene({ onReadyChange }: TitleMagnetProps) {
  const { size, gl } = useThree();
  const anchor = useRef<HTMLElement | null>(null);
  const pose = useRef<Group>(null);
  const origin = useRef<Group>(null);
  const ready = useRef(false);

  useEffect(() => {
    anchor.current = document.querySelector<HTMLElement>('[data-title-magnet]');
  }, []);

  useEffect(() => {
    const lost = () => onReadyChange(false);
    const restored = () => {
      ready.current = false;
    };
    const canvas = gl.domElement;
    canvas.addEventListener('webglcontextlost', lost);
    canvas.addEventListener('webglcontextrestored', restored);
    return () => {
      canvas.removeEventListener('webglcontextlost', lost);
      canvas.removeEventListener('webglcontextrestored', restored);
      onReadyChange(false);
    };
  }, [gl, onReadyChange]);

  useFrame(() => {
    const node = anchor.current;
    const body = pose.current;
    const textOrigin = origin.current;
    if (!node || !body || !textOrigin) return;
    const rect = node.getBoundingClientRect();
    body.visible = rect.width > 0 && rect.height > 0;
    if (!body.visible) return;

    // One complete word follows the same DOM anchor on mobile and desktop.
    const style = getComputedStyle(node);
    const matrix = new DOMMatrixReadOnly(style.transform === 'none' ? undefined : style.transform);
    const scale = Math.hypot(matrix.a, matrix.b);
    const fontSize = parseFloat(style.fontSize);
    const lift = parseFloat(style.getPropertyValue('--magnet-lift')) || 0;
    body.position.set(
      rect.left + rect.width / 2 - size.width / 2,
      size.height / 2 - rect.top - rect.height / 2,
      BODY_BEVEL_THICKNESS * fontSize + MAGNET_LIFT_PX * lift,
    );
    body.rotation.z = -Math.atan2(matrix.b, matrix.a);
    body.scale.set(fontSize * scale, fontSize * scale, fontSize);
    textOrigin.position.set(-parseFloat(style.width) / fontSize / 2, -BASELINE_FROM_CENTRE, 0);

    // Text3D's font metrics do not share the DOM line box's edges. Align the
    // actual bevel bounds to the anchor so the visible magnet follows its
    // viewport inset (and remains aligned while it is dragged).
    body.updateMatrixWorld(true);
    const visualBounds = new Box3().setFromObject(body);
    const visualLeft = visualBounds.min.x + size.width / 2;
    const visualBottom = size.height / 2 - visualBounds.min.y;
    body.position.x += rect.left - visualLeft;
    body.position.y += visualBottom - rect.bottom;
    if (!ready.current) {
      ready.current = true;
      onReadyChange(true);
    }
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <hemisphereLight args={['#ffffff', '#777b80', 0.8]} />
      <directionalLight
        position={[-250, 450, 1800]}
        intensity={1.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-size.width}
        shadow-camera-right={size.width}
        shadow-camera-top={size.height}
        shadow-camera-bottom={-size.height}
        shadow-camera-far={3000}
        shadow-bias={-0.0001}
        shadow-normalBias={0.1}
        shadow-radius={1.5}
      />
      <directionalLight position={[600, 100, 500]} intensity={0.5} />
      <mesh receiveShadow>
        <planeGeometry args={[size.width * 2, size.height * 2]} />
        <shadowMaterial transparent opacity={0.28} />
      </mesh>
      <group ref={pose} visible={false}>
        <group ref={origin}>
          <Text3D font={FONT_URL} size={1} height={BODY_DEPTH}
            bevelEnabled bevelSize={0.027} bevelThickness={BODY_BEVEL_THICKNESS}
            bevelSegments={10} curveSegments={16} smooth={0.0001} castShadow receiveShadow>
            Kalina
            <meshPhysicalMaterial color="#ffffff" roughness={0.3} clearcoat={0.45} />
          </Text3D>
          <Text3D font={FONT_URL} position={[0, 0, BODY_DEPTH + BODY_BEVEL_THICKNESS]}
            size={1} height={0.003} bevelEnabled bevelSize={0.004} bevelThickness={0.004}
            bevelSegments={6} curveSegments={16} smooth={0.0001} castShadow receiveShadow>
            Kalina
            <meshPhysicalMaterial color="#383838" roughness={0.65} clearcoat={0.08} />
          </Text3D>
        </group>
      </group>
    </>
  );
}

export default function TitleMagnet(props: TitleMagnetProps) {
  return (
    <div className="pointer-events-none fixed inset-0 z-30" aria-hidden="true">
      <MagnetBoundary onError={() => props.onReadyChange(false)}>
        <Canvas
          orthographic
          camera={{ position: [0, 0, 1000], zoom: 1, near: 0.1, far: 3000 }}
          dpr={[1, 1.5]}
          shadows
          gl={{ alpha: true, antialias: true }}
          fallback={null}
          style={{ pointerEvents: 'none' }}
        >
          <Suspense fallback={null}>
            <MagnetScene {...props} />
          </Suspense>
        </Canvas>
      </MagnetBoundary>
    </div>
  );
}
