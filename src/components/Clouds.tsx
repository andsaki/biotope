import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/** 雲コンポーネントのプロパティ */
interface CloudProps {
  /** 雲の位置 */
  position: [number, number, number];
  /** 雲のスケール */
  scale: number;
  /** 移動速度 */
  speed: number;
  /** 時間スケール */
  timeScale: number;
}

/**
 * 個別の雲コンポーネント
 * 風に流れる雲をシミュレート
 * @param props - コンポーネントのプロパティ
 */
const Cloud: React.FC<CloudProps> = ({ position, scale, speed, timeScale }) => {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      // X軸方向にゆっくりと移動
      groupRef.current.position.x += speed * 0.001 * timeScale; // timeScaleを乗算
      // Y軸とZ軸に微細な揺れを追加して、風に揺れるような効果を出す
      groupRef.current.position.y = position[1] + Math.sin(time * 0.5 + position[0]) * 0.1;
      groupRef.current.position.z = position[2] + Math.cos(time * 0.5 + position[1]) * 0.1;
      // ゆっくりと回転させる
      groupRef.current.rotation.y += speed * 0.00005 * timeScale; // timeScaleを乗算

      if (groupRef.current.position.x > 50) { // 画面外に出たら反対側から再出現
        groupRef.current.position.x = -50;
      }
    }
  });

  // 複数の球体を組み合わせて雲の形を表現
  const cloudParts = useMemo(() => {
    const parts = [];
    const numParts = 20 + Math.floor(Math.random() * 20); // 20〜39個の球体で構成
    for (let i = 0; i < numParts; i++) {
      const partScale = 0.5 + Math.random() * 1.0; // 各球体のスケールをさらにランダムに
      const partPosition: [number, number, number] = [
        (Math.random() - 0.5) * 4, // X方向のオフセットをさらに広げる
        (Math.random() - 0.5) * 3, // Y方向のオフセットをさらに広げる
        (Math.random() - 0.5) * 4, // Z方向のオフセットをさらに広げる
      ];
      parts.push(
        <mesh key={i} position={partPosition} scale={partScale}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color="#FFFFFF" transparent opacity={0.8} emissive={new THREE.Color(0xffffff)} emissiveIntensity={0.1} /> {/* emissiveを追加 */}
        </mesh>
      );
    }
    return parts;
  }, []);

  return (
    <group ref={groupRef} position={position} scale={[scale, scale * 0.7, scale]}>
      {cloudParts}
    </group>
  );
};

const Clouds: React.FC<{ timeScale: number }> = ({ timeScale }) => {
  const clouds = useMemo(() => {
    const tempClouds = [];
    for (let i = 0; i < 30; i++) { // 30個の雲を生成
      const x = Math.random() * 100 - 50; // -50から50の範囲で初期位置をランダムに設定
      const y = 20 + Math.random() * 5; // 地面より高い位置に設定（20〜25の範囲）
      const z = Math.random() * 60 - 30; // -30から30の範囲で初期位置をランダムに設定
      const scale = 2 + Math.random() * 3; // スケールをランダムに設定
      const speed = 0.5 + Math.random() * 0.5; // スピードをランダムに設定
      tempClouds.push({ position: [x, y, z], scale, speed });
    }
    return tempClouds;
  }, []);

  return (
    <group>
      {clouds.map((cloud, index) => (
        <Cloud key={index} position={cloud.position as [number, number, number]} scale={cloud.scale} speed={cloud.speed} timeScale={timeScale} />
      ))}
    </group>
  );
};

export default Clouds;
