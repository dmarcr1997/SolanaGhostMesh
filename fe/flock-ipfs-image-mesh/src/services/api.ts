import { CONFIG } from "../config";
export type Device = {
  devicePubkey: string;
  timestamp: string;
  verified: boolean;
};
export type DeviceHashResp = {
  devices: Device[];
  authorizedIpfsCids: string[];
};

export async function getDevices(): Promise<DeviceHashResp | null> {
  try {
    const res = await fetch(CONFIG.API_ENDPOINT, { method: "GET" });
    const data = await res.json().catch(() => ({}));
    return {
      devices: data.allDevices,
      authorizedIpfsCids: data.authorizedIpfsCids,
    };
  } catch {
    // Demo mode fallback
    return null;
  }
}
