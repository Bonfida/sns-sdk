import { describe, expect, jest, test } from "@jest/globals";

import { NoRecordDataError, SNSError } from "../src/errors";
import { getRecordV1Address } from "../src/record/getRecordV1Address";
import { getRecordV2Address } from "../src/record/getRecordV2Address";
import { verifyRecordRightOfAssociation } from "../src/record/verifyRecordRightOfAssociation";
import { verifyRecordStaleness } from "../src/record/verifyRecordStaleness";
import { Record } from "../src/types/record";
import { TEST_RPC } from "./constants";

jest.setTimeout(5_000);

interface Domain {
  domain: string;
  solRecordV1Address: string;
  solRecordV2Address: string;
  records: {
    record: Record;
    verified?: {
      roa: boolean;
      staleness: boolean;
    };
    error?: SNSError;
  }[];
}

describe("Record methods", () => {
  const domains: Domain[] = [
    {
      domain: "sns-ip-5-wallet-1",
      solRecordV1Address: "2nXNzKArYDcYq6LAtJ1iTTe1vPqpHLeYjT4RGpGGesCf",
      solRecordV2Address: "Dkmm4CBzw7JfcwYHHsdH2spSLgKiPeC2UZGP22gugkso",
      records: [
        {
          record: Record.SOL,
          error: new NoRecordDataError("Record account not found"),
        },
      ],
    },
    {
      domain: "sns-ip-5-wallet-2",
      solRecordV1Address: "4TuNaiUrwe229Daxc82agCc5XGZBUT3Q6ysBWZSSyayd",
      solRecordV2Address: "82a7opjDQGyanNj9BTqmdzHBnh6e4qpSx5tT6dSx2mWp",
      records: [
        {
          record: Record.SOL,
          verified: { roa: true, staleness: true },
        },
      ],
    },
    {
      domain: "sns-ip-5-wallet-3",
      solRecordV1Address: "DBBYDomUQ2cDoyMqdi6oVGSUddj4uTJBrNM9jFDwQJL2",
      solRecordV2Address: "AyEMrNz1G92Y9uA8o5i2utBiPkYHsueUqoSwe34sZ2Mp",
      records: [
        {
          record: Record.SOL,
          verified: { roa: false, staleness: true },
        },
      ],
    },
  ];

  test("getRecordV1Address", async () => {
    for (const { domain, solRecordV1Address } of domains) {
      const res = await getRecordV1Address(domain, Record.SOL);
      expect(res).toBe(solRecordV1Address);
    }
  });

  test("getRecordV2Address", async () => {
    for (const { domain, solRecordV2Address } of domains) {
      const res = await getRecordV2Address(domain, Record.SOL);
      expect(res).toBe(solRecordV2Address);
    }
  });

  test("verifyRecordRightOfAssociation", async () => {
    for (const { domain, records } of domains) {
      for (const { record, verified, error } of records) {
        if (verified) {
          const res = await verifyRecordRightOfAssociation(
            TEST_RPC,
            domain,
            record
          );
          expect(res).toBe(verified.roa);
        }
        if (error) {
          await expect(
            verifyRecordRightOfAssociation(TEST_RPC, domain, record)
          ).rejects.toThrow(error);
        }
      }
    }
  });

  test("verifyRecordStaleness", async () => {
    for (const { domain, records } of domains) {
      for (const { record, verified, error } of records) {
        if (verified) {
          const res = await verifyRecordStaleness(TEST_RPC, domain, record);
          expect(res).toBe(verified.staleness);
        }
        if (error) {
          await expect(
            verifyRecordStaleness(TEST_RPC, domain, record)
          ).rejects.toThrow(error);
        }
      }
    }
  });
});
