export const CONFIG = {
  API_ENDPOINT: import.meta.env.VITE_API_ENDPOINT as string,
  IPFS_GATEWAY: import.meta.env.VITE_IPFS_GATEWAY as string,
  WIDTH: 32,
  TRAIL_LENGTH: 10,
  BOUNDS: 800,
};

export const BIRDS = CONFIG.WIDTH * CONFIG.WIDTH;
export const BOUNDS_HALF = CONFIG.BOUNDS / 2;
