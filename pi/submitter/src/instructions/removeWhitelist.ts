import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId.js";

export interface RemoveWhitelistArgs {
  target: PublicKey;
}

export interface RemoveWhitelistAccounts {
  owner: PublicKey;
  deviceAttestation: PublicKey;
}

export const layout = borsh.struct([borsh.publicKey("target")]);

export function removeWhitelist(
  args: RemoveWhitelistArgs,
  accounts: RemoveWhitelistAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.owner, isSigner: true, isWritable: true },
    { pubkey: accounts.deviceAttestation, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([148, 244, 73, 234, 131, 55, 247, 90]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      target: args.target,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
