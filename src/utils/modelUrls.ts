import plantModel from "../assets/Potted Plant/scene.gltf?url";
import frogModel from "../assets/Frog/Frog_by_get3dmodels.glb?url";

const R2_BASE = "https://biotope-r2-worker.ruby-on-rails-api.workers.dev/assets";
const isLocal = import.meta.env.VITE_ENVIRONMENT === "local";

type ModelEntry =
  | {
      remote: string;
      local?: string;
    }
  | {
      remote?: undefined;
      local: string;
    };

const MODEL_URLS = {
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
  frog: {
    local: frogModel,
  },
} as const satisfies Record<string, ModelEntry>;

export type ModelKey = keyof typeof MODEL_URLS;

/**
 * R2/ローカルのいずれかからGLTFモデルURLを取得
 */
export const getModelUrl = (key: ModelKey): string => {
  const entry = MODEL_URLS[key];
  const local = "local" in entry ? entry.local : undefined;
  const remote = "remote" in entry ? entry.remote : undefined;

  if (local && (isLocal || !remote)) {
    return local;
  }
  if (remote) {
    return remote;
  }
  if (local) {
    return local;
  }
  throw new Error(`Model URL is not configured: ${key}`);
};
