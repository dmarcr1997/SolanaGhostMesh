import React from "react";

type Props = {
  connected: boolean;
  publicKey: string | null;
  onConnect(): void;
  onDisconnect(): void;
};

export const WalletButton: React.FC<Props> = ({
  connected,
  publicKey,
  onConnect,
  onDisconnect,
}) => {
  const short = publicKey
    ? `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`
    : "";
  return (
    <div>
      <button
        className="btn"
        onClick={connected ? onDisconnect : onConnect}
        disabled={false}
      >
        {connected ? "Disconnect" : "Connect Phantom Wallet"}
      </button>
      <div className="status">
        {connected ? `Connected: ${short}` : "Not Connected"}
      </div>
    </div>
  );
};
