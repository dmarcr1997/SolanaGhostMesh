import React, { createContext, useContext, useMemo, useReducer } from "react";
import type { Device } from "../services/api";

type WalletState = {
  connected: boolean;
  publicKey: string | null;
};

type UIState = {
  toast: { message: string; kind: "success" | "warning" | "error" } | null;
  loading: boolean;
  modal: { open: boolean; url?: string; hash?: string };
};

type AppState = {
  wallet: WalletState;
  devices: Device[];
  imageHashes: string[];
  ui: UIState;
};

type Action =
  | { type: "SET_WALLET"; payload: WalletState }
  | { type: "SET_DEVICES"; payload: Device[] }
  | { type: "SET_HASHES"; payload: string[] }
  | { type: "TOAST"; payload: UIState["toast"] }
  | { type: "LOADING"; payload: boolean }
  | { type: "MODAL"; payload: UIState["modal"] };

const initialState: AppState = {
  wallet: { connected: false, publicKey: null },
  devices: [],
  imageHashes: [],
  ui: { toast: null, loading: false, modal: { open: false } },
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_WALLET":
      return { ...state, wallet: action.payload };
    case "SET_DEVICES":
      return { ...state, devices: action.payload };
    case "SET_HASHES":
      return { ...state, imageHashes: action.payload };
    case "TOAST":
      return { ...state, ui: { ...state.ui, toast: action.payload } };
    case "LOADING":
      return { ...state, ui: { ...state.ui, loading: action.payload } };
    case "MODAL":
      return { ...state, ui: { ...state.ui, modal: action.payload } };
    default:
      return state;
  }
}

const AppCtx = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export const AppProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
