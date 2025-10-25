import React, { useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import { useApp } from "./state/AppState";

type Props = {
  showImg: (hash: string) => void;
};

const InteractiveSphere = ({
  position,
  hash,
  onPointerOver,
  onPointerLeave,
  onClick,
}) => {
  const meshRef = useRef();

  const [hover, setHover] = useState(false);

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={() => onClick(hash)}
      onPointerOver={(event) => {
        setHover(true);
        onPointerOver(event.object);
      }}
      onPointerLeave={(event) => {
        setHover(false);
        onPointerLeave(event.object);
      }}
    >
      <Text
        position={[0, 0.7, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {hover ? hash.slice(0, 8) : ""}
      </Text>
      <sphereGeometry args={[0.1]} />
      <meshBasicMaterial color={hover ? 0xff00ff : 0x00ff00} />
    </mesh>
  );
};

function calculateGridDimensions(count: number) {
  const cubeRoot = Math.ceil(Math.cbrt(count));

  const x = cubeRoot;
  const y = cubeRoot;
  const z = Math.ceil(count / (x * y));

  return { x, y, z };
}

const DeviceSceneR3F: React.FC<Props> = ({ showImg }) => {
  const { state } = useApp();
  const { imageHashes: hashes } = state;
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

  const { x, y, z } = calculateGridDimensions(hashes.length);
  const offsetX = (x - 1) / 2;
  const offsetY = (y - 1) / 2;
  const offsetZ = (z - 1) / 2;
  const spheres = [];
  let hashIndex = 0;
  for (let i = 0; i < x && hashIndex < hashes.length; i++) {
    for (let j = 0; j < y && hashIndex < hashes.length; j++) {
      for (let k = 0; k < z && hashIndex < hashes.length; k++) {
        spheres.push({
          position: [
            (i - offsetX) * 2,
            (j - offsetY) * 2,
            (k - offsetZ) * 2,
          ] as [number, number, number],
          hash: hashes[hashIndex],
        });
        hashIndex++;
      }
    }
  }

  return (
    <Canvas camera={{ position: [x * 3, y * 3, z * 3], fov: 75 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <OrbitControls />

      {spheres.map((sphere, idx) => (
        <InteractiveSphere
          key={idx}
          position={sphere.position}
          hash={sphere.hash}
          onClick={showImg}
          onPointerOver={handlePointerOver}
          onPointerLeave={handlePointerLeave}
        />
      ))}
    </Canvas>
  );
};

export default DeviceSceneR3F;
