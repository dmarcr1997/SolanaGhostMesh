# SolanaGhostMesh

**A Raspberry Pi–based AI camera that detects real-world events and securely publishes them to the Solana blockchain.**
<br/>[Demo](https://youtu.be/eP_a-cmqfsk)
<br/>[Pitch](https://youtu.be/7YC9A-6QJgQ)
<br/>[UI](https://solana-ghost-mesh-4rxz.vercel.app)
## 🚀 Overview

GhostMesh bridges the physical and digital worlds by turning low-power edge devices into verifiable sources of real-world truth.

This is an example node that can capture images using any raspberry pi camera, run detection locally using YOLOv10, uploads data to IPFS, and store file metadata on Solana for traceable, tamper-resistant verification.

This project was built for the **Colosseum x Solana Cypherpunk Hackathon**.


## ⚙️ System Architecture

**Core Components:**
- **YOLOv10 Docker Container** – runs local object detection on captured images.
- **Publisher Container** – uploads predictions + metadata (JSON) to IPFS via Storacha or Pinata.
- **Submitter Container** – monitors logs and submits verified hashes to a Solana smart contract using Anchor.
- **Solana Smart Contract** – tracks device attestations, whitelists, and CID verification.
- **Dashboard(fe)** – web UI to visualize device coverage, detections, and CID data.


## 🧩 Features

* [x] On-device AI inference (YOLOv10)  
* [x] IPFS-based image and metadata storage  
* [x] Solana Anchor contract for device attestation and CID verification  
* [x] Dockerized microservices for modular deployment  
* [x] Edge-to-chain verification pipeline  
* [x] UI To view devices and uploaded files
* [ ] (Stretch goal) Wind + solar-powered enclosure for off-grid operation
* [ ] More devices
* [ ] Device data encryption
* [ ] Device Mesh Communications

## Project Structure
pi/watchdog_script.py → Watch for images uploaded to yolo_input, run object detection, save file to yolo_output
pi/camera_capturer.py → Automatically capture an image every minute and store it in yolo_input
pi/uploader → IPFS upload + JSON logger
pi/submitter → API to interface with Solana device attestation contract 
pi/send_contract_update.py → Submit device attestation and IPFS hash to the device attestation smart contract 
/contracts/ → Anchor smart contract
/fe →  React, Three Drei UI(currently only allows for wallet connection, viewing the single device, and device data)


## 🧠 How It Works

1. **Capture**: Camera takes image every X minutes  
2. **Detect**: YOLOv10 classifies objects locally  
3. **Store**: Results and image pushed to IPFS  
4. **Log**: CID + timestamp stored in local log  
5. **Submit**: CID and metadata sent to Solana via API/contract  
6. **Verify**: Chain-of-trust ensures authenticity
7. **View**: Dashboard shows devices allowed for access(right now for the demo this is not fully true while I do have a whitelist I ran out of time to add it into the code so the first device/image is public to all for now)

## 🔐 Smart Contract

- Tracks device attestations (`device_pubkey`, `ipfs_cid`, `timestamp`)  
- Supports whitelisted access for viewing device data  
- Allows device verification


