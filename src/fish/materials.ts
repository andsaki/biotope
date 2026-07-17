import * as THREE from "three";
import { FLATFISH_LOW_POLY_MATERIAL } from "@/constants/fish";

export const applyLowPolyNormalFishMaterial = (
  scene: THREE.Object3D,
  baseColor: string,
  accentColor: string,
  index: number
) => {
  scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) {
      return;
    }

    object.material = new THREE.MeshStandardMaterial({
      color: index % 3 === 0 ? accentColor : baseColor,
      flatShading: true,
      metalness: 0,
      roughness: 0.82,
    });
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
    });
  });
};
