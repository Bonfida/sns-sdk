require("dotenv").config();
import { describe, test, expect } from "@jest/globals";
import { getDomainPriceFromName } from "../src/utils";

describe("getDomainPriceFromName", () => {
  test.each([
    ['1', 750],
    ['✅', 750],
    ['요', 750],
    ['👩‍👩‍👧', 750],

    ['10', 700],
    ['1✅', 700],
    ['👩‍👩‍👧✅', 700],
    ['독도', 700],

    ['100', 640],
    ['10✅', 640],
    ['1독도', 640],

    ['1000', 160],
    ['100✅', 160],

    ['10000', 20],
    ['1000✅', 20],
    ['fêtes', 20],
  ])('value %s to be %s', (value, expected) => {
    expect(getDomainPriceFromName(value)).toBe(expected);
  })
});
