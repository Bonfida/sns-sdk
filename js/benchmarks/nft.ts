require("dotenv").config();
import { Connection, PublicKey } from "@solana/web3.js";
import { retrieveNftOwner, retrieveNftOwnerV2 } from "../src/nft";
import { mean, median } from "mathjs";

const benchmark = async () => {
  const connection = new Connection(process.env.RPC_URL!);

  const nameAccounts = [
    new PublicKey("5RDpkiLAvYh5StaFbFdvkMnezQCFAN2vGyhVEeQHMTf"),
    new PublicKey("AVdePc1a3CXg56GzHLz8jxB5MxV4Fh3iKU7z7xbgDTEY"),
    new PublicKey("AQzjja886kuZpY3Bm8ataXDvJemwrwV91dHypZ45vaei"),
    new PublicKey("2nD7dijypykUCBxzLmPc21trzAZd2CWoQurWBRt5qg3D"),
    new PublicKey("Fwyp251aoe5LEis4WNjAvs9D7z4bSZSi4inangghgwf3"),
    new PublicKey("CT3kcSzzkaay8UpYJmYvGvXJLQPziFqJCgyetr7GhSpB"),
    new PublicKey("797fVNoYuyMcLf3d6oztSCAJSrevJ4dWrGy9B9xKWujy"),
    new PublicKey("F9ESKiA79dsHxhC3h7iLGTnVU5iPcaCKWaRDmTm9tiEa"),
  ];

  const results: any[] = [];
  const times1: number[] = [];
  const times2: number[] = [];

  for (const nameAccount of nameAccounts) {
    const accountBase58 = nameAccount.toBase58();

    console.time(`retrieveNftOwner-${accountBase58}`);
    const start1 = performance.now();
    const owner1 = await retrieveNftOwner(connection, nameAccount);
    const end1 = performance.now();
    console.timeEnd(`retrieveNftOwner-${accountBase58}`);
    const time1 = end1 - start1;
    times1.push(time1);

    console.time(`retrieveNftOwnerV2-${accountBase58}`);
    const start2 = performance.now();
    const owner2 = await retrieveNftOwnerV2(connection, nameAccount);
    const end2 = performance.now();
    console.timeEnd(`retrieveNftOwnerV2-${accountBase58}`);
    const time2 = end2 - start2;
    times2.push(time2);

    results.push({
      Account: accountBase58,
      Owner1: owner1?.toBase58() || "N/A",
      Time1: `${time1.toFixed(2)} ms`,
      Owner2: owner2?.toBase58() || "N/A",
      Time2: `${time2.toFixed(2)} ms`,
    });
  }

  console.table(results);

  const avgTime1 = mean(times1);
  const medianTime1 = median(times1);
  const avgTime2 = mean(times2);
  const medianTime2 = median(times2);

  console.table([
    {
      Metric: "Average Time (retrieveNftOwner)",
      Value: `${avgTime1.toFixed(2)} ms`,
    },
    {
      Metric: "Median Time (retrieveNftOwner)",
      Value: `${medianTime1.toFixed(2)} ms`,
    },
    {
      Metric: "Average Time (retrieveNftOwnerV2)",
      Value: `${avgTime2.toFixed(2)} ms`,
    },
    {
      Metric: "Median Time (retrieveNftOwnerV2)",
      Value: `${medianTime2.toFixed(2)} ms`,
    },
  ]);
};

benchmark().catch(console.error);
