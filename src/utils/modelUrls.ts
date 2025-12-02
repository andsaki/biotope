import fishModel from "../assets/Smoked Fish Raw/weflciqaa_tier_0.gltf?url";
import plantModel from "../assets/Potted Plant/scene.gltf?url";

const R2_BASE = "https://biotope-r2-worker.ruby-on-rails-api.workers.dev/assets";
const isLocal = import.meta.env.VITE_ENVIRONMENT === "local";

type ModelEntry = {
  remote: string;
  local?: string;
};

const MODEL_URLS = {
  normalFish: {
    local: fishModel,
    remote: `${R2_BASE}/Smoked Fish Raw/weflciqaa_tier_0.gltf`,
  },
  flatfish: {
    remote: `${R2_BASE}/cc0____yellow_striped_flounder.glb`,
  },
  leaf: {
    remote: `${R2_BASE}/cc0__deep_autumn__5k_followers_milestone.glb`,
  },
  lily: {
    remote: `${R2_BASE}/cc0__water_lily_nymphaea_cv.glb`,
  },
  pottedPlant: {
    local: plantModel,
    remote: `${R2_BASE}/Potted Plant/scene.gltf`,
  },
} as const satisfies Record<string, ModelEntry>;

export type ModelKey = keyof typeof MODEL_URLS;

/**
 * R2/ローカルのいずれかからGLTFモデルURLを取得
 */
export const getModelUrl = (key: ModelKey) => {
  const entry = MODEL_URLS[key];
  if (isLocal && "local" in entry && entry.local) {
    return entry.local;
  }
  return entry.remote;
};
