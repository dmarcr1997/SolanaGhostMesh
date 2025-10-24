export {};
declare global {
  interface Window {
    phantom?: {
      solana?: {
        isPhantom?: boolean;
        connect: () => Promise<{ publicKey: { toString(): string } }>;
        disconnect: () => Promise<void>;
        on: (
          event: "disconnect" | "accountChanged",
          cb: (...a: any[]) => void
        ) => void;
      };
    };
  }
}

declare module "*.glsl" {
  const value: string;
  export default value;
}
