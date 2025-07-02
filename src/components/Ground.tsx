import React, { useEffect, useState } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

const Ground: React.FC = () => {
  const { scene } = useThree();
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load("/Seamless Ocean Texture.jpg", (loadedTexture) => {
      loadedTexture.wrapS = loadedTexture.wrapT = THREE.RepeatWrapping;
      loadedTexture.repeat.set(10, 10); // Increase repeat to cover larger area
      setTexture(loadedTexture);
    });
  }, []);

  return (
    <group>
      {/* Ground plane to simulate the bottom of the pond, extended much further */}
      <mesh position={[0, 0, -2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />{" "}
        {/* Much larger plane to extend far into the distance */}
        <meshStandardMaterial map={texture} transparent={false} opacity={1.0} />
      </mesh>
      {/* Add more irregularity to mimic natural pond bottom, densely packed */}
      <mesh position={[0, 0, -1.9]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1, 16]} />
        <meshStandardMaterial
          color="#4A3A2B" // Darker brown for variation
          transparent={false}
          opacity={1.0}
        />
      </mesh>
      <mesh position={[2, 1, -1.95]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.8, 16]} />
        <meshStandardMaterial
          color="#4A3A2B" // Darker brown for variation
          transparent={false}
          opacity={1.0}
        />
      </mesh>
      <mesh position={[-1.5, -2, -1.92]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.2, 16]} />
        <meshStandardMaterial
          color="#4A3A2B" // Darker brown for variation
          transparent={false}
          opacity={1.0}
        />
      </mesh>
      <mesh position={[3, -3, -1.93]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.5, 16]} />
        <meshStandardMaterial
          color="#4A3A2B" // Darker brown for variation
          transparent={false}
          opacity={1.0}
        />
      </mesh>
      <mesh position={[-3, 2, -1.94]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.1, 16]} />
        <meshStandardMaterial
          color="#4A3A2B" // Darker brown for variation
          transparent={false}
          opacity={1.0}
        />
      </mesh>
      <mesh position={[1.5, 3, -1.91]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.9, 16]} />
        <meshStandardMaterial
          color="#4A3A2B" // Darker brown for variation
          transparent={false}
          opacity={1.0}
        />
      </mesh>
      <mesh position={[-2, -1, -1.96]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.3, 16]} />
        <meshStandardMaterial
          color="#4A3A2B" // Darker brown for variation
          transparent={false}
          opacity={1.0}
        />
      </mesh>
      <mesh position={[4, 2, -1.97]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.0, 16]} />
        <meshStandardMaterial
          color="#4A3A2B" // Darker brown for variation
          transparent={false}
          opacity={1.0}
        />
      </mesh>
      <mesh position={[-4, -3, -1.98]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.4, 16]} />
        <meshStandardMaterial
          color="#4A3A2B" // Darker brown for variation
          transparent={false}
          opacity={1.0}
        />
      </mesh>
      <mesh position={[0, -4, -1.99]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.2, 16]} />
        <meshStandardMaterial
          color="#4A3A2B" // Darker brown for variation
          transparent={false}
          opacity={1.0}
        />
      </mesh>
      <mesh position={[5, -1, -1.9]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.7, 16]} />
        <meshStandardMaterial
          color="#4A3A2B" // Darker brown for variation
          transparent={false}
          opacity={1.0}
        />
      </mesh>
      <mesh position={[-5, 1, -1.95]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.9, 16]} />
        <meshStandardMaterial
          color="#4A3A2B" // Darker brown for variation
          transparent={false}
          opacity={1.0}
        />
      </mesh>
      <mesh position={[2.5, 4.5, -1.92]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.1, 16]} />
        <meshStandardMaterial
          color="#4A3A2B" // Darker brown for variation
          transparent={false}
          opacity={1.0}
        />
      </mesh>
      <mesh position={[-2.5, -4.5, -1.93]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.3, 16]} />
        <meshStandardMaterial
          color="#4A3A2B" // Darker brown for variation
          transparent={false}
          opacity={1.0}
        />
      </mesh>
    </group>
  );
};

export default Ground;
