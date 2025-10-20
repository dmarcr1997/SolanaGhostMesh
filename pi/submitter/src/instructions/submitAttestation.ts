import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId.js";

export interface SubmitAttestationArgs {
  devicePubkey: PublicKey;
  ipfsCid: string;
  timestamp: BN;
}

export interface SubmitAttestationAccounts {
  payer: PublicKey;
  deviceAttestation: PublicKey;
  systemProgram: PublicKey;
}

export const layout = borsh.struct([
  borsh.publicKey("devicePubkey"),
  borsh.str("ipfsCid"),
  borsh.i64("timestamp"),
]);

export function submitAttestation(
  args: SubmitAttestationArgs,
  accounts: SubmitAttestationAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.payer, isSigner: true, isWritable: true },
    { pubkey: accounts.deviceAttestation, isSigner: false, isWritable: true },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([238, 220, 255, 105, 183, 211, 40, 83]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      devicePubkey: args.devicePubkey,
      ipfsCid: args.ipfsCid,
      timestamp: args.timestamp,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
