import { useGLTF } from "@react-three/drei";
import type * as THREE from "three";
import { getModelUrl, type ModelKey } from "../utils/modelUrls";

type UseModelScene = (key: ModelKey) => THREE.Group;

const useModelSceneHook: UseModelScene = (key) => {
  const url = getModelUrl(key);
  const { scene } = useGLTF(url, true);
  return scene;
};

export const preloadModel = (key: ModelKey) => {
  const url = getModelUrl(key);
  useGLTF.preload(url);
};

export const useModelScene = useModelSceneHook;
