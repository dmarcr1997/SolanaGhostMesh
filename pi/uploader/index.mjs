import { PinataSDK } from "pinata";
import fs from "fs";
import path from "path";
import { Blob } from "buffer";
import chokidar from "chokidar";
import dotenv from "dotenv";

dotenv.config();

const PRED_DIR = process.env.PRED_DIR || "/yolo_output";
const OUT_DIR = process.env.OUT_DIR || "/logs";

if (!process.env.JWT) throw new Error("Missing env JWT (Pinata JWT token)");

const pinata = new PinataSDK({
  pinataJwt: process.env.JWT,
  pinataGateway: process.env.GATEWAY,
});

function appendLog(row) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.appendFileSync(path.join(OUT_DIR, "log.json"), JSON.stringify(row) + "\n");
  console.log("[LOG]", row);
}

function isFile(p) {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

function readFileSafe(p) {
  if (!isFile(p)) throw new Error(`Not a file: ${p}`);
  // extra guard: ensure file size > 0 (avoid race on just-created file)
  const st = fs.statSync(p);
  if (st.size === 0) throw new Error(`Empty file (race?): ${p}`);
  return fs.readFileSync(p);
}

async function uploadOne(fp) {
  // fp is a full path to .jpg or .json
  const { name, ext } = path.parse(fp);
  const extLc = ext.toLowerCase();
  if (extLc !== ".jpg" && extLc !== ".json") return;

  // Ensure it’s a real file, not a dir
  const bytes = readFileSafe(fp);

  // Pick a simple content type
  const contentType = extLc === ".jpg" ? "image/jpeg" : "application/json";

  // Node 18+ has global File in most runtimes; if not, you can polyfill
  const blob = new Blob([bytes], { type: contentType });
  const file = new File([blob], path.basename(fp), { type: contentType });

  const res = await pinata.upload.public.file(file);
  const cid = res.IpfsHash;

  appendLog({
    timestamp: new Date().toISOString(),
    file: path.basename(fp),
    cid,
    url: `${GATEWAY}/ipfs/${cid}`,
  });
}

async function initialScan() {
  if (!fs.existsSync(PRED_DIR)) return;
  for (const f of fs.readdirSync(PRED_DIR)) {
    const fp = path.join(PRED_DIR, f);
    if (!isFile(fp)) continue;
    const ext = path.extname(f).toLowerCase();
    if (ext === ".jpg" || ext === ".json") {
      try {
        await uploadOne(fp);
      } catch (e) {
        console.error(e.message);
      }
    }
  }
}

async function main() {
  fs.mkdirSync(PRED_DIR, { recursive: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  await initialScan();

  const watcher = chokidar.watch(PRED_DIR, { ignoreInitial: true });
  watcher
    .on("add", (fp) => {
      const ext = path.extname(fp).toLowerCase();
      if (ext !== ".jpg" && ext !== ".json") return;
      // small delay so writer finishes
      setTimeout(() => {
        uploadOne(fp).catch((e) => console.error("[UPLOAD ERR]", e.message));
      }, 250);
    })
    .on("addDir", (dir) => {});

  console.log("[Pinata] Publisher running. Watching:", PRED_DIR);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
