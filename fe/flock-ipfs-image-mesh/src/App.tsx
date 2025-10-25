import React, { useEffect } from "react";
import "./index.css";
import { HUD } from "./components/HUD";
import { WalletButton } from "./components/WalletButton";
import { Toast } from "./components/Toast";
import { Modal } from "./components/Modal";
import { LoadingOverlay } from "./components/LoadingOverlay";
import { useApp } from "./state/AppState";
import { useWallet } from "./hooks/useWallet";
import { generateMockIPFSHashes, ipfsUrl } from "./services/ipfs";
import DeviceScene from "./DeviceScene";

const App: React.FC = () => {
  const { state, dispatch } = useApp();
  const { wallet, isWhitelisted, connect, disconnect } = useWallet();

  useEffect(() => {
    dispatch({ type: "SET_HASHES", payload: generateMockIPFSHashes() });
  }, [dispatch]);

  const onShowImage = (hash: string) => {
    const url = ipfsUrl(hash);
    dispatch({ type: "MODAL", payload: { open: true, hash, url } as any });
  };

  return (
    <>
      <HUD>
        <WalletButton
          connected={wallet.connected}
          publicKey={wallet.publicKey}
          onConnect={connect}
          onDisconnect={disconnect}
        />
        <div className="status" style={{ marginTop: 6 }}>
          {isWhitelisted ? "✅ Whitelisted" : "❌ Not Whitelisted"}
        </div>
      </HUD>
      <DeviceScene showImg={onShowImage} />
      <LoadingOverlay open={state.ui.loading} />
      <Toast
        message={state.ui.toast?.message ?? ""}
        kind={state.ui.toast?.kind ?? "error"}
      />
      <Modal
        open={state.ui.modal.open}
        imgUrl={(state.ui.modal as any).url}
        hash={(state.ui.modal as any).hash}
        onClose={() => dispatch({ type: "MODAL", payload: { open: false } })}
      />
    </>
  );
};

export default App;
