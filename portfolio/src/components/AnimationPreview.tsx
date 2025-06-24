import { useGLTF, useAnimations } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { Group } from "three";

export default function WalkAnimationPreview() {
  const group = useRef<Group>(null);

  const gltf = useGLTF("/animations/running_to_turn_mirror.glb");
  const { animations } = gltf;
  const { actions, mixer } = useAnimations(animations, group);

  useEffect(() => {
    if (actions && animations.length > 0) {
      actions[animations[0].name]?.play();
    }
  }, [actions, animations]);

  return <primitive ref={group} object={gltf.scene} />;
}
