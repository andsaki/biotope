
import React, { useRef, useMemo, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PointMaterial } from "@react-three/drei";

interface StarsProps {
  isNight: boolean;
}

const Stars: React.FC<StarsProps> = ({ isNight }) => {
  const meshRef = useRef<THREE.Points>(null!);
  const materialRef = useRef<THREE.PointsMaterial>(null!);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isNight) {
      timer = setTimeout(() => setVisible(true), 5000); // 5秒後に表示
    } else {
      setVisible(false);
    }
    return () => clearTimeout(timer);
  }, [isNight]);

  const { positions, colors, sizes } = useMemo(() => {
    const positions = [];
    const colors = [];
    const sizes = [];
    const color = new THREE.Color();

    for (let i = 0; i < 5000; i++) {
      const x = (Math.random() - 0.5) * 100;
      const y = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 100;
      positions.push(x, y, z);

      color.setHSL(0, 0, Math.random() * 0.5 + 0.5);
      colors.push(color.r, color.g, color.b);

      sizes.push(Math.random() * 0.5 + 0.2);
    }

    return {
      positions: new Float32Array(positions),
      colors: new Float32Array(colors),
      sizes: new Float32Array(sizes),
    };
  }, []);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta / 100;
    }
    if (materialRef.current) {
      materialRef.current.opacity = THREE.MathUtils.lerp(
        materialRef.current.opacity,
        visible ? 1 : 0,
        0.05
      );
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <PointMaterial
        ref={materialRef}
        transparent
        vertexColors
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        fog={false}
        opacity={0}
      />
    </points>
  );
};

export default Stars;
