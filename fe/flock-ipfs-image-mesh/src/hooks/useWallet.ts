import { useCallback, useEffect } from "react";
import { useApp } from "../state/AppState";
import { getDevices } from "../services/api";
import { generateMockIPFSHashes } from "../services/ipfs";

export function useWallet() {
  const { state, dispatch } = useApp();
  const connect = useCallback(async () => {
    try {
      if (!("phantom" in window) || !window.phantom?.solana?.isPhantom) {
        window.open("https://phantom.app/", "_blank");
        dispatch({
          type: "TOAST",
          payload: { message: "Phantom not installed", kind: "error" },
        });
        return;
      }
      const resp = await window.phantom.solana!.connect();
      const publicKey = resp.publicKey.toString();
      dispatch({ type: "SET_WALLET", payload: { connected: true, publicKey } });
      const deviceResp = await getDevices();
      dispatch({ type: "SET_DEVICES", payload: deviceResp?.devices || [] });
      dispatch({
        type: "SET_HASHES",
        payload: deviceResp?.authorizedIpfsCids || [],
      });
      if (deviceResp)
        dispatch({
          type: "TOAST",
          payload:
            deviceResp.devices.length > 0
              ? {
                  message: "✅ Access granted! Click birds to view images.",
                  kind: "success",
                }
              : {
                  message: "⚠️ Not whitelisted. Images will scatter.",
                  kind: "warning",
                },
        });
    } catch (e: any) {
      dispatch({
        type: "TOAST",
        payload: {
          message: e?.message ?? "Wallet connect failed",
          kind: "error",
        },
      });
    }
  }, [dispatch]);

  const disconnect = useCallback(async () => {
    try {
      await window.phantom?.solana?.disconnect?.();
    } finally {
      dispatch({
        type: "SET_WALLET",
        payload: { connected: false, publicKey: null },
      });
      dispatch({ type: "SET_HASHES", payload: generateMockIPFSHashes() });
    }
  }, [dispatch]);

  useEffect(() => {
    const provider = window.phantom?.solana;
    const onDisc = () => disconnect();
    const onAccount = async (pk?: string) => {
      if (pk) {
        dispatch({
          type: "SET_WALLET",
          payload: { connected: true, publicKey: pk.toString() },
        });
      } else {
        disconnect();
      }
    };
    provider?.on("disconnect", onDisc);
    provider?.on("accountChanged", onAccount);
    return () => {
      // @ts-expect-error phantom types
      provider?.off?.("disconnect", onDisc);
      // @ts-expect-error phantom types
      provider?.off?.("accountChanged", onAccount);
    };
  }, [disconnect, dispatch]);

  return {
    wallet: state.wallet,
    isWhitelisted: state.devices.length > 0,
    connect,
    disconnect,
  };
}
