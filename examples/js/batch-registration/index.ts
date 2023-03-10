import {
  Connection,
  Keypair,
  PublicKey,
  TransactionInstruction,
  clusterApiUrl,
} from "@solana/web3.js";
import { registerDomainName, getReverseKey } from "@bonfida/spl-name-service";
import { signAndSendInstructions } from "@bonfida/utils";
import fs from "fs";

const connection = new Connection(clusterApiUrl("mainnet-beta"));

/**
 * Path to your private key
 */
const WALLET_PATH = "my-wallet.json";
const keypair = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(fs.readFileSync(WALLET_PATH).toString()))
);

/**
 * We want a 1kB sized domain (max 10kB)
 */
const space = 1 * 1_000;

/**
 * Associated token account used for registration i.e your USDC address
 */
const ata = new PublicKey("");

/**
 * The list of domains you want to register
 */
const DOMAIN_LIST_PATH = "domain-list.json";

const run = async () => {
  const domains: string[] = JSON.parse(
    fs.readFileSync(DOMAIN_LIST_PATH).toString()
  );
  console.log(`Registering ${domains.length} domains`);

  while (domains.length > 0) {
    // Register by batch of 5
    const slice = domains.splice(0, 5);
    const ixs: TransactionInstruction[] = [];
    for (let x of slice) {
      // First check if domain already registered
      const reverseKey = await getReverseKey(x);
      const acc = await connection.getAccountInfo(reverseKey);
      if (!!acc) {
        console.log(`Alredy registered: ${x}`);
        continue;
      }

      const ix = await registerDomainName(x, space, keypair.publicKey, ata);
      ixs.push(...ix.flat());
    }

    if (ixs.length === 0) continue;

    const tx = await signAndSendInstructions(connection, [], keypair, ixs);
    console.log(tx);
  }
};

run();
