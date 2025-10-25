import { CONFIG } from "../config";

export function generateMockIPFSHashes(count = CONFIG.DEVICES) {
  const hashes: string[] = [];
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (let i = 0; i < count; i++) {
    let hash = "Qm";
    for (let j = 0; j < 44; j++)
      hash += chars.charAt(Math.floor(Math.random() * chars.length));
    hashes.push(hash);
  }
  return hashes;
}

export function ipfsUrl(cid: string) {
  const base = CONFIG.IPFS_GATEWAY;
  const withSlash = base.endsWith("/") ? base : base + "/";
  return withSlash + cid;
}
