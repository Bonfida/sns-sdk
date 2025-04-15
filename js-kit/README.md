<p align="center">
<img width="250" src="https://v2.sns.id/assets/logo/brand.svg"/>
</p>

# SNS JS-KIT SDK

![npm version](https://img.shields.io/npm/v/@solana-name-service/sns-sdk-kit)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![License](https://img.shields.io/github/license/bonfida/sns-sdk)

The JS-KIT SDK is a JavaScript toolkit for managing .sol domains and records. Built on `@solana/kit` (formerly `@solana/web3.js` 2.x), it simplifies development and ensures secure and efficient functionality.

**Note: This SDK is currently in beta and subject to changes. Features, APIs, and functionality may evolve as development progresses.**

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Example Usage](#example-usage)
- [Documentation](#documentation)
- [License](#license)

## Features

- Domain resolution and primary domain lookup
- Domain/Subdomain Management
- Record Handling

## Installation

```bash
npm install @solana-name-service/sns-sdk-kit@beta @solana/kit
```

```
yarn add @solana-name-service/sns-sdk-kit@beta @solana/kit
```

## Example Usage

```typescript
import {
  Record,
  getDomainRecord,
  getPrimaryDomain,
  resolveDomain,
} from "@solana-name-service/sns-sdk-kit";
import {
  Address,
  createDefaultRpcTransport,
  createSolanaRpcFromTransport,
} from "@solana/kit";

(async () => {
  // Initialize rpc interface
  const transport = createDefaultRpcTransport({
    url: YOUR_RPC_URL,
  });
  const rpc = createSolanaRpcFromTransport(transport);

  // Resolve .sol domain
  const resolved = await resolveDomain(rpc, "sns.sol");

  // Get domain records
  const records = await getDomainRecord(rpc, "sns.sol", Record.Url, {
    deserialize: true,
  });

  // Get primary domain for address
  const primaryDomain = await getPrimaryDomain(
    rpc,
    "36Dn3RWhB8x4c83W6ebQ2C2eH9sh5bQX2nMdkP2cWaA4" as Address
  );

  console.log({ resolved, records, primaryDomain });
})();
```

## Documentation

The documentation for the JS-KIT SDK is currently a work-in-progress. Stay tuned for updates!

## License

This project is licensed under the MIT License. See the LICENSE file for more details.
