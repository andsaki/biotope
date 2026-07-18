import * as THREE from "three";
import { FLATFISH_LOW_POLY_MATERIAL } from "@/constants/fish";
import type { FishColorPattern } from "./types";

export const disposeObjectMaterials = (scene: THREE.Object3D) => {
  scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) {
      return;
    }

    if (Array.isArray(object.material)) {
      object.material.forEach((material) => material.dispose());
      return;
    }

    object.material.dispose();
  });
};

export const applyLowPolyNormalFishMaterial = (
  scene: THREE.Object3D,
  baseColor: string,
  accentColor: string,
  pattern: FishColorPattern
) => {
  let meshIndex = 0;
  scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) {
      return;
    }

    const useAccent =
      pattern === "flash"
        ? meshIndex % 2 === 0
        : pattern === "belly"
          ? meshIndex % 3 === 1
          : meshIndex % 3 === 0;

    object.material = new THREE.MeshStandardMaterial({
      color: useAccent ? accentColor : baseColor,
      flatShading: true,
      metalness: 0,
      roughness: pattern === "flash" ? 0.86 : 0.92,
      envMapIntensity: pattern === "flash" ? 0.28 : 0.2,
    });
    meshIndex += 1;
  });
};

export const applyLowPolyFlatfishMaterial = (scene: THREE.Object3D, index: number) => {
  scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) {
      return;
    }

    object.material = new THREE.MeshStandardMaterial({
      color:
        index % 2 === 0
          ? FLATFISH_LOW_POLY_MATERIAL.BASE_COLOR
          : FLATFISH_LOW_POLY_MATERIAL.ACCENT_COLOR,
      flatShading: true,
      metalness: 0,
      roughness: FLATFISH_LOW_POLY_MATERIAL.ROUGHNESS,
      envMapIntensity: 0.12,
    });
  });
};
