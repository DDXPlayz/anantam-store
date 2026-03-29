import { useRef, useMemo } from 'react';
import { Float, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export function ShirtDisplay({
  modelPath,
  isActive = false
}: {
  modelPath: string,
  isActive?: boolean
}) {
  const group = useRef<THREE.Group>(null);

  // Load the GLB model
  const { scene } = useGLTF(modelPath);

  // Clone the scene to avoid sharing state between instances
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  // Adjust materials to look premium
  useMemo(() => {
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.roughness = 0.4;
          mat.metalness = 0.3;
          mat.envMapIntensity = 1.5;
        }
      }
    });
  }, [clonedScene]);

  // Model purely renders here. Rotation is externally controlled by InteractiveShirt
  return (
    <Float
      speed={isActive ? 0 : 1.5}
      rotationIntensity={isActive ? 0 : 0.1}
      floatIntensity={isActive ? 0 : 0.3}
      floatingRange={isActive ? [0, 0] : [-0.05, 0.05]}
      enabled={!isActive}
    >
      <group ref={group} dispose={null}>
        <primitive object={clonedScene} scale={0.5} position={[0, -1.2, 0]} />
      </group>
    </Float>
  );
}
