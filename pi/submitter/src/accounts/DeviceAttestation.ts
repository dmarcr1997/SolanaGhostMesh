import { PublicKey, Connection } from "@solana/web3.js";
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId.js";

export interface DeviceAttestationFields {
  devicePubkey: PublicKey;
  ipfsCid: string;
  timestamp: BN;
  verified: boolean;
  whitelist: Array<PublicKey>;
}

export interface DeviceAttestationJSON {
  devicePubkey: string;
  ipfsCid: string;
  timestamp: string;
  verified: boolean;
  whitelist: Array<string>;
}

export class DeviceAttestation {
  readonly devicePubkey: PublicKey;
  readonly ipfsCid: string;
  readonly timestamp: BN;
  readonly verified: boolean;
  readonly whitelist: Array<PublicKey>;

  static readonly discriminator = Buffer.from([
    3, 117, 146, 63, 149, 136, 60, 50,
  ]);

  static readonly layout = borsh.struct([
    borsh.publicKey("devicePubkey"),
    borsh.str("ipfsCid"),
    borsh.i64("timestamp"),
    borsh.bool("verified"),
    borsh.vec(borsh.publicKey(), "whitelist"),
  ]);

  constructor(fields: DeviceAttestationFields) {
    this.devicePubkey = fields.devicePubkey;
    this.ipfsCid = fields.ipfsCid;
    this.timestamp = fields.timestamp;
    this.verified = fields.verified;
    this.whitelist = fields.whitelist;
  }

  static async fetch(
    c: Connection,
    address: PublicKey,
    programId: PublicKey = PROGRAM_ID
  ): Promise<DeviceAttestation | null> {
    const info = await c.getAccountInfo(address);

    if (info === null) {
      return null;
    }
    if (!info.owner.equals(programId)) {
      throw new Error("account doesn't belong to this program");
    }

    return this.decode(info.data);
  }

  static async fetchMultiple(
    c: Connection,
    addresses: PublicKey[],
    programId: PublicKey = PROGRAM_ID
  ): Promise<Array<DeviceAttestation | null>> {
    const infos = await c.getMultipleAccountsInfo(addresses);

    return infos.map((info) => {
      if (info === null) {
        return null;
      }
      if (!info.owner.equals(programId)) {
        throw new Error("account doesn't belong to this program");
      }

      return this.decode(info.data);
    });
  }

  static decode(data: Buffer): DeviceAttestation {
    if (!data.slice(0, 8).equals(DeviceAttestation.discriminator)) {
      throw new Error("invalid account discriminator");
    }

    const dec = DeviceAttestation.layout.decode(data.slice(8));

    return new DeviceAttestation({
      devicePubkey: dec.devicePubkey,
      ipfsCid: dec.ipfsCid,
      timestamp: dec.timestamp,
      verified: dec.verified,
      whitelist: dec.whitelist,
    });
  }

  toJSON(): DeviceAttestationJSON {
    return {
      devicePubkey: this.devicePubkey.toString(),
      ipfsCid: this.ipfsCid,
      timestamp: this.timestamp.toString(),
      verified: this.verified,
      whitelist: this.whitelist.map((item) => item.toString()),
    };
  }

  static fromJSON(obj: DeviceAttestationJSON): DeviceAttestation {
    return new DeviceAttestation({
      devicePubkey: new PublicKey(obj.devicePubkey),
      ipfsCid: obj.ipfsCid,
      timestamp: new BN(obj.timestamp),
      verified: obj.verified,
      whitelist: obj.whitelist.map((item) => new PublicKey(item)),
    });
  }
}
