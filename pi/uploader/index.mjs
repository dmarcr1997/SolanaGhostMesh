import { PinataSDK } from "pinata";
import fs from "fs";
import path from "path";
import { Blob } from "buffer";
import chokidar from "chokidar";

const PRED_DIR = process.env.PRED_DIR || "/yolo_output";
const OUT_DIR = process.env.OUT_DIR || "/logs";

import dotenv from "dotenv";
dotenv.config();

if (!process.env.JWT) {
  throw new Error(
    "Missing required environment variable: JWT (Pinata JWT token)"
  );
}

const pinata = new PinataSDK({
  pinataJwt: process.env.JWT,
  pinataGateway: process.env.GATE || "https://gateway.pinata.cloud",
});

function appendLog(row) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.appendFileSync(
    path.join(`${OUT_DIR}`, "log.json"),
    JSON.stringify(row) + "\n"
  );
  console.log("[LOG]: ", row);
}

async function upload(imageName, filePath) {
  try {
    const blob = new Blob([fs.readFileSync(filePath)]);
    const file = new File([blob], imageName, { type: "image/jpeg" });
    const upload = await pinata.upload.public.file(file);
    appendLog({
      timestamp: new Date().toISOString(),
      image: imageName,
      cid: upload.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${upload.IpfsHash}`,
    });
    fs.unlinkSync(filePath);
  } catch (error) {
    console.log(error);
  }
}

async function main() {
  if (fs.existsSync(PRED_DIR)) {
    for (const f of fs.readdirSync(PRED_DIR)) {
      if (f.endsWith(".jpg")) {
        const filePath = path.join(PRED_DIR, f);
        await upload(path.parse(f).name, filePath);
      }
    }
  }
  fs.mkdirSync(PRED_DIR, { recursive: true });
  chokidar.watch(PRED_DIR, { ignoreInitial: true }).on("add", async (fp) => {
    const { ext, name } = path.parse(fp);
    if (ext !== ".jpg" && ext !== ".json") return;
    // Small delay to ensure file is fully written
    setTimeout(() => upload(name, fp).catch(console.error), 250);
  });

  console.log("[Pinata] Publisher running. Watching:", PRED_DIR);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
