import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import * as anchor from "@coral-xyz/anchor";
import * as borsh from "@coral-xyz/borsh";
import BN from "bn.js";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import {
  Connection,
  Keypair,
  PublicKey,
  clusterApiUrl,
  Transaction,
} from "@solana/web3.js";
import * as dotenv from "dotenv";
import { PROGRAM_ID } from "./programId.js";
import { submitAttestation } from "./instructions/submitAttestation.js";
import { DeviceAttestation } from "./accounts/DeviceAttestation.js";
import { verifyDevice } from "./instructions/verifyDevice.js";
import { addWhitelist } from "./instructions/addWhitelist.js";
import { removeWhitelist } from "./instructions/removeWhitelist.js";
dotenv.config();

interface SubmitAttestationRequest {
  device_pubkey_str: string;
  ipfs_cid: string;
  timestamp: number;
}

interface WhitelistRequest {
  device_pubkey_str: string;
  new_viewer_str?: string;
  target_str?: string;
}

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const ALLOW_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5500";

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", ALLOW_ORIGIN);
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

let apiSigner = Keypair.fromSecretKey(
  Uint8Array.from(
    process.env.PRIVATE_KEY ? JSON.parse(process.env.PRIVATE_KEY) : []
  )
);

const provider = new anchor.AnchorProvider(
  connection,
  new anchor.Wallet(apiSigner),
  { preflightCommitment: "confirmed" }
);

async function ensureFunded(
  pubkey: PublicKey,
  minLamports = anchor.web3.LAMPORTS_PER_SOL
) {
  const bal = await connection.getBalance(pubkey);
  if (bal < minLamports) {
    console.log(
      `[FUND] balance ${bal} < ${minLamports}, requesting airdrop...`
    );
    const sig = await connection.requestAirdrop(pubkey, minLamports);
    // Wait for confirmation
    await connection.confirmTransaction(sig, "confirmed");
    const newBal = await connection.getBalance(pubkey);
    console.log(`[FUND] airdrop complete. new balance=${newBal}`);
  }
}

const getPda = (publicKey: PublicKey): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("attestation"), publicKey.toBuffer()],
    PROGRAM_ID
  );
};

app.post(
  "/attestation/submit",
  async (req: Request<{}, {}, SubmitAttestationRequest>, res: Response) => {
    try {
      const { device_pubkey_str, ipfs_cid, timestamp } = req.body;
      const device_pubkey = new PublicKey(device_pubkey_str);
      const [deviceAttestationPda] = getPda(device_pubkey);
      console.log(`Submitting attestation for device: ${device_pubkey_str}`);
      const ix = submitAttestation(
        {
          devicePubkey: device_pubkey,
          ipfsCid: ipfs_cid,
          timestamp: new BN(timestamp),
        },
        {
          payer: apiSigner.publicKey,
          deviceAttestation: deviceAttestationPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        }
      );
      const tx = new Transaction().add(ix);
      await ensureFunded(apiSigner.publicKey);
      const signature = await provider.sendAndConfirm(tx, [apiSigner]);
      res.status(200).json({ signature });
    } catch (error) {
      console.error("Failed to submit attestation:", error);
      res.status(500).json({
        reqeust: JSON.stringify(req.body, null, 2),
        error: (error as Error).message,
      });
    }
  }
);

app.post(
  "/attestation/verify",
  async (
    req: Request<{}, {}, Pick<WhitelistRequest, "device_pubkey_str">>,
    res: Response
  ) => {
    try {
      const { device_pubkey_str } = req.body;
      const device_pubkey = new PublicKey(device_pubkey_str);
      const [deviceAttestationPda] = getPda(device_pubkey);
      console.log(`Verifying attestation for device: ${device_pubkey_str}`);
      const ix = verifyDevice({
        verifier: apiSigner.publicKey,
        deviceAttestation: deviceAttestationPda,
      });
      const tx = new Transaction().add(ix);
      await ensureFunded(apiSigner.publicKey);
      const signature = await provider.sendAndConfirm(tx, [apiSigner]);
      res.status(200).json({ signature });
    } catch (error) {
      console.error("Failed to verify attestation:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

app.post(
  "/attestation/whitelist/add",
  async (
    req: Request<
      {},
      {},
      Required<Pick<WhitelistRequest, "device_pubkey_str" | "new_viewer_str">>
    >,
    res: Response
  ) => {
    try {
      const { device_pubkey_str, new_viewer_str } = req.body;
      const device_pubkey = new PublicKey(device_pubkey_str);
      const new_viewer = new PublicKey(new_viewer_str);
      const [deviceAttestationPda] = getPda(device_pubkey);
      console.log(
        `Adding ${new_viewer_str} to device ${device_pubkey_str} whitelist`
      );
      const ix = addWhitelist(
        { newViewer: new_viewer },
        {
          owner: apiSigner.publicKey,
          deviceAttestation: deviceAttestationPda,
        }
      );
      const tx = new Transaction().add(ix);
      await ensureFunded(apiSigner.publicKey);
      const signature = await provider.sendAndConfirm(tx, [apiSigner]);
      res.status(200).json({ signature });
    } catch (error) {
      console.error("Failed to add to whitelist:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

app.post(
  "/attestation/whitelist/remove",
  async (
    req: Request<
      {},
      {},
      Required<Pick<WhitelistRequest, "device_pubkey_str" | "target_str">>
    >,
    res: Response
  ) => {
    try {
      const { device_pubkey_str, target_str } = req.body;
      const device_pubkey = new PublicKey(device_pubkey_str);
      const target = new PublicKey(target_str);
      const [deviceAttestationPda] = getPda(device_pubkey);
      console.log(
        `Removing ${target_str} from device ${device_pubkey_str} whitelist`
      );
      const ix = removeWhitelist(
        { target },
        {
          owner: apiSigner.publicKey,
          deviceAttestation: deviceAttestationPda,
        }
      );
      const tx = new Transaction().add(ix);
      await ensureFunded(apiSigner.publicKey);
      const signature = await provider.sendAndConfirm(tx, [apiSigner]);
      res.status(200).json({ signature });
    } catch (error) {
      console.error("Failed to remove from whitelist:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

app.get("/attestation/devices", async (req: Request, res: Response) => {
  try {
    const requestingAddressStr = req.query.requestingAddress as string;
    if (!requestingAddressStr) {
      return res
        .status(400)
        .json({ error: "requestingAddress query parameter is required." });
    }
    const requestingAddress = new PublicKey(requestingAddressStr);

    const accounts = await connection.getProgramAccounts(PROGRAM_ID);

    const devices = accounts
      .filter((acc) =>
        acc.account.data.slice(0, 8).equals(DeviceAttestation.discriminator)
      )
      .map((acc) => {
        const decoded = DeviceAttestation.decode(acc.account.data);
        return decoded.toJSON();
      });

    const authorizedDevices = devices.filter((device) =>
      device.whitelist.includes(requestingAddress.toBase58())
    );

    const authorizedIpfsCids = authorizedDevices.map(
      (device) => device.ipfsCid
    );
    res.status(200).json({
      allDevices: authorizedDevices,
      authorizedIpfsCids: authorizedIpfsCids,
    });
  } catch (error) {
    console.error("Failed to fetch devices:", error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
