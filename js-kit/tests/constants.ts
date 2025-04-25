import {
  Address,
  createDefaultRpcTransport,
  createSolanaRpcFromTransport,
} from "@solana/kit";
import * as dotenv from "dotenv";

dotenv.config();

const transport = createDefaultRpcTransport({
  url: process.env.RPC_URL!,
});

export const TEST_RPC = createSolanaRpcFromTransport(transport);

export const RANDOM_ADDRESS =
  "TEStzh6fnTp932uQRmy6cKbo79EwhwgjvKULX4s15Bo" as Address;
