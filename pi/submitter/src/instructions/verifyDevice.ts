import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId.js";

export interface VerifyDeviceAccounts {
  verifier: PublicKey;
  deviceAttestation: PublicKey;
}

export function verifyDevice(
  accounts: VerifyDeviceAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.verifier, isSigner: true, isWritable: true },
    { pubkey: accounts.deviceAttestation, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([103, 113, 98, 245, 141, 231, 98, 244]);
  const data = identifier;
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
