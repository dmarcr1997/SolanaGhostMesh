import { TransactionInstruction } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";
export const layout = borsh.struct([borsh.publicKey("newViewer")]);
export function addWhitelist(args, accounts, programId = PROGRAM_ID) {
    const keys = [
        { pubkey: accounts.owner, isSigner: true, isWritable: true },
        { pubkey: accounts.deviceAttestation, isSigner: false, isWritable: true },
    ];
    const identifier = Buffer.from([215, 46, 143, 176, 108, 113, 24, 1]);
    const buffer = Buffer.alloc(1000);
    const len = layout.encode({
        newViewer: args.newViewer,
    }, buffer);
    const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
    const ix = new TransactionInstruction({ keys, programId, data });
    return ix;
}
