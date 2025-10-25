import React, { useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// Component for a single interactive sphere
const InteractiveSphere = ({ position, onPointerOver, onPointerLeave }) => {
  const meshRef = useRef();

  const [hover, setHover] = useState(false);

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={(event) => {
        setHover(true);
        onPointerOver(event.object);
      }}
      onPointerLeave={(event) => {
        setHover(false);
        onPointerLeave(event.object);
      }}
    >
      <sphereGeometry args={[0.1]} />
      <meshBasicMaterial color={hover ? 0xff00ff : 0x00ff00} />
    </mesh>
  );
};

const DeviceSceneR3F: React.FC = () => {
  const [hoveredObject, setHoveredObject] = useState<THREE.Object3D | null>(
    null
  );

  const handlePointerOver = (object: THREE.Object3D) => {
    setHoveredObject(object);
    console.log(object);
  };
  const handlePointerLeave = (object: THREE.Object3D) => {
    setHoveredObject(null);
  };

  return (
    <Canvas camera={{ position: [5, 0, 10], fov: 75 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <OrbitControls />

      {Array.from({ length: 5 }).flatMap((_, i) =>
        Array.from({ length: 5 }).flatMap((_, j) =>
          Array.from({ length: 5 }).map((_, k) => (
            <InteractiveSphere
              key={`${i}-${j}-${k}`}
              position={[i, j, k]}
              onPointerOver={handlePointerOver}
              onPointerLeave={handlePointerLeave}
            />
          ))
        )
      )}
    </Canvas>
  );
};

export default DeviceSceneR3F;
