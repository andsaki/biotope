import * as THREE from 'three';

/**
 * 共有マテリアルユーティリティ
 * 同じマテリアルを複数のオブジェクトで再利用してパフォーマンスを向上
 */

// 基本的な色のマテリアル
export const createSharedBasicMaterial = (color: string | number, opacity = 1, transparent = false) => {
  return new THREE.MeshBasicMaterial({
    color,
    transparent,
    opacity,
  });
};

// 標準マテリアル
export const createSharedStandardMaterial = (options: {
  color: string | number;
  opacity?: number;
  transparent?: boolean;
  metalness?: number;
  roughness?: number;
  side?: THREE.Side;
}) => {
  return new THREE.MeshStandardMaterial({
    color: options.color,
    transparent: options.transparent ?? false,
    opacity: options.opacity ?? 1,
    metalness: options.metalness ?? 0.5,
    roughness: options.roughness ?? 0.5,
    side: options.side ?? THREE.FrontSide,
  });
};

// よく使われるマテリアルのシングルトン
let groundMaterialInstance: THREE.MeshStandardMaterial | null = null;
let waterMaterialInstance: THREE.MeshStandardMaterial | null = null;

export const getGroundMaterial = () => {
  if (!groundMaterialInstance) {
    groundMaterialInstance = new THREE.MeshStandardMaterial({
      color: '#8B7355',
      roughness: 0.8,
      metalness: 0.2,
    });
  }
  return groundMaterialInstance;
};

export const getWaterMaterial = () => {
  if (!waterMaterialInstance) {
    waterMaterialInstance = new THREE.MeshStandardMaterial({
      color: '#4A90E2',
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
      metalness: 0.1,
      roughness: 0.2,
      envMapIntensity: 1,
    });
  }
  return waterMaterialInstance;
};

// メモリリークを防ぐためのクリーンアップ関数
export const disposeSharedMaterials = () => {
  if (groundMaterialInstance) {
    groundMaterialInstance.dispose();
    groundMaterialInstance = null;
  }
  if (waterMaterialInstance) {
    waterMaterialInstance.dispose();
    waterMaterialInstance = null;
  }
};
