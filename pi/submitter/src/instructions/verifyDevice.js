import { TransactionInstruction } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";
export function verifyDevice(accounts, programId = PROGRAM_ID) {
    const keys = [
        { pubkey: accounts.verifier, isSigner: true, isWritable: true },
        { pubkey: accounts.deviceAttestation, isSigner: false, isWritable: true },
    ];
    const identifier = Buffer.from([103, 113, 98, 245, 141, 231, 98, 244]);
    const data = identifier;
    const ix = new TransactionInstruction({ keys, programId, data });
    return ix;
}
