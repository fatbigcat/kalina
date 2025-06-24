import { useThree, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { LuminosityShader } from "three/examples/jsm/shaders/LuminosityShader";
import { SobelOperatorShader } from "three/examples/jsm/shaders/SobelOperatorShader";
import * as THREE from "three";

/**
 * Post-processing pass that converts the whole framebuffer to greyscale
 * and then runs Sobel edge detection over it.
 *
 * @param enabled – toggle the pass on/off without unmounting the component
 */

export default function SobelEffect({ enabled = true }: { enabled?: boolean }) {
  const { gl, scene, camera, size } = useThree();
  const composer = useRef<InstanceType<typeof EffectComposer> | null>(null);
  const sobelPass = useRef<InstanceType<typeof ShaderPass> | null>(null);

  /* ----- Build the composer once -------------------------------------- */
  useEffect(() => {
    const c = new EffectComposer(gl);
    c.addPass(new RenderPass(scene, camera));

    c.addPass(new ShaderPass(LuminosityShader));

    const sobel = new ShaderPass(SobelOperatorShader);
    c.addPass(sobel);

    composer.current = c;
    sobelPass.current = sobel;

    return () => c.dispose();
  }, [gl, scene, camera]);

  /* ----- Keep buffers & uniform in sync with canvas size -------------- */
  useEffect(() => {
    if (!composer.current || !sobelPass.current) return;
    const dpr = gl.getPixelRatio();

    composer.current.setSize(size.width, size.height);
    sobelPass.current.uniforms.resolution.value.set(
      size.width * dpr,
      size.height * dpr
    );
  }, [size, gl]);

  /* ----- Render after the main scene each frame ----------------------- */
  useFrame(() => {
    if (enabled && composer.current) {
      composer.current.render();
    }
  }, 1); // index 1 → after r3f’s own render

  return null; // nothing added to the jsx tree
}
