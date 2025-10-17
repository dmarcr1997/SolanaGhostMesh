import { PinataSDK } from "@pinata/sdk";
import fs from "fs";
import { Blob } from "buffer";
import chokidar from "chokidar";

const PRED_DIR = process.env.PRED_DIR || "/yolo_output";
const OUT_DIR = process.env.OUT_DIR || "/logs";

const pinata = new PinataSDK({
  pinataJwt: process.env.JWT,
  pinataGateway: process.env.GATE,
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
      if (f.endsWith(".jpg")) await upload(path.parse(f).name, path);
    }
  }
  fs.mkdirSync(PRED_DIR, { recursive: true });
  chokidar.watch(PRED_DIR, { ignoreInitial: true }).on("add", async (fp) => {
    if (ext !== ".jpg" && ext !== ".json") return;
    const stem = path.parse(fp).name;
    setTimeout(() => upload(path, stem).catch(console.error), 250);
  });

  console.log("[Pinata] Publisher running. Watching:", PRED_DIR);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
